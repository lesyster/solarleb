
-- Enum
CREATE TYPE public.app_role AS ENUM ('admin','user');

-- Roles table
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

-- Admin audit log
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  actor_email text NOT NULL,
  action text NOT NULL,
  target text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view audit" ON public.admin_audit_log FOR SELECT TO authenticated USING (public.has_role('admin', auth.uid()));
CREATE POLICY "Auth users insert own audit" ON public.admin_audit_log FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

-- Error logs
CREATE TABLE public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  message text NOT NULL,
  context jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.error_logs TO anon, authenticated;
GRANT SELECT ON public.error_logs TO authenticated;
GRANT ALL ON public.error_logs TO service_role;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone insert errors" ON public.error_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins view errors" ON public.error_logs FOR SELECT TO authenticated USING (public.has_role('admin', auth.uid()));

-- Login events
CREATE TABLE public.login_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.login_events TO authenticated;
GRANT ALL ON public.login_events TO service_role;
ALTER TABLE public.login_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own login events" ON public.login_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view login events" ON public.login_events FOR SELECT TO authenticated USING (public.has_role('admin', auth.uid()));

-- Feature flags
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

-- Plans: missing columns used by admin page
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS user_email text;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'ok';

-- Admin RPCs
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(id uuid, email text, last_sign_in_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,auth AS $$
BEGIN
  IF NOT public.has_role('admin', auth.uid()) THEN
    RAISE EXCEPTION 'admin only';
  END IF;
  RETURN QUERY SELECT u.id, u.email::text, u.last_sign_in_at FROM auth.users u ORDER BY u.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_find_user_by_email(_email text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,auth AS $$
DECLARE uid uuid;
BEGIN
  IF NOT public.has_role('admin', auth.uid()) THEN
    RAISE EXCEPTION 'admin only';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1;
  RETURN uid;
END;
$$;

-- Admin plan reads/deletes
CREATE POLICY "Admins view plans" ON public.plans FOR SELECT TO authenticated USING (public.has_role('admin', auth.uid()));
CREATE POLICY "Admins delete plans" ON public.plans FOR DELETE TO authenticated USING (public.has_role('admin', auth.uid()));

-- Contact messages: admin read
CREATE POLICY "Admins view contact messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role('admin', auth.uid()));
GRANT SELECT ON public.contact_messages TO authenticated;

-- Seed: earliest existing auth user becomes admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users ORDER BY created_at ASC LIMIT 1
ON CONFLICT DO NOTHING;
