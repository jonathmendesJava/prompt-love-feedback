-- Remove the overly permissive policy
DROP POLICY "Anyone can view projects via unique link" ON public.projects;

-- Create a secure function to get project info by unique link
CREATE OR REPLACE FUNCTION public.get_project_by_link(link text)
RETURNS TABLE (
  id uuid,
  name text,
  description text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, description
  FROM public.projects
  WHERE link_unique = link
  LIMIT 1;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.get_project_by_link(text) TO anon;