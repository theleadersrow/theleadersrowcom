-- Fix PUBLIC_DATA_EXPOSURE: Career advisor data exposed with weak RLS
-- Solution: Use SECURITY DEFINER functions for controlled access

-- 1. Drop overly permissive policies on career_advisor_chats
DROP POLICY IF EXISTS "Anyone can view their own chat by session" ON public.career_advisor_chats;
DROP POLICY IF EXISTS "Anyone can update their own chat by session" ON public.career_advisor_chats;
DROP POLICY IF EXISTS "Anyone can insert chat" ON public.career_advisor_chats;
DROP POLICY IF EXISTS "Anyone can delete their own chat by session" ON public.career_advisor_chats;

-- 2. Drop overly permissive policies on career_advisor_goals  
DROP POLICY IF EXISTS "Anyone can view their own goals by session" ON public.career_advisor_goals;
DROP POLICY IF EXISTS "Anyone can manage their own goals by session" ON public.career_advisor_goals;
DROP POLICY IF EXISTS "Anyone can insert goals" ON public.career_advisor_goals;
DROP POLICY IF EXISTS "Anyone can update their own goals by session" ON public.career_advisor_goals;
DROP POLICY IF EXISTS "Anyone can delete their own goals by session" ON public.career_advisor_goals;

-- 3. Drop overly permissive policies on career_advisor_summaries
DROP POLICY IF EXISTS "Anyone can view their own summaries by session" ON public.career_advisor_summaries;
DROP POLICY IF EXISTS "Anyone can manage their own summaries by session" ON public.career_advisor_summaries;
DROP POLICY IF EXISTS "Anyone can insert summaries" ON public.career_advisor_summaries;
DROP POLICY IF EXISTS "Anyone can update their own summaries by session" ON public.career_advisor_summaries;
DROP POLICY IF EXISTS "Anyone can delete their own summaries by session" ON public.career_advisor_summaries;

