-- ====================================================================
-- DASHBOARD TOTALS RPC (FIX 3)
-- ====================================================================

CREATE OR REPLACE FUNCTION public.get_dashboard_financial_totals(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_target_income NUMERIC := 100000;
    v_total_salary NUMERIC := 0;
    v_total_new_income NUMERIC := 0;
    v_total_expenses NUMERIC := 0;
BEGIN
    SELECT COALESCE(target_income, 100000) INTO v_target_income
    FROM public.settings WHERE user_id = p_user_id LIMIT 1;

    SELECT COALESCE(SUM(amount), 0) INTO v_total_salary
    FROM public.income WHERE user_id = p_user_id AND source ILIKE '%Salary%';

    SELECT COALESCE(SUM(amount), 0) INTO v_total_new_income
    FROM public.income WHERE user_id = p_user_id AND source NOT ILIKE '%Salary%';

    SELECT COALESCE(SUM(amount), 0) INTO v_total_expenses
    FROM public.expenses WHERE user_id = p_user_id;

    RETURN jsonb_build_object(
        'targetIncome', v_target_income,
        'salarySum', v_total_salary,
        'newIncomeSum', v_total_new_income,
        'totalExpenses', v_total_expenses
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_dashboard_tuition_and_dues_totals(
    p_user_id UUID, 
    p_current_month_str TEXT, 
    p_today_str DATE, 
    p_next_7_days_str DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_expected_tuition NUMERIC := 0;
    v_collected_tuition NUMERIC := 0;
    v_total_dues NUMERIC := 0;
    v_overdue_dues NUMERIC := 0;
    v_due_soon_dues NUMERIC := 0;
BEGIN
    SELECT COALESCE(SUM(monthly_fee), 0) INTO v_expected_tuition
    FROM public.tuition_students WHERE user_id = p_user_id AND status = 'Active';

    SELECT COALESCE(SUM(amount), 0) INTO v_collected_tuition
    FROM public.tuition_payments WHERE user_id = p_user_id AND payment_month = p_current_month_str;

    SELECT COALESCE(SUM(GREATEST(0, total_amount - paid_amount)), 0) INTO v_total_dues
    FROM public.customer_dues WHERE user_id = p_user_id;

    SELECT COALESCE(SUM(GREATEST(0, total_amount - paid_amount)), 0) INTO v_overdue_dues
    FROM public.customer_dues 
    WHERE user_id = p_user_id AND due_date < p_today_str AND (total_amount - paid_amount) > 0;

    SELECT COALESCE(SUM(GREATEST(0, total_amount - paid_amount)), 0) INTO v_due_soon_dues
    FROM public.customer_dues 
    WHERE user_id = p_user_id AND due_date >= p_today_str AND due_date <= p_next_7_days_str AND (total_amount - paid_amount) > 0;

    RETURN jsonb_build_object(
        'expectedTuition', v_expected_tuition,
        'collectedTuition', v_collected_tuition,
        'totalDues', v_total_dues,
        'overdueDues', v_overdue_dues,
        'dueSoonDues', v_due_soon_dues
    );
END;
$$;
