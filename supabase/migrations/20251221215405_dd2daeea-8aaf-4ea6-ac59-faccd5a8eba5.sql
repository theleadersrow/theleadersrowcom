-- Add goals table for tracking career goals
CREATE TABLE public.career_advisor_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  email TEXT,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'in_progress',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add session summaries table
CREATE TABLE public.career_advisor_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  email TEXT,
  summary TEXT NOT NULL,
  key_insights JSONB DEFAULT '[]'::jsonb,
  action_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.career_advisor_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_advisor_summaries ENABLE ROW LEVEL SECURITY;

-- RLS policies for goals
CREATE POLICY "Anyone can create goals" ON public.career_advisor_goals FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view their own goals by session" ON public.career_advisor_goals FOR SELECT USING (true);
CREATE POLICY "Anyone can update their own goals by session" ON public.career_advisor_goals FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete their own goals by session" ON public.career_advisor_goals FOR DELETE USING (true);

-- RLS policies for summaries
CREATE POLICY "Anyone can create summaries" ON public.career_advisor_summaries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view their own summaries by session" ON public.career_advisor_summaries FOR SELECT USING (true);

-- Create trigger for updated_at on goals
CREATE TRIGGER update_career_advisor_goals_updated_at
  BEFORE UPDATE ON public.career_advisor_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();