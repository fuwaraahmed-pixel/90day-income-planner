-- ====================================================================
-- STEP 4.3C: SELF-SERVICE FREE TRIAL & ADMIN INTEGRATION MIGRATION
-- Dremoy Income Manager
--
-- FEATURES:
-- 1. Abuse-proof self-service trial initiation (14 days).
-- 2. Strict 1-trial-per-user lifecycle guarantee.
-- 3. Automatic history logging and seamless integration with existing RLS.
-- ====================================================================

CREATE OR REPLACE FUNCTION public.start_self_service_trial()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_sub RECORD;
    v_new_end TIMESTAMPTZ;
    v_has_previous_trial BOOLEAN;
BEGIN
    -- 1. Authentication Check
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to start a trial.';
    END IF;

    -- 2. Fetch User Email from auth.users
    SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
    IF v_user_email IS NULL THEN
        RAISE EXCEPTION 'User account not found.';
    END IF;

    -- 3. Lock Subscription Row (if exists)
    SELECT * INTO v_sub 
    FROM public.subscriptions 
    WHERE user_id = v_user_id 
    FOR UPDATE;

    -- 4. Check if user already has an active paid subscription
    IF v_sub IS NOT NULL AND v_sub.status = 'active' AND v_sub.expires_at IS NOT NULL AND v_sub.expires_at > NOW() THEN
        RETURN jsonb_build_object(
            'success', false, 
            'message', 'আপনার ইতিমধ্যে একটি সক্রিয় পেইড সাবস্ক্রিপশন চালু রয়েছে।'
        );
    END IF;

    -- 5. Check if user currently has an active trial
    IF v_sub IS NOT NULL AND v_sub.trial_ends_at IS NOT NULL AND v_sub.trial_ends_at > NOW() AND v_sub.trial_ended_at IS NULL THEN
        RETURN jsonb_build_object(
            'success', false, 
            'message', 'আপনার ফ্রি ট্রায়াল ইতিমধ্যে সক্রিয় রয়েছে।'
        );
    END IF;

    -- 6. Abuse Prevention: Check if user has already consumed a trial in the past
    -- Checked via subscriptions.trial_starts_at or public.trial_history
    v_has_previous_trial := (
        (v_sub IS NOT NULL AND v_sub.trial_starts_at IS NOT NULL) OR
        EXISTS (SELECT 1 FROM public.trial_history WHERE user_id = v_user_id)
    );

    IF v_has_previous_trial THEN
        RETURN jsonb_build_object(
            'success', false, 
            'already_used', true,
            'message', 'আপনি ইতিমধ্যে আপনার ফ্রি ট্রায়াল ব্যবহার করেছেন। সেবা চালু রাখতে সাবস্ক্রাইব করুন।'
        );
    END IF;

    -- 7. Calculate 14 Days Expiry
    v_new_end := NOW() + INTERVAL '14 days';

    -- 8. Upsert Subscription Row
    IF v_sub IS NULL THEN
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
            v_user_id,
            v_user_email,
            'unpaid',
            NULL,
            'Starter',
            'monthly',
            NULL,
            NULL,
            'starter',
            NOW(),
            v_new_end,
            NULL,
            'Self-service 14-day free trial',
            NOW(),
            NOW()
        );
    ELSE
        UPDATE public.subscriptions
        SET trial_plan_id = 'starter',
            trial_starts_at = NOW(),
            trial_ends_at = v_new_end,
            trial_ended_at = NULL,
            trial_note = 'Self-service 14-day free trial',
            updated_at = NOW()
        WHERE user_id = v_user_id;
    END IF;

    -- 9. Log Audit Entry in public.trial_history
    -- admin_id is set to user_id for self-service actions
    INSERT INTO public.trial_history (
        user_id,
        admin_id,
        action,
        days_added,
        previous_end_at,
        new_end_at,
        note
    ) VALUES (
        v_user_id,
        v_user_id,
        'START',
        14,
        NULL,
        v_new_end,
        'Self-service 14-day trial started by user'
    );

    RETURN jsonb_build_object(
        'success', true, 
        'trial_ends_at', v_new_end,
        'message', '১৪ দিনের ফ্রি ট্রায়াল সফলভাবে চালু হয়েছে!'
    );
END;
$$;

-- --------------------------------------------------------------------
-- PRIVILEGES & GRANTS
-- --------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.start_self_service_trial() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.start_self_service_trial() FROM anon;
GRANT EXECUTE ON FUNCTION public.start_self_service_trial() TO authenticated;
