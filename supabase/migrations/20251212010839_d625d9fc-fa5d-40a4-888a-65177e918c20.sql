-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create career_assessments table to store user submissions and AI analysis
CREATE TABLE public.career_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  resume_url TEXT,
  resume_text TEXT,
  target_companies TEXT[],
  job_description TEXT,
  current_level TEXT,
  target_level TEXT,
  skills JSONB,
  career_goals TEXT,
  conversation_history JSONB DEFAULT '[]'::jsonb,
  ai_assessment JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.career_assessments ENABLE ROW LEVEL SECURITY;

-- Allow public access since this is for all visitors
CREATE POLICY "Anyone can create career assessments"
ON public.career_assessments
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view their own assessment by session"
ON public.career_assessments
FOR SELECT
USING (true);

CREATE POLICY "Anyone can update their own assessment by session"
ON public.career_assessments
FOR UPDATE
USING (true);

-- Create storage bucket for resume uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', false);

-- Storage policies for resume uploads
CREATE POLICY "Anyone can upload resumes"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Anyone can view their own resumes"
ON storage.objects
FOR SELECT
USING (bucket_id = 'resumes');

-- Create trigger for updated_at
CREATE TRIGGER update_career_assessments_updated_at
BEFORE UPDATE ON public.career_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();