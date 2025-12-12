-- Add columns for dynamic question branching
ALTER TABLE public.assessment_questions 
ADD COLUMN IF NOT EXISTS branch_condition jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS skill_dimensions text[] DEFAULT '{}';

-- Update existing questions with skill dimensions based on their content
-- Module 1: Strategic Level Calibration - strategy, leadership, ambiguity
UPDATE public.assessment_questions 
SET skill_dimensions = ARRAY['strategy', 'leadership', 'ambiguity']
WHERE module_id = (SELECT id FROM assessment_modules WHERE name = 'Strategic Level Calibration');

-- Module 2: Skill Leverage Map - narrative, influence, data, execution
UPDATE public.assessment_questions 
SET skill_dimensions = ARRAY['narrative', 'influence', 'execution']
WHERE module_id = (SELECT id FROM assessment_modules WHERE name = 'Skill Leverage Map');

-- Module 3: Experience & Exposure Audit - visibility, business_ownership
UPDATE public.assessment_questions 
SET skill_dimensions = ARRAY['visibility', 'business_ownership', 'execution']
WHERE module_id = (SELECT id FROM assessment_modules WHERE name = 'Experience & Exposure Audit');

-- Module 4: Identity & Blocker Diagnosis - leadership, narrative, influence
UPDATE public.assessment_questions 
SET skill_dimensions = ARRAY['leadership', 'narrative', 'influence']
WHERE module_id = (SELECT id FROM assessment_modules WHERE name = 'Identity & Blocker Diagnosis');

-- Module 5: Market & Role Fit Engine - strategy, visibility, business_ownership
UPDATE public.assessment_questions 
SET skill_dimensions = ARRAY['strategy', 'visibility', 'business_ownership']
WHERE module_id = (SELECT id FROM assessment_modules WHERE name = 'Market & Role Fit Engine');

-- Insert new skill-focused questions for Weekly Edge skills (communication, influence, leadership, storytelling)
-- and 200K Method skills (personal brand, executive presence, interview mastery, negotiation)

-- Get module IDs
DO $$
DECLARE
  skill_module_id uuid;
  identity_module_id uuid;
  market_module_id uuid;
