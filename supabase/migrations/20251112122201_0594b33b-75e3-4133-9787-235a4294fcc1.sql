-- Drop and recreate views without SECURITY DEFINER
DROP VIEW IF EXISTS public.dashboard_stats;
DROP VIEW IF EXISTS public.projects_with_counts;

-- Create optimized view for dashboard stats (without SECURITY DEFINER)
CREATE VIEW public.dashboard_stats 
WITH (security_invoker=true) AS
SELECT 
  COUNT(DISTINCT p.id) as total_projects,
  COUNT(DISTINCT r.session_id) as total_responses,
  COALESCE(AVG(r.response_value), 0) as average_rating
FROM public.projects p
LEFT JOIN public.responses r ON p.id = r.project_id
WHERE p.user_id = auth.uid();

-- Create optimized view for projects with response counts (without SECURITY DEFINER)
CREATE VIEW public.projects_with_counts 
WITH (security_invoker=true) AS
SELECT 
  p.*,
  COUNT(DISTINCT r.session_id) as response_count
FROM public.projects p
LEFT JOIN public.responses r ON p.id = r.project_id
WHERE p.user_id = auth.uid()
GROUP BY p.id;