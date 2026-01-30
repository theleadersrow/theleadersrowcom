const TableOfContents = () => {
  return (
    <div
      className="pdf-page"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "18mm 22mm",
        fontFamily: "'DM Sans', Arial, sans-serif",
        backgroundColor: "#ffffff",
        color: "#1a2332",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "28px",
            fontWeight: "700",
            margin: "0 0 8px 0",
            color: "#1a2332",
          }}
        >
          How to Use This Toolkit
        </h1>
        <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
          This toolkit is designed as a step-by-step Career Operating System.<br />
          Complete the pages in order to build clarity and momentum fast.
        </p>
      </div>

      {/* What's Inside */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          borderRadius: "12px",
          padding: "20px 24px",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            fontSize: "16px",
            fontWeight: "700",
            margin: "0 0 16px 0",
            color: "#1a2332",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ color: "#c9a227" }}>✦</span> What's Inside
        </h2>

        {/* Tools List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            {
              num: "1",
              title: "True Level Scorecard",
              purpose: "Identify where you stand today — your real level beyond your title.",
              outcome: "Your top 2 blockers holding you back.",
            },
            {
              num: "2",
              title: "Strategic Benchmark → Target Role Matching Grid",
              purpose: "Choose the right next move (role + level + environment).",
              outcome: "Your best-fit target roles + readiness score.",
            },
            {
              num: "3",
              title: "Leadership Signals Checklist",
              purpose: "See exactly what decision-makers need from you.",
              outcome: "The signals you must strengthen to be seen as senior.",
            },
            {
              num: "4",
              title: "Gap → Skill → Proof Ladder",
              purpose: "Close gaps with the right action plan.",
              outcome: "One focused skill + one proof point to build in 2–4 weeks.",
            },
            {
              num: "5",
              title: "7-Day Career System Planner",
              purpose: "Build weekly momentum through small, repeatable actions.",
              outcome: "A weekly habit that compounds over time.",
            },
            {
              num: "6",
              title: "Offer-Winning Pitch Template",
              purpose: "Communicate your value — clearly and confidently.",
              outcome: "A pitch you can use in interviews, standups, and intros.",
            },
          ].map((tool) => (
            <div
              key={tool.num}
              style={{
                display: "flex",
                gap: "14px",
                padding: "12px 16px",
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#c9a227",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "14px",
                  flexShrink: 0,
                }}
              >
                {tool.num}
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    margin: "0 0 4px 0",
                    color: "#1a2332",
                  }}
                >
                  {tool.title}
                </h3>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#475569",
                    margin: "0 0 2px 0",
                    lineHeight: "1.5",
                  }}
                >
                  <strong>Purpose:</strong> {tool.purpose}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    margin: 0,
                    lineHeight: "1.5",
                  }}
                >
                  <strong>Outcome:</strong> {tool.outcome}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How to Get the Most Out of It */}
      <div
        style={{
          backgroundColor: "#fffbeb",
          border: "1px solid #c9a227",
          borderRadius: "12px",
          padding: "16px 20px",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            fontSize: "14px",
            fontWeight: "700",
            margin: "0 0 12px 0",
            color: "#92400e",
          }}
        >
          💡 How to Get the Most Out of It
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            "Complete each page in order — they build on each other.",
            "Be honest with yourself. This isn't about perfection; it's about clarity.",
            "Focus on 1–2 upgrades, not everything at once. Small systems create big outcomes.",
            "Review your toolkit monthly. Your level will shift as you grow.",
          ].map((tip, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                fontSize: "12px",
                color: "#78350f",
              }}
            >
              <span style={{ color: "#c9a227", fontWeight: "700" }}>✓</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Box */}
      <div
        style={{
          backgroundColor: "#1a2332",
          borderRadius: "12px",
          padding: "20px 24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#ffffff",
            margin: "0 0 6px 0",
          }}
        >
          Ready to build your Career Operating System?
        </p>
        <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 12px 0" }}>
          Start with Page 1: True Level Scorecard →
        </p>
        <div
          style={{
            display: "inline-block",
            backgroundColor: "#c9a227",
            color: "#1a2332",
            padding: "10px 24px",
            borderRadius: "6px",
            fontWeight: "700",
            fontSize: "12px",
          }}
        >
          Let's Begin
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: "20px",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "10px",
          color: "#94a3b8",
          position: "absolute",
          bottom: "18mm",
          left: "22mm",
          right: "22mm",
        }}
      >
        <span>Career Operating System Toolkit</span>
        <span>© The Leader's Row — All rights reserved</span>
      </div>
    </div>
  );
};

export { TableOfContents };
