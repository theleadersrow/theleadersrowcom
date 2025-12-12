-- Add subscription tracking fields to enrollments table
ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'one-time',
ADD COLUMN IF NOT EXISTS cancellation_requested_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_effective_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.enrollments.cancellation_requested_at IS 'Date when cancellation email was received';
COMMENT ON COLUMN public.enrollments.cancellation_effective_at IS 'Date when subscription access ends (end of billing cycle)';
COMMENT ON COLUMN public.enrollments.subscription_type IS 'one-time or subscription';