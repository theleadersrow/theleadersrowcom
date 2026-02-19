import { forwardRef } from "react";

interface OfferWinningPitchProps {
  className?: string;
}

export const OfferWinningPitch = forwardRef<HTMLDivElement, OfferWinningPitchProps>(
  ({ className }, ref) => {
    const valuePoints = [
      "clarity",
      "confidence", 
      "credibility",
      "direction",
      "seniority",
    ];

    const fillInFields = [
      { label: "My domain / niche is:", width: "60%" },
      { label: "My signature strength is:", width: "55%" },
      { label: "Impact win #1:", width: "65%" },
      { label: "Impact win #2:", width: "65%" },
      { label: "My next target role is:", width: "55%" },
      { label: "The bigger value I want to drive is:", width: "45%" },
    ];

    const checklistItems = [
      "I sound confident, not apologetic",
      "I'm clear about what I want next",
      "My impact sounds measurable",
      "My story shows leadership, not just tasks",
      "I feel aligned and grounded delivering it",
    ];

    return (
      <div
        ref={ref}
        className={className}
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "14mm 22mm",
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
          <div style={{ textAlign: "center", marginBottom: "14px", paddingBottom: "12px", borderBottom: "2px solid #B8860B" }}>
            <p style={{ 
              fontSize: "9pt", 
              color: "#B8860B", 
              fontWeight: 600, 
              textTransform: "uppercase", 
              letterSpacing: "2px",
              margin: "0 0 6px 0" 
            }}>
              The Strategic Career Mastery Program™ Career Diagnostic
            </p>
            <h1 style={{ 
              fontSize: "22pt", 
              fontWeight: "bold", 
              color: "#1a2332", 
              margin: "0 0 4px 0",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}>
              Offer-Winning Pitch Template
            </h1>
            <p style={{ 
              fontSize: "11pt", 
              color: "#6b7280", 
              margin: 0,
              fontStyle: "italic",
            }}>
              Your 30-Second Career Pitch
            </p>
          </div>

          {/* Intro */}
          <div style={{ 
            background: "#f8f9fa", 
            borderRadius: "6px", 
            padding: "10px 14px", 
            marginBottom: "12px",
            borderLeft: "4px solid #B8860B",
          }}>
            <p style={{ fontWeight: 600, margin: "0 0 6px 0", color: "#1a2332", fontSize: "9pt" }}>
              Make your value undeniable in interviews + networking.
            </p>
            <p style={{ margin: "0 0 6px 0", color: "#4a5568", fontSize: "8pt", lineHeight: "1.4" }}>
              This is the pitch that changes everything because it helps you communicate:
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {valuePoints.map((point) => (
                <span key={point} style={{ 
                  fontSize: "8pt", 
                  color: "#166534",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}>
                  ✅ {point}
                </span>
              ))}
            </div>
          </div>

          {/* 30-Second Pitch Template */}
          <div style={{ marginBottom: "12px" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              marginBottom: "8px" 
            }}>
              <div style={{
                background: "#B8860B",
                color: "#ffffff",
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "7pt",
                fontWeight: 700,
              }}>
                30 SEC
              </div>
              <h2 style={{ 
                margin: 0, 
                fontSize: "11pt", 
                fontWeight: 600,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}>
                30-Second Pitch Template
              </h2>
            </div>
            <div style={{ 
              background: "#1a2332", 
              borderRadius: "8px", 
              padding: "14px 16px",
              color: "#ffffff",
            }}>
              <p style={{ 
                margin: 0, 
                fontSize: "9pt", 
                lineHeight: "1.6",
                fontStyle: "italic",
              }}>
                "I'm a <span style={{ color: "#B8860B" }}>[PM / Senior PM / Product Leader]</span> with experience in <span style={{ color: "#B8860B" }}>[domain / industry]</span>.<br />
                I'm known for <span style={{ color: "#B8860B" }}>[your signature strength]</span>, especially in <span style={{ color: "#B8860B" }}>[scope/problem type]</span>.<br />
                Recently, I <span style={{ color: "#B8860B" }}>[impact win #1]</span> and <span style={{ color: "#B8860B" }}>[impact win #2]</span>.<br />
                Now I'm focused on <span style={{ color: "#B8860B" }}>[next role / next level]</span> where I can <span style={{ color: "#B8860B" }}>[bigger value / bigger outcomes]</span>."
              </p>
            </div>
          </div>

          {/* 60-Second Pitch Add-On */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              marginBottom: "8px" 
            }}>
              <div style={{
                background: "#6b7280",
                color: "#ffffff",
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "7pt",
                fontWeight: 700,
              }}>
                60 SEC
              </div>
              <h2 style={{ 
                margin: 0, 
                fontSize: "11pt", 
                fontWeight: 600,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}>
                60-Second Pitch Add-On
              </h2>
              <span style={{ fontSize: "8pt", color: "#6b7280", fontStyle: "italic" }}>
                (Optional — use if someone asks "Tell me more.")
              </span>
            </div>
            <div style={{ 
              background: "#f8f9fa", 
              border: "1px solid #e5e7eb",
              borderRadius: "8px", 
              padding: "12px 14px",
            }}>
              <p style={{ 
                margin: 0, 
                fontSize: "9pt", 
                lineHeight: "1.6",
                color: "#4a5568",
                fontStyle: "italic",
              }}>
                "One of my biggest strengths is <span style={{ color: "#1a2332", fontWeight: 500 }}>[strength]</span>, and I've built it through <span style={{ color: "#1a2332", fontWeight: 500 }}>[type of work]</span>.<br />
                The kind of teams I thrive in are <span style={{ color: "#1a2332", fontWeight: 500 }}>[environment]</span>, and I'm excited about roles where I can own <span style={{ color: "#1a2332", fontWeight: 500 }}>[scope]</span> and drive <span style={{ color: "#1a2332", fontWeight: 500 }}>[business/customer outcomes]</span>."
              </p>
            </div>
          </div>

          {/* Fill Yours In */}
          <div style={{ marginBottom: "14px" }}>
            <h2 style={{ 
              margin: "0 0 10px 0", 
              fontSize: "11pt", 
              fontWeight: 600,
              fontFamily: "'Playfair Display', Georgia, serif",
              color: "#1a2332",
            }}>
              Fill Yours In
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {fillInFields.map((field) => (
                <div key={field.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "8pt", fontWeight: 500, color: "#1a2332", whiteSpace: "nowrap" }}>
                    {field.label}
                  </span>
                  <div style={{ 
                    flex: 1,
                    maxWidth: field.width,
                    height: "18px", 
                    borderBottom: "2px solid #d1d5db",
                  }} />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Checklist */}
          <div style={{ 
            background: "#fef3c7", 
            borderRadius: "8px", 
            padding: "12px 16px",
            marginBottom: "14px",
            border: "1px solid #fcd34d",
          }}>
            <h2 style={{ 
              margin: "0 0 10px 0", 
              fontSize: "10pt", 
              fontWeight: 600,
              color: "#92400e",
            }}>
              Quick Checklist (Before You Say It Out Loud)
            </h2>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr",
              gap: "6px 20px",
            }}>
              {checklistItems.map((item, index) => (
                <div key={item} style={{ 
                  display: "flex", 
                  alignItems: "flex-start", 
                  gap: "6px",
                  gridColumn: index === checklistItems.length - 1 ? "1 / -1" : "auto",
                }}>
                  <div style={{
                    width: "12px",
                    height: "12px",
                    border: "1.5px solid #92400e",
                    borderRadius: "2px",
                    flexShrink: 0,
                    marginTop: "1px",
                  }} />
                  <span style={{ fontSize: "8pt", color: "#78350f", lineHeight: "1.3" }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* The One-Line Insight */}
          <div style={{ 
            textAlign: "center", 
            padding: "14px 16px",
            background: "linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)",
            borderRadius: "10px",
            border: "1px solid #c4b5fd",
          }}>
            <p style={{ 
              fontSize: "8pt", 
              color: "#7c3aed", 
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
              People don't reward potential.<br />
              <strong>They reward clear value delivered with confidence.</strong>
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
                © the Leader's Row — All rights reserved
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

OfferWinningPitch.displayName = "OfferWinningPitch";

export default OfferWinningPitch;
