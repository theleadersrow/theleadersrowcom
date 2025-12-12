-- Create RPC function to create a new session securely
CREATE OR REPLACE FUNCTION public.create_session_by_token(p_session_token text)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  email text,
  status session_status,
  inferred_level text,
  current_module_index integer,
  current_question_index integer,
  session_token text,
  started_at timestamp with time zone,
  submitted_at timestamp with time zone,
  scored_at timestamp with time zone,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_session_id uuid;
BEGIN
  -- Insert new session
  INSERT INTO assessment_sessions (session_token, status)
  VALUES (p_session_token, 'in_progress')
  RETURNING assessment_sessions.id INTO v_session_id;
  
  -- Return the created session
  RETURN QUERY
  SELECT 
    s.id, s.user_id, s.email, s.status, s.inferred_level,
    s.current_module_index, s.current_question_index, s.session_token,
    s.started_at, s.submitted_at, s.scored_at, s.created_at
  FROM assessment_sessions s
  WHERE s.id = v_session_id;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.create_session_by_token(text) TO anon;
GRANT EXECUTE ON FUNCTION public.create_session_by_token(text) TO authenticated;