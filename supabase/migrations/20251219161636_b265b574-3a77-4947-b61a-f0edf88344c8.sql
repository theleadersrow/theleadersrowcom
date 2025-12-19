-- Add tool_type column to track which beta event the user is registering for
ALTER TABLE public.beta_event_registrations 
ADD COLUMN tool_type text NOT NULL DEFAULT 'resume_suite';

-- Add comment for clarity
COMMENT ON COLUMN public.beta_event_registrations.tool_type IS 'Type of tool: resume_suite or linkedin_signal';