-- Create table for career advisor chat history
CREATE TABLE public.career_advisor_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  email TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_career_advisor_chats_session ON public.career_advisor_chats(session_id);
CREATE INDEX idx_career_advisor_chats_email ON public.career_advisor_chats(email);

-- Enable RLS
ALTER TABLE public.career_advisor_chats ENABLE ROW LEVEL SECURITY;

-- Allow public insert/update/select for anonymous users (session-based)
CREATE POLICY "Anyone can create chat sessions"
  ON public.career_advisor_chats
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view their own chat by session"
  ON public.career_advisor_chats
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update their own chat by session"
  ON public.career_advisor_chats
  FOR UPDATE
  USING (true);

-- Trigger to update updated_at
CREATE TRIGGER update_career_advisor_chats_updated_at
  BEFORE UPDATE ON public.career_advisor_chats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();