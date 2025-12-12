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
        "Invisible Expert": "You deliver exceptional work, yet your contributions remain unseen. You have mastered the craft but need to amplify your impact through strategic visibility.",
        "Execution Hero": "You are the person everyone counts on to get things done. But this strength has become your ceiling. The path forward is stepping back to lead strategy.",
        "Strategic Thinker Without Voice": "You see what others miss—the patterns, the opportunities. But your insights get lost where louder voices dominate.",
        "Over-Deliverer": "You hold yourself to impossibly high standards. This perfectionism feels like quality—but it is actually fear dressed as excellence.",
        "Certainty Seeker": "You thrive when the path is clear, but freeze when facing ambiguity. Building comfort with incomplete information is your gateway to leadership.",
      };
      return descriptions[archetype] || "";
    };

    // Get top 6 skills for compact display
    const topSkills = Object.entries(score.dimension_scores)
      .filter(([key]) => key !== "general")
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return (
      <div
        ref={ref}
        style={{
          width: "210mm",
          height: "297mm",
          padding: "15mm 18mm",
          fontFamily: "Georgia, serif",
          backgroundColor: "#ffffff",
          color: "#1a2332",
          fontSize: "9pt",
          lineHeight: "1.5",
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* Diagonal Watermark */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-45deg)",
            fontSize: "72pt",
            fontWeight: "bold",
            color: "rgba(184, 134, 11, 0.04)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 0,
            letterSpacing: "8px",
          }}
        >
          THE LEADER'S ROW
        </div>

        {/* Corner Ribbon */}
        <div
          style={{
            position: "absolute",
            top: "25px",
            right: "-35px",
            width: "150px",
            height: "28px",
            backgroundColor: "#B8860B",
            transform: "rotate(45deg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontSize: "7pt",
            fontWeight: "bold",
            letterSpacing: "0.5px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            zIndex: 10,
          }}
        >
          THE LEADER'S ROW
        </div>

        {/* Content Container */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Header */}
          <div style={{ borderBottom: "2px solid #B8860B", paddingBottom: "10px", marginBottom: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <h1 style={{ fontSize: "20pt", fontWeight: "bold", color: "#1a2332", margin: 0, letterSpacing: "0.5px" }}>
                  Career Intelligence Report
                </h1>
                <p style={{ fontSize: "9pt", color: "#B8860B", margin: "3px 0 0 0", fontWeight: 600 }}>
                  Strategic Benchmark Assessment
                </p>
              </div>
              <div style={{ textAlign: "right", color: "#6b7280", fontSize: "8pt" }}>
                <p style={{ margin: 0 }}>{today}</p>
              </div>
            </div>
          </div>

          {/* Executive Summary Card */}
          <div style={{ 
            background: "linear-gradient(135deg, #1a2332 0%, #2d3748 100%)", 
            borderRadius: "8px", 
            padding: "18px 20px", 
            marginBottom: "15px",
            color: "#ffffff"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "8pt", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>
                  Your Inferred Level
                </p>
                <p style={{ fontSize: "18pt", fontWeight: "bold", margin: "3px 0 0 0", color: "#B8860B" }}>
                  {score.current_level_inferred} Product Manager
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "8pt", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>
                  Readiness Score
                </p>
                <p style={{ fontSize: "28pt", fontWeight: "bold", margin: "3px 0 0 0" }}>
                  {Math.round(score.overall_score)}<span style={{ fontSize: "14pt", opacity: 0.7 }}>/100</span>
                </p>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
            {/* Left Column - Strengths & Gaps */}
            <div style={{ flex: 1 }}>
              <div style={{ background: "#f0fdf4", borderRadius: "6px", padding: "12px", marginBottom: "10px" }}>
                <h3 style={{ color: "#166534", fontSize: "9pt", margin: "0 0 8px 0", fontWeight: "bold" }}>
                  ✓ Your Strengths
                </h3>
                {score.skill_heatmap.strengths?.slice(0, 3).map((strength, i) => (
                  <p key={i} style={{ margin: "4px 0", color: "#1a2332", fontSize: "8pt" }}>
                    {i + 1}. {dimensionLabels[strength] || strength}
                  </p>
                ))}
              </div>
              <div style={{ background: "#fffbeb", borderRadius: "6px", padding: "12px" }}>
                <h3 style={{ color: "#92400e", fontSize: "9pt", margin: "0 0 8px 0", fontWeight: "bold" }}>
                  ⚡ Priority Gaps
                </h3>
                {score.skill_heatmap.gaps?.slice(0, 3).map((gap, i) => (
                  <p key={i} style={{ margin: "4px 0", color: "#1a2332", fontSize: "8pt" }}>
                    {i + 1}. {dimensionLabels[gap] || gap}
                  </p>
                ))}
              </div>
            </div>

            {/* Right Column - Skill Bars */}
            <div style={{ flex: 1 }}>
              <h3 style={{ color: "#1a2332", fontSize: "9pt", margin: "0 0 10px 0", fontWeight: "bold" }}>
                Skill Assessment
              </h3>
              {topSkills.map(([key, value]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "7pt", color: "#6b7280", width: "90px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {dimensionLabels[key] || key}
                  </span>
                  <div style={{ flex: 1, height: "6px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ 
                      width: `${Math.min(100, value)}%`, 
                      height: "100%", 
                      background: value >= 70 ? "#10b981" : value >= 50 ? "#f59e0b" : "#ef4444",
                      borderRadius: "3px"
                    }} />
                  </div>
                  <span style={{ fontSize: "7pt", fontWeight: "bold", width: "20px", textAlign: "right" }}>
                    {Math.round(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Blocker Pattern */}
          {score.blocker_archetype && (
            <div style={{ 
              background: "#faf5ff", 
              borderLeft: "3px solid #9333ea", 
              padding: "12px 15px", 
              marginBottom: "15px",
              borderRadius: "0 6px 6px 0"
            }}>
              <h3 style={{ color: "#9333ea", fontSize: "9pt", margin: 0, fontWeight: "bold" }}>
                Blocker Pattern: {score.blocker_archetype}
              </h3>
              <p style={{ margin: "6px 0 0 0", color: "#4a5568", fontSize: "8pt", lineHeight: "1.5" }}>
                {score.blocker_description || getBlockerDescription(score.blocker_archetype)}
              </p>
            </div>
          )}

          {/* Market Readiness */}
          {score.market_readiness_score && (
            <div style={{ 
              background: "#f0fdf4", 
              borderLeft: "3px solid #10b981", 
              padding: "10px 15px", 
              marginBottom: "15px",
              borderRadius: "0 6px 6px 0"
            }}>
              <p style={{ fontWeight: "bold", color: "#047857", margin: 0, fontSize: "8pt", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Market Readiness
              </p>
              <p style={{ margin: "4px 0 0 0", color: "#1a2332", fontSize: "8pt" }}>{score.market_readiness_score}</p>
            </div>
          )}

          {/* 30-Day Actions */}
          {score.thirty_day_actions && score.thirty_day_actions.length > 0 && (
            <div style={{ marginBottom: "15px" }}>
              <h3 style={{ color: "#1a2332", fontSize: "10pt", margin: "0 0 8px 0", fontWeight: "bold" }}>
                30-Day Action Plan
              </h3>
              <div style={{ background: "#f8f9fa", borderRadius: "6px", padding: "10px 12px" }}>
                {score.thirty_day_actions.slice(0, 4).map((action, i) => (
                  <p key={i} style={{ margin: i === 0 ? 0 : "6px 0 0 0", fontSize: "8pt", color: "#1a2332" }}>
                    <span style={{ color: "#B8860B", fontWeight: "bold" }}>{i + 1}.</span> {action}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* 90-Day Growth Plan */}
          {report.growth_plan_json && report.growth_plan_json.length > 0 && (
            <div style={{ marginBottom: "15px" }}>
              <h3 style={{ color: "#1a2332", fontSize: "10pt", margin: "0 0 8px 0", fontWeight: "bold" }}>
                90-Day Leadership Lift Plan
              </h3>
              <div style={{ display: "flex", gap: "10px" }}>
                {report.growth_plan_json.slice(0, 3).map((month, i) => (
                  <div key={i} style={{ 
                    flex: 1, 
                    background: "#f8f9fa", 
                    borderRadius: "6px", 
                    padding: "10px",
                    borderTop: `3px solid ${i === 0 ? "#B8860B" : i === 1 ? "#f59e0b" : "#10b981"}`
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                      <div style={{ 
                        width: "20px", 
                        height: "20px", 
                        borderRadius: "50%", 
                        background: i === 0 ? "#B8860B" : i === 1 ? "#f59e0b" : "#10b981",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "9pt"
                      }}>
                        {month.month}
                      </div>
                      <span style={{ fontWeight: "bold", fontSize: "8pt" }}>{month.theme}</span>
                    </div>
                    {month.actions?.slice(0, 2).map((action, j) => (
                      <p key={j} style={{ margin: "3px 0", fontSize: "7pt", color: "#4a5568" }}>
                        • {action.length > 50 ? action.substring(0, 50) + "..." : action}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ 
            position: "absolute",
            bottom: "15mm",
            left: "18mm",
            right: "18mm",
            borderTop: "1px solid #e5e7eb", 
            paddingTop: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div style={{ color: "#6b7280", fontSize: "8pt" }}>
              <p style={{ margin: 0, fontWeight: 600 }}>Ready to accelerate your career?</p>
              <p style={{ margin: "2px 0 0 0", color: "#B8860B", fontWeight: 600 }}>
                theleadersrow.com/200k-method
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "10pt", fontWeight: "bold", color: "#1a2332", letterSpacing: "1px" }}>
                THE LEADER'S ROW
              </p>
            </div>
            <div style={{ textAlign: "right", color: "#9ca3af", fontSize: "7pt" }}>
              <p style={{ margin: 0 }}>© The Leader's Row</p>
              <p style={{ margin: "2px 0 0 0" }}>Confidential Assessment</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PDFReport.displayName = "PDFReport";