
-- =========== PLANS ===========
CREATE TABLE public.plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text,
  status text NOT NULL DEFAULT 'ok',
  created_at timestamptz NOT NULL DEFAULT now(),
  city text NOT NULL,
  monthly_bill numeric NOT NULL,
  generator_hours numeric NOT NULL,
  property_type text NOT NULL,
  monthly_kwh numeric,
  recommended_system_kw numeric,
  recommended_battery text,
  estimated_cost_low numeric,
  estimated_cost_high numeric,
  estimated_savings numeric,
  payback_period text,
  explanation_text text,
  is_locked boolean NOT NULL DEFAULT false,
  locked_until timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.plans TO anon;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- =========== CONTACT MESSAGES ===========
CREATE TABLE public.contact_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL
);
GRANT INSERT, SELECT ON public.contact_messages TO authenticated;
GRANT INSERT ON public.contact_messages TO anon;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- =========== ROLES ===========
CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role);
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role('admin', auth.uid()));
CREATE POLICY "Admins insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role('admin', auth.uid()));
CREATE POLICY "Admins delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role('admin', auth.uid()));

-- =========== PLANS POLICIES ===========
CREATE POLICY "Anyone can insert plans"
  ON public.plans FOR INSERT TO anon, authenticated
  WITH CHECK (
    (user_id IS NULL AND auth.uid() IS NULL)
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NOT NULL AND user_id IS NULL)
  );
CREATE POLICY "Owners can view their plans" ON public.plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners can update their plans" ON public.plans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anonymous can update anon plans" ON public.plans FOR UPDATE TO anon USING (user_id IS NULL) WITH CHECK (user_id IS NULL);
CREATE POLICY "Admins view plans" ON public.plans FOR SELECT TO authenticated USING (public.has_role('admin', auth.uid()));
CREATE POLICY "Admins delete plans" ON public.plans FOR DELETE TO authenticated USING (public.has_role('admin', auth.uid()));
CREATE POLICY "Admins update all plans" ON public.plans FOR UPDATE TO authenticated USING (public.has_role('admin', auth.uid())) WITH CHECK (public.has_role('admin', auth.uid()));

-- =========== CONTACT POLICIES ===========
CREATE POLICY "Anyone can submit contact message" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins view contact messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role('admin', auth.uid()));
CREATE POLICY "Admins can delete contact messages" ON public.contact_messages FOR DELETE TO authenticated USING (public.has_role('admin', auth.uid()));

-- =========== ADMIN AUDIT LOG ===========
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  actor_email text NOT NULL,
  action text NOT NULL,
  target text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view audit" ON public.admin_audit_log FOR SELECT TO authenticated USING (public.has_role('admin', auth.uid()));
CREATE POLICY "Auth users insert own audit" ON public.admin_audit_log FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());
CREATE POLICY "Admins delete audit" ON public.admin_audit_log FOR DELETE TO authenticated USING (public.has_role('admin', auth.uid()));

-- =========== ERROR LOGS ===========
CREATE TABLE public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  message text NOT NULL,
  context jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.error_logs TO anon, authenticated;
GRANT SELECT, DELETE ON public.error_logs TO authenticated;
GRANT ALL ON public.error_logs TO service_role;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone insert errors" ON public.error_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins view errors" ON public.error_logs FOR SELECT TO authenticated USING (public.has_role('admin', auth.uid()));
CREATE POLICY "Admins delete errors" ON public.error_logs FOR DELETE TO authenticated USING (public.has_role('admin', auth.uid()));

-- =========== LOGIN EVENTS ===========
CREATE TABLE public.login_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.login_events TO authenticated;
GRANT ALL ON public.login_events TO service_role;
ALTER TABLE public.login_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own login events" ON public.login_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view login events" ON public.login_events FOR SELECT TO authenticated USING (public.has_role('admin', auth.uid()));
CREATE POLICY "Admins can delete login events" ON public.login_events FOR DELETE TO authenticated USING (public.has_role('admin', auth.uid()));
CREATE INDEX login_events_created_at_idx ON public.login_events (created_at DESC);

-- =========== FEATURE FLAGS ===========
CREATE TABLE public.feature_flags (
  key text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT false,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.feature_flags TO anon, authenticated;
GRANT ALL ON public.feature_flags TO service_role;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read flags" ON public.feature_flags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage flags" ON public.feature_flags FOR ALL TO authenticated USING (public.has_role('admin', auth.uid())) WITH CHECK (public.has_role('admin', auth.uid()));

-- =========== ADMIN RPCs ===========
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(id uuid, email text, last_sign_in_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,auth AS $$
BEGIN
  IF NOT public.has_role('admin', auth.uid()) THEN RAISE EXCEPTION 'admin only'; END IF;
  RETURN QUERY SELECT u.id, u.email::text, u.last_sign_in_at FROM auth.users u ORDER BY u.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_find_user_by_email(_email text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,auth AS $$
DECLARE uid uuid;
BEGIN
  IF NOT public.has_role('admin', auth.uid()) THEN RAISE EXCEPTION 'admin only'; END IF;
  SELECT id INTO uid FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1;
  RETURN uid;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_find_user_by_email(text) FROM PUBLIC, anon;

-- Seed: earliest existing user becomes admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users ORDER BY created_at ASC LIMIT 1
ON CONFLICT DO NOTHING;
