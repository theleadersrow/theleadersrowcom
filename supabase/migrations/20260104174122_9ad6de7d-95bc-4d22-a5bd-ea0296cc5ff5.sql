-- Add indexes for high-traffic queries to support 500+ concurrent users

-- Interview sessions - commonly queried by session_token and status
CREATE INDEX IF NOT EXISTS idx_interview_sessions_token ON interview_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user ON interview_sessions(user_id);

-- Interview answers - frequently joined with sessions and questions
CREATE INDEX IF NOT EXISTS idx_interview_answers_session ON interview_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_interview_answers_question ON interview_answers(question_id);

-- Interview evaluations - high-read table for scorecard displays
CREATE INDEX IF NOT EXISTS idx_interview_evaluations_session ON interview_evaluations(session_id);
CREATE INDEX IF NOT EXISTS idx_interview_evaluations_answer ON interview_evaluations(answer_id);

-- Interview questions - filtered by category and active status
CREATE INDEX IF NOT EXISTS idx_interview_questions_category_active ON interview_questions(category, is_active);

-- Session category scores - queried per session
CREATE INDEX IF NOT EXISTS idx_session_category_scores_session ON session_category_scores(session_id);

-- STAR bank - filtered by session token and user
CREATE INDEX IF NOT EXISTS idx_star_bank_session_token ON star_bank(session_token);
CREATE INDEX IF NOT EXISTS idx_star_bank_user ON star_bank(user_id);

-- Narrative insights - queried per session
CREATE INDEX IF NOT EXISTS idx_narrative_insights_session ON narrative_insights(session_id);

-- Interview users - looked up by email
CREATE INDEX IF NOT EXISTS idx_interview_users_email ON interview_users(email);

-- Rate limits - frequently queried for throttling (improve cleanup performance)
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_endpoint ON rate_limits(identifier, endpoint);

-- Tool purchases - access validation queries
CREATE INDEX IF NOT EXISTS idx_tool_purchases_email_tool ON tool_purchases(email, tool_type, status);
CREATE INDEX IF NOT EXISTS idx_tool_purchases_expires ON tool_purchases(expires_at) WHERE status = 'active';