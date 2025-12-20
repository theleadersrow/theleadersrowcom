-- Add explicit SELECT policy to beta_event_registrations table
-- This ensures only admins can read registration data

CREATE POLICY "Only admins can view beta registrations"
ON public.beta_event_registrations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));