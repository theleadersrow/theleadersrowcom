-- Add event_date column to track which AMA event each registration is for
ALTER TABLE public.beta_event_registrations
ADD COLUMN event_date date;