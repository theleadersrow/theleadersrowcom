-- Fix: assessment_sessions publicly exposes emails via overly permissive RLS

-- Step 1: Create a security definer function for safe anonymous session access
CREATE OR REPLACE FUNCTION public.get_session_by_token(p_session_token text)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  email text,
  status session_status,
  inferred_level text,
  current_module_index integer,
  current_question_index integer,
  session_token text,
  started_at timestamptz,
  submitted_at timestamptz,
  scored_at timestamptz,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id, user_id, email, status, inferred_level,
    current_module_index, current_question_index, session_token,
    started_at, submitted_at, scored_at, created_at
  FROM assessment_sessions 
  WHERE session_token = p_session_token
  LIMIT 1;
$$;

-- Step 2: Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view own sessions" ON assessment_sessions;

-- Step 3: Create a properly restrictive SELECT policy (authenticated users only)
CREATE POLICY "Authenticated users can view own sessions"
ON assessment_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Step 4: Fix the UPDATE policy as well (it had the same issue)
DROP POLICY IF EXISTS "Users can update own sessions" ON assessment_sessions;

CREATE POLICY "Authenticated users can update own sessions"
ON assessment_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- Step 5: Create UPDATE function for anonymous users via session_token
CREATE OR REPLACE FUNCTION public.update_session_by_token(
  p_session_token text,
  p_email text DEFAULT NULL,
  p_status session_status DEFAULT NULL,
  p_inferred_level text DEFAULT NULL,
  p_current_module_index integer DEFAULT NULL,
  p_current_question_index integer DEFAULT NULL,
  p_submitted_at timestamptz DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id uuid;
BEGIN
  UPDATE assessment_sessions
  SET
    email = COALESCE(p_email, email),
    status = COALESCE(p_status, status),
    inferred_level = COALESCE(p_inferred_level, inferred_level),
    current_module_index = COALESCE(p_current_module_index, current_module_index),
    current_question_index = COALESCE(p_current_question_index, current_question_index),
    submitted_at = COALESCE(p_submitted_at, submitted_at)
  WHERE session_token = p_session_token
  RETURNING id INTO v_session_id;
  
  RETURN v_session_id;
END;
$$;