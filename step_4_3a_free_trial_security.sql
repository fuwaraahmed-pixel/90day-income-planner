-- ====================================================================
-- STEP 4.3A: FREE TRIAL SECURITY & STATE MANAGEMENT MIGRATION
-- Dremoy Income Manager
--
-- PROPERTIES:
-- - Standalone, additive, idempotent migration script.
-- - Preserves all existing paid subscriptions and payment requests.
-- - Preserves client submitPaymentRequest() upsert flow.
-- - Enforces locked Free Trial State Contract (Step 4.2.1).
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. ADD TRIAL COLUMNS TO public.subscriptions
-- --------------------------------------------------------------------
ALTER TABLE public.subscriptions 
    ADD COLUMN IF NOT EXISTS trial_plan_id TEXT,
    ADD COLUMN IF NOT EXISTS trial_starts_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS trial_ended_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS trial_note TEXT;

-- --------------------------------------------------------------------
-- 2. CREATE public.trial_history AUDIT TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trial_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    action TEXT NOT NULL CHECK (action IN ('START', 'EXTEND', 'SET_DATE', 'END', 'RESET', 'CONVERTED_TO_PAID')),
    days_added INTEGER DEFAULT 0,
    previous_end_at TIMESTAMPTZ,
    new_end_at TIMESTAMPTZ,
    note TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast user history lookup ordered by newest first
CREATE INDEX IF NOT EXISTS idx_trial_history_user_created 
    ON public.trial_history(user_id, created_at DESC);

-- --------------------------------------------------------------------
-- 3. RLS & PERMISSIONS ON public.trial_history (APPEND-ONLY)
-- --------------------------------------------------------------------
ALTER TABLE public.trial_history ENABLE ROW LEVEL SECURITY;

-- Revoke all direct modification privileges from PUBLIC, anon, and authenticated
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.trial_history FROM PUBLIC, anon, authenticated;

-- Allow authenticated users to view history (own records or admin viewing all)
DROP POLICY IF EXISTS "Users can view own trial history or admin can view all" ON public.trial_history;
CREATE POLICY "Users can view own trial history or admin can view all" 
    ON public.trial_history FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Grant SELECT to authenticated so the policy can be evaluated
GRANT SELECT ON public.trial_history TO authenticated;

-- --------------------------------------------------------------------
-- 4. HARDEN public.subscriptions INSERT POLICY
-- --------------------------------------------------------------------
-- Prevents clients from inserting status = 'active' or forging trial dates.
DROP POLICY IF EXISTS "Users can insert own initial subscription" ON public.subscriptions;
CREATE POLICY "Users can insert own initial subscription" 
    ON public.subscriptions FOR INSERT 
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id 
        AND status IN ('unpaid', 'pending')
        AND trial_starts_at IS NULL
        AND trial_ends_at IS NULL
        AND trial_ended_at IS NULL
        AND trial_plan_id IS NULL
        AND trial_note IS NULL
    );

-- --------------------------------------------------------------------
-- 5. TRIGGER TO PREVENT CLIENT-SIDE MODIFICATION OF TRIAL COLUMNS ON UPDATE
-- --------------------------------------------------------------------
-- RLS cannot compare OLD vs NEW row values. A BEFORE UPDATE trigger
-- ensures regular client updates (such as submitPaymentRequest) can update
-- status to 'pending' without tampering with trial fields, while exempting
-- trusted administrators / SECURITY DEFINER functions.
CREATE OR REPLACE FUNCTION public.protect_subscription_trial_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- If caller is system admin (or SECURITY DEFINER running under admin context), allow all changes
    IF public.is_admin(auth.uid()) THEN
        RETURN NEW;
    END IF;

    -- For normal authenticated users, trial columns MUST NOT be modified
    IF (NEW.trial_plan_id IS DISTINCT FROM OLD.trial_plan_id) OR
       (NEW.trial_starts_at IS DISTINCT FROM OLD.trial_starts_at) OR
       (NEW.trial_ends_at IS DISTINCT FROM OLD.trial_ends_at) OR
       (NEW.trial_ended_at IS DISTINCT FROM OLD.trial_ended_at) OR
       (NEW.trial_note IS DISTINCT FROM OLD.trial_note) THEN
        RAISE EXCEPTION 'Unauthorized: Trial fields cannot be modified by standard users.';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_subscription_trial_fields ON public.subscriptions;
CREATE TRIGGER trg_protect_subscription_trial_fields
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_subscription_trial_fields();

