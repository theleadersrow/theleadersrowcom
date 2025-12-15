export const executiveCommunicationCourse = {
  id: "executive-communication",
  title: "Executive Communication & Influence",
  subtitle: "Turn Updates into Decisions",
  description: "A 60-minute self-paced course that transforms how you communicate, influence stakeholders, and drive decisions — without authority.",
  duration: "60 minutes",
  modules: 6,
  price: "$149",
  featured: true,
  badge: "New",
  targetAudience: [
    "Mid-to-senior professionals ready to communicate at an executive level",
    "Leaders who want their ideas heard and acted upon",
    "Anyone tired of meetings that end without decisions",
    "Professionals who want to influence without formal authority"
  ],
  outcomes: [
    "Communicate like a senior leader — not a task executor",
    "Frame messages that drive decisions (not discussion)",
    "Influence stakeholders without authority",
    "Design meetings that end with clear outcomes"
  ],
  includes: [
    "4 executive communication frameworks",
    "Ready-to-use scripts and templates",
    "Stakeholder power mapping tools",
    "Meeting design blueprints",
    "Capstone project with completion certificate",
    "Downloadable course workbook"
  ],
  whyItWorks: [
    "Decision-driven: Every lesson focuses on outcomes, not theory",
    "Real-world ready: Scripts and frameworks you can use tomorrow",
    "Senior-level: Built from how executives actually communicate"
  ],
  modulesList: [
    {
      id: 1,
      title: "Message Compression",
      subtitle: "The 90-Second Rule",
      duration: "12 min"
    },
    {
      id: 2,
      title: "Executive Framing",
      subtitle: "Make It Land",
      duration: "12 min"
    },
    {
      id: 3,
      title: "Stakeholder Power & Influence",
      subtitle: "Map Your Path to Yes",
      duration: "12 min"
    },
    {
      id: 4,
      title: "Meeting-to-Decision System",
      subtitle: "End Every Meeting with Clarity",
      duration: "12 min"
    },
    {
      id: 5,
      title: "Capstone Project",
      subtitle: "Build Your Executive Communication Packet",
      duration: "12 min"
    }
  ]
};

export const module1Content = {
  title: "Message Compression",
  subtitle: "The 90-Second Rule",
  duration: "12 minutes",
  objective: "Learn to deliver executive-level updates in 90 seconds or less using the C-S-D-T Framework.",
  sections: [
    {
      type: "insight",
      title: "Why Executives Don't Want Updates",
      content: `Executives don't have time for background. They don't want a tour of your process. They want four things — fast:

**Context** — What changed and why it matters now
**Stakes** — What's at risk if we act vs. don't act
**Decision** — What exactly you're asking for
**Tradeoffs** — Options, costs, and your recommendation

If you can deliver all four in 90 seconds, you communicate like a senior leader. If you can't, you sound like everyone else.`
    },
    {
      type: "framework",
      title: "The C-S-D-T Framework",
      items: [
        {
          label: "C — Context",
          description: "What changed? Why does it matter now? Lead with the shift, not the history.",
          example: "\"Our launch timeline moved up by two weeks due to competitor activity.\""
        },
        {
          label: "S — Stakes",
          description: "What's the impact of action vs. inaction? Make the cost of waiting clear.",
          example: "\"If we don't reprioritize engineering resources, we risk losing first-mover advantage in the enterprise segment.\""
        },
        {
          label: "D — Decision",
          description: "What are you asking for? Be specific. Don't say 'thoughts?' — say what you need.",
          example: "\"I'm asking for approval to reallocate two engineers from the analytics project for the next sprint.\""
        },
        {
          label: "T — Tradeoffs",
          description: "What are the options? What's the cost of each? What do you recommend?",
          example: "\"Option A delays analytics by one week. Option B hires a contractor at $15K. I recommend Option A — it's lower risk and fully reversible.\""
        }
      ]
    },
    {
      type: "example",
      title: "The 90-Second Executive Update (Real Example)",
      content: `**Before (unfocused, 3+ minutes):**
"So, as you know, we've been working on the launch for a while now, and there have been some changes. The competitor announced something similar, which might affect our timeline. I wanted to get your thoughts on whether we should adjust our approach. There are a few options we could consider..."

**After (C-S-D-T, 90 seconds):**
"Our launch timeline needs to move up two weeks — a competitor just announced a similar feature. If we don't act, we lose first-mover advantage in enterprise. I'm asking for two engineers from analytics for one sprint. That delays their project by a week, but it's reversible. I recommend we do it."`
    },
    {
      type: "exercise",
      title: "Your 90-Second Executive Update Script",
      instructions: "Complete this template for a real situation you're facing at work:",
      template: `**Context:** What changed and why it matters now:
_____________________________________________

**Stakes:** Impact of action vs. inaction:
_____________________________________________

**Decision:** What you're asking for (be specific):
_____________________________________________

**Tradeoffs:** Options, costs, and your recommendation:
_____________________________________________

**Full Script (read aloud — should be under 90 seconds):**
_____________________________________________`
    },
    {
      type: "action",
      title: "Apply This Week",
      content: "Identify one update you need to give this week. Rewrite it using the C-S-D-T framework. Deliver it in your next meeting or Slack message. Notice the difference in response."
    }
  ]
};

