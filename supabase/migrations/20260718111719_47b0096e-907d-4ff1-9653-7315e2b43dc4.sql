
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "Anonymous can update plans they inserted in same session" ON public.plans;
REVOKE UPDATE ON public.plans FROM anon;
