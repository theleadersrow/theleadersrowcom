-- Add more level-specific PM questions across modules

-- Questions for Aspiring/Junior PMs
INSERT INTO assessment_questions (module_id, prompt, question_type, order_index, is_active, min_level, max_level, help_text) VALUES
((SELECT id FROM assessment_modules WHERE name = 'Skill Leverage Map' LIMIT 1),
 'How confident are you explaining technical concepts to non-technical stakeholders?',
 'scale_1_5', 16, true, NULL, 'PM',
 'Communication across audiences is key.'),

((SELECT id FROM assessment_modules WHERE name = 'Experience & Exposure Audit' LIMIT 1),
 'Have you ever owned a feature from ideation to launch?',
 'multiple_choice', 1, true, NULL, 'Senior',
 'Understanding your end-to-end experience.'),

((SELECT id FROM assessment_modules WHERE name = 'Experience & Exposure Audit' LIMIT 1),
 'How many products or major features have you shipped?',
 'multiple_choice', 2, true, NULL, 'PM',
 'Gauging your shipping experience.');

-- Questions for Senior/Principal PMs
INSERT INTO assessment_questions (module_id, prompt, question_type, order_index, is_active, min_level, max_level, help_text) VALUES
((SELECT id FROM assessment_modules WHERE name = 'Strategic Level Calibration' LIMIT 1),
 'How do you balance short-term revenue pressure with long-term product vision?',
 'multiple_choice', 13, true, 'Senior', NULL,
 'Strategic tradeoff thinking.'),

((SELECT id FROM assessment_modules WHERE name = 'Experience & Exposure Audit' LIMIT 1),
 'Have you led cross-functional initiatives spanning multiple teams?',
 'multiple_choice', 3, true, 'Senior', NULL,
 'Leadership scope assessment.'),

((SELECT id FROM assessment_modules WHERE name = 'Identity & Blocker Diagnosis' LIMIT 1),
 'What''s your biggest career challenge right now?',
 'multiple_choice', 10, true, 'Senior', NULL,
 'Identifying your growth blockers.');

-- Questions for Director level
INSERT INTO assessment_questions (module_id, prompt, question_type, order_index, is_active, min_level, max_level, help_text) VALUES
((SELECT id FROM assessment_modules WHERE name = 'Strategic Level Calibration' LIMIT 1),
 'How do you build and develop your product team?',
 'multiple_choice', 14, true, 'Principal', NULL,
 'Leadership and team development.'),

((SELECT id FROM assessment_modules WHERE name = 'Market & Role Fit Engine' LIMIT 1),
 'What type of organization would you thrive in most?',
 'multiple_choice', 5, true, 'Senior', NULL,
 'Finding your ideal environment.');

-- Add options for the new questions
DO $$
DECLARE
  q_owned_feature uuid;
  q_shipped uuid;
  q_balance uuid;
  q_cross_func uuid;
  q_challenge uuid;
  q_team uuid;
  q_org uuid;