export const module2Content = {
  title: "Executive Framing",
  subtitle: "Make It Land",
  duration: "12 minutes",
  objective: "Learn how executives listen and structure your message to match their decision-making process.",
  sections: [
    {
      type: "insight",
      title: "How Executives Listen",
      content: `When you speak, executives aren't following your logic. They're filtering your message through five questions:

1. **So what?** — Why should I care about this?
2. **What do you recommend?** — What's your point of view?
3. **What are we trading off?** — What's the cost?
4. **What's the risk?** — What could go wrong?
5. **What happens next?** — Who does what by when?

If your message doesn't answer these — in this order — it won't land. You'll get "let me think about it" instead of a decision.`
    },
    {
      type: "framework",
      title: "The Executive Framing Ladder",
      items: [
        {
          label: "Level 1 — So What",
          description: "Start with why this matters to them, not what happened.",
          example: "\"This affects Q3 revenue targets.\""
        },
        {
          label: "Level 2 — Recommendation",
          description: "Lead with your answer. Don't make them wait for it.",
          example: "\"I recommend we approve the vendor change.\""
        },
        {
          label: "Level 3 — Tradeoffs",
          description: "Show you've weighed the options. Be honest about costs.",
          example: "\"This adds $50K but saves two months.\""
        },
        {
          label: "Level 4 — Risk",
          description: "Name the risk. Executives respect candor, not false confidence.",
          example: "\"The risk is vendor lock-in. Mitigation: 90-day exit clause.\""
        },
        {
          label: "Level 5 — Next Steps",
          description: "Close with ownership and timeline. Leave no ambiguity.",
          example: "\"If approved, I'll initiate the contract by Friday.\""
        }
      ]
    },
    {
      type: "example",
      title: "Before & After: Weak vs. Strong Executive Message",
      content: `**Before (weak framing):**
"We've been looking at vendors for the new tool, and there are three options. Vendor A costs more but has better features. Vendor B is cheaper but has some gaps. I'm not sure which one is best — wanted to get your input."

**After (Executive Framing Ladder):**
"I recommend we go with Vendor A. It costs $50K more than Vendor B, but it saves us two months of integration work and fully supports our compliance requirements. The risk is vendor lock-in — I've negotiated a 90-day exit clause to mitigate. If you approve today, I'll initiate the contract by Friday."`
    },
    {
      type: "exercise",
      title: "Rewrite Exercise: Apply the Ladder",
      instructions: "Take a message you need to deliver and restructure it using the Executive Framing Ladder:",
      template: `**Your current message (as you'd normally say it):**
_____________________________________________

**Rewritten using the Ladder:**

So What:
_____________________________________________

Recommendation:
_____________________________________________

Tradeoffs:
_____________________________________________

Risk:
_____________________________________________

Next Steps:
_____________________________________________`
    },
    {
      type: "insight",
      title: "Confidence Calibration",
      content: `You don't need to be 100% certain to make a recommendation. Executives expect 70% certainty — and they respect you more for committing.

**Say this:** "Based on what we know, I recommend Option A. There's 30% uncertainty around timeline, but we can course-correct in sprint two."

**Not this:** "I'm not sure... it depends on a lot of factors... what do you think?"`
    },
    {
      type: "checklist",
      title: "Executive Message Checklist (Use Before Every High-Stakes Communication)",
      items: [
        "Does my opening answer 'So what?' immediately?",
        "Have I stated my recommendation clearly (not buried it)?",
        "Have I named the tradeoffs honestly?",
        "Have I acknowledged the risks and how I'll mitigate them?",
        "Does my close include who does what by when?"
      ]
    }
  ]
};

