-- Add indexes to optimize queries
CREATE INDEX IF NOT EXISTS idx_responses_project_id ON public.responses(project_id);
CREATE INDEX IF NOT EXISTS idx_responses_session_id ON public.responses(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_submitted_at ON public.responses(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_project_id ON public.questions(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);

-- Create optimized view for dashboard stats
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT 
  COUNT(DISTINCT p.id) as total_projects,
  COUNT(DISTINCT r.session_id) as total_responses,
  COALESCE(AVG(r.response_value), 0) as average_rating
FROM public.projects p
LEFT JOIN public.responses r ON p.id = r.project_id
WHERE p.user_id = auth.uid();

-- Create optimized view for projects with response counts
CREATE OR REPLACE VIEW public.projects_with_counts AS
SELECT 
  p.*,
  COUNT(DISTINCT r.session_id) as response_count
FROM public.projects p
LEFT JOIN public.responses r ON p.id = r.project_id
WHERE p.user_id = auth.uid()
GROUP BY p.id;