BEGIN
  SELECT id INTO q_owned_feature FROM assessment_questions WHERE prompt = 'Have you ever owned a feature from ideation to launch?' LIMIT 1;
  SELECT id INTO q_shipped FROM assessment_questions WHERE prompt = 'How many products or major features have you shipped?' LIMIT 1;
  SELECT id INTO q_balance FROM assessment_questions WHERE prompt = 'How do you balance short-term revenue pressure with long-term product vision?' LIMIT 1;
  SELECT id INTO q_cross_func FROM assessment_questions WHERE prompt = 'Have you led cross-functional initiatives spanning multiple teams?' LIMIT 1;
  SELECT id INTO q_challenge FROM assessment_questions WHERE prompt = 'What''s your biggest career challenge right now?' LIMIT 1;
  SELECT id INTO q_team FROM assessment_questions WHERE prompt = 'How do you build and develop your product team?' LIMIT 1;
  SELECT id INTO q_org FROM assessment_questions WHERE prompt = 'What type of organization would you thrive in most?' LIMIT 1;

  -- Owned feature options
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map) VALUES
    (q_owned_feature, 'A', 'Not yet - I''ve contributed to features but not owned one', 0, '{"execution": 2, "leadership": 1}'),
    (q_owned_feature, 'B', 'Yes, one small feature with guidance', 1, '{"execution": 3, "leadership": 2}'),
    (q_owned_feature, 'C', 'Yes, multiple features independently', 2, '{"execution": 4, "leadership": 3}'),
    (q_owned_feature, 'D', 'Yes, I''ve owned entire product areas', 3, '{"execution": 5, "leadership": 4}');

  -- Shipped count options
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map) VALUES
    (q_shipped, 'A', 'None yet - still learning', 0, '{"execution": 1}'),
    (q_shipped, 'B', '1-2 features', 1, '{"execution": 2}'),
    (q_shipped, 'C', '3-5 features', 2, '{"execution": 3}'),
    (q_shipped, 'D', '5+ major features or products', 3, '{"execution": 5}');

  -- Balance options
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map) VALUES
    (q_balance, 'A', 'I focus on what leadership asks for quarter by quarter', 0, '{"strategy": 2, "influence": 2}'),
    (q_balance, 'B', 'I try to sneak in long-term bets alongside short-term wins', 1, '{"strategy": 3, "influence": 3}'),
    (q_balance, 'C', 'I frame long-term investments as strategic enablers and get buy-in', 2, '{"strategy": 5, "influence": 4}'),
    (q_balance, 'D', 'I build a portfolio approach with explicit allocation to each horizon', 3, '{"strategy": 5, "influence": 5}');

  -- Cross-functional options
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map) VALUES
    (q_cross_func, 'A', 'I work mostly within my immediate team', 0, '{"leadership": 2, "influence": 2}'),
    (q_cross_func, 'B', 'I collaborate with other teams but don''t lead the initiatives', 1, '{"leadership": 3, "influence": 3}'),
    (q_cross_func, 'C', 'I''ve led initiatives with 2-3 teams involved', 2, '{"leadership": 4, "influence": 4}'),
    (q_cross_func, 'D', 'I regularly lead org-wide or company-wide initiatives', 3, '{"leadership": 5, "influence": 5}');

  -- Challenge options
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map) VALUES
    (q_challenge, 'A', 'Getting visibility for my work and contributions', 0, '{"visibility": 2, "narrative": 2}'),
    (q_challenge, 'B', 'Breaking into senior/leadership roles', 1, '{"leadership": 2, "visibility": 3}'),
    (q_challenge, 'C', 'Navigating organizational politics', 2, '{"influence": 2, "leadership": 3}'),
    (q_challenge, 'D', 'Finding the right opportunity/company fit', 3, '{"strategy": 3, "visibility": 2}');

  -- Team building options
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map) VALUES
    (q_team, 'A', 'I focus on hiring strong ICs and letting them run', 0, '{"leadership": 3}'),
    (q_team, 'B', 'I invest heavily in coaching and developing each person', 1, '{"leadership": 4}'),
    (q_team, 'C', 'I build career frameworks and growth paths systematically', 2, '{"leadership": 5}'),
    (q_team, 'D', 'I create a culture where the team develops itself', 3, '{"leadership": 5, "influence": 4}');

  -- Organization type options
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map) VALUES
    (q_org, 'A', 'Fast-paced startup where I wear many hats', 0, '{"ambiguity": 4, "execution": 3}'),
    (q_org, 'B', 'Scale-up with growth opportunity and some structure', 1, '{"ambiguity": 3, "strategy": 3}'),
    (q_org, 'C', 'Large tech company with clear career paths', 2, '{"ambiguity": 2, "strategy": 4}'),
    (q_org, 'D', 'Enterprise with deep domain expertise needed', 3, '{"business_ownership": 4, "strategy": 3}');
END $$;