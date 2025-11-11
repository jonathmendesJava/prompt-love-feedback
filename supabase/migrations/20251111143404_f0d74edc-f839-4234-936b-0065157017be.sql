-- Allow public access to projects when accessing via unique link
CREATE POLICY "Anyone can view projects via unique link"
  ON public.projects FOR SELECT
  USING (true);