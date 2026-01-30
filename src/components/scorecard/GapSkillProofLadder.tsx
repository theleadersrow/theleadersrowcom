import { forwardRef } from "react";

interface GapSkillProofLadderProps {
  className?: string;
}

export const GapSkillProofLadder = forwardRef<HTMLDivElement, GapSkillProofLadderProps>(
  ({ className }, ref) => {
    const gapOptions = [
      "I'm not getting promoted",
      "I'm not getting interviews",
      "I'm getting interviews but not offers",
      "I don't feel confident in high-stakes rooms",
      "I want bigger scope but I'm not being trusted with it",
      "I want to move into a bigger company / stronger role",
      "I'm trying to break into product / my first PM role",
    ];

    const skillExamples = [
      "Executive communication",
      "Stakeholder management",
      "Product strategy & prioritization",
      "Metrics & decision-making",
      "Structured thinking",
      "Storytelling & positioning",
      "Leadership presence",
      "Influence without authority",
    ];

    const proofExamples = [
      "led a decision meeting",
      "wrote a strategy / alignment memo",
      "drove tradeoffs and stakeholder alignment",
      "improved a metric with measurable impact",
      "owned an ambiguous project end-to-end",
      "influenced roadmap direction",
      "handled conflict and drove resolution",
      "created clarity when others were stuck",
    ];

    return (
      <div
        ref={ref}
        className={className}
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "14mm 18mm",
          fontFamily: "'DM Sans', Arial, sans-serif",
          backgroundColor: "#ffffff",
          color: "#1a2332",
          fontSize: "9pt",
          lineHeight: "1.35",
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
          <div style={{ textAlign: "center", marginBottom: "16px", paddingBottom: "14px", borderBottom: "2px solid #B8860B" }}>
            <p style={{ 
              fontSize: "9pt", 
              color: "#B8860B", 
              fontWeight: 600, 
              textTransform: "uppercase", 
              letterSpacing: "2px",
              margin: "0 0 6px 0" 
            }}>
              The 200K Method™ Career Diagnostic
            </p>
            <h1 style={{ 
              fontSize: "22pt", 
              fontWeight: "bold", 
              color: "#1a2332", 
              margin: "0 0 4px 0",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}>
              Gap → Skill → Proof Ladder
            </h1>
            <p style={{ 
              fontSize: "11pt", 
              color: "#6b7280", 
              margin: 0,
              fontStyle: "italic",
            }}>
              The Fastest Way to Level Up
            </p>
          </div>

          {/* Instructions */}
          <div style={{ 
            background: "#f8f9fa", 
            borderRadius: "6px", 
            padding: "10px 14px", 
            marginBottom: "14px",
            borderLeft: "4px solid #B8860B",
          }}>
            <p style={{ fontWeight: 600, margin: "0 0 4px 0", color: "#1a2332", fontSize: "9pt" }}>
              Stop collecting tips. Start building proof.
            </p>
            <p style={{ margin: 0, color: "#4a5568", fontSize: "8pt", lineHeight: "1.4" }}>
              You don't close gaps by learning random things. You close gaps by building <strong>one skill</strong> that creates <strong>proof</strong> of the next level.
            </p>
          </div>

          {/* STEP 1 */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              marginBottom: "10px" 
            }}>
              <div style={{
                background: "#1a2332",
                color: "#B8860B",
                padding: "4px 10px",
                borderRadius: "4px",
                fontSize: "8pt",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}>
                Step 1
              </div>
              <h2 style={{ 
                margin: 0, 
                fontSize: "12pt", 
                fontWeight: 600,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}>
                Identify the Gap
              </h2>
            </div>
            <p style={{ fontSize: "8pt", color: "#6b7280", margin: "0 0 8px 0" }}>
              Choose the most honest gap that's holding you back:
            </p>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr",
              gap: "4px 16px",
              marginBottom: "10px",
            }}>
              {gapOptions.map((option) => (
                <div key={option} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                  <div style={{
                    width: "12px",
                    height: "12px",
                    border: "1.5px solid #d1d5db",
                    borderRadius: "2px",
                    flexShrink: 0,
                    marginTop: "1px",
                  }} />
                  <span style={{ fontSize: "8pt", color: "#4a5568", lineHeight: "1.3" }}>
                    {option}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "8pt", fontWeight: 600, color: "#1a2332", whiteSpace: "nowrap" }}>
                My #1 gap is:
              </span>
              <div style={{ 
                flex: 1, 
                height: "20px", 
                borderBottom: "2px solid #d1d5db",
              }} />
            </div>
          </div>

          {/* STEP 2 */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              marginBottom: "10px" 
            }}>
              <div style={{
                background: "#1a2332",
                color: "#B8860B",
                padding: "4px 10px",
                borderRadius: "4px",
                fontSize: "8pt",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}>
                Step 2
              </div>
              <h2 style={{ 
                margin: 0, 
                fontSize: "12pt", 
                fontWeight: 600,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}>
                Convert the Gap Into a Skill
              </h2>
            </div>
            <p style={{ fontSize: "8pt", color: "#6b7280", margin: "0 0 8px 0" }}>
              Examples of skills that create career lift:
            </p>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: "6px",
              marginBottom: "10px",
            }}>
              {skillExamples.map((skill) => (
                <div key={skill} style={{ 
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "4px",
                  padding: "5px 8px",
                  fontSize: "7pt",
                  color: "#166534",
                  textAlign: "center",
                }}>
                  {skill}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "8pt", fontWeight: 600, color: "#1a2332", whiteSpace: "nowrap" }}>
                The ONE skill I will focus on first is:
              </span>
              <div style={{ 
                flex: 1, 
                height: "20px", 
                borderBottom: "2px solid #d1d5db",
              }} />
            </div>
          </div>

          {/* STEP 3 */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              marginBottom: "10px" 
            }}>
              <div style={{
                background: "#1a2332",
                color: "#B8860B",
                padding: "4px 10px",
                borderRadius: "4px",
                fontSize: "8pt",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}>
                Step 3
              </div>
              <h2 style={{ 
                margin: 0, 
                fontSize: "12pt", 
                fontWeight: 600,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}>
                Convert the Skill Into Proof
              </h2>
            </div>
            <p style={{ fontSize: "8pt", color: "#6b7280", margin: "0 0 8px 0", fontStyle: "italic" }}>
              Proof is what gets rewarded. Proof is what gets promoted. Proof gets hired.
            </p>
            <p style={{ fontSize: "8pt", color: "#6b7280", margin: "0 0 6px 0" }}>
              Examples of proof:
            </p>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr",
              gap: "4px 16px",
              marginBottom: "10px",
            }}>
              {proofExamples.map((proof) => (
                <div key={proof} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                  <div style={{
                    width: "12px",
                    height: "12px",
                    border: "1.5px solid #d1d5db",
                    borderRadius: "2px",
                    flexShrink: 0,
                    marginTop: "1px",
                  }} />
                  <span style={{ fontSize: "8pt", color: "#4a5568", lineHeight: "1.3" }}>
                    {proof}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "8pt", fontWeight: 600, color: "#1a2332", whiteSpace: "nowrap" }}>
                The proof I will build in the next 2–4 weeks is:
              </span>
              <div style={{ 
                flex: 1, 
                height: "20px", 
                borderBottom: "2px solid #d1d5db",
              }} />
            </div>
          </div>

          {/* Weekly Proof Plan */}
          <div style={{ 
            background: "#1a2332", 
            borderRadius: "10px", 
            padding: "14px 18px",
            marginBottom: "14px",
            color: "#ffffff",
          }}>
            <h2 style={{ 
              fontSize: "12pt", 
              fontWeight: 600, 
              margin: "0 0 12px 0",
              color: "#B8860B",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}>
              Your Weekly Proof Plan
            </h2>

            <div style={{ marginBottom: "12px" }}>
              <p style={{ fontSize: "8pt", color: "rgba(255,255,255,0.7)", margin: "0 0 6px 0" }}>
                This week, I will build proof by doing:
              </p>
              <div style={{ 
                height: "28px", 
                borderBottom: "2px solid rgba(255,255,255,0.3)",
              }} />
            </div>

            <div>
              <p style={{ fontSize: "8pt", color: "rgba(255,255,255,0.7)", margin: "0 0 6px 0" }}>
                The outcome I want to show is:
              </p>
              <div style={{ 
                height: "28px", 
                borderBottom: "2px solid rgba(255,255,255,0.3)",
              }} />
            </div>
          </div>

          {/* The One-Line Insight */}
          <div style={{ 
            textAlign: "center", 
            padding: "14px 16px",
            background: "linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)",
            borderRadius: "10px",
            border: "1px solid #fcd34d",
          }}>
            <p style={{ 
              fontSize: "8pt", 
              color: "#B8860B", 
              fontWeight: 600, 
              textTransform: "uppercase",
              letterSpacing: "1px",
              margin: "0 0 8px 0",
            }}>
              The One-Line Insight
            </p>
            <p style={{ 
              fontSize: "11pt", 
              color: "#1a2332", 
              margin: 0,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              lineHeight: "1.4",
            }}>
              If you're not growing, it's not because you need more effort.<br />
              <strong>It's because you're missing proof of the next level.</strong>
            </p>
          </div>

          {/* Footer */}
          <div style={{ 
            marginTop: "16px",
            paddingTop: "12px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div>
              <p style={{ margin: 0, fontSize: "8pt", fontWeight: 600, color: "#B8860B" }}>
                Career Operating System Toolkit
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: "7pt", color: "#9ca3af" }}>
                © Naina Agarwal — All rights reserved
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

GapSkillProofLadder.displayName = "GapSkillProofLadder";

export default GapSkillProofLadder;