-- 4. Create restrictive RLS policies (admin only for direct access)
-- career_advisor_chats: Only admins can access directly
CREATE POLICY "Admins can manage career_advisor_chats"
  ON public.career_advisor_chats
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- career_advisor_goals: Only admins can access directly  
CREATE POLICY "Admins can manage career_advisor_goals"
  ON public.career_advisor_goals
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- career_advisor_summaries: Only admins can access directly
CREATE POLICY "Admins can manage career_advisor_summaries"
  ON public.career_advisor_summaries
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. Add unique constraint on session_id for upsert operations
CREATE UNIQUE INDEX IF NOT EXISTS idx_career_advisor_chats_session_unique 
  ON public.career_advisor_chats(session_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_career_advisor_goals_session_title_unique
  ON public.career_advisor_goals(session_id, title);
CREATE UNIQUE INDEX IF NOT EXISTS idx_career_advisor_summaries_session_unique
  ON public.career_advisor_summaries(session_id);

-- 6. Create SECURITY DEFINER function to get chat by session_id
CREATE OR REPLACE FUNCTION public.get_chat_by_session(p_session_id text)
RETURNS TABLE (
  id uuid,
  session_id text,
  email text,
  messages jsonb,
  user_profile_type text,
  user_profile_context text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, session_id, email, messages, user_profile_type, user_profile_context, created_at, updated_at
  FROM career_advisor_chats
  WHERE career_advisor_chats.session_id = p_session_id
  LIMIT 1;
$$;

-- 7. Create SECURITY DEFINER function to upsert chat by session_id
CREATE OR REPLACE FUNCTION public.upsert_chat_by_session(
  p_session_id text,
  p_email text DEFAULT NULL,
  p_messages jsonb DEFAULT '[]'::jsonb,
  p_user_profile_type text DEFAULT NULL,
  p_user_profile_context text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_chat_id uuid;
BEGIN
  INSERT INTO career_advisor_chats (
    session_id, email, messages, user_profile_type, user_profile_context, updated_at
  )
  VALUES (
    p_session_id, p_email, p_messages, p_user_profile_type, p_user_profile_context, now()
  )
  ON CONFLICT (session_id) 
  DO UPDATE SET
    messages = EXCLUDED.messages,
    email = COALESCE(EXCLUDED.email, career_advisor_chats.email),
    user_profile_type = COALESCE(EXCLUDED.user_profile_type, career_advisor_chats.user_profile_type),
    user_profile_context = COALESCE(EXCLUDED.user_profile_context, career_advisor_chats.user_profile_context),
    updated_at = now()
  RETURNING id INTO v_chat_id;
  
  RETURN v_chat_id;
END;
$$;

-- 8. Create SECURITY DEFINER function to get goals by session_id
CREATE OR REPLACE FUNCTION public.get_goals_by_session(p_session_id text)
RETURNS TABLE (
  id uuid,
  session_id text,
  email text,
  title text,
  description text,
  status text,
  progress integer,
  target_date date,
  completed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, session_id, email, title, description, status, progress, target_date::date, completed_at, created_at, updated_at
  FROM career_advisor_goals
  WHERE career_advisor_goals.session_id = p_session_id
  ORDER BY created_at DESC;
$$;

-- 9. Create SECURITY DEFINER function to upsert goal
CREATE OR REPLACE FUNCTION public.upsert_goal_by_session(
  p_session_id text,
  p_title text,
  p_email text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_status text DEFAULT 'active',
  p_progress integer DEFAULT 0,
  p_target_date text DEFAULT NULL,
  p_completed_at timestamptz DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_goal_id uuid;
BEGIN
  INSERT INTO career_advisor_goals (
    session_id, email, title, description, status, progress, target_date, completed_at, updated_at
  )
  VALUES (
    p_session_id, p_email, p_title, p_description, p_status, p_progress, 
    CASE WHEN p_target_date IS NOT NULL THEN p_target_date::date ELSE NULL END, 
    p_completed_at, now()
  )
  ON CONFLICT (session_id, title) 
  DO UPDATE SET
    email = COALESCE(EXCLUDED.email, career_advisor_goals.email),
    description = COALESCE(EXCLUDED.description, career_advisor_goals.description),
    status = EXCLUDED.status,
    progress = EXCLUDED.progress,
    target_date = EXCLUDED.target_date,
    completed_at = EXCLUDED.completed_at,
    updated_at = now()
  RETURNING id INTO v_goal_id;
  
  RETURN v_goal_id;
END;
$$;

-- 10. Create SECURITY DEFINER function to delete goal
CREATE OR REPLACE FUNCTION public.delete_goal_by_id(p_goal_id uuid, p_session_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted boolean;
BEGIN
  DELETE FROM career_advisor_goals
  WHERE id = p_goal_id AND session_id = p_session_id;
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted > 0;
END;
$$;

-- 11. Create SECURITY DEFINER function to get summaries by session_id
CREATE OR REPLACE FUNCTION public.get_summaries_by_session(p_session_id text)
RETURNS TABLE (
  id uuid,
  session_id text,
  email text,
  summary text,
  key_insights jsonb,
  action_items jsonb,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, session_id, email, summary, key_insights, action_items, created_at
  FROM career_advisor_summaries
  WHERE career_advisor_summaries.session_id = p_session_id
  ORDER BY created_at DESC;
$$;

-- 12. Create SECURITY DEFINER function to upsert summary
CREATE OR REPLACE FUNCTION public.upsert_summary_by_session(
  p_session_id text,
  p_summary text,
  p_email text DEFAULT NULL,
  p_key_insights jsonb DEFAULT '[]'::jsonb,
  p_action_items jsonb DEFAULT '[]'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_summary_id uuid;
BEGIN
  INSERT INTO career_advisor_summaries (
    session_id, email, summary, key_insights, action_items
  )
  VALUES (
    p_session_id, p_email, p_summary, p_key_insights, p_action_items
  )
  ON CONFLICT (session_id) 
  DO UPDATE SET
    email = COALESCE(EXCLUDED.email, career_advisor_summaries.email),
    summary = EXCLUDED.summary,
    key_insights = EXCLUDED.key_insights,
    action_items = EXCLUDED.action_items
  RETURNING id INTO v_summary_id;
  
  RETURN v_summary_id;
END;
$$;