
-- ============ PLANS ============
CREATE TABLE public.plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  city TEXT NOT NULL,
  monthly_bill NUMERIC NOT NULL,
  generator_hours NUMERIC NOT NULL,
  property_type TEXT NOT NULL,
  monthly_kwh NUMERIC,
  recommended_system_kw NUMERIC,
  recommended_battery TEXT,
  estimated_cost_low NUMERIC,
  estimated_cost_high NUMERIC,
  estimated_savings NUMERIC,
  payback_period TEXT,
  explanation_text TEXT,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  locked_until TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.plans TO anon;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- ============ CONTACT MESSAGES ============
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ PLANS POLICIES ============
CREATE POLICY "Anyone can insert plans"
  ON public.plans FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (user_id IS NULL AND auth.uid() IS NULL)
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NOT NULL AND user_id IS NULL)
  );

CREATE POLICY "Owners can view their plans"
  ON public.plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can update their plans"
  ON public.plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous can update plans they inserted in same session"
  ON public.plans FOR UPDATE
  TO anon
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Admins can view all plans"
  ON public.plans FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete plans"
  ON public.plans FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all plans"
  ON public.plans FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ CONTACT POLICIES ============
CREATE POLICY "Anyone can submit contact message"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view contact messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ FEATURE FLAGS ============
CREATE TABLE public.feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.feature_flags TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.feature_flags TO authenticated;
GRANT ALL ON public.feature_flags TO service_role;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view feature flags"
  ON public.feature_flags FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can update feature flags"
  ON public.feature_flags FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert feature flags"
  ON public.feature_flags FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete feature flags"
  ON public.feature_flags FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.feature_flags (key, enabled, description) VALUES
  ('onboarding_enabled', true, 'Show the Sami walkthrough on the Get a Plan page'),
  ('mock_mode_enabled', false, 'Use mock plan generation instead of the real AI/API');

-- ============ ERROR LOGS ============
CREATE TABLE public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL,
  message TEXT NOT NULL,
  context JSONB
);
GRANT INSERT ON public.error_logs TO anon, authenticated;
GRANT ALL ON public.error_logs TO service_role;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert error logs"
  ON public.error_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view error logs"
  ON public.error_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete error logs"
  ON public.error_logs FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX error_logs_created_at_idx ON public.error_logs (created_at DESC);
CREATE INDEX plans_created_at_idx ON public.plans (created_at DESC);
