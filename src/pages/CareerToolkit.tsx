import { useRef, useState } from "react";
import { Download, ArrowLeft, FileText, Target, MessageSquare, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrueLevelScorecard } from "@/components/scorecard/TrueLevelScorecard";
import { GapSkillProofLadder } from "@/components/scorecard/GapSkillProofLadder";
import { OfferWinningPitch } from "@/components/scorecard/OfferWinningPitch";
import { WeeklyCareerPlanner } from "@/components/scorecard/WeeklyCareerPlanner";
import { LeadershipSignalsChecklist } from "@/components/scorecard/LeadershipSignalsChecklist";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";

const tools = [
  {
    id: "true-level",
    title: "True Level Scorecard",
    description: "Know exactly where you stand today—not where you think you are.",
    icon: Target,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "gap-skill",
    title: "Gap → Skill → Proof Ladder",
    description: "Turn identified gaps into tangible skills and documented proof.",
    icon: FileText,
    color: "bg-secondary/10 text-secondary",
  },
  {
    id: "offer-pitch",
    title: "Offer-Winning Pitch Builder",
    description: "Craft the narrative that makes hiring managers say yes.",
    icon: MessageSquare,
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "weekly-planner",
    title: "7-Day Career System Planner",
    description: "Small daily actions that compound into career momentum.",
    icon: Calendar,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "leadership-signals",
    title: "Leadership Signals Checklist",
    description: "The signals decision-makers look for at Senior/Principal/Director level.",
    icon: Shield,
    color: "bg-blue-100 text-blue-700",
  },
];

const CareerToolkit = () => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const hiddenContainerRef = useRef<HTMLDivElement>(null);

  const handleDownload = async (toolId: string) => {
    setDownloadingId(toolId);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      
      // Get the component container
      const container = document.getElementById(`pdf-${toolId}`);
      if (!container) return;

      const titleMap: Record<string, string> = {
        "true-level": "True-Level-Scorecard",
        "gap-skill": "Gap-Skill-Proof-Ladder",
        "offer-pitch": "Offer-Winning-Pitch",
        "weekly-planner": "Weekly-Career-Planner",
        "leadership-signals": "Leadership-Signals-Checklist",
      };

      const opt = {
        margin: 0,
        filename: `${titleMap[toolId]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
        },
        jsPDF: { 
          unit: "mm", 
          format: "a4", 
          orientation: "portrait" 
        },
      };

      await html2pdf().set(opt).from(container).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <Link 
              to="/200k-method" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to 200K Method</span>
            </Link>
            
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Career Operating System Toolkit
            </h1>
            <p className="text-lg text-muted-foreground">
              Free diagnostic tools to help you identify gaps, build skills, and accelerate your career.
            </p>
          </div>

          {/* Tools Grid */}
          <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
            {tools.map((tool) => (
              <Card 
                key={tool.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${tool.color}`}>
                  <tool.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{tool.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => handleDownload(tool.id)}
                  disabled={downloadingId === tool.id}
                >
                  <Download className="w-4 h-4" />
                  {downloadingId === tool.id ? "Generating..." : "Download PDF"}
                </Button>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="max-w-2xl mx-auto text-center bg-navy rounded-2xl p-8">
            <h2 className="font-serif text-2xl font-semibold text-cream mb-4">
              Ready to Build Your Career System?
            </h2>
            <p className="text-cream/70 mb-6">
              These tools are just the beginning. The 200K Method gives you the complete system to execute on your career goals.
            </p>
            <Link to="/200k-method">
              <Button variant="hero" size="lg">
                Explore the 200K Method
              </Button>
            </Link>
          </div>
        </div>

        {/* Hidden PDF Containers */}
        <div ref={hiddenContainerRef} className="absolute left-[-9999px] top-0">
          <div id="pdf-true-level">
            <TrueLevelScorecard />
          </div>
          <div id="pdf-gap-skill">
            <GapSkillProofLadder />
          </div>
          <div id="pdf-offer-pitch">
            <OfferWinningPitch />
          </div>
          <div id="pdf-weekly-planner">
            <WeeklyCareerPlanner />
          </div>
          <div id="pdf-leadership-signals">
            <LeadershipSignalsChecklist />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CareerToolkit;
