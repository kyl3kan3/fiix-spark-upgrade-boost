REVOKE EXECUTE ON FUNCTION public.get_company_subscription() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.company_within_limit(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_company_subscription() TO authenticated;
GRANT EXECUTE ON FUNCTION public.company_within_limit(text) TO authenticated;