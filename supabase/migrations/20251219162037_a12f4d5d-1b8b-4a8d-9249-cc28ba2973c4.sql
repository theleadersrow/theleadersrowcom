-- Add newsletter subscription column to beta_event_registrations
ALTER TABLE public.beta_event_registrations 
ADD COLUMN subscribe_to_newsletter boolean DEFAULT false;