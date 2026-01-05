-- Create table for AMA feedback
CREATE TABLE public.ama_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  registration_id UUID REFERENCES public.beta_event_registrations(id) ON DELETE SET NULL,
  event_date DATE NOT NULL,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  content_quality INTEGER CHECK (content_quality >= 1 AND content_quality <= 5),
  speaker_quality INTEGER CHECK (speaker_quality >= 1 AND speaker_quality <= 5),
  would_recommend BOOLEAN,
  most_valuable TEXT,
  suggestions TEXT,
  topics_for_next TEXT,
  testimonial TEXT,
  allow_testimonial_use BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ama_feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback (public form)
CREATE POLICY "Anyone can submit feedback"
ON public.ama_feedback
FOR INSERT
WITH CHECK (true);

-- Only admins can view feedback
CREATE POLICY "Admins can view feedback"
ON public.ama_feedback
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Create index for faster queries
CREATE INDEX idx_ama_feedback_event_date ON public.ama_feedback(event_date DESC);
CREATE INDEX idx_ama_feedback_email ON public.ama_feedback(email);