import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { InterviewHome } from "@/components/pm-interview/InterviewHome";
import { LiveInterview } from "@/components/pm-interview/LiveInterview";
import { SessionScorecard } from "@/components/pm-interview/SessionScorecard";
import { NarrativeInsights } from "@/components/pm-interview/NarrativeInsights";
import { STARBankLibrary } from "@/components/pm-interview/STARBankLibrary";
import { supabase } from "@/integrations/supabase/client";

export type PMInterviewView = 
  | "home" 
  | "live" 
  | "scorecard" 
  | "narrative" 
  | "starbank";

export interface InterviewUserProfile {
  id?: string;
  name: string;
  email: string;
  targetRoleLevel: "PM" | "Senior" | "Principal" | "GPM" | "Director";
  targetCompanyType: "FAANG" | "Startup" | "Enterprise" | "Growth" | "Other";
  domainFocus: string;
}

export interface SessionConfig {
  interviewType: "full_loop" | "category_drill" | "rapid_fire";
  selectedCategories: string[];
  targetLevel: string;
  targetCompany: string;
}

export default function PMInterview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState<PMInterviewView>("home");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string>("");
  const [userProfile, setUserProfile] = useState<InterviewUserProfile>({
    name: "",
    email: "",
    targetRoleLevel: "Senior",
    targetCompanyType: "FAANG",
    domainFocus: "General"
  });
  const [isLoading, setIsLoading] = useState(true);

  // Generate or retrieve session token
  useEffect(() => {
    const existingToken = localStorage.getItem("pm_interview_session_token");
    if (existingToken) {
      setSessionToken(existingToken);
    } else {
      const newToken = `pmi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("pm_interview_session_token", newToken);
      setSessionToken(newToken);
    }

    // Check URL params for view
    const view = searchParams.get("view") as PMInterviewView;
    const sid = searchParams.get("session");
    if (view) setCurrentView(view);
    if (sid) setSessionId(sid);

    // Load user profile from localStorage
    const savedProfile = localStorage.getItem("pm_interview_user_profile");
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Failed to parse user profile", e);
      }
    }

    setIsLoading(false);
  }, [searchParams]);

  const handleUpdateProfile = async (profile: InterviewUserProfile) => {
    setUserProfile(profile);
    localStorage.setItem("pm_interview_user_profile", JSON.stringify(profile));

    // Upsert to database
    try {
      const { data, error } = await supabase
        .from("interview_users")
        .upsert({
          email: profile.email,
          name: profile.name,
          target_role_level: profile.targetRoleLevel,
          target_company_type: profile.targetCompanyType,
          domain_focus: profile.domainFocus
        }, { onConflict: "email" })
        .select()
        .single();

      if (error) console.error("Failed to save profile:", error);
    } catch (e) {
      console.error("Profile save error:", e);
    }
  };

  const handleStartSession = async (config: SessionConfig) => {
    try {
      const { data, error } = await supabase
        .from("interview_sessions")
        .insert({
          session_token: sessionToken,
          interview_type: config.interviewType,
          selected_categories: config.selectedCategories,
          target_level: config.targetLevel,
          target_company: config.targetCompany,
          status: "active"
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setCurrentView("live");
      navigate(`/pm-interview?view=live&session=${data.id}`);
    } catch (e) {
      console.error("Failed to start session:", e);
    }
  };

  const handleEndSession = () => {
    setCurrentView("scorecard");
    navigate(`/pm-interview?view=scorecard&session=${sessionId}`);
  };

  const handleViewNarrative = () => {
    setCurrentView("narrative");
    navigate(`/pm-interview?view=narrative&session=${sessionId}`);
  };

  const handleViewSTARBank = () => {
    setCurrentView("starbank");
    navigate(`/pm-interview?view=starbank`);
  };

  const handleBackToHome = () => {
    setCurrentView("home");
    setSessionId(null);
    navigate("/pm-interview");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {currentView === "home" && (
          <InterviewHome
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            onStartSession={handleStartSession}
            onViewSTARBank={handleViewSTARBank}
          />
        )}
        
        {currentView === "live" && sessionId && (
          <LiveInterview
            sessionId={sessionId}
            sessionToken={sessionToken}
            userProfile={userProfile}
            onEndSession={handleEndSession}
            onBack={handleBackToHome}
          />
        )}
        
        {currentView === "scorecard" && sessionId && (
          <SessionScorecard
            sessionId={sessionId}
            onViewNarrative={handleViewNarrative}
            onViewSTARBank={handleViewSTARBank}
            onBack={handleBackToHome}
            onDrillCategory={(category) => {
              handleStartSession({
                interviewType: "category_drill",
                selectedCategories: [category],
                targetLevel: userProfile.targetRoleLevel,
                targetCompany: userProfile.targetCompanyType
              });
            }}
          />
        )}
        
        {currentView === "narrative" && sessionId && (
          <NarrativeInsights
            sessionId={sessionId}
            onViewSTARBank={handleViewSTARBank}
            onBack={() => {
              setCurrentView("scorecard");
              navigate(`/pm-interview?view=scorecard&session=${sessionId}`);
            }}
          />
        )}
        
        {currentView === "starbank" && (
          <STARBankLibrary
            sessionToken={sessionToken}
            onBack={handleBackToHome}
          />
        )}
      </div>
    </Layout>
  );
}
