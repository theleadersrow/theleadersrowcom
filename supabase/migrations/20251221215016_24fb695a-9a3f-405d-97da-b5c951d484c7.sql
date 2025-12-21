-- Add user profile columns to career_advisor_chats table
ALTER TABLE public.career_advisor_chats
ADD COLUMN IF NOT EXISTS user_profile_type text,
ADD COLUMN IF NOT EXISTS user_profile_context text;

-- Create index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_career_advisor_chats_profile_type 
ON public.career_advisor_chats(user_profile_type);

-- Create index for updated_at for sorting
CREATE INDEX IF NOT EXISTS idx_career_advisor_chats_updated_at 
ON public.career_advisor_chats(updated_at DESC);