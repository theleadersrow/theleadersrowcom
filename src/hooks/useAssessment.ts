import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Module {
  id: string;
  name: string;
  description: string;
  order_index: number;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_label: string;
  option_text: string;
  score_map: unknown;
  level_map: unknown;
  order_index: number;
}

export interface Question {
  id: string;
  module_id: string;
  question_type: string;
  prompt: string;
  help_text: string | null;
  order_index: number;
  weight: number;
  options?: QuestionOption[];
  min_level?: string | null;
  max_level?: string | null;
  is_calibration?: boolean;
}

export interface Response {
  question_id: string;
  selected_option_id?: string;
  numeric_value?: number;
  text_value?: string;
}

export interface AssessmentSession {
  id: string;
  session_token: string;
  status: string;
  current_module_index: number;
  current_question_index: number;
  email: string | null;
  inferred_level: string | null;
}

// Level hierarchy for filtering questions
const LEVEL_ORDER = ['aspiring', 'junior', 'PM', 'Senior', 'Principal', 'Director'];

function getLevelIndex(level: string | null | undefined): number {
  if (!level) return -1;
  return LEVEL_ORDER.indexOf(level);
}

function isQuestionForLevel(question: Question, userLevel: string | null): boolean {
  // Calibration question is always shown
  if (question.is_calibration) return true;
  
  // If no level filtering, show to everyone
  if (!question.min_level && !question.max_level) return true;
  
  // If user level not yet determined, show questions without min_level
  if (!userLevel) return !question.min_level;
  
  const userLevelIdx = getLevelIndex(userLevel);
  const minLevelIdx = getLevelIndex(question.min_level);
  const maxLevelIdx = getLevelIndex(question.max_level);
  
  // Check min level (user must be at or above)
  if (question.min_level && userLevelIdx < minLevelIdx) return false;
  
  // Check max level (user must be at or below)
  if (question.max_level && userLevelIdx > maxLevelIdx) return false;
  
  return true;
}