BEGIN
  SELECT id INTO skill_module_id FROM assessment_modules WHERE name = 'Skill Leverage Map';
  SELECT id INTO identity_module_id FROM assessment_modules WHERE name = 'Identity & Blocker Diagnosis';
  SELECT id INTO market_module_id FROM assessment_modules WHERE name = 'Market & Role Fit Engine';

  -- Communication & Storytelling (Weekly Edge)
  INSERT INTO assessment_questions (module_id, prompt, question_type, order_index, skill_dimensions, help_text)
  VALUES 
  (skill_module_id, 'When presenting a product update to leadership, how do you structure your message?', 'multiple_choice', 30, ARRAY['narrative', 'influence', 'communication'], 'Think about how you typically open and close your presentations.')
  ON CONFLICT DO NOTHING;

  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map)
  SELECT q.id, 'A', 'Lead with data and metrics, then explain conclusions', 0, '{"narrative": 4, "data": 8}'::jsonb
  FROM assessment_questions q WHERE q.prompt LIKE 'When presenting a product update%' AND q.module_id = skill_module_id
  ON CONFLICT DO NOTHING;
  
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map)
  SELECT q.id, 'B', 'Start with the business impact, support with key data points', 1, '{"narrative": 8, "influence": 6}'::jsonb
  FROM assessment_questions q WHERE q.prompt LIKE 'When presenting a product update%' AND q.module_id = skill_module_id
  ON CONFLICT DO NOTHING;
  
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map)
  SELECT q.id, 'C', 'Tell a story about the user problem we solved', 2, '{"narrative": 10, "influence": 8}'::jsonb
  FROM assessment_questions q WHERE q.prompt LIKE 'When presenting a product update%' AND q.module_id = skill_module_id
  ON CONFLICT DO NOTHING;
  
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map)
  SELECT q.id, 'D', 'Walk through the feature list and technical details', 3, '{"execution": 4, "narrative": 2}'::jsonb
  FROM assessment_questions q WHERE q.prompt LIKE 'When presenting a product update%' AND q.module_id = skill_module_id
  ON CONFLICT DO NOTHING;

  -- Personal Brand (200K Method)
  INSERT INTO assessment_questions (module_id, prompt, question_type, order_index, skill_dimensions, help_text)
  VALUES 
  (identity_module_id, 'How would you describe your professional brand identity?', 'multiple_choice', 30, ARRAY['visibility', 'narrative', 'personal_brand'], 'Your personal brand is how others perceive and remember you professionally.')
  ON CONFLICT DO NOTHING;

  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map)
  SELECT q.id, 'A', 'I haven''t really thought about it - I let my work speak for itself', 0, '{"visibility": 2, "narrative": 2}'::jsonb
  FROM assessment_questions q WHERE q.prompt LIKE 'How would you describe your professional brand%' AND q.module_id = identity_module_id
  ON CONFLICT DO NOTHING;
  
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map)
  SELECT q.id, 'B', 'I have a general idea but haven''t actively crafted or promoted it', 1, '{"visibility": 4, "narrative": 4}'::jsonb
  FROM assessment_questions q WHERE q.prompt LIKE 'How would you describe your professional brand%' AND q.module_id = identity_module_id
  ON CONFLICT DO NOTHING;
  
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map)
  SELECT q.id, 'C', 'I know my key differentiators and communicate them when asked', 2, '{"visibility": 6, "narrative": 6}'::jsonb
  FROM assessment_questions q WHERE q.prompt LIKE 'How would you describe your professional brand%' AND q.module_id = identity_module_id
  ON CONFLICT DO NOTHING;
  
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map)
  SELECT q.id, 'D', 'I actively manage my brand through consistent messaging, content, and visibility', 3, '{"visibility": 10, "narrative": 10}'::jsonb
  FROM assessment_questions q WHERE q.prompt LIKE 'How would you describe your professional brand%' AND q.module_id = identity_module_id
  ON CONFLICT DO NOTHING;

  -- Executive Presence (200K Method)
  INSERT INTO assessment_questions (module_id, prompt, question_type, order_index, skill_dimensions, help_text)
  VALUES 
  (skill_module_id, 'Rate your confidence speaking up in meetings with senior executives.', 'scale_1_5', 31, ARRAY['influence', 'leadership', 'executive_presence'], 'Consider how you feel and perform in high-stakes meetings.')
  ON CONFLICT DO NOTHING;

  -- Interview Mastery (200K Method)
  INSERT INTO assessment_questions (module_id, prompt, question_type, order_index, skill_dimensions, help_text)
  VALUES 
  (market_module_id, 'How prepared are you to answer strategic PM interview questions (product sense, execution, leadership)?', 'scale_1_5', 30, ARRAY['strategy', 'interview_readiness'], 'Think about framework knowledge and ability to structure answers.')
  ON CONFLICT DO NOTHING;

  -- Negotiation (200K Method)
  INSERT INTO assessment_questions (module_id, prompt, question_type, order_index, skill_dimensions, help_text)
  VALUES 
  (market_module_id, 'When negotiating compensation or scope, you typically:', 'multiple_choice', 31, ARRAY['influence', 'negotiation'], 'Be honest about your negotiation approach.')
  ON CONFLICT DO NOTHING;

  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map)
  SELECT q.id, 'A', 'Accept the first offer to avoid conflict', 0, '{"influence": 2, "negotiation": 1}'::jsonb
  FROM assessment_questions q WHERE q.prompt LIKE 'When negotiating compensation%' AND q.module_id = market_module_id
  ON CONFLICT DO NOTHING;
  
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map)
  SELECT q.id, 'B', 'Counter once but back down if there''s pushback', 1, '{"influence": 4, "negotiation": 3}'::jsonb
  FROM assessment_questions q WHERE q.prompt LIKE 'When negotiating compensation%' AND q.module_id = market_module_id
  ON CONFLICT DO NOTHING;
  
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map)
  SELECT q.id, 'C', 'Research market rates and make a justified counter-offer', 2, '{"influence": 7, "negotiation": 7}'::jsonb
  FROM assessment_questions q WHERE q.prompt LIKE 'When negotiating compensation%' AND q.module_id = market_module_id
  ON CONFLICT DO NOTHING;
  
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map)
  SELECT q.id, 'D', 'Approach it strategically - understand their constraints, present multiple options, and find mutual wins', 3, '{"influence": 10, "negotiation": 10}'::jsonb
  FROM assessment_questions q WHERE q.prompt LIKE 'When negotiating compensation%' AND q.module_id = market_module_id
  ON CONFLICT DO NOTHING;

  -- Influence without authority (Weekly Edge)
  INSERT INTO assessment_questions (module_id, prompt, question_type, order_index, skill_dimensions, help_text)
  VALUES 
  (skill_module_id, 'A key stakeholder disagrees with your product direction. How do you handle it?', 'multiple_choice', 32, ARRAY['influence', 'leadership', 'stakeholder_management'], 'Think about a real situation where you had to influence without authority.')
  ON CONFLICT DO NOTHING;

  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map)
  SELECT q.id, 'A', 'Defer to their expertise and adjust my plans accordingly', 0, '{"influence": 2, "leadership": 2}'::jsonb
  FROM assessment_questions q WHERE q.prompt LIKE 'A key stakeholder disagrees with your product direction%' AND q.module_id = skill_module_id
  ON CONFLICT DO NOTHING;
  
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map)
  SELECT q.id, 'B', 'Present data and research to support my position', 1, '{"influence": 5, "data": 6}'::jsonb
  FROM assessment_questions q WHERE q.prompt LIKE 'A key stakeholder disagrees with your product direction%' AND q.module_id = skill_module_id
  ON CONFLICT DO NOTHING;
  
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map)
  SELECT q.id, 'C', 'Seek to understand their concerns first, then find common ground', 2, '{"influence": 8, "leadership": 7}'::jsonb
  FROM assessment_questions q WHERE q.prompt LIKE 'A key stakeholder disagrees with your product direction%' AND q.module_id = skill_module_id
  ON CONFLICT DO NOTHING;
  
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map)
  SELECT q.id, 'D', 'Build coalition support before the meeting and present a unified front', 3, '{"influence": 10, "leadership": 9}'::jsonb
  FROM assessment_questions q WHERE q.prompt LIKE 'A key stakeholder disagrees with your product direction%' AND q.module_id = skill_module_id
  ON CONFLICT DO NOTHING;

  -- Visibility & self-promotion (Weekly Edge + 200K Method)
  INSERT INTO assessment_questions (module_id, prompt, question_type, order_index, skill_dimensions, help_text)
  VALUES 
  (identity_module_id, 'How often do you share your wins and accomplishments with your manager and leadership?', 'multiple_choice', 31, ARRAY['visibility', 'self_promotion', 'narrative'], 'Being visible is key to career advancement.')
  ON CONFLICT DO NOTHING;

  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map)
  SELECT q.id, 'A', 'Rarely - I expect my work to be noticed on its own', 0, '{"visibility": 2, "narrative": 2}'::jsonb
  FROM assessment_questions q WHERE q.prompt LIKE 'How often do you share your wins%' AND q.module_id = identity_module_id
  ON CONFLICT DO NOTHING;
  
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map)
  SELECT q.id, 'B', 'Only during performance reviews', 1, '{"visibility": 3, "narrative": 3}'::jsonb
  FROM assessment_questions q WHERE q.prompt LIKE 'How often do you share your wins%' AND q.module_id = identity_module_id
  ON CONFLICT DO NOTHING;
  
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map)
  SELECT q.id, 'C', 'I mention wins in 1:1s when relevant', 2, '{"visibility": 6, "narrative": 5}'::jsonb
  FROM assessment_questions q WHERE q.prompt LIKE 'How often do you share your wins%' AND q.module_id = identity_module_id
  ON CONFLICT DO NOTHING;
  
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map)
  SELECT q.id, 'D', 'I proactively create visibility through regular updates, demos, and skip-level conversations', 3, '{"visibility": 10, "narrative": 8}'::jsonb
  FROM assessment_questions q WHERE q.prompt LIKE 'How often do you share your wins%' AND q.module_id = identity_module_id
  ON CONFLICT DO NOTHING;

END $$;