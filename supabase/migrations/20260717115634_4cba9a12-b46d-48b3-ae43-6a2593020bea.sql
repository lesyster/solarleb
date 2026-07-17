
-- PLANS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert plans" ON public.plans;
DROP POLICY IF EXISTS "Anyone can view plans" ON public.plans;
DROP POLICY IF EXISTS "Anyone can update plans" ON public.plans;
DROP POLICY IF EXISTS "Anyone can delete plans" ON public.plans;

REVOKE DELETE ON public.plans FROM anon, authenticated;
REVOKE SELECT, UPDATE ON public.plans FROM anon;

CREATE POLICY "Anyone can insert plans"
  ON public.plans FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (user_id IS NULL AND auth.uid() IS NULL)
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
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

-- CONTACT MESSAGES
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
DROP POLICY IF EXISTS "Public can view contact messages" ON public.contact_messages;

REVOKE SELECT, UPDATE, DELETE ON public.contact_messages FROM anon, authenticated;
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT ALL ON public.contact_messages TO service_role;

CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
