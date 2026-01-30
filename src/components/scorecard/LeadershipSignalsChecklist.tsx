import { forwardRef } from "react";

interface LeadershipSignalsChecklistProps {
  className?: string;
}

export const LeadershipSignalsChecklist = forwardRef<HTMLDivElement, LeadershipSignalsChecklistProps>(
  ({ className }, ref) => {
    const signals = [
      {
        number: 1,
        title: "Scope Ownership",
        items: [
          "I own outcomes, not tasks",
          "I drive clarity and define success metrics",
          "I proactively identify problems before they become urgent",
          "I make decisions under ambiguity",
        ],
        prompt: "My strongest scope signal right now:",
      },
      {
        number: 2,
        title: "Strategic Judgment",
        items: [
          "I prioritize with tradeoffs",
          'I can explain "why this, why now"',
          "I balance customer value + business impact",
          "I think in second-order effects",
        ],
        prompt: "My #1 judgment skill to strengthen:",
      },
      {
        number: 3,
        title: "Executive Communication",
        items: [
          "I communicate with structure and brevity",
          "I don't over-explain",
          "I can present recommendations with confidence",
          "I can handle pushback without spiraling",
        ],
        prompt: "My communication upgrade goal:",
      },
      {
        number: 4,
        title: "Influence & Stakeholder Trust",
        items: [
          "I align cross-functional partners effectively",
          "I influence without authority",
          "I handle conflict with calm and clarity",
          "People trust my judgment",
        ],
        prompt: "My #1 influence move this month:",
      },
      {
        number: 5,
        title: "Leadership Presence",
        items: [
          "I show up grounded, clear, decisive",
          "I'm visible in the rooms that matter",
          "My work is known and understood by decision makers",
          "I'm seen as someone who can own bigger scope",
        ],
        prompt: "My leadership presence upgrade:",
      },
    ];

    const finalAssessment = [
      "The signal I'm strongest in today is:",
      "The signal that will unlock my next level is:",
      "My next level will become inevitable when I improve:",
    ];

    return (
      <div
        ref={ref}
        className={className}
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "12mm 16mm",
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
              The 200K Method™ Career Diagnostic
            </p>
            <h1 style={{ 
              fontSize: "20pt", 
              fontWeight: "bold", 
              color: "#1a2332", 
              margin: "0 0 3px 0",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}>
              Leadership Signals Checklist
            </h1>
            <p style={{ 
              fontSize: "10pt", 
              color: "#6b7280", 
              margin: 0,
              fontStyle: "italic",
            }}>
              Senior / Principal / Director Readiness Signals
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
              This is what decision makers look for—whether they say it or not.
            </p>
            <p style={{ margin: 0, color: "#4a5568", fontSize: "7pt", lineHeight: "1.4" }}>
              Use this checklist to identify what you already signal—and what you need to upgrade next.
            </p>
          </div>

          {/* Signals Grid */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            marginBottom: "10px",
          }}>
            {signals.map((signal, index) => (
              <div
                key={signal.number}
                style={{
                  background: index % 2 === 0 ? "#f0fdf4" : "#eff6ff",
                  border: `1px solid ${index % 2 === 0 ? "#bbf7d0" : "#bfdbfe"}`,
                  borderRadius: "6px",
                  padding: "8px 10px",
                  gridColumn: index === signals.length - 1 ? "1 / -1" : "auto",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "9pt", color: "#166534" }}>✅</span>
                  <span style={{ 
                    fontSize: "8pt", 
                    fontWeight: 700, 
                    color: index % 2 === 0 ? "#166534" : "#1e40af",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>
                    Signal {signal.number}
                  </span>
                  <span style={{ 
                    fontSize: "8pt", 
                    fontWeight: 600, 
                    color: "#1a2332",
                  }}>
                    — {signal.title}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginBottom: "6px" }}>
                  {signal.items.map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "5px" }}>
                      <div style={{
                        width: "10px",
                        height: "10px",
                        border: "1.5px solid #d1d5db",
                        borderRadius: "2px",
                        flexShrink: 0,
                        marginTop: "1px",
                      }} />
                      <span style={{ fontSize: "7pt", color: "#4a5568", lineHeight: "1.3" }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ fontSize: "6.5pt", fontWeight: 500, color: "#1a2332", whiteSpace: "nowrap" }}>
                    {signal.prompt}
                  </span>
                  <div style={{ 
                    flex: 1,
                    height: "12px", 
                    borderBottom: "1.5px solid #d1d5db",
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Final Self-Assessment */}
          <div style={{ 
            background: "#1a2332", 
            borderRadius: "8px", 
            padding: "12px 14px",
            marginBottom: "10px",
            color: "#ffffff",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
              <span style={{ fontSize: "9pt" }}>✅</span>
              <h2 style={{ 
                fontSize: "10pt", 
                fontWeight: 600, 
                margin: 0,
                color: "#B8860B",
                fontFamily: "'Playfair Display', Georgia, serif",
              }}>
                Final Self-Assessment
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {finalAssessment.map((field) => (
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
              You don't get promoted for doing good work.<br />
              <strong>You get promoted for signaling that you're ready for bigger work.</strong>
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
                THE LEADER'S ROW
              </p>
              <p style={{ margin: "2px 0 0 0", fontSize: "6pt", color: "#6b7280" }}>
                theleadersrow.com/200k-method
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: "6pt", color: "#9ca3af" }}>
                © The Leader's Row • The 200K Method™
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

LeadershipSignalsChecklist.displayName = "LeadershipSignalsChecklist";

export default LeadershipSignalsChecklist;
