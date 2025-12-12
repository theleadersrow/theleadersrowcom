-- Create rate limiting table for edge functions
CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP address or email
  endpoint text NOT NULL, -- function name
  request_count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(identifier, endpoint)
);

-- Enable RLS (only edge functions with service role can access)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No public policies - only service role access
-- This table is managed entirely by edge functions using service role

-- Create index for fast lookups
CREATE INDEX idx_rate_limits_lookup ON public.rate_limits(identifier, endpoint, window_start);

-- Create cleanup function for old rate limit records (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM rate_limits WHERE window_start < now() - interval '1 hour';
$$;