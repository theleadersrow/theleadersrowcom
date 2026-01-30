const ToolkitCoverPage = () => {
  return (
    <div>
      {/* COVER PAGE */}
      <div
        className="pdf-page"
        style={{
          width: "210mm",
          height: "297mm",
          padding: "0",
          fontFamily: "'DM Sans', Arial, sans-serif",
          backgroundColor: "#1a2332",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "linear-gradient(90deg, #c9a227, #e8c547, #c9a227)",
          }}
        />

        {/* Main Content */}
        <div style={{ padding: "40mm 25mm", maxWidth: "160mm" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-block",
              backgroundColor: "#c9a227",
              color: "#1a2332",
              padding: "6px 20px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "1px",
              marginBottom: "24px",
              textTransform: "uppercase",
            }}
          >
            The 200K Method™
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "42px",
              fontWeight: "700",
              lineHeight: "1.2",
              margin: "0 0 16px 0",
              color: "#ffffff",
            }}
          >
            Career Operating<br />System Toolkit
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "16px",
              color: "#94a3b8",
              margin: "0 0 40px 0",
              lineHeight: "1.6",
            }}
          >
            A practical, repeatable system to unlock your next level in Product.
          </p>

          {/* Description */}
          <p
            style={{
              fontSize: "13px",
              color: "#cbd5e1",
              margin: "0 0 32px 0",
              lineHeight: "1.7",
              maxWidth: "400px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Inside this toolkit, you'll build clarity, positioning, leadership presence, and offer-winning performance—without guessing.
          </p>

          {/* Checklist */}
          <div
            style={{
              textAlign: "left",
              display: "inline-block",
              marginBottom: "48px",
            }}
          >
            {[
              "Promotion & scope readiness",
              "Offer-winning interviews",
              "Executive-level communication",
              "Visibility through people",
              "A system you can reuse every time you level up",
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                  fontSize: "13px",
                  color: "#e2e8f0",
                }}
              >
                <span style={{ color: "#c9a227", fontSize: "14px" }}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div
            style={{
              width: "60px",
              height: "2px",
              backgroundColor: "#c9a227",
              margin: "0 auto 32px auto",
            }}
          />

          {/* Author */}
          <div style={{ marginBottom: "8px" }}>
            <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 4px 0" }}>
              Created by
            </p>
            <p
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#ffffff",
                margin: "0 0 4px 0",
              }}
            >
              Naina Agarwal
            </p>
            <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>
              Former Product Leader at Apple | 15+ years in Product Leadership
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "20mm",
            left: 0,
            right: 0,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "10px", color: "#64748b", fontStyle: "italic", margin: 0 }}>
            Use this toolkit in order. Each page builds on the last.
          </p>
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #c9a227, #e8c547, #c9a227)",
          }}
        />
      </div>

      {/* WELCOME / INSTRUCTIONS PAGE */}
      <div
        className="pdf-page"
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "16mm 20mm",
          fontFamily: "'DM Sans', Arial, sans-serif",
          backgroundColor: "#ffffff",
          color: "#1a2332",
          pageBreakBefore: "always",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "26px",
              fontWeight: "700",
              margin: "0 0 6px 0",
              color: "#1a2332",
              lineHeight: "1.2",
            }}
          >
            Welcome — You're Not Stuck.<br />You're Unsystemized.
          </h1>
        </div>

        {/* Intro */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "16px",
          }}
        >
          <p style={{ fontSize: "12px", color: "#1a2332", margin: "0 0 10px 0", lineHeight: "1.6" }}>
            <strong>Hi — I'm Naina Agarwal 👋</strong><br />
            Former Product Leader at Apple, and I've spent 15+ years building and leading product teams.
          </p>
          <p style={{ fontSize: "11px", color: "#475569", margin: "0 0 10px 0", lineHeight: "1.6" }}>
            If you've been feeling like you want more from your career — promotion, bigger scope, better interviews, a stronger company, or your next breakthrough — I want you to know this:
          </p>
          <div style={{ fontSize: "12px", color: "#1a2332", fontWeight: "600", lineHeight: "1.7" }}>
            You don't need more hustle.<br />
            You don't need another degree.<br />
            <span style={{ color: "#c9a227" }}>You need a system.</span>
          </div>
          <p style={{ fontSize: "11px", color: "#475569", margin: "12px 0 0 0", lineHeight: "1.6" }}>
            This toolkit is designed to help you build your personal Career Operating System — a repeatable way to create the outcomes you want, without guessing.
          </p>
        </div>

        {/* What This Toolkit Will Help You Do */}
        <div
          style={{
            backgroundColor: "#f0fdf4",
            border: "1px solid #22c55e",
            borderRadius: "10px",
            padding: "14px 18px",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ fontSize: "13px", fontWeight: "700", margin: "0 0 10px 0", color: "#166534", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>✅</span> What This Toolkit Will Help You Do
          </h2>
          <div style={{ fontSize: "11px", color: "#166534", lineHeight: "1.7" }}>
            {[
              "Understand where you stand today (your true level)",
              "Get clear on where you should go next (the right next role for you)",
              "Identify the gaps holding you back",
              "Build proof and momentum through simple weekly actions",
              "Communicate your value through an offer-winning pitch",
            ].map((item, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "4px" }}>
                <span style={{ color: "#22c55e" }}>•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How to Use in 20 Minutes */}
        <div
          style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #c9a227",
            borderRadius: "10px",
            padding: "14px 18px",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ fontSize: "13px", fontWeight: "700", margin: "0 0 12px 0", color: "#92400e", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>⏱️</span> How to Use This Toolkit in 20 Minutes
          </h2>
          <p style={{ fontSize: "10px", color: "#78350f", margin: "0 0 12px 0", fontStyle: "italic" }}>
            You don't need hours. You need clarity + one focused action plan.
          </p>
          
          {[
            { time: "0–5", title: "Diagnose Your True Level", action: "Complete the True Level Scorecard", tip: "Circle your lowest 2 scores — those are your biggest blockers." },
            { time: "5–10", title: "Choose Your Next Best Move", action: "Complete the Strategic Benchmark → Target Role Matching Grid", tip: "Pick your top 1–2 target role types based on Fit + Readiness." },
            { time: "10–14", title: "Identify What Decision-Makers Need to See", action: "Complete the Leadership Signals Checklist", tip: "This tells you exactly what you must strengthen to be seen as next-level." },
            { time: "14–17", title: "Build Your Gap → Skill → Proof Plan", action: "Complete the Gap → Skill → Proof Ladder", tip: "Choose one skill and one proof outcome to build in the next 2–4 weeks." },
            { time: "17–20", title: "Lock Your Weekly Momentum", action: "Fill the 7-Day Career System Planner", tip: "Pick 3 actions you will execute this week." },
          ].map((step, idx) => (
            <div key={idx} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <div
                style={{
                  backgroundColor: "#c9a227",
                  color: "#fff",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  fontSize: "9px",
                  fontWeight: "700",
                  whiteSpace: "nowrap",
                  height: "fit-content",
                }}
              >
                Min {step.time}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "11px", fontWeight: "700", margin: "0 0 2px 0", color: "#1a2332" }}>{step.title}</p>
                <p style={{ fontSize: "10px", color: "#475569", margin: "0 0 2px 0" }}>✅ {step.action}</p>
                <p style={{ fontSize: "9px", color: "#78350f", margin: 0, fontStyle: "italic" }}>{step.tip}</p>
              </div>
            </div>
          ))}
          
          <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px dashed #c9a227" }}>
            <p style={{ fontSize: "10px", color: "#78350f", margin: 0, fontStyle: "italic" }}>
              (Optional Bonus: Complete the Offer-Winning Pitch Template after the 20 minutes.)
            </p>
          </div>
        </div>

        {/* The One Rule */}
        <div
          style={{
            backgroundColor: "#fef3c7",
            border: "2px solid #c9a227",
            borderRadius: "10px",
            padding: "14px 18px",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "8px" }}>
            <span style={{ fontSize: "14px" }}>⭐</span>
            <span style={{ fontWeight: "700", fontSize: "12px", color: "#1a2332" }}>The One Rule That Changes Everything</span>
          </div>
          <p style={{ fontSize: "12px", color: "#1a2332", margin: "0 0 6px 0", fontWeight: "600" }}>
            Don't try to fix everything.
          </p>
          <p style={{ fontSize: "11px", color: "#475569", margin: "0 0 6px 0" }}>
            Focus on 1–2 upgrades that compound into big career lift.
          </p>
          <p style={{ fontSize: "11px", color: "#c9a227", fontWeight: "700", margin: 0 }}>
            Small, consistent systems create big outcomes.
          </p>
        </div>

        {/* AI Report CTA */}
        <div
          style={{
            backgroundColor: "#f0f9ff",
            border: "1px solid #0ea5e9",
            borderRadius: "10px",
            padding: "12px 16px",
            marginBottom: "16px",
          }}
        >
          <p style={{ fontSize: "11px", fontWeight: "700", margin: "0 0 4px 0", color: "#0369a1" }}>
            ✅ Bonus: Generate Your Personalized AI Career Report
          </p>
          <p style={{ fontSize: "10px", color: "#0369a1", margin: "0 0 4px 0" }}>
            Want a tailored plan based on your answers? Generate your AI Career Benchmark Report here:
          </p>
          <p style={{ fontSize: "11px", fontWeight: "600", color: "#0369a1", margin: 0 }}>
            theleadersrow.com/career-coach
          </p>
        </div>

        {/* Closing */}
        <div
          style={{
            textAlign: "center",
            paddingTop: "12px",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <p style={{ fontSize: "11px", color: "#475569", margin: "0 0 8px 0", lineHeight: "1.6" }}>
            <strong>You've got this.</strong>
          </p>
          <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 4px 0", fontStyle: "italic", lineHeight: "1.5" }}>
            Clarity creates confidence.<br />
            A system creates outcomes.<br />
            And you're closer than you think.
          </p>
          <p style={{ fontSize: "12px", color: "#c9a227", fontWeight: "700", margin: "8px 0 0 0" }}>
            — Naina
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "12px",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "9px",
            color: "#94a3b8",
            position: "absolute",
            bottom: "16mm",
            left: "20mm",
            right: "20mm",
          }}
        >
          <span>Career Operating System Toolkit</span>
          <span>© The Leader's Row — All rights reserved</span>
        </div>
      </div>

      {/* TABLE OF CONTENTS PAGE */}
      <div
        className="pdf-page"
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "18mm 22mm",
          fontFamily: "'DM Sans', Arial, sans-serif",
          backgroundColor: "#ffffff",
          color: "#1a2332",
          pageBreakBefore: "always",
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
                purpose: "Learn what decision-makers reward and what signals you're missing.",
                outcome: "Your next-level signal upgrade plan.",
              },
              {
                num: "4",
                title: "Gap → Skill → Proof Ladder",
                purpose: "Turn gaps into a skill strategy and proof plan that creates results.",
                outcome: "Your top skill focus + proof goal for the next 2–4 weeks.",
              },
              {
                num: "5",
                title: "7-Day Career System Planner",
                purpose: "Convert your plan into consistent execution and weekly traction.",
                outcome: "A repeatable weekly cadence that compounds career growth.",
              },
              {
                num: "6",
                title: "Offer-Winning Pitch Template (30s + 60s)",
                purpose: "Communicate your value clearly in interviews, networking, and promotions.",
                outcome: "A confident pitch you can use immediately.",
              },
            ].map((tool) => (
              <div
                key={tool.num}
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: "#c9a227",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: "700",
                    flexShrink: 0,
                  }}
                >
                  {tool.num}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "13px", fontWeight: "700", margin: "0 0 4px 0", color: "#1a2332" }}>
                    {tool.title}
                  </h3>
                  <p style={{ fontSize: "11px", color: "#475569", margin: "0 0 2px 0" }}>
                    <strong>Purpose:</strong> {tool.purpose}
                  </p>
                  <p style={{ fontSize: "11px", color: "#475569", margin: 0 }}>
                    <strong>Outcome:</strong> {tool.outcome}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Reminder */}
        <div
          style={{
            backgroundColor: "#fefce8",
            border: "1px solid #c9a227",
            borderRadius: "10px",
            padding: "16px 20px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ fontSize: "16px" }}>⭐</span>
            <span style={{ fontWeight: "700", fontSize: "13px", color: "#1a2332" }}>Quick Reminder</span>
          </div>
          <p style={{ fontSize: "12px", color: "#1a2332", margin: "0 0 8px 0" }}>
            <strong>Use in order:</strong>
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexWrap: "wrap",
              fontSize: "11px",
              color: "#475569",
            }}
          >
            <span style={{ backgroundColor: "#c9a227", color: "#fff", padding: "3px 10px", borderRadius: "12px", fontWeight: "600" }}>Diagnose</span>
            <span>→</span>
            <span style={{ backgroundColor: "#c9a227", color: "#fff", padding: "3px 10px", borderRadius: "12px", fontWeight: "600" }}>Target</span>
            <span>→</span>
            <span style={{ backgroundColor: "#c9a227", color: "#fff", padding: "3px 10px", borderRadius: "12px", fontWeight: "600" }}>Signal</span>
            <span>→</span>
            <span style={{ backgroundColor: "#c9a227", color: "#fff", padding: "3px 10px", borderRadius: "12px", fontWeight: "600" }}>Close Gaps</span>
            <span>→</span>
            <span style={{ backgroundColor: "#c9a227", color: "#fff", padding: "3px 10px", borderRadius: "12px", fontWeight: "600" }}>Execute</span>
            <span>→</span>
            <span style={{ backgroundColor: "#c9a227", color: "#fff", padding: "3px 10px", borderRadius: "12px", fontWeight: "600" }}>Pitch</span>
          </div>
        </div>

        {/* Bonus CTA */}
        <div
          style={{
            backgroundColor: "#f0f9ff",
            border: "1px solid #0ea5e9",
            borderRadius: "10px",
            padding: "16px 20px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "12px", fontWeight: "700", margin: "0 0 4px 0", color: "#0369a1" }}>
            ✅ Bonus: Generate Your AI Career Report
          </p>
          <p style={{ fontSize: "11px", color: "#0369a1", margin: "0 0 6px 0" }}>
            Want a personalized Career Benchmark Report based on your answers?
          </p>
          <p style={{ fontSize: "12px", fontWeight: "600", color: "#0369a1", margin: 0 }}>
            Generate your AI report here: <strong>theleadersrow.com/career-coach</strong>
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "16px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "9px",
            color: "#94a3b8",
            position: "absolute",
            bottom: "18mm",
            left: "22mm",
            right: "22mm",
          }}
        >
          <span>Career Operating System Toolkit</span>
          <span>© the Leader's Row — All rights reserved</span>
        </div>
      </div>
    </div>
  );
};

export { ToolkitCoverPage };
