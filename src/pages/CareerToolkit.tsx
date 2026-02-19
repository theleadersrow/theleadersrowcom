import { useState } from "react";
import { ArrowLeft, FileText, Target, MessageSquare, Calendar, Shield, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TrueLevelScorecard } from "@/components/scorecard/TrueLevelScorecard";
import { GapSkillProofLadder } from "@/components/scorecard/GapSkillProofLadder";
import { OfferWinningPitch } from "@/components/scorecard/OfferWinningPitch";
import { WeeklyCareerPlanner } from "@/components/scorecard/WeeklyCareerPlanner";
import { LeadershipSignalsChecklist } from "@/components/scorecard/LeadershipSignalsChecklist";
import { TargetRoleMatchingGrid } from "@/components/scorecard/TargetRoleMatchingGrid";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";

const tools = [
  {
    id: "true-level",
    title: "True Level Scorecard",
    shortTitle: "1. Diagnose",
    description: "Identify where you stand today—your baseline and 2 biggest blockers.",
    icon: Target,
    component: TrueLevelScorecard,
  },
  {
    id: "target-role",
    title: "Target Role Matching Grid",
    shortTitle: "2. Target",
    description: "Pick the right next move—your best-fit target roles + readiness.",
    icon: Crosshair,
    component: TargetRoleMatchingGrid,
  },
  {
    id: "leadership-signals",
    title: "Leadership Signals Checklist",
    shortTitle: "3. Signal",
    description: "See what you're missing to be seen as next-level—signal gaps to upgrade.",
    icon: Shield,
    component: LeadershipSignalsChecklist,
  },
  {
    id: "gap-skill",
    title: "Gap → Skill → Proof Ladder",
    shortTitle: "4. Close Gaps",
    description: "Turn gaps into a focused skill plan + proof-building plan.",
    icon: FileText,
    component: GapSkillProofLadder,
  },
  {
    id: "weekly-planner",
    title: "7-Day Career System Planner",
    shortTitle: "5. Execute",
    description: "Turn strategy into weekly execution + momentum—a simple repeatable cadence.",
    icon: Calendar,
    component: WeeklyCareerPlanner,
  },
  {
    id: "offer-pitch",
    title: "Offer-Winning Pitch Template",
    shortTitle: "6. Pitch",
    description: "Communicate your value clearly everywhere—a ready-to-use pitch you practice daily.",
    icon: MessageSquare,
    component: OfferWinningPitch,
  },
];

const CareerToolkit = () => {
  const [activeTab, setActiveTab] = useState("true-level");
  const activeTool = tools.find(t => t.id === activeTab);

  return (
    <Layout>
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link 
                to="/200k-method" 
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Program</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Page Title */}
          <div className="text-center mb-6">
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">
              Career Operating System Toolkit
            </h1>
            <p className="text-muted-foreground">
              Complete all 6 pages to build your personalized career system
            </p>
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full flex-wrap h-auto gap-2 bg-transparent mb-6 justify-center">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <TabsTrigger
                    key={tool.id}
                    value={tool.id}
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-lg border border-border/50 bg-card"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tool.shortTitle}</span>
                    <span className="sm:hidden text-xs">{tool.shortTitle.split('. ')[0]}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Tool Description */}
            {activeTool && (
              <div className="text-center mb-6">
                <h2 className="font-semibold text-lg text-foreground mb-2">{activeTool.title}</h2>
                <p className="text-muted-foreground">{activeTool.description}</p>
              </div>
            )}

            {/* Tab Contents */}
            {tools.map((tool) => (
              <TabsContent key={tool.id} value={tool.id} className="flex justify-center">
                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                  <tool.component />
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* CTA Below Tool */}
          <div className="mt-12 text-center max-w-2xl mx-auto">
            <p className="text-lg text-muted-foreground mb-4">
              Ready to build your complete Career Operating System?
            </p>
            <Link to="/200k-method">
              <Button variant="gold" size="lg" className="gap-2">
                Explore the Strategic Career Mastery Program
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CareerToolkit;