export const module3Content = {
  title: "Stakeholder Power & Influence",
  subtitle: "Map Your Path to Yes",
  duration: "12 minutes",
  objective: "Learn to map stakeholder dynamics and pre-align decision-makers before the meeting.",
  sections: [
    {
      type: "insight",
      title: "Why Good Ideas Fail",
      content: `The best idea in the room often loses. Not because it's wrong — but because it wasn't pre-aligned.

Decisions aren't made in meetings. They're confirmed in meetings. The real decision happens in the hallway conversations, the 1:1s, and the Slack DMs before anyone walks into the room.

If you're walking into a meeting hoping to persuade, you've already lost.`
    },
    {
      type: "framework",
      title: "The Stakeholder Power Map",
      items: [
        {
          label: "Power",
          description: "Can they approve, block, or influence the decision?",
          example: "High power = decision maker or veto holder"
        },
        {
          label: "Interest",
          description: "Do they care about this topic? Will they show up?",
          example: "High interest = engaged and vocal"
        },
        {
          label: "Resistance",
          description: "Are they likely to support, oppose, or be neutral?",
          example: "High resistance = they have something to lose"
        }
      ]
    },
    {
      type: "visual",
      title: "The 2x2 Stakeholder Grid",
      content: `Map each stakeholder on this grid:

|                    | LOW POWER | HIGH POWER |
|--------------------|-----------|------------|
| **HIGH INTEREST**  | Inform    | Partner    |
| **LOW INTEREST**   | Monitor   | Activate   |

**Partner (High Power, High Interest):** Your key allies. Pre-align with them. Get their input early.

**Activate (High Power, Low Interest):** They can approve but don't care yet. Your job: make them care. Frame why this matters to their goals.

**Inform (Low Power, High Interest):** Keep them updated. They can be champions or detractors in the hallway.

**Monitor (Low Power, Low Interest):** Don't spend energy here.`
    },
    {
      type: "exercise",
      title: "Stakeholder Mapping Exercise",
      instructions: "For a decision you need to drive, map your stakeholders:",
      template: `**Decision/Initiative:**
_____________________________________________

**Stakeholder 1:**
Name: _____________
Power (H/M/L): ___
Interest (H/M/L): ___
Resistance (H/M/L): ___
Grid Position: ___

**Stakeholder 2:**
Name: _____________
Power (H/M/L): ___
Interest (H/M/L): ___
Resistance (H/M/L): ___
Grid Position: ___

**Stakeholder 3:**
Name: _____________
Power (H/M/L): ___
Interest (H/M/L): ___
Resistance (H/M/L): ___
Grid Position: ___`
    },
    {
      type: "insight",
      title: "The Framing Prompt",
      content: `For each stakeholder, complete this sentence:

**"This stakeholder cares about ___, so I will frame this as ___."**

Examples:
- "This stakeholder cares about **cost control**, so I will frame this as **a $200K annual savings opportunity**."
- "This stakeholder cares about **team morale**, so I will frame this as **reducing burnout and improving retention**."
- "This stakeholder cares about **their reputation**, so I will frame this as **a win they can take credit for**."`
    },
    {
      type: "scripts",
      title: "Pre-Alignment Message Scripts",
      items: [
        {
          label: "Script 1: Seeking Input (for Partners)",
          script: "\"I'm bringing a proposal to the leadership meeting on [topic]. Before I finalize, I'd love your input — you've navigated this before and I want to make sure I'm not missing anything. Can we grab 15 minutes this week?\""
        },
        {
          label: "Script 2: Creating Urgency (for Activators)",
          script: "\"I know this isn't top of mind for you, but there's a decision coming up that affects [their priority]. I wanted to give you a heads up and see if you have any concerns before the meeting.\""
        },
        {
          label: "Script 3: Reducing Resistance",
          script: "\"I know you have reservations about this approach. I'd like to understand your concerns better — not to convince you, but to make sure I'm thinking about this the right way. What am I missing?\""
        }
      ]
    },
    {
      type: "action",
      title: "Apply This Week",
      content: "Before your next important meeting, identify the one stakeholder who could block your idea. Reach out to them using one of the scripts above. Get aligned before the room fills up."
    }
  ]
};

