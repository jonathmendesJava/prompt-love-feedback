-- Add public form display fields to projects table
ALTER TABLE public.projects 
ADD COLUMN public_title TEXT,
ADD COLUMN public_description TEXT;