const TargetRoleMatchingGrid = () => {
  const benchmarkAreas = [
    "Product Execution (delivery, velocity, quality)",
    "Outcome Ownership (metrics, accountability, clarity)",
    "Product Judgment (tradeoffs, prioritization, decisions)",
    "Strategic Thinking (vision, roadmap, \"why now\")",
    "Stakeholder Management (alignment, conflict, influence)",
    "Executive Communication (structure, brevity, confidence)",
    "Leadership Presence (visibility, trust, authority)",
    "Domain Strength (payments, ads, AI/ML, platform, etc.)",
  ];

  const roleTypes = [
    "Product Growth / Growth PM",
    "Platform PM / Infrastructure",
    "Monetization / Ads",
    "Payments / Fintech",
    "Data / AI / ML Products",
    "Enterprise / B2B SaaS",
    "Consumer / B2C Apps",
    "0→1 / New Product",
    "International / Global Expansion",
    "Marketplace / Two-sided Platforms",
  ];

  const companyEnvironments = [
    "Big Tech (scale, brand, structured orgs)",
    "High-growth startup (speed, ambiguity, ownership)",
    "Mid-size scaling company (process + growth)",
    "Regulated industry (fintech/health)",
    "Global teams / multi-region complexity",
  ];

  const signalsChecklist = [
    "I can clearly explain my product impact with metrics",
    "I can explain tradeoffs and prioritize with confidence",
    "I've led cross-functional execution end-to-end",
    "I communicate with structure and brevity",
    "I influence stakeholders without authority",
    "I've driven strategy (not just roadmap delivery)",
    "My resume/LinkedIn clearly signals my level",
    "I can deliver a strong 30-second pitch",
    "I perform well in high-stakes interviews / meetings",
    "I have strong visibility through people / network pull",
  ];

  const targetLevels = [
    "Associate / Early PM (breaking in)",
    "PM (owning a feature/area)",
    "Senior PM (owning outcomes + cross-functional leadership)",
    "Staff / Principal PM (owning strategy + driving org-level influence)",
    "GPM / Group PM (leading PMs + org execution)",
    "Director (multi-team leadership + org strategy + executive influence)",
  ];

  return (
    <div
      className="pdf-page"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "10mm 16mm",
        fontFamily: "'DM Sans', Arial, sans-serif",
        backgroundColor: "#ffffff",
        color: "#1a2332",
        fontSize: "9px",
        lineHeight: "1.3",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <h1
          style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "#1a2332",
            margin: "0 0 4px 0",
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          Strategic Benchmark → Target Role Matching Grid
        </h1>
        <p style={{ fontSize: "10px", color: "#64748b", margin: 0, fontStyle: "italic" }}>
          Find the Right Next Role (Not Just the Next Role)
        </p>
      </div>

      {/* Intro */}
      <p style={{ fontSize: "8px", color: "#475569", marginBottom: "10px", textAlign: "center" }}>
        This worksheet helps you match your current strengths + signals to the right next-level role, so you stop wasting effort on roles that don't fit (yet) and start targeting roles you can win.
      </p>

      {/* STEP 1 */}
      <div style={{ marginBottom: "10px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "6px",
          }}
        >
          <div
            style={{
              backgroundColor: "#c9a227",
              color: "#fff",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "8px",
              fontWeight: "700",
            }}
          >
            STEP 1
          </div>
          <h2 style={{ fontSize: "11px", fontWeight: "700", margin: 0 }}>
            Your Strategic Benchmark (Current Reality)
          </h2>
        </div>
        <p style={{ fontSize: "7px", color: "#64748b", marginBottom: "4px" }}>
          Rate yourself 1–5 (1 = needs work, 5 = strong signal)
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc" }}>
              <th style={{ border: "1px solid #e2e8f0", padding: "4px 6px", textAlign: "left", fontWeight: "600" }}>
                Benchmark Area
              </th>
              <th style={{ border: "1px solid #e2e8f0", padding: "4px 6px", textAlign: "center", fontWeight: "600", width: "50px" }}>
                Score (1–5)
              </th>
            </tr>
          </thead>
          <tbody>
            {benchmarkAreas.map((area, idx) => (
              <tr key={idx}>
                <td style={{ border: "1px solid #e2e8f0", padding: "3px 6px" }}>{area}</td>
                <td style={{ border: "1px solid #e2e8f0", padding: "3px 6px", textAlign: "center" }}></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "flex", gap: "12px", marginTop: "6px", fontSize: "8px" }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: "600" }}>✅ My top 2 strengths are:</span>
            <div style={{ borderBottom: "1px solid #cbd5e1", height: "14px", marginTop: "2px" }}></div>
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: "600" }}>✅ My bottom 2 gaps are:</span>
            <div style={{ borderBottom: "1px solid #cbd5e1", height: "14px", marginTop: "2px" }}></div>
          </div>
        </div>
      </div>

      {/* STEP 2 */}
      <div style={{ marginBottom: "10px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "6px",
          }}
        >
          <div
            style={{
              backgroundColor: "#c9a227",
              color: "#fff",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "8px",
              fontWeight: "700",
            }}
          >
            STEP 2
          </div>
          <h2 style={{ fontSize: "11px", fontWeight: "700", margin: 0 }}>
            Your Target Role Definition
          </h2>
        </div>
        <p style={{ fontSize: "7px", color: "#64748b", marginBottom: "4px" }}>
          Choose the level you're targeting next:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px", fontSize: "8px" }}>
          {targetLevels.map((level, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "10px", height: "10px", border: "1px solid #cbd5e1", borderRadius: "2px" }}></div>
              <span>{level}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "6px", fontSize: "8px" }}>
          <span style={{ fontWeight: "600" }}>My target level is:</span>
          <span style={{ borderBottom: "1px solid #cbd5e1", display: "inline-block", width: "200px", marginLeft: "8px" }}>&nbsp;</span>
        </div>
      </div>

      {/* STEP 3 */}
      <div style={{ marginBottom: "10px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "6px",
          }}
        >
          <div
            style={{
              backgroundColor: "#c9a227",
              color: "#fff",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "8px",
              fontWeight: "700",
            }}
          >
            STEP 3
          </div>
          <h2 style={{ fontSize: "11px", fontWeight: "700", margin: 0 }}>
            The Role Fit Grid (Match Before You Apply)
          </h2>
        </div>
        <p style={{ fontSize: "7px", color: "#64748b", marginBottom: "4px" }}>
          Fit: 1 (low interest) → 5 (high interest) | Readiness: 1 (not yet) → 5 (ready now)
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc" }}>
              <th style={{ border: "1px solid #e2e8f0", padding: "3px 6px", textAlign: "left", fontWeight: "600" }}>
                Role Type
              </th>
              <th style={{ border: "1px solid #e2e8f0", padding: "3px 6px", textAlign: "center", fontWeight: "600", width: "45px" }}>
                Fit (1–5)
              </th>
              <th style={{ border: "1px solid #e2e8f0", padding: "3px 6px", textAlign: "center", fontWeight: "600", width: "60px" }}>
                Readiness (1–5)
              </th>
              <th style={{ border: "1px solid #e2e8f0", padding: "3px 6px", textAlign: "left", fontWeight: "600", width: "100px" }}>
                Why / Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {roleTypes.map((role, idx) => (
              <tr key={idx}>
                <td style={{ border: "1px solid #e2e8f0", padding: "2px 6px" }}>{role}</td>
                <td style={{ border: "1px solid #e2e8f0", padding: "2px 6px", textAlign: "center" }}></td>
                <td style={{ border: "1px solid #e2e8f0", padding: "2px 6px", textAlign: "center" }}></td>
                <td style={{ border: "1px solid #e2e8f0", padding: "2px 6px" }}></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "flex", gap: "12px", marginTop: "6px", fontSize: "8px" }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: "600" }}>✅ My top 2 role targets:</span>
            <div style={{ borderBottom: "1px solid #cbd5e1", height: "14px", marginTop: "2px" }}></div>
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: "600" }}>✅ Roles I like but I'm not ready for yet:</span>
            <div style={{ borderBottom: "1px solid #cbd5e1", height: "14px", marginTop: "2px" }}></div>
          </div>
        </div>
      </div>

      {/* STEP 4 */}
      <div style={{ marginBottom: "10px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "6px",
          }}
        >
          <div
            style={{
              backgroundColor: "#c9a227",
              color: "#fff",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "8px",
              fontWeight: "700",
            }}
          >
            STEP 4
          </div>
          <h2 style={{ fontSize: "11px", fontWeight: "700", margin: 0 }}>
            Company Fit (Choose the Right Battlefield)
          </h2>
        </div>
        <p style={{ fontSize: "7px", color: "#64748b", marginBottom: "4px" }}>
          Rate each environment based on where you perform best.
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc" }}>
              <th style={{ border: "1px solid #e2e8f0", padding: "3px 6px", textAlign: "left", fontWeight: "600" }}>
                Company Environment
              </th>
              <th style={{ border: "1px solid #e2e8f0", padding: "3px 6px", textAlign: "center", fontWeight: "600", width: "50px" }}>
                Fit (1–5)
              </th>
              <th style={{ border: "1px solid #e2e8f0", padding: "3px 6px", textAlign: "left", fontWeight: "600", width: "140px" }}>
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {companyEnvironments.map((env, idx) => (
              <tr key={idx}>
                <td style={{ border: "1px solid #e2e8f0", padding: "2px 6px" }}>{env}</td>
                <td style={{ border: "1px solid #e2e8f0", padding: "2px 6px", textAlign: "center" }}></td>
                <td style={{ border: "1px solid #e2e8f0", padding: "2px 6px" }}></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: "6px", fontSize: "8px" }}>
          <span style={{ fontWeight: "600" }}>✅ My best-fit environment is:</span>
          <span style={{ borderBottom: "1px solid #cbd5e1", display: "inline-block", width: "220px", marginLeft: "8px" }}>&nbsp;</span>
        </div>
      </div>

      {/* STEP 5 */}
      <div style={{ marginBottom: "10px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "6px",
          }}
        >
          <div
            style={{
              backgroundColor: "#c9a227",
              color: "#fff",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "8px",
              fontWeight: "700",
            }}
          >
            STEP 5
          </div>
          <h2 style={{ fontSize: "11px", fontWeight: "700", margin: 0 }}>
            Role Signals Checklist (Do I "Look Ready" Yet?)
          </h2>
        </div>
        <p style={{ fontSize: "7px", color: "#64748b", marginBottom: "4px" }}>
          These are the signals hiring managers and promo committees reward. Check all that apply:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", fontSize: "8px" }}>
          {signalsChecklist.map((signal, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "4px" }}>
              <div style={{ width: "10px", height: "10px", border: "1px solid #cbd5e1", borderRadius: "2px", flexShrink: 0, marginTop: "1px" }}></div>
              <span>{signal}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "6px", fontSize: "8px" }}>
          <span style={{ fontWeight: "600" }}>✅ Total checked:</span>
          <span style={{ borderBottom: "1px solid #cbd5e1", display: "inline-block", width: "30px", marginLeft: "8px", textAlign: "center" }}>&nbsp;</span>
          <span> / 10</span>
        </div>
      </div>

      {/* STEP 6 */}
      <div style={{ marginBottom: "10px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "6px",
          }}
        >
          <div
            style={{
              backgroundColor: "#c9a227",
              color: "#fff",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "8px",
              fontWeight: "700",
            }}
          >
            STEP 6
          </div>
          <h2 style={{ fontSize: "11px", fontWeight: "700", margin: 0 }}>
            Your Next 2-Week Career Sprint (Action Plan)
          </h2>
        </div>
        <div style={{ fontSize: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <div>
            <span style={{ fontWeight: "600" }}>My role focus for the next 2 weeks:</span>
            <div style={{ borderBottom: "1px solid #cbd5e1", height: "14px", marginTop: "2px" }}></div>
          </div>
          <div>
            <span style={{ fontWeight: "600" }}>The #1 gap I will close:</span>
            <div style={{ borderBottom: "1px solid #cbd5e1", height: "14px", marginTop: "2px" }}></div>
          </div>
          <div>
            <span style={{ fontWeight: "600" }}>The proof I will build:</span>
            <div style={{ borderBottom: "1px solid #cbd5e1", height: "14px", marginTop: "2px" }}></div>
          </div>
          <div>
            <span style={{ fontWeight: "600" }}>The 3 actions I will take this week:</span>
            <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
              <div style={{ flex: 1, borderBottom: "1px solid #cbd5e1", height: "14px" }}></div>
              <div style={{ flex: 1, borderBottom: "1px solid #cbd5e1", height: "14px" }}></div>
              <div style={{ flex: 1, borderBottom: "1px solid #cbd5e1", height: "14px" }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Final Decision Rule */}
      <div
        style={{
          backgroundColor: "#fefce8",
          border: "1px solid #c9a227",
          borderRadius: "6px",
          padding: "8px 12px",
          marginBottom: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
          <span style={{ fontSize: "12px" }}>⭐</span>
          <span style={{ fontWeight: "700", fontSize: "10px" }}>Final Decision Rule (High Clarity)</span>
        </div>
        <p style={{ fontSize: "8px", margin: 0, color: "#1a2332" }}>
          <strong>Apply when your Fit is high AND your Readiness is high.</strong><br />
          If readiness is low, don't quit—build the missing signal and proof.
        </p>
      </div>

      {/* CTA */}
      <div
        style={{
          backgroundColor: "#f0f9ff",
          border: "1px solid #0ea5e9",
          borderRadius: "6px",
          padding: "8px 12px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "9px", fontWeight: "600", margin: "0 0 2px 0", color: "#0369a1" }}>
          Want a personalized Career Benchmark Report?
        </p>
        <p style={{ fontSize: "8px", margin: 0, color: "#0369a1" }}>
          Answer a few questions and generate your AI report here: <strong>theleadersrow.com/career-coach</strong>
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "10px",
          paddingTop: "6px",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "7px",
          color: "#94a3b8",
        }}
      >
        <span>Career Operating System Toolkit</span>
        <span>© the Leader's Row — All rights reserved</span>
      </div>
    </div>
  );
};

export { TargetRoleMatchingGrid };
