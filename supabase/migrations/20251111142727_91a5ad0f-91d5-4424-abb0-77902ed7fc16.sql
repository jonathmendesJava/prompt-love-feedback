-- Create projects table
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  link_unique text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- Create questions table
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('text', 'multiple_choice', 'stars')),
  options jsonb,
  max_stars int DEFAULT 5,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for questions
CREATE POLICY "Users can view questions of their projects"
  ON public.questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = questions.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create questions for their projects"
  ON public.questions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = questions.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update questions of their projects"
  ON public.questions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = questions.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete questions of their projects"
  ON public.questions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = questions.project_id
    AND projects.user_id = auth.uid()
  ));

-- Public policy to view questions when submitting feedback
CREATE POLICY "Anyone can view questions for public forms"
  ON public.questions FOR SELECT
  USING (true);

-- Create responses table
CREATE TABLE public.responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  question_id uuid REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  response_text text,
  response_value int,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  session_id text NOT NULL
);

-- Enable RLS
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for responses
CREATE POLICY "Users can view responses of their projects"
  ON public.responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = responses.project_id
    AND projects.user_id = auth.uid()
  ));

-- Public policy to insert responses
CREATE POLICY "Anyone can submit responses"
  ON public.responses FOR INSERT
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_questions_project_id ON public.questions(project_id);
CREATE INDEX idx_responses_project_id ON public.responses(project_id);
CREATE INDEX idx_responses_session_id ON public.responses(session_id);
CREATE INDEX idx_projects_link_unique ON public.projects(link_unique);