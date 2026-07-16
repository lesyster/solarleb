DROP POLICY IF EXISTS "Anyone can insert a plan" ON public.plans;
DROP POLICY IF EXISTS "Users can delete their own plans" ON public.plans;
DROP POLICY IF EXISTS "Users can update their own plans" ON public.plans;
DROP POLICY IF EXISTS "Users can view their own plans" ON public.plans;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO authenticated;

CREATE POLICY "Public can view plans" ON public.plans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can insert plans" ON public.plans FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can update plans" ON public.plans FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete plans" ON public.plans FOR DELETE TO anon, authenticated USING (true);