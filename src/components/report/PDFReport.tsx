import { forwardRef } from "react";

interface Score {
  overall_score: number;
  current_level_inferred: string;
  dimension_scores: Record<string, number>;
  skill_heatmap: { strengths: string[]; gaps: string[] };
  experience_gaps: string[];
  blocker_archetype: string;
  blocker_description?: string;
  market_readiness_score?: string;
  thirty_day_actions?: string[];
  market_fit: { role_types: string[]; company_types: string[] };
}

interface Report {
  growth_plan_json: Array<{
    month: number;
    theme: string;
    actions: string[];
  }>;
}

interface PDFReportProps {
  score: Score;
  report: Report;
  dimensionLabels: Record<string, string>;
}

export const PDFReport = forwardRef<HTMLDivElement, PDFReportProps>(
  ({ score, report, dimensionLabels }, ref) => {
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const getBlockerDescription = (archetype: string) => {
      const descriptions: Record<string, string> = {
        "Invisible Expert": "You consistently deliver exceptional work, yet your contributions remain unseen by decision-makers. You've mastered the craft of product management but haven't learned to amplify your impact through strategic visibility.",
        "Execution Hero": "You're the person everyone counts on to get things done—reliable, thorough, and tireless. But this very strength has become your ceiling. The path forward isn't working harder; it's stepping back to lead strategy.",
        "Strategic Thinker Without Voice": "You see what others miss—the patterns, the opportunities, the right path forward. But your insights die in your head or get lost in meetings where louder voices dominate.",
        "Over-Deliverer": "You hold yourself to impossibly high standards, polishing every deliverable until it shines. This perfectionism feels like quality—but it's actually fear dressed up as excellence.",
        "Certainty Seeker": "You thrive when the path is clear, but freeze or over-analyze when facing ambiguity. Building comfort with incomplete information is your gateway to leadership.",
      };
      return descriptions[archetype] || "";
    };

    return (
      <div
        ref={ref}
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "20mm",
          fontFamily: "Georgia, serif",
          backgroundColor: "#ffffff",
          color: "#1a2332",
          fontSize: "11pt",
          lineHeight: "1.6",
        }}
      >
        {/* Header */}
        <div style={{ borderBottom: "3px solid #B8860B", paddingBottom: "15px", marginBottom: "25px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: "28pt", fontWeight: "bold", color: "#1a2332", margin: 0, letterSpacing: "0.5px" }}>
                THE LEADER'S ROW
              </h1>
              <p style={{ fontSize: "12pt", color: "#B8860B", margin: "5px 0 0 0", fontWeight: 500 }}>
                Career Intelligence Report
              </p>
            </div>
            <div style={{ textAlign: "right", color: "#6b7280", fontSize: "10pt" }}>
              <p style={{ margin: 0 }}>Generated: {today}</p>
              <p style={{ margin: "3px 0 0 0" }}>Strategic Benchmark Assessment</p>
            </div>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div style={{ 
          background: "linear-gradient(135deg, #1a2332 0%, #2d3748 100%)", 
          borderRadius: "12px", 
          padding: "25px", 
          marginBottom: "25px",
          color: "#ffffff"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "10pt", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>
                Your Inferred Level
              </p>
              <p style={{ fontSize: "22pt", fontWeight: "bold", margin: "5px 0 0 0", color: "#B8860B" }}>
                {score.current_level_inferred} Product Manager
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "10pt", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>
                Readiness Score
              </p>
              <p style={{ fontSize: "36pt", fontWeight: "bold", margin: "5px 0 0 0" }}>
                {Math.round(score.overall_score)}<span style={{ fontSize: "16pt", opacity: 0.7 }}>/100</span>
              </p>
            </div>
          </div>
        </div>

        {/* Market Readiness */}
        {score.market_readiness_score && (
          <div style={{ 
            background: "#f0fdf4", 
            borderLeft: "4px solid #10b981", 
            padding: "15px 20px", 
            marginBottom: "25px",
            borderRadius: "0 8px 8px 0"
          }}>
            <p style={{ fontWeight: "bold", color: "#047857", margin: 0, fontSize: "10pt", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Market Readiness Assessment
            </p>
            <p style={{ margin: "8px 0 0 0", color: "#1a2332" }}>{score.market_readiness_score}</p>
          </div>
        )}

        {/* Strengths & Gaps */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "25px" }}>
          <div style={{ flex: 1, background: "#f0fdf4", borderRadius: "8px", padding: "20px" }}>
            <h3 style={{ color: "#166534", fontSize: "12pt", margin: "0 0 12px 0", fontWeight: "bold" }}>
              ✓ Your Strengths
            </h3>
            {score.skill_heatmap.strengths?.slice(0, 3).map((strength, i) => (
              <p key={i} style={{ margin: "8px 0", color: "#1a2332" }}>
                {i + 1}. {dimensionLabels[strength] || strength}
              </p>
            ))}
          </div>
          <div style={{ flex: 1, background: "#fffbeb", borderRadius: "8px", padding: "20px" }}>
            <h3 style={{ color: "#92400e", fontSize: "12pt", margin: "0 0 12px 0", fontWeight: "bold" }}>
              ⚡ Priority Gaps
            </h3>
            {score.skill_heatmap.gaps?.slice(0, 3).map((gap, i) => (
              <p key={i} style={{ margin: "8px 0", color: "#1a2332" }}>
                {i + 1}. {dimensionLabels[gap] || gap}
              </p>
            ))}
          </div>
        </div>

        {/* Blocker Pattern */}
        {score.blocker_archetype && (
          <div style={{ 
            background: "#faf5ff", 
            borderLeft: "4px solid #9333ea", 
            padding: "20px", 
            marginBottom: "25px",
            borderRadius: "0 8px 8px 0"
          }}>
            <h3 style={{ color: "#9333ea", fontSize: "12pt", margin: 0, fontWeight: "bold" }}>
              Your Blocker Pattern: {score.blocker_archetype}
            </h3>
            <p style={{ margin: "10px 0 0 0", color: "#4a5568", fontSize: "10pt", lineHeight: "1.7" }}>
              {score.blocker_description || getBlockerDescription(score.blocker_archetype)}
            </p>
          </div>
        )}

        {/* 30-Day Actions */}
        {score.thirty_day_actions && score.thirty_day_actions.length > 0 && (
          <div style={{ marginBottom: "25px" }}>
            <h3 style={{ color: "#1a2332", fontSize: "14pt", margin: "0 0 15px 0", fontWeight: "bold" }}>
              Your 30-Day Action Plan
            </h3>
            <div style={{ background: "#f8f9fa", borderRadius: "8px", overflow: "hidden" }}>
              {score.thirty_day_actions.map((action, i) => (
                <div key={i} style={{ 
                  padding: "12px 15px", 
                  borderLeft: "3px solid #B8860B",
                  background: i % 2 === 0 ? "#ffffff" : "#f8f9fa",
                  borderBottom: i < score.thirty_day_actions!.length - 1 ? "1px solid #e5e7eb" : "none"
                }}>
                  <span style={{ color: "#B8860B", fontWeight: "bold" }}>{i + 1}.</span> {action}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 90-Day Growth Plan */}
        {report.growth_plan_json && report.growth_plan_json.length > 0 && (
          <div style={{ marginBottom: "25px" }}>
            <h3 style={{ color: "#1a2332", fontSize: "14pt", margin: "0 0 15px 0", fontWeight: "bold" }}>
              90-Day Leadership Lift Plan
            </h3>
            <div style={{ display: "flex", gap: "15px" }}>
              {report.growth_plan_json.slice(0, 3).map((month, i) => (
                <div key={i} style={{ 
                  flex: 1, 
                  background: "#f8f9fa", 
                  borderRadius: "8px", 
                  padding: "15px",
                  borderTop: `3px solid ${i === 0 ? "#B8860B" : i === 1 ? "#f59e0b" : "#10b981"}`
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <div style={{ 
                      width: "28px", 
                      height: "28px", 
                      borderRadius: "50%", 
                      background: i === 0 ? "#B8860B" : i === 1 ? "#f59e0b" : "#10b981",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "12pt"
                    }}>
                      {month.month}
                    </div>
                    <span style={{ fontWeight: "bold", fontSize: "10pt" }}>{month.theme}</span>
                  </div>
                  {month.actions?.map((action, j) => (
                    <p key={j} style={{ margin: "6px 0", fontSize: "9pt", color: "#4a5568" }}>
                      • {action}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skill Scores */}
        <div style={{ marginBottom: "25px" }}>
          <h3 style={{ color: "#1a2332", fontSize: "14pt", margin: "0 0 15px 0", fontWeight: "bold" }}>
            Skill Assessment Breakdown
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {Object.entries(score.dimension_scores)
              .filter(([key]) => key !== "general")
              .sort((a, b) => b[1] - a[1])
              .map(([key, value]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "9pt", color: "#6b7280", width: "140px" }}>
                    {dimensionLabels[key] || key}
                  </span>
                  <div style={{ 
                    flex: 1, 
                    height: "8px", 
                    background: "#e5e7eb", 
                    borderRadius: "4px", 
                    overflow: "hidden" 
                  }}>
                    <div style={{ 
                      width: `${Math.min(100, value)}%`, 
                      height: "100%", 
                      background: value >= 70 ? "#10b981" : value >= 50 ? "#f59e0b" : "#ef4444",
                      borderRadius: "4px"
                    }} />
                  </div>
                  <span style={{ fontSize: "9pt", fontWeight: "bold", width: "30px", textAlign: "right" }}>
                    {Math.round(value)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          borderTop: "1px solid #e5e7eb", 
          paddingTop: "15px", 
          marginTop: "auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ color: "#6b7280", fontSize: "9pt" }}>
            <p style={{ margin: 0 }}>Ready to accelerate your career?</p>
            <p style={{ margin: "3px 0 0 0", color: "#B8860B", fontWeight: 500 }}>
              theleadersrow.com/200k-method
            </p>
          </div>
          <div style={{ textAlign: "right", color: "#9ca3af", fontSize: "8pt" }}>
            <p style={{ margin: 0 }}>© The Leader's Row</p>
            <p style={{ margin: "3px 0 0 0" }}>Confidential Career Assessment</p>
          </div>
        </div>
      </div>
    );
  }
);

PDFReport.displayName = "PDFReport";