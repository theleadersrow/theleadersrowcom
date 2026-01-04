-- PM Interview Intelligence Data Model

-- 1) Interview Users Profile (extends existing profiles)
CREATE TABLE public.interview_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  target_role_level TEXT NOT NULL DEFAULT 'Senior' CHECK (target_role_level IN ('PM', 'Senior', 'Principal', 'GPM', 'Director')),
  target_company_type TEXT NOT NULL DEFAULT 'FAANG' CHECK (target_company_type IN ('FAANG', 'Startup', 'Enterprise', 'Growth', 'Other')),
  domain_focus TEXT DEFAULT 'General',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2) Interview Sessions
CREATE TABLE public.interview_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.interview_users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  interview_type TEXT NOT NULL DEFAULT 'full_loop' CHECK (interview_type IN ('full_loop', 'category_drill', 'rapid_fire')),
  selected_categories TEXT[] DEFAULT '{}',
  target_level TEXT NOT NULL DEFAULT 'Senior',
  target_company TEXT DEFAULT 'FAANG',
  overall_score_0_100 INTEGER,
  readiness_verdict TEXT CHECK (readiness_verdict IN ('ready', 'almost_ready', 'not_yet')),
  committee_recommendation TEXT CHECK (committee_recommendation IN ('strong_hire', 'hire', 'lean_hire', 'no_hire')),
  committee_notes TEXT,
  strong_hire_signals_count INTEGER DEFAULT 0,
  red_flags_count INTEGER DEFAULT 0,
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3) Question Bank
CREATE TABLE public.interview_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('product_sense', 'strategy', 'execution', 'data_metrics', 'influence', 'leadership')),
  prompt_text TEXT NOT NULL,
  difficulty INTEGER NOT NULL DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 5),
  target_level TEXT NOT NULL DEFAULT 'Senior' CHECK (target_level IN ('PM', 'Senior', 'Principal', 'GPM', 'Director')),
  rubric_weights JSONB NOT NULL DEFAULT '{"problem_framing": 0.2, "strategic_thinking": 0.2, "execution_rigor": 0.15, "decision_quality": 0.15, "communication_clarity": 0.15, "ownership_impact": 0.15}',
  company_context TEXT,
  followup_prompts TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4) Answers
CREATE TABLE public.interview_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.interview_questions(id),
  answer_text TEXT NOT NULL,
  audio_url TEXT,
  transcript TEXT,
  question_index INTEGER NOT NULL DEFAULT 0,
  timestamp_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  timestamp_end TIMESTAMP WITH TIME ZONE,
  is_retry BOOLEAN DEFAULT false,
  original_answer_id UUID REFERENCES public.interview_answers(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5) Evaluations (one per answer)
CREATE TABLE public.interview_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.interview_questions(id),
  answer_id UUID NOT NULL REFERENCES public.interview_answers(id) ON DELETE CASCADE,
  problem_framing_1_5 INTEGER CHECK (problem_framing_1_5 >= 1 AND problem_framing_1_5 <= 5),
  strategic_thinking_1_5 INTEGER CHECK (strategic_thinking_1_5 >= 1 AND strategic_thinking_1_5 <= 5),
  execution_rigor_1_5 INTEGER CHECK (execution_rigor_1_5 >= 1 AND execution_rigor_1_5 <= 5),
  decision_quality_1_5 INTEGER CHECK (decision_quality_1_5 >= 1 AND decision_quality_1_5 <= 5),
  communication_clarity_1_5 INTEGER CHECK (communication_clarity_1_5 >= 1 AND communication_clarity_1_5 <= 5),
  ownership_impact_1_5 INTEGER CHECK (ownership_impact_1_5 >= 1 AND ownership_impact_1_5 <= 5),
  category_score_0_100 INTEGER,
  level_calibration TEXT CHECK (level_calibration IN ('below', 'at', 'above')),
  hire_signals JSONB DEFAULT '[]',
  feedback_strengths TEXT[],
  feedback_gaps TEXT[],
  followup_questions TEXT[],
  rewritten_sample_answer TEXT,
  coach_next_steps TEXT[],
  live_checklist JSONB DEFAULT '{"defined_user_problem": false, "success_metric": false, "tradeoffs_clear": false, "quantified_impact": false, "ownership_explicit": false}',
  interviewer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6) STAR Story Bank
