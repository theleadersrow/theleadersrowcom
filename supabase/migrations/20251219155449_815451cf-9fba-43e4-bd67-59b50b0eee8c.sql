-- Create table for beta event registrations
CREATE TABLE public.beta_event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  current_position TEXT NOT NULL,
  company TEXT,
  job_search_status TEXT NOT NULL,
  target_roles TEXT NOT NULL,
  linkedin_url TEXT,
  understands_beta_terms BOOLEAN NOT NULL DEFAULT false,
  agrees_to_communication BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, invited, waitlisted
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  invited_at TIMESTAMP WITH TIME ZONE,
  zoom_link_sent BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.beta_event_registrations ENABLE ROW LEVEL SECURITY;

-- Admins can view and manage all registrations
CREATE POLICY "Admins can manage beta registrations"
ON public.beta_event_registrations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can submit a registration
CREATE POLICY "Anyone can submit beta registration"
ON public.beta_event_registrations
FOR INSERT
WITH CHECK (true);

-- Create index for email lookups
CREATE INDEX idx_beta_registrations_email ON public.beta_event_registrations(email);
CREATE INDEX idx_beta_registrations_status ON public.beta_event_registrations(status);