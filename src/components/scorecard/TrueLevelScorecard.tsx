import { forwardRef } from "react";

interface TrueLevelScorecardProps {
  className?: string;
}

export const TrueLevelScorecard = forwardRef<HTMLDivElement, TrueLevelScorecardProps>(
  ({ className }, ref) => {
    const skills = [
      {
        number: 1,
        title: "Execution Excellence",
        description: "I deliver high-quality work end-to-end with reliability and speed.",
      },
      {
        number: 2,
        title: "Outcome Ownership",
        description: "I don't just complete tasks — I own outcomes, define success metrics, and drive clarity.",
      },
      {
        number: 3,
        title: "Product Judgment & Tradeoffs",
        description: "I make decisions under ambiguity, prioritize effectively, and communicate tradeoffs clearly.",
      },
      {
        number: 4,
        title: "Influence Without Authority",
        description: "I align stakeholders, manage conflict, and move decisions forward without escalation.",
      },
      {
        number: 5,
        title: "Leadership Presence",
        description: "I communicate with confidence, structure, and authority in high-stakes rooms.",
      },
    ];

    const needOptions = [
      "clarity & direction",
      "stronger positioning",
      "better visibility",
      "executive communication",
      "interview performance",
      "leadership influence",
    ];

    return (
      <div
        ref={ref}
        className={className}
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "16mm 18mm",
          fontFamily: "'DM Sans', Arial, sans-serif",
          backgroundColor: "#ffffff",
          color: "#1a2332",
          fontSize: "10pt",
          lineHeight: "1.4",
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
          <div style={{ textAlign: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: "2px solid #B8860B" }}>
            <p style={{ 
              fontSize: "9pt", 
              color: "#B8860B", 
              fontWeight: 600, 
              textTransform: "uppercase", 
              letterSpacing: "2px",
              margin: "0 0 8px 0" 
            }}>
              The 200K Method™ Career Diagnostic
            </p>
            <h1 style={{ 
              fontSize: "26pt", 
              fontWeight: "bold", 
              color: "#1a2332", 
              margin: "0 0 6px 0",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}>
              True Level Scorecard
            </h1>
            <p style={{ 
              fontSize: "12pt", 
              color: "#6b7280", 
              margin: 0,
              fontStyle: "italic",
            }}>
              Stop guessing your level. Benchmark it.
            </p>
          </div>

          {/* Instructions */}
          <div style={{ 
            background: "#f8f9fa", 
            borderRadius: "8px", 
            padding: "14px 18px", 
            marginBottom: "20px",
            borderLeft: "4px solid #B8860B",
          }}>
            <p style={{ fontWeight: 600, margin: "0 0 8px 0", color: "#1a2332", fontSize: "10pt" }}>
              How to use this:
            </p>
            <p style={{ margin: "0 0 10px 0", color: "#4a5568", fontSize: "9pt", lineHeight: "1.5" }}>
              Rate yourself on each skill from 1 (early) to 5 (exceptional) based on how consistently you demonstrate it in real work situations.
            </p>
            <div style={{ display: "flex", gap: "24px", fontSize: "9pt", color: "#1a2332" }}>
              <span>✅ <strong>Circle your lowest 2</strong> — those are your true growth blockers.</span>
            </div>
            <div style={{ marginTop: "4px", fontSize: "9pt", color: "#1a2332" }}>
              <span>✅ Your goal is not to improve everything — <strong>upgrade the signal that unlocks your next role.</strong></span>
            </div>
          </div>

          {/* Skills Assessment */}
          <div style={{ marginBottom: "24px" }}>
            {skills.map((skill, index) => (
              <div
                key={skill.number}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "14px 0",
                  borderBottom: index < skills.length - 1 ? "1px solid #e5e7eb" : "none",
                }}
              >
                {/* Skill Number */}
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#1a2332",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "11pt",
                    flexShrink: 0,
                  }}
                >
                  {skill.number}
                </div>

                {/* Skill Content */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: "0 0 4px 0", 
                    fontSize: "11pt", 
                    fontWeight: 600, 
                    color: "#1a2332" 
                  }}>
                    {skill.title}
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    fontSize: "9pt", 
                    color: "#6b7280",
                    lineHeight: "1.4",
                  }}>
                    {skill.description}
                  </p>
                </div>

                {/* Score Bubbles */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                  {[1, 2, 3, 4, 5].map((score) => (
                    <div
                      key={score}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        border: "2px solid #d1d5db",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10pt",
                        fontWeight: 500,
                        color: "#6b7280",
                        background: "#ffffff",
                      }}
                    >
                      {score}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Results Section */}
          <div style={{ 
            background: "#1a2332", 
            borderRadius: "12px", 
            padding: "20px 24px",
            marginBottom: "20px",
            color: "#ffffff",
          }}>
            <h2 style={{ 
              fontSize: "14pt", 
              fontWeight: 600, 
              margin: "0 0 16px 0",
              color: "#B8860B",
            }}>
              Your Results
            </h2>

            {/* Lowest 2 Scores */}
            <div style={{ marginBottom: "18px" }}>
              <p style={{ fontSize: "9pt", color: "rgba(255,255,255,0.7)", margin: "0 0 8px 0" }}>
                My lowest 2 scores (my real blockers):
              </p>
              <div style={{ 
                display: "flex", 
                gap: "12px",
              }}>
                <div style={{ 
                  flex: 1, 
                  height: "32px", 
                  borderBottom: "2px solid rgba(255,255,255,0.3)",
                }} />
                <div style={{ 
                  flex: 1, 
                  height: "32px", 
                  borderBottom: "2px solid rgba(255,255,255,0.3)",
                }} />
              </div>
            </div>

            {/* What I Need */}
            <div>
              <p style={{ fontSize: "9pt", color: "rgba(255,255,255,0.7)", margin: "0 0 10px 0" }}>
                What I need most right now is:
              </p>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "8px 16px",
              }}>
                {needOptions.map((option) => (
                  <div key={option} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      width: "14px",
                      height: "14px",
                      border: "2px solid rgba(255,255,255,0.5)",
                      borderRadius: "3px",
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: "9pt", color: "rgba(255,255,255,0.9)" }}>
                      {option}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* The One-Line Insight */}
          <div style={{ 
            textAlign: "center", 
            padding: "20px",
            background: "linear-gradient(135deg, #faf5ff 0%, #f0fdf4 100%)",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
          }}>
            <p style={{ 
              fontSize: "9pt", 
              color: "#B8860B", 
              fontWeight: 600, 
              textTransform: "uppercase",
              letterSpacing: "1px",
              margin: "0 0 10px 0",
            }}>
              The One-Line Insight
            </p>
            <p style={{ 
              fontSize: "13pt", 
              color: "#1a2332", 
              margin: 0,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              lineHeight: "1.5",
            }}>
              If you feel stuck, it's rarely because you're not capable.<br />
              <strong>It's because you're not signaling the next level yet.</strong>
            </p>
          </div>

          {/* Footer */}
          <div style={{ 
            marginTop: "24px",
            paddingTop: "16px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div>
              <p style={{ margin: 0, fontSize: "9pt", fontWeight: 600, color: "#B8860B" }}>
                THE LEADER'S ROW
              </p>
              <p style={{ margin: "2px 0 0 0", fontSize: "8pt", color: "#6b7280" }}>
                theleadersrow.com/200k-method
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: "8pt", color: "#9ca3af" }}>
                © The Leader's Row • The 200K Method™
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

TrueLevelScorecard.displayName = "TrueLevelScorecard";

export default TrueLevelScorecard;