CREATE TABLE public.star_bank (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.interview_users(id) ON DELETE CASCADE,
  session_token TEXT,
  title TEXT NOT NULL,
  theme_tags TEXT[] DEFAULT '{}',
  situation TEXT NOT NULL,
  task TEXT NOT NULL,
  action TEXT NOT NULL,
  result TEXT NOT NULL,
  metrics JSONB DEFAULT '[]',
  scope JSONB DEFAULT '{"users": "", "revenue": "", "cost": "", "latency": "", "geo": "", "team_size": ""}',
  stakeholders TEXT[] DEFAULT '{}',
  competency_tags TEXT[] DEFAULT '{}',
  level_signal TEXT DEFAULT 'Senior' CHECK (level_signal IN ('PM', 'Senior', 'Principal', 'GPM', 'Director')),
  confidence_score NUMERIC(3,2) DEFAULT 0.0,
  missing_fields TEXT[] DEFAULT '{}',
  version_30sec TEXT,
  version_2min TEXT,
  version_deep_dive TEXT,
  best_categories TEXT[] DEFAULT '{}',
  risk_areas TEXT[],
  last_used_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  source_answer_id UUID REFERENCES public.interview_answers(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7) Narrative Insights (per session)
CREATE TABLE public.narrative_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  repeated_themes TEXT[] DEFAULT '{}',
  missing_themes TEXT[] DEFAULT '{}',
  proof_gaps JSONB DEFAULT '[]',
  metric_gaps TEXT[] DEFAULT '{}',
  ownership_gaps TEXT[] DEFAULT '{}',
  clarity_gaps TEXT[] DEFAULT '{}',
  story_recommendations UUID[] DEFAULT '{}',
  narrative_score_0_100 INTEGER,
  coverage_score INTEGER,
  proof_metrics_score INTEGER,
  ownership_clarity_score INTEGER,
  decision_tradeoffs_score INTEGER,
  concision_clarity_score INTEGER,
  next_drill_plan JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8) Category Scores (computed per session)
CREATE TABLE public.session_category_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  score_0_100 INTEGER,
  strongest_dimension TEXT,
  weakest_dimension TEXT,
  questions_count INTEGER DEFAULT 0,
  below_count INTEGER DEFAULT 0,
  at_count INTEGER DEFAULT 0,
  above_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.interview_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.star_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.narrative_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_category_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Interview Users
CREATE POLICY "Users can view own profile" ON public.interview_users FOR SELECT USING (true);
CREATE POLICY "Users can create profile" ON public.interview_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON public.interview_users FOR UPDATE USING (true);

-- Interview Sessions
CREATE POLICY "Anyone can create sessions" ON public.interview_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert sessions" ON public.interview_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sessions" ON public.interview_sessions FOR UPDATE USING (true);

-- Interview Questions (read-only for users)
CREATE POLICY "Anyone can view questions" ON public.interview_questions FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage questions" ON public.interview_questions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Interview Answers
CREATE POLICY "Anyone can view answers" ON public.interview_answers FOR SELECT USING (true);
CREATE POLICY "Anyone can insert answers" ON public.interview_answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update answers" ON public.interview_answers FOR UPDATE USING (true);

-- Interview Evaluations
CREATE POLICY "Anyone can view evaluations" ON public.interview_evaluations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert evaluations" ON public.interview_evaluations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update evaluations" ON public.interview_evaluations FOR UPDATE USING (true);

-- STAR Bank
CREATE POLICY "Anyone can view star bank" ON public.star_bank FOR SELECT USING (true);
CREATE POLICY "Anyone can insert star bank" ON public.star_bank FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update star bank" ON public.star_bank FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete star bank" ON public.star_bank FOR DELETE USING (true);

-- Narrative Insights
CREATE POLICY "Anyone can view insights" ON public.narrative_insights FOR SELECT USING (true);
CREATE POLICY "Anyone can insert insights" ON public.narrative_insights FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update insights" ON public.narrative_insights FOR UPDATE USING (true);

