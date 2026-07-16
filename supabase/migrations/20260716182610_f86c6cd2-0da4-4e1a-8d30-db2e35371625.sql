
-- plans table
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
GRANT INSERT ON public.plans TO anon;
GRANT ALL ON public.plans TO service_role;

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert a plan"
  ON public.plans FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL)
    OR (auth.uid() = user_id)
  );

CREATE POLICY "Users can view their own plans"
  ON public.plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON public.plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
  ON public.plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- contact_messages table
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

CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
