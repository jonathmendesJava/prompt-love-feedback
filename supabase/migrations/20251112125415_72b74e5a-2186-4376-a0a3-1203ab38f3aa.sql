-- Add openai_api_key column to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN openai_api_key TEXT;