-- Session Category Scores
CREATE POLICY "Anyone can view scores" ON public.session_category_scores FOR SELECT USING (true);
CREATE POLICY "Anyone can insert scores" ON public.session_category_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update scores" ON public.session_category_scores FOR UPDATE USING (true);

-- Seed initial question bank
INSERT INTO public.interview_questions (category, prompt_text, difficulty, target_level, company_context) VALUES
-- Product Sense
('product_sense', 'You are the PM for Google Maps. Users are complaining about inaccurate arrival times. How would you approach improving this feature?', 3, 'Senior', 'Google'),
('product_sense', 'Design a feature for Instagram that helps creators monetize their content without disrupting user experience.', 4, 'Principal', 'Meta'),
('product_sense', 'Amazon wants to reduce cart abandonment by 20%. What would you build?', 3, 'Senior', 'Amazon'),
('product_sense', 'How would you improve the onboarding experience for a B2B SaaS product with complex workflows?', 3, 'Senior', 'Enterprise'),

-- Strategy
('strategy', 'You are the PM for YouTube Shorts. TikTok just launched a feature that is gaining traction. What is your response strategy?', 4, 'Principal', 'Google'),
('strategy', 'Define a 3-year product vision for a fintech startup entering the SMB lending market.', 5, 'GPM', 'Startup'),
('strategy', 'AWS is losing enterprise customers to Google Cloud. What strategic initiatives would you prioritize?', 4, 'Principal', 'Amazon'),
('strategy', 'How would you position a new AI productivity tool in a market dominated by Microsoft and Google?', 4, 'Senior', 'Startup'),

-- Execution
('execution', 'Your engineering team just told you the launch date will slip by 6 weeks. The feature was promised to a key customer. What do you do?', 3, 'Senior', 'Enterprise'),
('execution', 'Walk me through how you would launch a new payment method in 10 countries simultaneously.', 4, 'Principal', 'Stripe'),
('execution', 'You have 3 engineers and need to deliver an MVP in 8 weeks. How do you scope and prioritize?', 2, 'PM', 'Startup'),
('execution', 'Your A/B test results are inconclusive after 4 weeks. Stakeholders want a decision. What do you do?', 3, 'Senior', 'Meta'),

-- Data & Metrics
('data_metrics', 'You notice that DAU is up 15% but revenue per user is down 10%. What would you investigate?', 3, 'Senior', 'Growth'),
('data_metrics', 'Define the success metrics for a new AI-powered search feature.', 3, 'Senior', 'Google'),
('data_metrics', 'Your conversion funnel shows a 40% drop at the payment step. How would you diagnose and fix this?', 3, 'Senior', 'E-commerce'),
('data_metrics', 'Design an experimentation framework for testing pricing changes without hurting retention.', 4, 'Principal', 'SaaS'),

-- Influence & Stakeholder Management
('influence', 'Your VP of Engineering disagrees with your product direction. They control the resources. How do you handle this?', 4, 'Principal', 'Enterprise'),
('influence', 'You need to convince the executive team to invest $5M in a new initiative with uncertain ROI. How do you make the case?', 4, 'GPM', 'Growth'),
('influence', 'Sales is pushing for a feature that conflicts with your product vision. Walk me through the conversation.', 3, 'Senior', 'B2B'),
('influence', 'You have competing requests from 3 different stakeholder groups. How do you prioritize and communicate?', 3, 'Senior', 'Enterprise'),

-- Leadership
('leadership', 'Tell me about a time you had to make an unpopular decision. How did you handle the aftermath?', 3, 'Senior', 'Behavioral'),
('leadership', 'How do you build a high-performing PM team from scratch?', 5, 'GPM', 'Leadership'),
('leadership', 'Describe how you would mentor a junior PM who is struggling with stakeholder management.', 3, 'Senior', 'Leadership'),
('leadership', 'You inherited a demoralized team after a failed product launch. What do you do in the first 30 days?', 4, 'Principal', 'Leadership');