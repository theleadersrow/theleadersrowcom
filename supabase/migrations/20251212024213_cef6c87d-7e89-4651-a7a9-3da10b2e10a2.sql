-- Add columns to support dynamic question routing based on user level
ALTER TABLE assessment_questions 
ADD COLUMN IF NOT EXISTS min_level text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS max_level text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_calibration boolean DEFAULT false;

-- Add inferred_level to sessions to track what level we determined early
ALTER TABLE assessment_sessions
ADD COLUMN IF NOT EXISTS inferred_level text DEFAULT NULL;

-- Create calibration question (asked first to determine level)
-- This will be Question 0 in the flow
INSERT INTO assessment_questions (
  module_id,
  prompt,
  question_type,
  order_index,
  is_active,
  is_calibration,
  help_text
) VALUES (
  (SELECT id FROM assessment_modules WHERE name = 'Strategic Level Calibration' LIMIT 1),
  'What best describes your current Product Management role?',
  'multiple_choice',
  0,
  true,
  true,
  'This helps us tailor the assessment to your experience level.'
);

-- Get the calibration question id and add options
DO $$
DECLARE
  calibration_q_id uuid;
BEGIN
  SELECT id INTO calibration_q_id FROM assessment_questions WHERE is_calibration = true LIMIT 1;
  
  INSERT INTO question_options (question_id, option_label, option_text, order_index, level_map) VALUES
    (calibration_q_id, 'A', 'Aspiring PM or transitioning into PM (0-1 years)', 0, '{"level": "aspiring"}'),
    (calibration_q_id, 'B', 'Associate/Junior PM (1-2 years)', 1, '{"level": "junior"}'),
    (calibration_q_id, 'C', 'Product Manager (2-4 years)', 2, '{"level": "PM"}'),
    (calibration_q_id, 'D', 'Senior PM (4-7 years)', 3, '{"level": "Senior"}'),
    (calibration_q_id, 'E', 'Staff/Principal PM or GPM (7+ years)', 4, '{"level": "Principal"}'),
    (calibration_q_id, 'F', 'Director/VP of Product (10+ years leadership)', 5, '{"level": "Director"}');
END $$;

-- Tag existing strategic questions as senior/director level
UPDATE assessment_questions 
SET min_level = 'Senior'
WHERE prompt LIKE '%VP asks%' OR prompt LIKE '%CEO wants%' OR prompt LIKE '%executive%';

-- Add some entry-level / mid-level questions
INSERT INTO assessment_questions (module_id, prompt, question_type, order_index, is_active, min_level, max_level, help_text) VALUES
-- Entry/Junior level questions
((SELECT id FROM assessment_modules WHERE name = 'Strategic Level Calibration' LIMIT 1),
 'When assigned a new feature to build, what''s your first step?',
 'multiple_choice', 11, true, NULL, 'Senior',
 'Shows how you approach new work.'),
 
((SELECT id FROM assessment_modules WHERE name = 'Strategic Level Calibration' LIMIT 1),
 'How do you typically gather user feedback?',
 'multiple_choice', 12, true, NULL, 'PM',
 'Understanding your research methods.'),

((SELECT id FROM assessment_modules WHERE name = 'Skill Leverage Map' LIMIT 1),
 'When writing a PRD, what do you find most challenging?',
 'multiple_choice', 15, true, NULL, 'Senior',
 'Identifies documentation skill gaps.');

-- Add options for new questions
DO $$
DECLARE
  q1_id uuid;
  q2_id uuid;
  q3_id uuid;
BEGIN
  SELECT id INTO q1_id FROM assessment_questions WHERE prompt = 'When assigned a new feature to build, what''s your first step?' LIMIT 1;
  SELECT id INTO q2_id FROM assessment_questions WHERE prompt = 'How do you typically gather user feedback?' LIMIT 1;
  SELECT id INTO q3_id FROM assessment_questions WHERE prompt = 'When writing a PRD, what do you find most challenging?' LIMIT 1;
  
  -- Q1 options
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map) VALUES
    (q1_id, 'A', 'Start building right away to show progress', 0, '{"execution": 2, "strategy": 1}'),
    (q1_id, 'B', 'Review existing documentation and talk to stakeholders', 1, '{"execution": 4, "strategy": 3}'),
    (q1_id, 'C', 'Define success metrics and user problems first', 2, '{"execution": 3, "strategy": 5}'),
    (q1_id, 'D', 'Create a project plan with clear milestones', 3, '{"execution": 5, "strategy": 2}');
    
  -- Q2 options  
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map) VALUES
    (q2_id, 'A', 'I rely on support tickets and bug reports', 0, '{"data": 2, "execution": 3}'),
    (q2_id, 'B', 'I conduct regular user interviews', 1, '{"data": 4, "strategy": 3}'),
    (q2_id, 'C', 'I analyze product analytics and usage data', 2, '{"data": 5, "execution": 3}'),
    (q2_id, 'D', 'I combine surveys, interviews, and analytics', 3, '{"data": 5, "strategy": 4}');
    
  -- Q3 options
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map) VALUES
    (q3_id, 'A', 'Defining clear requirements without over-specifying', 0, '{"narrative": 3, "strategy": 2}'),
    (q3_id, 'B', 'Getting alignment from all stakeholders', 1, '{"influence": 2, "narrative": 3}'),
    (q3_id, 'C', 'Balancing detail with readability', 2, '{"narrative": 4, "execution": 3}'),
    (q3_id, 'D', 'Connecting features to strategic objectives', 3, '{"narrative": 3, "strategy": 5}');
END $$;