export const module4Content = {
  title: "Meeting-to-Decision System",
  subtitle: "End Every Meeting with Clarity",
  duration: "12 minutes",
  objective: "Learn to design meetings that end with decisions, not discussion.",
  sections: [
    {
      type: "insight",
      title: "Why Meetings Fail",
      content: `Meetings fail because they have no decision design.

People walk in without knowing:
- What decision is being made
- Who has the authority to make it
- What information is needed to decide
- What happens after the meeting ends

The result? Discussion without decision. Alignment without action. Another meeting to discuss what you just discussed.

Senior leaders don't let this happen. They design meetings for decisions.`
    },
    {
      type: "framework",
      title: "The Meeting-to-Decision Checklist",
      items: [
        {
          label: "1. Decision Type",
          description: "What kind of decision is this?",
          options: [
            "**Approve** — Yes/no on a proposal",
            "**Align** — Get everyone on the same page",
            "**Choose** — Pick between options",
            "**Inform** — Share information (no decision)"
          ]
        },
        {
          label: "2. Who Must Be Pre-Wired",
          description: "Which stakeholders need to be aligned before the meeting?",
          example: "Anyone with high power or high resistance"
        },
        {
          label: "3. One-Slide Structure",
          description: "Prepare one slide that covers:",
          options: [
            "**Context** — What's the situation",
            "**Stakes** — Why it matters",
            "**Ask** — What you need from them",
            "**Options** — Choices with tradeoffs"
          ]
        },
        {
          label: "4. Close with Ownership",
          description: "End every meeting by confirming:",
          options: [
            "What was decided",
            "Who owns the action",
            "When it will be done"
          ]
        }
      ]
    },
    {
      type: "exercise",
      title: "Meeting Planning Worksheet",
      instructions: "For an upcoming meeting, complete this planning template:",
      template: `**Meeting Purpose:**
_____________________________________________

**Decision Type:** □ Approve □ Align □ Choose □ Inform

**Key Stakeholders to Pre-Wire:**
1. _______________ — Pre-wire by: ___________
2. _______________ — Pre-wire by: ___________

**One-Slide Structure:**
Context: _____________________________________________
Stakes: _____________________________________________
Ask: _____________________________________________
Options: _____________________________________________

**Closing Script:**
"So we've agreed to ________. [Name] will own ________ and have it done by ________. Any questions?"`
    },
    {
      type: "scripts",
      title: "Close-the-Meeting Script",
      content: `Use this script in the last 2 minutes of every meeting:

**"Before we wrap, let me confirm what we've decided:**
- We agreed to [decision]
- [Name] will own [action]
- This will be complete by [date]
- If there are blockers, [escalation path]

**Anyone see it differently?"**

This takes 30 seconds. It prevents 3 follow-up emails and 1 follow-up meeting.`
    },
    {
      type: "example",
      title: "Real Example: A Meeting Redesigned for Decision Clarity",
      content: `**Before (typical meeting):**
- Subject: "Q4 Planning Discussion"
- Agenda: Review Q4 priorities
- Attendees: 12 people
- Outcome: "Let's take this offline and circle back"

**After (decision-designed meeting):**
- Subject: "Decision: Approve Q4 OKRs"
- Agenda: 
  1. Context: What changed since last quarter (5 min)
  2. Stakes: What we risk if we don't align (2 min)
  3. Recommendation: Proposed OKRs with tradeoffs (10 min)
  4. Decision: Approve or modify (10 min)
  5. Close: Confirm owners and dates (3 min)
- Attendees: 5 decision-makers (others get async update)
- Outcome: OKRs approved. Owners assigned. Done.`
    },
    {
      type: "template",
      title: "Reusable Meeting Blueprint",
      content: `**Meeting Invitation Template:**

Subject: [Decision Type]: [Specific Decision]

---

**Purpose:** [One sentence on what decision we're making]

**Pre-read:** [Link to one-pager if needed]

**Agenda:**
1. Context (5 min)
2. Stakes (2 min)
3. Recommendation + Tradeoffs (10 min)
4. Decision (10 min)
5. Close: Owners + Dates (3 min)

**Attendees:**
- Decision Maker: [Name]
- Input: [Names]
- Informed (async): [Names]

---

**Expected Outcome:** [Specific decision] approved and assigned.`
    },
    {
      type: "action",
      title: "Apply This Week",
      content: "Take your next meeting invite. Rewrite it using the blueprint above. Add a decision type to the subject line. End the meeting with the closing script. Watch what changes."
    }
  ]
};

