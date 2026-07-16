CREATE POLICY "Public can view contact messages" ON public.contact_messages FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON public.contact_messages TO anon;
GRANT SELECT ON public.contact_messages TO authenticated;