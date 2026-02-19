import { forwardRef } from "react";

interface WeeklyCareerPlannerProps {
  className?: string;
}

export const WeeklyCareerPlanner = forwardRef<HTMLDivElement, WeeklyCareerPlannerProps>(
  ({ className }, ref) => {
    const dailyPlan = [
      {
        day: "Monday",
        theme: "Clarity + Planning",
        fields: [
          "1 action that moves my career forward:",
          "1 gap I'm closing this week:",
        ],
      },
      {
        day: "Tuesday",
        theme: "Skill + Proof",
        fields: [
          "Skill rep (practice / prep):",
          "Proof action (real-world application):",
        ],
      },
      {
        day: "Wednesday",
        theme: "Visibility Through People",
        fields: ["2 outreach messages sent to aligned people"],
        noInput: true,
      },
      {
        day: "Thursday",
        theme: "Interview Performance Rep",
        subtitle: "Practice: pitch + 1 interview question + 1 story",
        fields: ["What I practiced:"],
      },
      {
        day: "Friday",
        theme: "Brand Signal Upgrade",
        subtitle: "Improve 1 asset: resume / LinkedIn / story bank / portfolio",
        fields: ["Update made:"],
      },
      {
        day: "Saturday",
        theme: "Reflection + Reset",
        fields: ["What worked:", "What to improve:"],
      },
      {
        day: "Sunday",
        theme: "Leadership Identity Check",
        fields: ["How did I show up like the next level this week?"],
      },
    ];

    const weeklyScores = ["Consistency", "Confidence", "Momentum"];

    return (
      <div
        ref={ref}
        className={className}
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "12mm 20mm",
          fontFamily: "'DM Sans', Arial, sans-serif",
          backgroundColor: "#ffffff",
          color: "#1a2332",
          fontSize: "8pt",
          lineHeight: "1.3",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {/* Subtle Diagonal Watermark */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-45deg)",
            fontSize: "80pt",
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
          <div style={{ textAlign: "center", marginBottom: "10px", paddingBottom: "10px", borderBottom: "2px solid #B8860B" }}>
            <p style={{ 
              fontSize: "8pt", 
              color: "#B8860B", 
              fontWeight: 600, 
              textTransform: "uppercase", 
              letterSpacing: "2px",
              margin: "0 0 4px 0" 
            }}>
              The Strategic Career Mastery Program™ Career Diagnostic
            </p>
            <h1 style={{ 
              fontSize: "20pt", 
              fontWeight: "bold", 
              color: "#1a2332", 
              margin: "0 0 3px 0",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}>
              7-Day Career System Planner
            </h1>
            <p style={{ 
              fontSize: "10pt", 
              color: "#6b7280", 
              margin: 0,
              fontStyle: "italic",
            }}>
              Your Weekly Career Momentum Plan
            </p>
          </div>

          {/* Intro */}
          <div style={{ 
            background: "#f8f9fa", 
            borderRadius: "6px", 
            padding: "8px 12px", 
            marginBottom: "10px",
            borderLeft: "4px solid #B8860B",
          }}>
            <p style={{ fontWeight: 600, margin: "0 0 3px 0", color: "#1a2332", fontSize: "8pt" }}>
              Small actions. Big compounding outcomes.
            </p>
            <p style={{ margin: 0, color: "#4a5568", fontSize: "7pt", lineHeight: "1.4" }}>
              You don't need more time. <strong>You need a system you can execute consistently.</strong>
            </p>
          </div>

          {/* Weekly Focus */}
          <div style={{ 
            background: "#1a2332", 
            borderRadius: "8px", 
            padding: "10px 14px",
            marginBottom: "10px",
            color: "#ffffff",
          }}>
            <h2 style={{ 
              fontSize: "10pt", 
              fontWeight: 600, 
              margin: "0 0 8px 0",
              color: "#B8860B",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}>
              Weekly Focus
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                "My next-level goal is:",
                "My #1 skill focus this week is:",
                "My proof goal this week is:",
              ].map((field) => (
                <div key={field} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "7pt", color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap" }}>
                    {field}
                  </span>
                  <div style={{ 
                    flex: 1,
                    height: "14px", 
                    borderBottom: "1.5px solid rgba(255,255,255,0.3)",
                  }} />
                </div>
              ))}
            </div>
          </div>

          {/* Daily System */}
          <div style={{ marginBottom: "10px" }}>
            <h2 style={{ 
              margin: "0 0 8px 0", 
              fontSize: "10pt", 
              fontWeight: 600,
              fontFamily: "'Playfair Display', Georgia, serif",
              color: "#1a2332",
            }}>
              Daily System <span style={{ fontSize: "7pt", color: "#6b7280", fontWeight: 400 }}>(15–30 minutes)</span>
            </h2>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr",
              gap: "6px",
            }}>
              {dailyPlan.map((day, index) => (
                <div 
                  key={day.day} 
                  style={{ 
                    background: index % 2 === 0 ? "#f0fdf4" : "#fef3c7",
                    border: `1px solid ${index % 2 === 0 ? "#bbf7d0" : "#fcd34d"}`,
                    borderRadius: "6px",
                    padding: "8px 10px",
                    gridColumn: index === dailyPlan.length - 1 ? "1 / -1" : "auto",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "8pt", color: "#166534" }}>✅</span>
                    <span style={{ 
                      fontSize: "8pt", 
                      fontWeight: 700, 
                      color: index % 2 === 0 ? "#166534" : "#92400e",
                    }}>
                      {day.day}
                    </span>
                    <span style={{ fontSize: "7pt", color: "#4a5568" }}>— {day.theme}</span>
                  </div>
                  
                  {day.subtitle && (
                    <p style={{ 
                      margin: "0 0 4px 0", 
                      fontSize: "6.5pt", 
                      color: "#6b7280",
                      fontStyle: "italic",
                    }}>
                      {day.subtitle}
                    </p>
                  )}
                  
                  {!day.noInput && day.fields.map((field) => (
                    <div key={field} style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "3px" }}>
                      <span style={{ fontSize: "6.5pt", color: "#4a5568", whiteSpace: "nowrap" }}>
                        {field}
                      </span>
                      <div style={{ 
                        flex: 1,
                        height: "12px", 
                        borderBottom: "1.5px solid #d1d5db",
                      }} />
                    </div>
                  ))}
                  
                  {day.noInput && (
                    <p style={{ 
                      margin: "2px 0 0 0", 
                      fontSize: "6.5pt", 
                      color: "#4a5568",
                    }}>
                      {day.fields[0]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Score */}
          <div style={{ 
            background: "linear-gradient(135deg, #ede9fe 0%, #faf5ff 100%)",
            borderRadius: "8px",
            padding: "10px 14px",
            marginBottom: "10px",
            border: "1px solid #c4b5fd",
          }}>
            <h2 style={{ 
              margin: "0 0 8px 0", 
              fontSize: "9pt", 
              fontWeight: 600,
              color: "#7c3aed",
            }}>
              Weekly Score (circle one)
            </h2>
            <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
              {weeklyScores.map((score) => (
                <div key={score} style={{ textAlign: "center" }}>
                  <p style={{ margin: "0 0 4px 0", fontSize: "7pt", fontWeight: 600, color: "#5b21b6" }}>
                    {score}
                  </p>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div
                        key={num}
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          border: "1.5px solid #7c3aed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "7pt",
                          color: "#7c3aed",
                          fontWeight: 500,
                        }}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* The One-Line Insight */}
          <div style={{ 
            textAlign: "center", 
            padding: "12px 14px",
            background: "linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)",
            borderRadius: "8px",
            border: "1px solid #fcd34d",
          }}>
            <p style={{ 
              fontSize: "7pt", 
              color: "#B8860B", 
              fontWeight: 600, 
              textTransform: "uppercase",
              letterSpacing: "1px",
              margin: "0 0 6px 0",
            }}>
              The One-Line Insight
            </p>
            <p style={{ 
              fontSize: "10pt", 
              color: "#1a2332", 
              margin: 0,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              lineHeight: "1.4",
            }}>
              Your career won't change from one big moment.<br />
              <strong>It changes from a system you repeat every week.</strong>
            </p>
          </div>

          {/* Footer */}
          <div style={{ 
            marginTop: "12px",
            paddingTop: "10px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div>
              <p style={{ margin: 0, fontSize: "7pt", fontWeight: 600, color: "#B8860B" }}>
                Career Operating System Toolkit
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: "6pt", color: "#9ca3af" }}>
                © the Leader's Row — All rights reserved
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

WeeklyCareerPlanner.displayName = "WeeklyCareerPlanner";

export default WeeklyCareerPlanner;
