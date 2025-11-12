-- Create table for n8n conversations
CREATE TABLE public.n8n_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for fast lookup by conversation_id
CREATE INDEX idx_n8n_conversations_conversation_id ON public.n8n_conversations(conversation_id);

-- Create index for user_id lookups
CREATE INDEX idx_n8n_conversations_user_id ON public.n8n_conversations(user_id);

-- Enable Row Level Security
ALTER TABLE public.n8n_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own conversations
CREATE POLICY "Users can view their own conversations"
  ON public.n8n_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own conversations
CREATE POLICY "Users can delete their own conversations"
  ON public.n8n_conversations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_n8n_conversations_updated_at
  BEFORE UPDATE ON public.n8n_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();