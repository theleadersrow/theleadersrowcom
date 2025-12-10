-- Create a table for email leads
CREATE TABLE public.email_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  lead_magnet TEXT NOT NULL DEFAULT 'starter-kit',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_leads ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting leads (anyone can subscribe)
CREATE POLICY "Anyone can subscribe to lead magnets" 
ON public.email_leads 
FOR INSERT 
WITH CHECK (true);

-- Add unique constraint on email per lead magnet
CREATE UNIQUE INDEX idx_email_leads_unique ON public.email_leads(email, lead_magnet);