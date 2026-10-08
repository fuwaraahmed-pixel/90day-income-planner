REVOKE EXECUTE ON FUNCTION public.approve_payment_request(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.approve_payment_request(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.approve_payment_request(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.reject_payment_request(UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reject_payment_request(UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.reject_payment_request(UUID, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.record_crm_payment(UUID, BIGINT, DATE, NUMERIC, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_crm_payment(UUID, BIGINT, DATE, NUMERIC, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.record_crm_payment(UUID, BIGINT, DATE, NUMERIC, TEXT, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.record_customer_due_payment(UUID, BIGINT, DATE, NUMERIC, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_customer_due_payment(UUID, BIGINT, DATE, NUMERIC, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.record_customer_due_payment(UUID, BIGINT, DATE, NUMERIC, TEXT, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.record_emi_payment(UUID, BIGINT, UUID, DATE, NUMERIC, TEXT, TEXT, BOOLEAN) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_emi_payment(UUID, BIGINT, UUID, DATE, NUMERIC, TEXT, TEXT, BOOLEAN) FROM anon;
GRANT EXECUTE ON FUNCTION public.record_emi_payment(UUID, BIGINT, UUID, DATE, NUMERIC, TEXT, TEXT, BOOLEAN) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.record_liability_payment(UUID, BIGINT, DATE, NUMERIC, TEXT, TEXT, BOOLEAN) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_liability_payment(UUID, BIGINT, DATE, NUMERIC, TEXT, TEXT, BOOLEAN) FROM anon;
GRANT EXECUTE ON FUNCTION public.record_liability_payment(UUID, BIGINT, DATE, NUMERIC, TEXT, TEXT, BOOLEAN) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.record_tuition_payment(BIGINT, DATE, TEXT, NUMERIC, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_tuition_payment(BIGINT, DATE, TEXT, NUMERIC, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.record_tuition_payment(BIGINT, DATE, TEXT, NUMERIC, TEXT, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_admin(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
