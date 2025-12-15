-- Create table to track AI tool purchases (Resume Suite and LinkedIn Signal Score)
CREATE TABLE public.tool_purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  tool_type text NOT NULL CHECK (tool_type IN ('resume_suite', 'linkedin_signal')),
  stripe_session_id text,
  purchased_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  usage_count integer NOT NULL DEFAULT 0,
  last_used_at timestamp with time zone,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  results_summary jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_tool_purchases_email ON public.tool_purchases(email);
CREATE INDEX idx_tool_purchases_tool_type ON public.tool_purchases(tool_type);
CREATE INDEX idx_tool_purchases_status ON public.tool_purchases(status);

-- Enable RLS
ALTER TABLE public.tool_purchases ENABLE ROW LEVEL SECURITY;

-- Admins can view and manage all purchases
CREATE POLICY "Admins can view all tool purchases"
ON public.tool_purchases
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update tool purchases"
ON public.tool_purchases
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete tool purchases"
ON public.tool_purchases
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert purchases (from edge functions)
CREATE POLICY "System can insert tool purchases"
ON public.tool_purchases
FOR INSERT
WITH CHECK (true);

-- Users can view their own purchases by email (for checking access)
CREATE POLICY "Anyone can check tool access by email"
ON public.tool_purchases
FOR SELECT
USING (true);