export const module5Content = {
  title: "Capstone Project",
  subtitle: "Build Your Executive Communication Packet",
  duration: "12 minutes",
  objective: "Apply everything you've learned by creating a complete executive communication packet for a real situation.",
  sections: [
    {
      type: "insight",
      title: "Your Transformation",
      content: `You've learned four critical skills:

1. **Message Compression** — How to deliver updates in 90 seconds
2. **Executive Framing** — How to structure messages that land
3. **Stakeholder Influence** — How to pre-align decision-makers
4. **Meeting Design** — How to end every meeting with decisions

Now it's time to apply them all together.

Your capstone project will create a complete Executive Communication Packet — a set of assets you can use for any high-stakes decision at work.`
    },
    {
      type: "exercise",
      title: "Part 1: Your 90-Second Executive Update",
      instructions: "Using the C-S-D-T Framework, write a complete 90-second update for a real situation:",
      template: `**Situation:** What decision or update are you communicating?
_____________________________________________

**Your 90-Second Script:**

[Context] What changed and why it matters now:
_____________________________________________
_____________________________________________

[Stakes] Impact of action vs. inaction:
_____________________________________________
_____________________________________________

[Decision] What you're asking for:
_____________________________________________

[Tradeoffs] Options, costs, and recommendation:
_____________________________________________
_____________________________________________

**Read this aloud. Time yourself. Aim for under 90 seconds.**`
    },
    {
      type: "exercise",
      title: "Part 2: Your 1-Page Executive Memo",
      instructions: "Structure a one-page memo using the Executive Framing Ladder:",
      template: `**EXECUTIVE MEMO**

**To:** _______________
**From:** _______________
**Date:** _______________
**Re:** _______________

---

**BOTTOM LINE:**
[Your recommendation in one sentence]
_____________________________________________

**CONTEXT:**
[Why this matters now — 2-3 sentences]
_____________________________________________
_____________________________________________

**OPTIONS & TRADEOFFS:**
| Option | Cost | Benefit | Risk |
|--------|------|---------|------|
| Option A | | | |
| Option B | | | |
| Option C | | | |

**RECOMMENDATION:**
[Why you recommend this option — 2-3 sentences]
_____________________________________________
_____________________________________________

**RISKS & MITIGATION:**
_____________________________________________

**NEXT STEPS:**
[Who does what by when]
_____________________________________________`
    },
    {
      type: "exercise",
      title: "Part 3: Your Stakeholder Power Map",
      instructions: "Map the stakeholders for this decision:",
      template: `**Decision:** _______________

**STAKEHOLDER GRID:**

|                    | LOW POWER | HIGH POWER |
|--------------------|-----------|------------|
| **HIGH INTEREST**  |           |            |
| **LOW INTEREST**   |           |            |

**Key Stakeholder Strategy:**

Stakeholder 1: _______________
- They care about: _______________
- I will frame this as: _______________
- Pre-alignment approach: _______________

Stakeholder 2: _______________
- They care about: _______________
- I will frame this as: _______________
- Pre-alignment approach: _______________

Stakeholder 3: _______________
- They care about: _______________
- I will frame this as: _______________
- Pre-alignment approach: _______________`
    },
    {
      type: "exercise",
      title: "Part 4: Your Decision-Driven Meeting Plan",
      instructions: "Design a meeting that ends with a decision:",
      template: `**MEETING PLAN**

**Meeting Title:** [Decision Type]: _______________
**Decision Type:** □ Approve □ Align □ Choose □ Inform
**Date/Time:** _______________
**Duration:** _______________

**Attendees:**
- Decision Maker: _______________
- Input Needed: _______________
- Informed (async): _______________

**Pre-Meeting Alignment:**
- _______ (by date: _______)
- _______ (by date: _______)

**Agenda:**
1. Context (__ min)
2. Stakes (__ min)
3. Recommendation + Tradeoffs (__ min)
4. Decision (__ min)
5. Close: Owners + Dates (__ min)

**Closing Script:**
"So we've agreed to _______________. 
[Name] will own _______________ 
and have it done by _______________. 
Any questions?"`
    },
    {
      type: "reflection",
      title: "Reflection Question",
      question: "What changed in how you think about communication and influence?",
      template: `_____________________________________________
_____________________________________________
_____________________________________________`
    },
    {
      type: "completion",
      title: "Congratulations",
      content: `**You've completed Executive Communication & Influence.**

You now communicate like a decision-maker, not a task executor.

You have the frameworks to:
✓ Compress any message to 90 seconds
✓ Frame your ideas so they land with executives
✓ Map and influence stakeholders before the room fills up
✓ Design meetings that end with decisions

**What's Next:**
- Use your Executive Communication Packet this week
- Practice the C-S-D-T framework in your next update
- Pre-align one stakeholder before your next big meeting
- Close every meeting with the ownership script

Your career is built on how you communicate. You now have the tools to communicate like a leader.`
    }
  ]
};

