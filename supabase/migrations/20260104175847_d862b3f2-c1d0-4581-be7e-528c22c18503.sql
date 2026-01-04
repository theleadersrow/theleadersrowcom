-- Add company profiles for company-specific mode
CREATE TABLE public.company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  category_weights JSONB NOT NULL DEFAULT '{}',
  preferred_answer_style TEXT,
  common_red_flags TEXT[],
  bar_raiser_expectations TEXT,
  core_values TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default company profiles
INSERT INTO public.company_profiles (company_name, display_name, category_weights, preferred_answer_style, common_red_flags, bar_raiser_expectations, core_values) VALUES
('amazon', 'Amazon', '{"execution": 1.3, "leadership": 1.2, "product_sense": 1.0, "strategy": 0.9, "data": 1.1, "influence": 1.0}', 'STAR format with metrics, ownership-focused, bias for action', ARRAY['Lack of ownership', 'No metrics', 'Committee decisions', 'Vague scope'], 'Deep dive into customer obsession, ownership, and bar raising', ARRAY['Customer Obsession', 'Ownership', 'Bias for Action', 'Dive Deep', 'Earn Trust']),
('google', 'Google', '{"product_sense": 1.3, "data": 1.2, "strategy": 1.1, "execution": 1.0, "influence": 0.9, "leadership": 0.9}', 'Structured problem-solving, first principles thinking, data-driven', ARRAY['Lack of structure', 'No hypothesis', 'Missing edge cases', 'Poor estimation'], 'Clear problem decomposition, Googleyness, technical depth', ARRAY['Focus on the user', 'Fast is better than slow', 'Dont be evil', 'Great just isnt good enough']),
('meta', 'Meta', '{"product_sense": 1.4, "influence": 1.2, "execution": 1.1, "strategy": 1.0, "data": 1.0, "leadership": 0.8}', 'Move fast, impact-focused, product intuition', ARRAY['Slow decision making', 'Over-engineering', 'Lack of product sense', 'Risk averse'], 'Strong product intuition, ability to move fast, builder mentality', ARRAY['Move Fast', 'Be Bold', 'Focus on Impact', 'Be Open', 'Build Social Value']),
('apple', 'Apple', '{"product_sense": 1.5, "execution": 1.2, "strategy": 1.0, "influence": 1.0, "data": 0.8, "leadership": 0.9}', 'Design-focused, attention to detail, user experience', ARRAY['Compromising quality', 'Feature bloat', 'Ignoring details', 'Poor aesthetics sense'], 'Obsession with user experience, simplicity, craft', ARRAY['Simplicity', 'Innovation', 'Quality', 'Privacy', 'Excellence']),
('microsoft', 'Microsoft', '{"strategy": 1.2, "execution": 1.2, "leadership": 1.1, "product_sense": 1.0, "data": 1.0, "influence": 1.0}', 'Growth mindset, enterprise focus, collaborative', ARRAY['Fixed mindset', 'Siloed thinking', 'Lack of empathy', 'Poor collaboration'], 'Growth mindset demonstration, customer empathy, inclusive leadership', ARRAY['Growth Mindset', 'Customer Obsessed', 'Diverse and Inclusive', 'One Microsoft', 'Making a difference']);