export function useAssessment() {
  const [modules, setModules] = useState<Module[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [responses, setResponses] = useState<Map<string, Response>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Generate or retrieve session token
  const getSessionToken = useCallback(() => {
    let token = localStorage.getItem("assessment_session_token");
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem("assessment_session_token", token);
    }
    return token;
  }, []);

  // Load modules and questions
  const loadAssessmentData = useCallback(async () => {
    try {
      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from("assessment_modules")
        .select("*")
        .eq("is_active", true)
        .order("order_index");

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

      // Fetch questions with options
      const { data: questionsData, error: questionsError } = await supabase
        .from("assessment_questions")
        .select(`
          *,
          options:question_options(*)
        `)
        .eq("is_active", true)
        .order("order_index");

      if (questionsError) throw questionsError;
      
      // Sort options within each question and cast to our types
      const sortedQuestions = (questionsData || []).map(q => {
        const options = ((q.options || []) as QuestionOption[]).sort((a, b) => a.order_index - b.order_index);
        console.log(`Question "${q.prompt.substring(0, 40)}..." has ${options.length} options`);
        return {
          ...q,
          weight: Number(q.weight) || 1,
          options
        };
      }) as Question[];
      
      console.log("Loaded questions:", sortedQuestions.length);
      setAllQuestions(sortedQuestions);
    } catch (error) {
      console.error("Error loading assessment data:", error);
      toast({
        title: "Error",
        description: "Failed to load assessment. Please refresh.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Load or create session
  const loadOrCreateSession = useCallback(async () => {
    const token = getSessionToken();
    
    try {
      // Check for existing session
      const { data: existingSession, error: fetchError } = await supabase
        .from("assessment_sessions")
        .select("*")
        .eq("session_token", token)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingSession) {
        setSession(existingSession as AssessmentSession);
        
        // Load existing responses
        const { data: existingResponses, error: responsesError } = await supabase
          .from("assessment_responses")
          .select("*")
          .eq("session_id", existingSession.id);

        if (responsesError) throw responsesError;

        const responseMap = new Map<string, Response>();
        (existingResponses || []).forEach(r => {
          responseMap.set(r.question_id, {
            question_id: r.question_id,
            selected_option_id: r.selected_option_id,
            numeric_value: r.numeric_value,
            text_value: r.text_value,
          });
        });
        setResponses(responseMap);
      } else {
        // Create new session
        const { data: newSession, error: createError } = await supabase
          .from("assessment_sessions")
          .insert({
            session_token: token,
            status: "in_progress",
          })
          .select()
          .single();

        if (createError) throw createError;
        setSession(newSession as AssessmentSession);
      }
    } catch (error) {
      console.error("Error with session:", error);
      toast({
        title: "Error",
        description: "Failed to start assessment. Please refresh.",
        variant: "destructive",
      });
    }
  }, [getSessionToken, toast]);

  // Initialize
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadAssessmentData();
      await loadOrCreateSession();
      setIsLoading(false);
    };
    init();
  }, [loadAssessmentData, loadOrCreateSession]);

  // Save a response
  const saveResponse = useCallback(async (response: Response) => {
    if (!session) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("assessment_responses")
        .upsert({
          session_id: session.id,
          question_id: response.question_id,
          selected_option_id: response.selected_option_id || null,
          numeric_value: response.numeric_value || null,
          text_value: response.text_value || null,
        }, {
          onConflict: "session_id,question_id",
        });

      if (error) throw error;

      setResponses(prev => {
        const next = new Map(prev);
        next.set(response.question_id, response);
        return next;
      });
    } catch (error) {
      console.error("Error saving response:", error);
      toast({
        title: "Error",
        description: "Failed to save answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [session, toast]);

  // Update session progress
  const updateProgress = useCallback(async (moduleIndex: number, questionIndex: number) => {
    if (!session) return;
    
    try {
      await supabase
        .from("assessment_sessions")
        .update({
          current_module_index: moduleIndex,
          current_question_index: questionIndex,
        })
        .eq("id", session.id);

      setSession(prev => prev ? {
        ...prev,
        current_module_index: moduleIndex,
        current_question_index: questionIndex,
      } : null);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  }, [session]);

  // Save email
  const saveEmail = useCallback(async (email: string) => {
    if (!session) return false;
    
    try {
      const { error } = await supabase
        .from("assessment_sessions")
        .update({ email })
        .eq("id", session.id);

      if (error) throw error;

      setSession(prev => prev ? { ...prev, email } : null);
      return true;
    } catch (error) {
      console.error("Error saving email:", error);
      toast({
        title: "Error",
        description: "Failed to save email. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [session, toast]);

  // Submit assessment
  const submitAssessment = useCallback(async () => {
    if (!session) return false;
    
    try {
      const { error } = await supabase
        .from("assessment_sessions")
        .update({
          status: "submitted",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", session.id);

      if (error) throw error;

      setSession(prev => prev ? { ...prev, status: "submitted" } : null);
      return true;
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast({
        title: "Error",
        description: "Failed to submit assessment. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [session, toast]);

  // Filter questions based on user level
  const questions = allQuestions.filter(q => isQuestionForLevel(q, session?.inferred_level));

  // Get questions for a module (filtered by level)
  const getQuestionsForModule = useCallback((moduleId: string) => {
    return allQuestions
      .filter(q => q.module_id === moduleId)
      .filter(q => isQuestionForLevel(q, session?.inferred_level));
  }, [allQuestions, session?.inferred_level]);

  // Calculate progress percentage
  const getProgress = useCallback(() => {
    const totalQuestions = questions.length;
    const answeredQuestions = responses.size;
    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  }, [questions.length, responses.size]);

  // Check if signup gate should show (after 6 questions)
  const shouldShowSignupGate = useCallback(() => {
    return responses.size >= 6 && !session?.email;
  }, [responses.size, session?.email]);

  // Save inferred level to session
  const saveInferredLevel = useCallback(async (level: string) => {
    if (!session) return false;
    
    try {
      const { error } = await supabase
        .from("assessment_sessions")
        .update({ inferred_level: level })
        .eq("id", session.id);

      if (error) throw error;

      setSession(prev => prev ? { ...prev, inferred_level: level } : null);
      return true;
    } catch (error) {
      console.error("Error saving inferred level:", error);
      return false;
    }
  }, [session]);

  return {
    modules,
    questions,
    session,
    responses,
    isLoading,
    isSaving,
    saveResponse,
    updateProgress,
    saveEmail,
    saveInferredLevel,
    submitAssessment,
    getQuestionsForModule,
    getProgress,
    shouldShowSignupGate,
  };
}
