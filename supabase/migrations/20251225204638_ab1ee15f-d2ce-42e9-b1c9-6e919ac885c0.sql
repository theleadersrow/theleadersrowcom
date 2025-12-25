-- Add interview_prep to allowed tool_type values
ALTER TABLE tool_purchases DROP CONSTRAINT IF EXISTS tool_purchases_tool_type_check;
ALTER TABLE tool_purchases ADD CONSTRAINT tool_purchases_tool_type_check 
CHECK (tool_type IN ('resume_suite', 'linkedin_signal', 'interview_prep'));