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
  report_markdown?: string;
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

// Helper to extract sections from markdown
function extractSection(markdown: string, sectionName: string): string {
  if (!markdown) return "";
  const patterns = [
    new RegExp(`\\*\\*${sectionName}\\*\\*[:\\s]*([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, "i"),
    new RegExp(`##\\s*${sectionName}[:\\s]*([\\s\\S]*?)(?=##|$)`, "i"),
    new RegExp(`${sectionName}[:\\s]*([\\s\\S]*?)(?=\\n\\n|$)`, "i"),
  ];
  for (const pattern of patterns) {
    const match = markdown.match(pattern);
    if (match && match[1]) {
      return match[1].trim().replace(/\*\*/g, "").substring(0, 250);
    }
  }
  return "";
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
        "Invisible Expert": "You deliver exceptional work, yet your contributions remain unseen. Amplify your impact through strategic visibility.",
        "Execution Hero": "You are the person everyone counts on. But this strength has become your ceiling. Step back to lead strategy.",
        "Strategic Thinker Without Voice": "You see what others miss. But your insights get lost where louder voices dominate.",
        "Over-Deliverer": "You hold yourself to impossibly high standards. This perfectionism is actually fear dressed as excellence.",
        "Certainty Seeker": "You thrive when the path is clear, but freeze facing ambiguity. Comfort with incomplete information is your gateway.",
      };
      return descriptions[archetype] || "";
    };

    // Extract key insights from AI narrative - keep short
    const hardTruth = extractSection(report.report_markdown || "", "Hard Truth");

    // Get top 5 skills for compact display
    const topSkills = Object.entries(score.dimension_scores)
      .filter(([key]) => key !== "general")
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return (
      <div
        ref={ref}
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "10mm 12mm 15mm 12mm",
          fontFamily: "Arial, sans-serif",
          backgroundColor: "#ffffff",
          color: "#1a2332",
          fontSize: "9pt",
          lineHeight: "1.35",
          position: "relative",
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
            fontSize: "60pt",
            fontWeight: "bold",
            color: "rgba(184, 134, 11, 0.03)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          THE LEADER'S ROW
        </div>

        {/* Content Container */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Header */}
          <div style={{ borderBottom: "2px solid #B8860B", paddingBottom: "6px", marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h1 style={{ fontSize: "16pt", fontWeight: "bold", color: "#1a2332", margin: 0 }}>
                  Career Intelligence Report
                </h1>
                <p style={{ fontSize: "8pt", color: "#B8860B", margin: "2px 0 0 0", fontWeight: 600 }}>
                  Strategic Benchmark Assessment
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: "8pt", fontWeight: "bold", color: "#B8860B" }}>THE LEADER'S ROW</p>
                <p style={{ margin: 0, color: "#6b7280", fontSize: "7pt" }}>{today}</p>
              </div>
            </div>
          </div>

          {/* Executive Summary Card */}
          <div style={{ 
            background: "#1a2332", 
            borderRadius: "6px", 
            padding: "12px 14px", 
            marginBottom: "8px",
            color: "#ffffff"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "7pt", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Inferred Level
                </p>
                <p style={{ fontSize: "14pt", fontWeight: "bold", margin: "2px 0 0 0", color: "#B8860B" }}>
                  {score.current_level_inferred} PM
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "7pt", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Readiness Score
                </p>
                <p style={{ fontSize: "20pt", fontWeight: "bold", margin: "2px 0 0 0" }}>
                  {Math.round(score.overall_score)}<span style={{ fontSize: "10pt", opacity: 0.6 }}>/100</span>
                </p>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            {/* Left Column - Strengths & Gaps */}
            <div style={{ flex: 1 }}>
              <div style={{ background: "#f0fdf4", borderRadius: "4px", padding: "8px", marginBottom: "6px" }}>
                <h3 style={{ color: "#166534", fontSize: "8pt", margin: "0 0 4px 0", fontWeight: "bold" }}>
                  ✓ Strengths
                </h3>
                {score.skill_heatmap.strengths?.slice(0, 3).map((strength, i) => (
                  <p key={i} style={{ margin: "2px 0", color: "#1a2332", fontSize: "7pt" }}>
                    {i + 1}. {dimensionLabels[strength] || strength}
                  </p>
                ))}
              </div>
              <div style={{ background: "#fffbeb", borderRadius: "4px", padding: "8px" }}>
                <h3 style={{ color: "#92400e", fontSize: "8pt", margin: "0 0 4px 0", fontWeight: "bold" }}>
                  ⚡ Priority Gaps
                </h3>
                {score.skill_heatmap.gaps?.slice(0, 3).map((gap, i) => (
                  <p key={i} style={{ margin: "2px 0", color: "#1a2332", fontSize: "7pt" }}>
                    {i + 1}. {dimensionLabels[gap] || gap}
                  </p>
                ))}
              </div>
            </div>

            {/* Right Column - Skill Bars */}
            <div style={{ flex: 1 }}>
              <h3 style={{ color: "#1a2332", fontSize: "8pt", margin: "0 0 6px 0", fontWeight: "bold" }}>
                Skill Assessment
              </h3>
              {topSkills.map(([key, value]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "6pt", color: "#6b7280", width: "70px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {dimensionLabels[key] || key}
                  </span>
                  <div style={{ flex: 1, height: "5px", background: "#e5e7eb", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ 
                      width: `${Math.min(100, value)}%`, 
                      height: "100%", 
                      background: value >= 70 ? "#10b981" : value >= 50 ? "#f59e0b" : "#ef4444",
                      borderRadius: "2px"
                    }} />
                  </div>
                  <span style={{ fontSize: "6pt", fontWeight: "bold", width: "16px", textAlign: "right" }}>
                    {Math.round(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hard Truth - Compact */}
          {hardTruth && (
            <div style={{ 
              background: "#fef2f2", 
              borderLeft: "3px solid #dc2626", 
              padding: "8px 10px", 
              marginBottom: "8px",
              borderRadius: "0 4px 4px 0"
            }}>
              <h3 style={{ color: "#dc2626", fontSize: "8pt", margin: 0, fontWeight: "bold" }}>
                Hard Truth
              </h3>
              <p style={{ margin: "3px 0 0 0", color: "#1a2332", fontSize: "7pt", lineHeight: "1.3" }}>
                {hardTruth.substring(0, 180)}{hardTruth.length > 180 ? "..." : ""}
              </p>
            </div>
          )}

          {/* Blocker Pattern - Compact */}
          {score.blocker_archetype && (
            <div style={{ 
              background: "#faf5ff", 
              borderLeft: "3px solid #9333ea", 
              padding: "8px 10px", 
              marginBottom: "8px",
              borderRadius: "0 4px 4px 0"
            }}>
              <h3 style={{ color: "#9333ea", fontSize: "8pt", margin: 0, fontWeight: "bold" }}>
                Blocker: {score.blocker_archetype}
              </h3>
              <p style={{ margin: "3px 0 0 0", color: "#4a5568", fontSize: "7pt", lineHeight: "1.3" }}>
                {(score.blocker_description || getBlockerDescription(score.blocker_archetype)).substring(0, 150)}
              </p>
            </div>
          )}

          {/* 30-Day Actions - Compact */}
          {score.thirty_day_actions && score.thirty_day_actions.length > 0 && (
            <div style={{ marginBottom: "8px" }}>
              <h3 style={{ color: "#1a2332", fontSize: "9pt", margin: "0 0 4px 0", fontWeight: "bold" }}>
                30-Day Actions
              </h3>
              <div style={{ background: "#f8f9fa", borderRadius: "4px", padding: "6px 8px" }}>
                {score.thirty_day_actions.slice(0, 3).map((action, i) => (
                  <p key={i} style={{ margin: i === 0 ? 0 : "3px 0 0 0", fontSize: "7pt", color: "#1a2332" }}>
                    <span style={{ color: "#B8860B", fontWeight: "bold" }}>{i + 1}.</span> {action.substring(0, 70)}{action.length > 70 ? "..." : ""}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* 90-Day Growth Plan - Compact */}
          {report.growth_plan_json && report.growth_plan_json.length > 0 && (
            <div style={{ marginBottom: "8px" }}>
              <h3 style={{ color: "#1a2332", fontSize: "9pt", margin: "0 0 4px 0", fontWeight: "bold" }}>
                90-Day Plan
              </h3>
              <div style={{ display: "flex", gap: "6px" }}>
                {report.growth_plan_json.slice(0, 3).map((month, i) => (
                  <div key={i} style={{ 
                    flex: 1, 
                    background: "#f8f9fa", 
                    borderRadius: "4px", 
                    padding: "6px",
                    borderTop: `2px solid ${i === 0 ? "#B8860B" : i === 1 ? "#f59e0b" : "#10b981"}`
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "3px" }}>
                      <div style={{ 
                        width: "14px", 
                        height: "14px", 
                        borderRadius: "50%", 
                        background: i === 0 ? "#B8860B" : i === 1 ? "#f59e0b" : "#10b981",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "7pt"
                      }}>
                        {month.month}
                      </div>
                      <span style={{ fontWeight: "bold", fontSize: "7pt" }}>{month.theme?.substring(0, 20)}</span>
                    </div>
                    {month.actions?.slice(0, 2).map((action, j) => (
                      <p key={j} style={{ margin: "2px 0", fontSize: "6pt", color: "#4a5568" }}>
                        • {action.substring(0, 40)}{action.length > 40 ? "..." : ""}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer - Static positioned */}
          <div style={{ 
            borderTop: "1px solid #e5e7eb", 
            paddingTop: "8px",
            marginTop: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div style={{ color: "#6b7280", fontSize: "7pt" }}>
              <p style={{ margin: 0, fontWeight: 600 }}>Ready to accelerate?</p>
              <p style={{ margin: "1px 0 0 0", color: "#B8860B", fontWeight: 600 }}>
                theleadersrow.com/200k-method
              </p>
            </div>
            <div style={{ textAlign: "right", color: "#9ca3af", fontSize: "6pt" }}>
              <p style={{ margin: 0 }}>© The Leader's Row</p>
              <p style={{ margin: "1px 0 0 0" }}>Confidential</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PDFReport.displayName = "PDFReport";
