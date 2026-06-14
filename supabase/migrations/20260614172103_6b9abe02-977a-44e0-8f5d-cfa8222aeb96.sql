
REVOKE EXECUTE ON FUNCTION public.dispatch_request_triage() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.dispatch_request_triage() TO service_role;
