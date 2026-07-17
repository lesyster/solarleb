
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO anon, authenticated;
GRANT ALL ON public.plans TO service_role;

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert plans" ON public.plans;
DROP POLICY IF EXISTS "Public can view plans" ON public.plans;
DROP POLICY IF EXISTS "Public can update plans" ON public.plans;
DROP POLICY IF EXISTS "Public can delete plans" ON public.plans;
DROP POLICY IF EXISTS "Allow anonymous insert on plans" ON public.plans;
DROP POLICY IF EXISTS "Allow authenticated insert on plans" ON public.plans;
DROP POLICY IF EXISTS "Allow public read on plans" ON public.plans;

CREATE POLICY "Anyone can insert plans"
  ON public.plans FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view plans"
  ON public.plans FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update plans"
  ON public.plans FOR UPDATE
  TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete plans"
  ON public.plans FOR DELETE
  TO anon, authenticated
  USING (true);
