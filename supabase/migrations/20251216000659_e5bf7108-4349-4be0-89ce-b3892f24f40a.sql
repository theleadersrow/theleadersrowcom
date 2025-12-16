-- Add column to track if reminder was sent
ALTER TABLE public.tool_purchases 
ADD COLUMN IF NOT EXISTS reminder_sent_at timestamp with time zone DEFAULT NULL;