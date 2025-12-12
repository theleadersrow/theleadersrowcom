-- Add more PM-critical skill questions

-- Customer Empathy / User Research dimension
INSERT INTO assessment_questions (module_id, prompt, question_type, order_index, is_active, help_text) VALUES
((SELECT id FROM assessment_modules WHERE name = 'Skill Leverage Map' LIMIT 1),
 'When did you last have a direct conversation with an end user of your product?',
 'multiple_choice', 20, true,
 'Customer proximity is key to product intuition.');

-- Prioritization / Tradeoff Thinking dimension
INSERT INTO assessment_questions (module_id, prompt, question_type, order_index, is_active, help_text) VALUES
((SELECT id FROM assessment_modules WHERE name = 'Strategic Level Calibration' LIMIT 1),
 'How do you typically prioritize your roadmap?',
 'multiple_choice', 20, true,
 'Prioritization frameworks reveal product thinking maturity.');

-- Technical Fluency dimension
INSERT INTO assessment_questions (module_id, prompt, question_type, order_index, is_active, min_level, help_text) VALUES
((SELECT id FROM assessment_modules WHERE name = 'Skill Leverage Map' LIMIT 1),
 'How deeply do you engage with technical architecture decisions?',
 'multiple_choice', 21, true, 'PM',
 'Technical depth affects your credibility with engineering.');

-- Stakeholder Management dimension
INSERT INTO assessment_questions (module_id, prompt, question_type, order_index, is_active, min_level, help_text) VALUES
((SELECT id FROM assessment_modules WHERE name = 'Identity & Blocker Diagnosis' LIMIT 1),
 'How do you handle a stakeholder who repeatedly pushes back on your decisions?',
 'multiple_choice', 20, true, 'PM',
 'Stakeholder management separates senior PMs from juniors.');

-- Product Sense / Intuition dimension  
INSERT INTO assessment_questions (module_id, prompt, question_type, order_index, is_active, help_text) VALUES
((SELECT id FROM assessment_modules WHERE name = 'Strategic Level Calibration' LIMIT 1),
 'A new feature shows strong engagement but low conversion. What do you investigate first?',
 'multiple_choice', 21, true,
 'Product sense reveals how you diagnose problems.');

-- Cross-functional Collaboration dimension
INSERT INTO assessment_questions (module_id, prompt, question_type, order_index, is_active, help_text) VALUES
((SELECT id FROM assessment_modules WHERE name = 'Experience & Exposure Audit' LIMIT 1),
 'How would your engineering counterpart describe working with you?',
 'multiple_choice', 10, true,
 'Cross-functional relationships drive execution.');

-- Add options for new questions
DO $$
DECLARE
  q_user_research uuid;
  q_prioritize uuid;
  q_technical uuid;
  q_stakeholder uuid;
  q_product_sense uuid;
  q_crossfunc uuid;
BEGIN
  SELECT id INTO q_user_research FROM assessment_questions WHERE prompt LIKE '%direct conversation with an end user%' LIMIT 1;
  SELECT id INTO q_prioritize FROM assessment_questions WHERE prompt = 'How do you typically prioritize your roadmap?' LIMIT 1;
  SELECT id INTO q_technical FROM assessment_questions WHERE prompt LIKE '%technical architecture decisions%' LIMIT 1;
  SELECT id INTO q_stakeholder FROM assessment_questions WHERE prompt LIKE '%repeatedly pushes back%' LIMIT 1;
  SELECT id INTO q_product_sense FROM assessment_questions WHERE prompt LIKE '%strong engagement but low conversion%' LIMIT 1;
  SELECT id INTO q_crossfunc FROM assessment_questions WHERE prompt LIKE '%engineering counterpart describe%' LIMIT 1;

  -- User research options
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map) VALUES
    (q_user_research, 'A', 'It''s been months - I rely on research reports', 0, '{"customer_empathy": 2, "data": 3}'),
    (q_user_research, 'B', 'Within the last month', 1, '{"customer_empathy": 3, "execution": 3}'),
    (q_user_research, 'C', 'Weekly - I make it a habit', 2, '{"customer_empathy": 5, "strategy": 3}'),
    (q_user_research, 'D', 'I embed with customers regularly as part of my process', 3, '{"customer_empathy": 5, "leadership": 3}');

  -- Prioritization options
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map) VALUES
    (q_prioritize, 'A', 'I focus on what stakeholders ask for most loudly', 0, '{"prioritization": 2, "influence": 2}'),
    (q_prioritize, 'B', 'I use a framework like RICE or ICE scoring', 1, '{"prioritization": 4, "data": 3}'),
    (q_prioritize, 'C', 'I balance quantitative scoring with strategic alignment', 2, '{"prioritization": 4, "strategy": 4}'),
    (q_prioritize, 'D', 'I tie everything to company objectives and make clear tradeoffs', 3, '{"prioritization": 5, "strategy": 5, "influence": 3}');

  -- Technical fluency options
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map) VALUES
    (q_technical, 'A', 'I leave that entirely to engineering', 0, '{"technical_fluency": 2}'),
    (q_technical, 'B', 'I understand enough to ask good questions', 1, '{"technical_fluency": 3, "execution": 3}'),
    (q_technical, 'C', 'I actively participate in architecture discussions', 2, '{"technical_fluency": 4, "influence": 3}'),
    (q_technical, 'D', 'I can challenge technical approaches and propose alternatives', 3, '{"technical_fluency": 5, "leadership": 3}');

  -- Stakeholder management options
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map) VALUES
    (q_stakeholder, 'A', 'I avoid conflict and often accommodate their requests', 0, '{"stakeholder_mgmt": 2, "influence": 2}'),
    (q_stakeholder, 'B', 'I escalate to my manager for help', 1, '{"stakeholder_mgmt": 2, "leadership": 2}'),
    (q_stakeholder, 'C', 'I dig into their underlying concerns and find common ground', 2, '{"stakeholder_mgmt": 4, "influence": 4}'),
    (q_stakeholder, 'D', 'I build alignment proactively so pushback rarely happens', 3, '{"stakeholder_mgmt": 5, "influence": 5, "leadership": 4}');

  -- Product sense options
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map) VALUES
    (q_product_sense, 'A', 'Check if there are bugs or UX issues in the flow', 0, '{"product_sense": 3, "execution": 3}'),
    (q_product_sense, 'B', 'Analyze the funnel to find where users drop off', 1, '{"product_sense": 4, "data": 4}'),
    (q_product_sense, 'C', 'Talk to users to understand their intent and blockers', 2, '{"product_sense": 4, "customer_empathy": 4}'),
    (q_product_sense, 'D', 'Combine quantitative funnel analysis with qualitative user insights', 3, '{"product_sense": 5, "data": 4, "customer_empathy": 4}');

  -- Cross-functional options
  INSERT INTO question_options (question_id, option_label, option_text, order_index, score_map) VALUES
    (q_crossfunc, 'A', 'They deliver requirements and we build', 0, '{"collaboration": 2, "influence": 2}'),
    (q_crossfunc, 'B', 'Good partner who understands trade-offs', 1, '{"collaboration": 3, "execution": 3}'),
    (q_crossfunc, 'C', 'Strategic thought partner who makes us better', 2, '{"collaboration": 4, "influence": 4}'),
    (q_crossfunc, 'D', 'Extension of the team - we co-own the product together', 3, '{"collaboration": 5, "leadership": 4}');
END $$;