export const workbookContent = {
  title: "Executive Communication & Influence Workbook",
  subtitle: "Frameworks, Scripts, and Templates",
  sections: [
    {
      title: "Message Goal Selector",
      content: `Before you communicate, identify your goal:

□ **Get Approval** → Use: C-S-D-T Framework + Executive Framing Ladder
□ **Drive Alignment** → Use: Stakeholder Power Map + Pre-alignment Scripts
□ **Share Information** → Use: 90-Second Update (modified for FYI)
□ **Request Resources** → Use: Full Executive Memo
□ **Close a Meeting** → Use: Meeting-to-Decision Checklist`
    },
    {
      title: "90-Second Executive Update Script",
      content: `**C-S-D-T FRAMEWORK**

**CONTEXT:** What changed and why it matters now
_____________________________________________
_____________________________________________

**STAKES:** Impact of action vs. inaction
_____________________________________________
_____________________________________________

**DECISION:** What you're asking for (be specific)
_____________________________________________

**TRADEOFFS:** Options, costs, and recommendation
_____________________________________________
_____________________________________________

□ Read aloud and timed under 90 seconds`
    },
    {
      title: "Executive Framing Ladder Worksheet",
      content: `**Structure every executive message in this order:**

**1. SO WHAT:** Why should they care?
_____________________________________________

**2. RECOMMENDATION:** What do you recommend?
_____________________________________________

**3. TRADEOFFS:** What's the cost of each option?
_____________________________________________

**4. RISK:** What could go wrong + mitigation?
_____________________________________________

**5. NEXT STEPS:** Who does what by when?
_____________________________________________

**PRE-FLIGHT CHECKLIST:**
□ Opening answers "So what?" immediately
□ Recommendation is stated, not buried
□ Tradeoffs are honest
□ Risks acknowledged with mitigation
□ Close includes owner + deadline`
    },
    {
      title: "Stakeholder Power Map",
      content: `**DECISION:** _______________________________

**MAP YOUR STAKEHOLDERS:**

|                    | LOW POWER | HIGH POWER |
|--------------------|-----------|------------|
| **HIGH INTEREST**  |           |            |
| **LOW INTEREST**   |           |            |

**STAKEHOLDER STRATEGY:**

**Stakeholder 1:** _______________
Power: □ H □ M □ L   Interest: □ H □ M □ L   Resistance: □ H □ M □ L
They care about: _______________________________
I will frame this as: _______________________________
Action: _______________________________

**Stakeholder 2:** _______________
Power: □ H □ M □ L   Interest: □ H □ M □ L   Resistance: □ H □ M □ L
They care about: _______________________________
I will frame this as: _______________________________
Action: _______________________________

**Stakeholder 3:** _______________
Power: □ H □ M □ L   Interest: □ H □ M □ L   Resistance: □ H □ M □ L
They care about: _______________________________
I will frame this as: _______________________________
Action: _______________________________`
    },
    {
      title: "Meeting-to-Decision Checklist",
      content: `**BEFORE THE MEETING:**

□ **Decision Type Defined:**
  □ Approve □ Align □ Choose □ Inform

□ **Stakeholders Pre-Wired:**
  Name: _____________ Pre-wire date: _______
  Name: _____________ Pre-wire date: _______

□ **One-Slide Prepared:**
  Context: _______________________________
  Stakes: _______________________________
  Ask: _______________________________
  Options: _______________________________

**DURING THE MEETING:**
□ Opened with "So what"
□ Stated recommendation early
□ Covered tradeoffs honestly
□ Time-boxed discussion

**CLOSING THE MEETING (last 2 minutes):**
□ "We've agreed to _______________"
□ "[Name] will own _______________"
□ "Complete by _______________"
□ "Anyone see it differently?"`
    },
    {
      title: "Capstone Submission",
      content: `**YOUR EXECUTIVE COMMUNICATION PACKET**

Complete all four components for one real decision:

**□ 90-Second Executive Update**
Situation: _______________________________
Script attached: □ Yes

**□ 1-Page Executive Memo**
Recipient: _______________________________
Document attached: □ Yes

**□ Stakeholder Power Map**
Decision: _______________________________
Map completed: □ Yes

**□ Decision-Driven Meeting Plan**
Meeting title: _______________________________
Plan completed: □ Yes

**REFLECTION:**
What changed in how you think about communication and influence?
_____________________________________________
_____________________________________________
_____________________________________________

**COMPLETION CONFIRMATION:**
I have completed all four components of my Executive Communication Packet.

Signature: _________________ Date: _________`
    }
  ]
};