-- Add hiring committee simulation results
CREATE TABLE public.hiring_committee_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  persona_name TEXT NOT NULL,
  persona_role TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('strong_hire', 'hire', 'lean_hire', 'lean_no_hire', 'no_hire')),
  top_positives TEXT[] NOT NULL DEFAULT '{}',
  top_concerns TEXT[] NOT NULL DEFAULT '{}',
  detailed_feedback TEXT,
  confidence_score NUMERIC(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add committee summary
CREATE TABLE public.committee_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE UNIQUE,
  final_verdict TEXT NOT NULL,
  verdict_explanation TEXT,
  tipping_factors TEXT[],
  what_would_change TEXT[],
  consensus_level TEXT CHECK (consensus_level IN ('unanimous', 'strong_majority', 'split', 'contentious')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add confidence calibration
ALTER TABLE public.interview_evaluations 
ADD COLUMN IF NOT EXISTS confidence_score NUMERIC(3,2),
ADD COLUMN IF NOT EXISTS hedging_language_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS assertion_evidence_ratio NUMERIC(3,2),
ADD COLUMN IF NOT EXISTS confidence_calibration TEXT CHECK (confidence_calibration IN ('underconfident', 'calibrated', 'overconfident')),
ADD COLUMN IF NOT EXISTS confidence_coaching TEXT[];

-- Add career leverage analysis
CREATE TABLE public.career_leverage_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE UNIQUE,
  recommended_level TEXT,
  current_level_assessment TEXT,
  level_gap_analysis TEXT,
  best_fit_roles TEXT[],
  best_fit_company_types TEXT[],
  leveling_strategy TEXT,
  undervaluation_signals TEXT[],
  market_positioning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add signal coverage tracking
CREATE TABLE public.required_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_name TEXT NOT NULL,
  signal_description TEXT,
  target_level TEXT NOT NULL,
  category TEXT NOT NULL,
  importance TEXT CHECK (importance IN ('critical', 'important', 'nice_to_have')),
  example_prompts TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert required signals for different levels
INSERT INTO public.required_signals (signal_name, signal_description, target_level, category, importance, example_prompts) VALUES
('leadership_under_ambiguity', 'Leading without clear direction or authority', 'Senior', 'leadership', 'critical', ARRAY['Tell me about a time you had to lead without clear direction', 'Describe navigating ambiguity in a project']),
('stakeholder_conflict', 'Managing conflict with senior stakeholders', 'Senior', 'influence', 'critical', ARRAY['Tell me about a disagreement with a senior leader', 'How did you handle pushback from executives?']),
('failure_recovery', 'Handling failure and learning from it', 'PM', 'execution', 'critical', ARRAY['Tell me about a project that failed', 'Describe a significant mistake and what you learned']),
('cross_functional_influence', 'Influencing without authority across teams', 'Senior', 'influence', 'important', ARRAY['How did you align teams with competing priorities?', 'Describe influencing engineering without direct authority']),
('strategic_tradeoffs', 'Making and defending difficult tradeoffs', 'Principal', 'strategy', 'critical', ARRAY['Describe a major strategic tradeoff you made', 'How do you prioritize when everything seems important?']),
('org_level_impact', 'Driving organization-wide change', 'Principal', 'leadership', 'critical', ARRAY['Tell me about driving change across the organization', 'Describe a company-wide initiative you led']),
('mentorship_growth', 'Developing and mentoring others', 'Senior', 'leadership', 'important', ARRAY['How have you helped others grow?', 'Tell me about mentoring a team member']),
('data_driven_decisions', 'Using data to drive major decisions', 'PM', 'data', 'critical', ARRAY['Describe a decision you made based on data', 'How do you use metrics to guide product direction?']);

CREATE TABLE public.signal_coverage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  signal_id UUID REFERENCES public.required_signals(id),
  is_covered BOOLEAN DEFAULT false,
  coverage_strength TEXT CHECK (coverage_strength IN ('strong', 'moderate', 'weak', 'missing')),
  source_answer_id UUID REFERENCES public.interview_answers(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, signal_id)
);

-- Add offer readiness analysis
CREATE TABLE public.offer_readiness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE UNIQUE,
  predicted_level TEXT,
  downlevel_probability NUMERIC(3,2),
  negotiation_readiness TEXT CHECK (negotiation_readiness IN ('strong', 'moderate', 'weak')),
  compensation_leverage_signals TEXT[],
  leveling_risks TEXT[],
  negotiation_recommendations TEXT[],
  target_company_fit JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add objection handling mode settings
ALTER TABLE public.interview_sessions
ADD COLUMN IF NOT EXISTS objection_mode BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS target_company TEXT,
ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id);

-- Enable RLS
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hiring_committee_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_leverage_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.required_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_coverage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_readiness ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public read for profiles and signals, session-based for others)
CREATE POLICY "Company profiles are publicly readable" ON public.company_profiles FOR SELECT USING (true);
CREATE POLICY "Required signals are publicly readable" ON public.required_signals FOR SELECT USING (true);
CREATE POLICY "Anyone can read hiring committee reviews" ON public.hiring_committee_reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can insert hiring committee reviews" ON public.hiring_committee_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read committee summaries" ON public.committee_summaries FOR SELECT USING (true);
CREATE POLICY "Anyone can insert committee summaries" ON public.committee_summaries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read career leverage" ON public.career_leverage_analysis FOR SELECT USING (true);
CREATE POLICY "Anyone can insert career leverage" ON public.career_leverage_analysis FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read signal coverage" ON public.signal_coverage FOR SELECT USING (true);
CREATE POLICY "Anyone can insert signal coverage" ON public.signal_coverage FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update signal coverage" ON public.signal_coverage FOR UPDATE USING (true);
CREATE POLICY "Anyone can read offer readiness" ON public.offer_readiness FOR SELECT USING (true);
CREATE POLICY "Anyone can insert offer readiness" ON public.offer_readiness FOR INSERT WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_hiring_committee_session ON public.hiring_committee_reviews(session_id);
CREATE INDEX idx_signal_coverage_session ON public.signal_coverage(session_id);
CREATE INDEX idx_required_signals_level ON public.required_signals(target_level);
CREATE INDEX idx_company_profiles_name ON public.company_profiles(company_name);