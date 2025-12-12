import { useState, useEffect, useCallback, useMemo } from "react";
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
  score_map: Record<string, number> | null;
  level_map: Record<string, string> | null;
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
  skill_dimensions?: string[];
  branch_condition?: {
    requires_dimension?: string;
    min_score?: number;
    max_score?: number;
    requires_response_pattern?: string;
  } | null;
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

// Calculate cumulative dimension scores from responses
function calculateDimensionScores(
  responses: Map<string, Response>,
  questions: Question[]
): Record<string, number> {
  const scores: Record<string, number> = {};
  
  responses.forEach((response, questionId) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    // For multiple choice, get score from selected option
    if (response.selected_option_id && question.options) {
      const option = question.options.find(o => o.id === response.selected_option_id);
      if (option?.score_map) {
        Object.entries(option.score_map).forEach(([dimension, score]) => {
          scores[dimension] = (scores[dimension] || 0) + (score as number);
        });
      }
    }
    
    // For scale questions, distribute to dimensions
    if (response.numeric_value && question.skill_dimensions) {
      question.skill_dimensions.forEach(dimension => {
        scores[dimension] = (scores[dimension] || 0) + (response.numeric_value! * 2);
      });
    }
  });
  
  return scores;
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

// Dynamic branching - check if question should be shown based on previous responses
function shouldShowDynamicQuestion(
  question: Question,
  dimensionScores: Record<string, number>,
  responses: Map<string, Response>
): boolean {
  if (!question.branch_condition) return true;
  
  const condition = question.branch_condition;
  
  // Check dimension score requirements
  if (condition.requires_dimension) {
    const score = dimensionScores[condition.requires_dimension] || 0;
    if (condition.min_score && score < condition.min_score) return false;
    if (condition.max_score && score > condition.max_score) return false;
  }
  
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
      // Check for existing session using secure RPC function
      const { data: existingSessionData, error: fetchError } = await supabase
        .rpc("get_session_by_token", { p_session_token: token });

      if (fetchError) {
        console.error("Error fetching session:", fetchError);
        throw fetchError;
      }

      const existingSession = existingSessionData?.[0];

      if (existingSession) {
        setSession(existingSession as AssessmentSession);
        
        // Load existing responses
        const { data: existingResponses, error: responsesError } = await supabase
          .from("assessment_responses")
          .select("*")
          .eq("session_id", existingSession.id);

        if (responsesError) {
          console.error("Error loading responses:", responsesError);
          throw responsesError;
        }

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
        // Create new session using secure RPC function
        const { data: newSessionData, error: createError } = await supabase
          .rpc("create_session_by_token", { p_session_token: token });

        if (createError) {
          console.error("Error creating session:", createError);
          throw createError;
        }

        const newSession = newSessionData?.[0];
        if (!newSession) {
          throw new Error("Failed to create session - no data returned");
        }
        
        setSession(newSession as AssessmentSession);
      }
    } catch (error) {
      console.error("Error with session:", error);
      toast({
        title: "Error",
        description: "Failed to start assessment. Please refresh the page.",
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

  // Update session progress using secure RPC function
  const updateProgress = useCallback(async (moduleIndex: number, questionIndex: number) => {
    if (!session) return;
    
    try {
      await supabase.rpc("update_session_by_token", {
        p_session_token: session.session_token,
        p_current_module_index: moduleIndex,
        p_current_question_index: questionIndex,
      });

      setSession(prev => prev ? {
        ...prev,
        current_module_index: moduleIndex,
        current_question_index: questionIndex,
      } : null);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  }, [session]);

  // Save email using secure RPC function
  const saveEmail = useCallback(async (email: string) => {
    if (!session) return false;
    
    try {
      const { error } = await supabase.rpc("update_session_by_token", {
        p_session_token: session.session_token,
        p_email: email,
      });

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

  // Submit assessment using secure RPC function
  const submitAssessment = useCallback(async () => {
    if (!session) return false;
    
    try {
      const { error } = await supabase.rpc("update_session_by_token", {
        p_session_token: session.session_token,
        p_status: "submitted",
        p_submitted_at: new Date().toISOString(),
      });

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

  // Calculate dimension scores for dynamic filtering
  const dimensionScores = useMemo(() => 
    calculateDimensionScores(responses, allQuestions),
    [responses, allQuestions]
  );

  // Filter questions based on user level AND dynamic conditions
  const questions = useMemo(() => 
    allQuestions
      .filter(q => isQuestionForLevel(q, session?.inferred_level))
      .filter(q => shouldShowDynamicQuestion(q, dimensionScores, responses)),
    [allQuestions, session?.inferred_level, dimensionScores, responses]
  );

  // Get questions for a module (filtered by level and dynamic conditions)
  const getQuestionsForModule = useCallback((moduleId: string) => {
    return allQuestions
      .filter(q => q.module_id === moduleId)
      .filter(q => isQuestionForLevel(q, session?.inferred_level))
      .filter(q => shouldShowDynamicQuestion(q, dimensionScores, responses));
  }, [allQuestions, session?.inferred_level, dimensionScores, responses]);

  // Calculate progress percentage - use useMemo instead of useCallback for derived value
  const progress = useMemo(() => {
    const totalQuestions = questions.length;
    const answeredQuestions = responses.size;
    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  }, [questions.length, responses.size]);

  // Check if signup gate should show (after 6 questions)
  const shouldShowSignupGate = useCallback(() => {
    return responses.size >= 6 && !session?.email;
  }, [responses.size, session?.email]);

  // Save inferred level to session using secure RPC function
  const saveInferredLevel = useCallback(async (level: string) => {
    if (!session) return false;
    
    try {
      const { error } = await supabase.rpc("update_session_by_token", {
        p_session_token: session.session_token,
        p_inferred_level: level,
      });

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
    dimensionScores,
    progress,
    saveResponse,
    updateProgress,
    saveEmail,
    saveInferredLevel,
    submitAssessment,
    getQuestionsForModule,
    shouldShowSignupGate,
  };
}