-- --------------------------------------------------------------------
-- 6. ADMIN RPC: manage_user_trial()
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.manage_user_trial(
    p_user_id UUID,
    p_action TEXT,
    p_days INT DEFAULT NULL,
    p_target_date TIMESTAMPTZ DEFAULT NULL,
    p_plan_id TEXT DEFAULT 'starter',
    p_reason TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_admin_id UUID;
    v_sub RECORD;
    v_user_email TEXT;
    v_new_end TIMESTAMPTZ;
    v_prev_end TIMESTAMPTZ;
    v_clean_plan TEXT;
    v_is_paid_active BOOLEAN;
    v_is_trial_active BOOLEAN;
BEGIN
    -- 1. Security Check: Caller must be admin
    v_admin_id := auth.uid();
    IF v_admin_id IS NULL OR NOT public.is_admin(v_admin_id) THEN
        RAISE EXCEPTION 'Unauthorized: Only system administrators can manage trials.';
    END IF;

    -- 2. Validate Target User in auth.users
    SELECT email INTO v_user_email FROM auth.users WHERE id = p_user_id;
    IF v_user_email IS NULL THEN
        RAISE EXCEPTION 'User not found in system.';
    END IF;

    -- 3. Validate Action
    IF p_action NOT IN ('START', 'EXTEND', 'SET_DATE', 'END', 'RESET') THEN
        RAISE EXCEPTION 'Invalid trial action: %', p_action;
    END IF;

    -- 4. Normalize & Validate Plan ID
    v_clean_plan := COALESCE(NULLIF(trim(p_plan_id), ''), 'starter');
    IF v_clean_plan NOT IN ('starter', 'monthly_pro', 'pro_business', 'agency') THEN
        RAISE EXCEPTION 'Invalid plan ID: %', p_plan_id;
    END IF;

    -- 5. Lock Subscription Row (if exists)
    SELECT * INTO v_sub 
    FROM public.subscriptions 
    WHERE user_id = p_user_id 
    FOR UPDATE;

    -- Compute Active Statuses
    v_is_paid_active := (v_sub IS NOT NULL AND v_sub.status = 'active' AND v_sub.expires_at IS NOT NULL AND v_sub.expires_at > NOW());
    v_is_trial_active := (v_sub IS NOT NULL AND v_sub.trial_ends_at IS NOT NULL AND v_sub.trial_ends_at > NOW() AND v_sub.trial_ended_at IS NULL);
    v_prev_end := v_sub.trial_ends_at;

    -- Paid active users CANNOT receive trial operations
    IF v_is_paid_active AND p_action IN ('START', 'EXTEND', 'SET_DATE') THEN
        RAISE EXCEPTION 'User already has an active paid subscription until %. Trial actions are blocked.', to_char(v_sub.expires_at, 'YYYY-MM-DD HH24:MI:SS');
    END IF;

    -- ================================================================
    -- ACTION: START
    -- ================================================================
    IF p_action = 'START' THEN
        IF v_is_trial_active THEN
            RAISE EXCEPTION 'User already has an active trial until %. Use Extend instead.', to_char(v_sub.trial_ends_at, 'YYYY-MM-DD HH24:MI:SS');
        END IF;

        IF p_days IS NULL OR p_days < 1 OR p_days > 90 THEN
            RAISE EXCEPTION 'Trial duration must be between 1 and 90 days.';
        END IF;

        v_new_end := NOW() + (p_days || ' days')::INTERVAL;

        IF v_sub IS NULL THEN
            -- Create initial subscription row with unpaid paid-state
            INSERT INTO public.subscriptions (
                user_id,
                user_email,
                status,
                plan_id,
                plan_name,
                billing_cycle,
                starts_at,
                expires_at,
                trial_plan_id,
                trial_starts_at,
                trial_ends_at,
                trial_ended_at,
                trial_note,
                created_at,
                updated_at
            ) VALUES (
                p_user_id,
                v_user_email,
                'unpaid',
                NULL,
                'Starter',
                'monthly',
                NULL,
                NULL,
                v_clean_plan,
                NOW(),
                v_new_end,
                NULL,
                COALESCE(p_reason, ''),
                NOW(),
                NOW()
            );
        ELSE
            -- Update existing row trial fields, preserving paid fields
            UPDATE public.subscriptions
            SET trial_plan_id = v_clean_plan,
                trial_starts_at = NOW(),
                trial_ends_at = v_new_end,
                trial_ended_at = NULL,
                trial_note = COALESCE(p_reason, ''),
                updated_at = NOW()
            WHERE user_id = p_user_id;
        END IF;

        -- Record Audit History
        INSERT INTO public.trial_history (
            user_id, admin_id, action, days_added, previous_end_at, new_end_at, note
        ) VALUES (
            p_user_id, v_admin_id, 'START', p_days, v_prev_end, v_new_end, COALESCE(p_reason, '')
        );

        RETURN jsonb_build_object(
            'success', true,
            'action', 'START',
            'trial_ends_at', v_new_end,
            'message', 'Free trial started successfully.'
        );

    -- ================================================================
    -- ACTION: EXTEND
    -- ================================================================
    ELSIF p_action = 'EXTEND' THEN
        IF v_sub IS NULL THEN
            RAISE EXCEPTION 'No subscription record found. Start a trial first.';
        END IF;

        IF p_days IS NULL OR p_days < 1 OR p_days > 90 THEN
            RAISE EXCEPTION 'Extension days must be between 1 and 90 days.';
        END IF;

        -- If trial is currently active, extend from current end date; otherwise extend from NOW()
        IF v_is_trial_active THEN
            v_new_end := v_sub.trial_ends_at + (p_days || ' days')::INTERVAL;
        ELSE
            v_new_end := NOW() + (p_days || ' days')::INTERVAL;
        END IF;

        UPDATE public.subscriptions
        SET trial_ends_at = v_new_end,
            trial_ended_at = NULL, -- Reactivates if it was manually ended
            updated_at = NOW()
        WHERE user_id = p_user_id;

        INSERT INTO public.trial_history (
            user_id, admin_id, action, days_added, previous_end_at, new_end_at, note
        ) VALUES (
            p_user_id, v_admin_id, 'EXTEND', p_days, v_prev_end, v_new_end, COALESCE(p_reason, '')
        );

        RETURN jsonb_build_object(
            'success', true,
            'action', 'EXTEND',
            'trial_ends_at', v_new_end,
            'message', 'Trial extended successfully.'
        );

    -- ================================================================
    -- ACTION: SET_DATE
    -- ================================================================
    ELSIF p_action = 'SET_DATE' THEN
        IF v_sub IS NULL THEN
            RAISE EXCEPTION 'No subscription record found. Start a trial first.';
        END IF;

        IF p_target_date IS NULL OR p_target_date <= NOW() THEN
            RAISE EXCEPTION 'Target trial end date must be strictly in the future.';
        END IF;

        IF p_target_date > (NOW() + INTERVAL '365 days') THEN
            RAISE EXCEPTION 'Target trial end date cannot exceed 365 days from now.';
        END IF;

        IF v_prev_end IS NOT NULL AND p_target_date = v_prev_end THEN
            RAISE EXCEPTION 'Target date is identical to the current end date.';
        END IF;

        v_new_end := p_target_date;

        UPDATE public.subscriptions
        SET trial_ends_at = v_new_end,
            trial_ended_at = NULL,
            updated_at = NOW()
        WHERE user_id = p_user_id;

        INSERT INTO public.trial_history (
            user_id, admin_id, action, days_added, previous_end_at, new_end_at, note
        ) VALUES (
            p_user_id, v_admin_id, 'SET_DATE', 0, v_prev_end, v_new_end, COALESCE(p_reason, '')
        );

        RETURN jsonb_build_object(
            'success', true,
            'action', 'SET_DATE',
            'trial_ends_at', v_new_end,
            'message', 'Trial end date updated successfully.'
        );

    -- ================================================================
    -- ACTION: END
    -- ================================================================
    ELSIF p_action = 'END' THEN
        IF v_sub IS NULL THEN
            RAISE EXCEPTION 'No subscription record found.';
        END IF;

        -- If already ended, return idempotent success
        IF v_sub.trial_ended_at IS NOT NULL THEN
            RETURN jsonb_build_object(
                'success', true,
                'action', 'END',
                'message', 'Trial was already ended.'
            );
        END IF;

        UPDATE public.subscriptions
        SET trial_ended_at = NOW(),
            updated_at = NOW()
        WHERE user_id = p_user_id;

        INSERT INTO public.trial_history (
            user_id, admin_id, action, days_added, previous_end_at, new_end_at, note
        ) VALUES (
            p_user_id, v_admin_id, 'END', 0, v_prev_end, NOW(), COALESCE(p_reason, '')
        );

        RETURN jsonb_build_object(
            'success', true,
            'action', 'END',
            'message', 'Trial ended successfully.'
        );

    -- ================================================================
    -- ACTION: RESET
    -- ================================================================
    ELSIF p_action = 'RESET' THEN
        IF v_sub IS NULL THEN
            RAISE EXCEPTION 'No subscription record found.';
        END IF;

        IF p_reason IS NULL OR char_length(trim(p_reason)) < 5 THEN
            RAISE EXCEPTION 'A mandatory audit reason of at least 5 characters is required to reset a trial.';
        END IF;

        UPDATE public.subscriptions
        SET trial_plan_id = NULL,
            trial_starts_at = NULL,
            trial_ends_at = NULL,
            trial_ended_at = NOW(),
            trial_note = trim(p_reason),
            updated_at = NOW()
        WHERE user_id = p_user_id;

        INSERT INTO public.trial_history (
            user_id, admin_id, action, days_added, previous_end_at, new_end_at, note
        ) VALUES (
            p_user_id, v_admin_id, 'RESET', 0, v_prev_end, NULL, trim(p_reason)
        );

        RETURN jsonb_build_object(
            'success', true,
            'action', 'RESET',
            'message', 'Trial state reset successfully.'
        );
    END IF;

    RETURN jsonb_build_object('success', false, 'message', 'Unhandled trial action.');
END;
$$;

-- --------------------------------------------------------------------
-- 7. UPDATE approve_payment_request() WITH TRIAL CONVERSION
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.approve_payment_request(request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    req RECORD;
    v_existing_sub RECORD;
    v_starts_at TIMESTAMPTZ;
    v_expires_at TIMESTAMPTZ;
    v_admin_id UUID;
    v_had_active_trial BOOLEAN;
BEGIN
    v_admin_id := auth.uid();
    IF v_admin_id IS NULL OR NOT public.is_admin(v_admin_id) THEN
        RAISE EXCEPTION 'Unauthorized: Only system administrators can approve payment requests.';
    END IF;

    -- 1. Fetch & lock pending payment request
    SELECT * INTO req 
    FROM public.payment_requests 
    WHERE id = request_id AND status = 'pending'
    FOR UPDATE;
    
    IF req IS NULL THEN
        RAISE EXCEPTION 'Payment request not found or already processed.';
    END IF;

    UPDATE public.payment_requests 
    SET status = 'approved', updated_at = NOW() 
    WHERE id = request_id;

    -- 2. Fetch & lock existing subscription for smart renewal & trial conversion
    SELECT * INTO v_existing_sub 
    FROM public.subscriptions 
    WHERE user_id = req.user_id
    FOR UPDATE;

    -- Smart Renewal calculation for paid subscription
    IF v_existing_sub IS NOT NULL AND v_existing_sub.status = 'active' AND v_existing_sub.expires_at > NOW() THEN
        v_starts_at := v_existing_sub.starts_at;
        v_expires_at := v_existing_sub.expires_at + INTERVAL '1 month';
    ELSE
        v_starts_at := NOW();
        v_expires_at := NOW() + INTERVAL '1 month';
    END IF;

    -- Check if user currently has an active trial
    v_had_active_trial := (
        v_existing_sub IS NOT NULL 
        AND v_existing_sub.trial_ends_at IS NOT NULL 
        AND v_existing_sub.trial_ends_at > NOW() 
        AND v_existing_sub.trial_ended_at IS NULL
    );

    -- 3. Upsert paid subscription state & conclude active trial if present
    INSERT INTO public.subscriptions (
        user_id, 
        user_email, 
        status, 
        plan_id, 
        plan_name, 
        billing_cycle, 
        starts_at, 
        expires_at, 
        trial_ended_at,
        updated_at
    ) VALUES (
        req.user_id, 
        req.user_email, 
        'active', 
        req.plan_id, 
        req.plan_name, 
        'monthly', 
        v_starts_at, 
        v_expires_at, 
        CASE WHEN v_had_active_trial THEN NOW() ELSE NULL END,
        NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        status = 'active',
        plan_id = EXCLUDED.plan_id,
        plan_name = EXCLUDED.plan_name,
        billing_cycle = 'monthly',
        starts_at = v_starts_at,
        expires_at = v_expires_at,
        trial_ended_at = CASE 
            WHEN v_had_active_trial THEN NOW() 
            ELSE public.subscriptions.trial_ended_at 
        END,
        updated_at = NOW();

    -- 4. If trial was active, record immutable CONVERTED_TO_PAID audit event
    IF v_had_active_trial THEN
        INSERT INTO public.trial_history (
            user_id,
            admin_id,
            action,
            days_added,
            previous_end_at,
            new_end_at,
            note
        ) VALUES (
            req.user_id,
            v_admin_id,
            'CONVERTED_TO_PAID',
            0,
            v_existing_sub.trial_ends_at,
            NOW(),
            'Trial concluded automatically upon payment request approval.'
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'converted_from_trial', v_had_active_trial,
        'message', 'Payment request approved successfully.'
    );
END;
$$;

-- --------------------------------------------------------------------
-- 8. FUNCTION PRIVILEGES / GRANTS
-- --------------------------------------------------------------------
-- manage_user_trial
REVOKE EXECUTE ON FUNCTION public.manage_user_trial(UUID, TEXT, INT, TIMESTAMPTZ, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.manage_user_trial(UUID, TEXT, INT, TIMESTAMPTZ, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.manage_user_trial(UUID, TEXT, INT, TIMESTAMPTZ, TEXT, TEXT) TO authenticated;

-- approve_payment_request
REVOKE EXECUTE ON FUNCTION public.approve_payment_request(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.approve_payment_request(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.approve_payment_request(UUID) TO authenticated;
