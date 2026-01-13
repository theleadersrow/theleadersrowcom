-- Create webinar_registrations table
CREATE TABLE public.webinar_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  webinar_title TEXT NOT NULL DEFAULT 'The 200K Method',
  webinar_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT '2025-01-15 19:30:00-06',
  status TEXT NOT NULL DEFAULT 'registered',
  confirmation_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.webinar_registrations ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access (admins can read all)
CREATE POLICY "Admins can view all webinar registrations" 
ON public.webinar_registrations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  )
);

-- Allow edge functions to insert (service role)
CREATE POLICY "Service role can insert webinar registrations"
ON public.webinar_registrations
FOR INSERT
WITH CHECK (true);

-- Allow edge functions to update (service role)
CREATE POLICY "Service role can update webinar registrations"
ON public.webinar_registrations
FOR UPDATE
USING (true);

-- Create index for email lookups
CREATE INDEX idx_webinar_registrations_email ON public.webinar_registrations(email);

-- Create index for status filtering
CREATE INDEX idx_webinar_registrations_status ON public.webinar_registrations(status);