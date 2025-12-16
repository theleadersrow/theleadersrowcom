-- Add access_token column for magic link verification
ALTER TABLE public.tool_purchases 
ADD COLUMN IF NOT EXISTS access_token text UNIQUE;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_tool_purchases_access_token ON public.tool_purchases(access_token);

-- Create index for email + tool_type lookups
CREATE INDEX IF NOT EXISTS idx_tool_purchases_email_tool ON public.tool_purchases(email, tool_type, status);