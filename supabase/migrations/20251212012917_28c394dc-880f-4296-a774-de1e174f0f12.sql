-- Create enums
CREATE TYPE public.target_level AS ENUM ('PM', 'Senior', 'Principal', 'GPM', 'Director');
CREATE TYPE public.question_type AS ENUM ('multiple_choice', 'forced_choice', 'scale_1_5', 'short_text', 'scenario', 'confidence');
CREATE TYPE public.session_status AS ENUM ('not_started', 'in_progress', 'submitted', 'scored');

-- User profile for career assessment
CREATE TABLE public.user_career_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_title TEXT,
  years_experience INTEGER,
  domain TEXT,
  location TEXT,
  target_level target_level,
  target_comp_range TEXT,
  goals TEXT,
  blockers_self_report TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Assessment modules
CREATE TABLE public.assessment_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Questions
CREATE TABLE public.assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.assessment_modules(id) ON DELETE CASCADE NOT NULL,
  question_type question_type NOT NULL DEFAULT 'multiple_choice',
  prompt TEXT NOT NULL,
  help_text TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  weight NUMERIC DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Question options
CREATE TABLE public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.assessment_questions(id) ON DELETE CASCADE NOT NULL,
  option_label TEXT NOT NULL,
  option_text TEXT NOT NULL,
  score_map JSONB DEFAULT '{}'::jsonb,
  level_map JSONB DEFAULT '{}'::jsonb,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Assessment sessions
CREATE TABLE public.assessment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE,
  status session_status DEFAULT 'not_started',
  current_module_index INTEGER DEFAULT 0,
  current_question_index INTEGER DEFAULT 0,
  email TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  scored_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Responses
CREATE TABLE public.assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.assessment_sessions(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.assessment_questions(id) ON DELETE CASCADE NOT NULL,
  selected_option_id UUID REFERENCES public.question_options(id) ON DELETE SET NULL,
  numeric_value NUMERIC,
  text_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(session_id, question_id)
);

-- Scores
CREATE TABLE public.assessment_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.assessment_sessions(id) ON DELETE CASCADE NOT NULL UNIQUE,
  overall_score NUMERIC,
  current_level_inferred TEXT,
  level_gap NUMERIC,
  dimension_scores JSONB DEFAULT '{}'::jsonb,
  skill_heatmap JSONB DEFAULT '{}'::jsonb,
  experience_gaps JSONB DEFAULT '{}'::jsonb,
  blocker_archetype TEXT,
  market_fit JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Reports
CREATE TABLE public.assessment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.assessment_sessions(id) ON DELETE CASCADE NOT NULL UNIQUE,
  report_markdown TEXT,
  growth_plan_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_assessment_sessions_user ON public.assessment_sessions(user_id);
CREATE INDEX idx_assessment_sessions_token ON public.assessment_sessions(session_token);
CREATE INDEX idx_assessment_responses_session ON public.assessment_responses(session_id);
CREATE INDEX idx_assessment_questions_module ON public.assessment_questions(module_id);

-- Enable RLS
ALTER TABLE public.user_career_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_career_profiles
CREATE POLICY "Users can view own profile" ON public.user_career_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.user_career_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.user_career_profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for modules and questions (public read)
CREATE POLICY "Anyone can view active modules" ON public.assessment_modules FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage modules" ON public.assessment_modules FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active questions" ON public.assessment_questions FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage questions" ON public.assessment_questions FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view options" ON public.question_options FOR SELECT USING (true);
CREATE POLICY "Admins can manage options" ON public.question_options FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for sessions (by user_id or session_token)
CREATE POLICY "Users can view own sessions" ON public.assessment_sessions FOR SELECT USING (auth.uid() = user_id OR session_token IS NOT NULL);
CREATE POLICY "Anyone can create sessions" ON public.assessment_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own sessions" ON public.assessment_sessions FOR UPDATE USING (auth.uid() = user_id OR session_token IS NOT NULL);

-- RLS Policies for responses
CREATE POLICY "Users can view own responses" ON public.assessment_responses FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.assessment_sessions WHERE id = session_id AND (user_id = auth.uid() OR session_token IS NOT NULL))
);
CREATE POLICY "Anyone can insert responses" ON public.assessment_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own responses" ON public.assessment_responses FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.assessment_sessions WHERE id = session_id AND (user_id = auth.uid() OR session_token IS NOT NULL))
);

-- RLS Policies for scores
CREATE POLICY "Users can view own scores" ON public.assessment_scores FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.assessment_sessions WHERE id = session_id AND user_id = auth.uid())
);
CREATE POLICY "System can insert scores" ON public.assessment_scores FOR INSERT WITH CHECK (true);

-- RLS Policies for reports
CREATE POLICY "Users can view own reports" ON public.assessment_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.assessment_sessions WHERE id = session_id AND user_id = auth.uid())
);
CREATE POLICY "System can insert reports" ON public.assessment_reports FOR INSERT WITH CHECK (true);

-- Seed the 5 assessment modules
INSERT INTO public.assessment_modules (name, description, order_index) VALUES
('Strategic Level Calibration', 'Determine your true operating level through scenario judgment, scope, ambiguity, influence, and business ownership.', 1),
('Skill Leverage Map', 'Identify high-ROI skill gaps across foundational, strategic, and leadership capabilities.', 2),
('Experience & Exposure Audit', 'Detect missing experiences needed to reach the next level — 0→1 vs scale, platform exposure, exec visibility, cross-functional ownership.', 3),
('Identity & Blocker Diagnosis', 'Surface invisible blockers (confidence patterns, visibility avoidance, perfectionism, decision hesitation) and assign an archetype.', 4),
('Market & Role Fit Engine', 'Match your profile to role archetypes and company types; evaluate market signal strength and targeting clarity.', 5);

-- Trigger for updated_at
CREATE TRIGGER update_user_career_profiles_updated_at
  BEFORE UPDATE ON public.user_career_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();