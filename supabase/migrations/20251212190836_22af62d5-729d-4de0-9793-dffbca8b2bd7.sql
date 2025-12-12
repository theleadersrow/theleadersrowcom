-- Create RPC function to save responses securely
CREATE OR REPLACE FUNCTION public.save_assessment_response(
  p_session_token text,
  p_question_id uuid,
  p_selected_option_id uuid DEFAULT NULL,
  p_numeric_value numeric DEFAULT NULL,
  p_text_value text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_session_id uuid;
  v_response_id uuid;
BEGIN
  -- Get session ID from token
  SELECT id INTO v_session_id
  FROM assessment_sessions
  WHERE session_token = p_session_token
  LIMIT 1;
  
  IF v_session_id IS NULL THEN
    RAISE EXCEPTION 'Invalid session token';
  END IF;
  
  -- Upsert response
  INSERT INTO assessment_responses (
    session_id,
    question_id,
    selected_option_id,
    numeric_value,
    text_value
  ) VALUES (
    v_session_id,
    p_question_id,
    p_selected_option_id,
    p_numeric_value,
    p_text_value
  )
  ON CONFLICT (session_id, question_id) DO UPDATE SET
    selected_option_id = EXCLUDED.selected_option_id,
    numeric_value = EXCLUDED.numeric_value,
    text_value = EXCLUDED.text_value
  RETURNING id INTO v_response_id;
  
  RETURN v_response_id;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.save_assessment_response(text, uuid, uuid, numeric, text) TO anon;
GRANT EXECUTE ON FUNCTION public.save_assessment_response(text, uuid, uuid, numeric, text) TO authenticated;