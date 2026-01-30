import { useRef, useState } from "react";
import { Download, Printer, ArrowLeft, FileText, Target, MessageSquare, Calendar, Shield, Crosshair, BookOpen, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrueLevelScorecard } from "@/components/scorecard/TrueLevelScorecard";
import { GapSkillProofLadder } from "@/components/scorecard/GapSkillProofLadder";
import { OfferWinningPitch } from "@/components/scorecard/OfferWinningPitch";
import { WeeklyCareerPlanner } from "@/components/scorecard/WeeklyCareerPlanner";
import { LeadershipSignalsChecklist } from "@/components/scorecard/LeadershipSignalsChecklist";
import { TargetRoleMatchingGrid } from "@/components/scorecard/TargetRoleMatchingGrid";
import { ToolkitCoverPage } from "@/components/scorecard/ToolkitCoverPage";
import { TableOfContents } from "@/components/scorecard/TableOfContents";
import { ToolkitSidebar } from "@/components/toolkit/ToolkitSidebar";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";

// PDF-only pages (not shown in navigation)
const pdfOnlyPages = [
  { id: "cover", component: ToolkitCoverPage },
  { id: "toc", component: TableOfContents },
];

// Viewable tools (shown in sidebar navigation)
const tools = [
  {
    id: "true-level",
    title: "True Level Scorecard",
    shortTitle: "1. Diagnose",
    description: "Identify where you stand today—your baseline and 2 biggest blockers.",
    icon: Target,
    filename: "True-Level-Scorecard",
    component: TrueLevelScorecard,
  },
  {
    id: "target-role",
    title: "Target Role Matching Grid",
    shortTitle: "2. Target",
    description: "Pick the right next move—your best-fit target roles + readiness.",
    icon: Crosshair,
    filename: "Target-Role-Matching-Grid",
    component: TargetRoleMatchingGrid,
  },
  {
    id: "leadership-signals",
    title: "Leadership Signals Checklist",
    shortTitle: "3. Signal",
    description: "See what you're missing to be seen as next-level—signal gaps to upgrade.",
    icon: Shield,
    filename: "Leadership-Signals-Checklist",
    component: LeadershipSignalsChecklist,
  },
  {
    id: "gap-skill",
    title: "Gap → Skill → Proof Ladder",
    shortTitle: "4. Close Gaps",
    description: "Turn gaps into a focused skill plan + proof-building plan.",
    icon: FileText,
    filename: "Gap-Skill-Proof-Ladder",
    component: GapSkillProofLadder,
  },
  {
    id: "weekly-planner",
    title: "7-Day Career System Planner",
    shortTitle: "5. Execute",
    description: "Turn strategy into weekly execution + momentum—a simple repeatable cadence.",
    icon: Calendar,
    filename: "Weekly-Career-Planner",
    component: WeeklyCareerPlanner,
  },
  {
    id: "offer-pitch",
    title: "Offer-Winning Pitch Template",
    shortTitle: "6. Pitch",
    description: "Communicate your value clearly everywhere—a ready-to-use pitch you practice daily.",
    icon: MessageSquare,
    filename: "Offer-Winning-Pitch",
    component: OfferWinningPitch,
  },
];

const CareerToolkit = () => {
  const [activeTab, setActiveTab] = useState("true-level");
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfContainerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const fullPdfContainerRef = useRef<HTMLDivElement | null>(null);

  const activeTool = tools.find(t => t.id === activeTab);

  const handleDownloadFullToolkit = async () => {
    if (!fullPdfContainerRef.current) return;

    setIsGenerating(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;

      const opt = {
        margin: 0,
        filename: "Career-Operating-System-Toolkit.pdf",
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
        pagebreak: { mode: ['css', 'legacy'] },
      };

      await html2pdf().set(opt).from(fullPdfContainerRef.current).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="min-h-screen bg-muted/30">
        {/* Header Controls - Hidden in Print */}
        <div className="print:hidden sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link 
                to="/200k-method" 
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to 200K Method</span>
                <span className="sm:hidden">Back</span>
              </Link>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  className="gap-2"
                  size="sm"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print</span>
                </Button>
                <Button
                  variant="gold"
                  onClick={handleDownloadFullToolkit}
                  disabled={isGenerating}
                  className="gap-2"
                  size="sm"
                >
                  <Download className="w-4 h-4" />
                  {isGenerating ? "Generating..." : <span className="hidden sm:inline">Download Full Toolkit</span>}
                  {!isGenerating && <span className="sm:hidden">PDF</span>}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Navigation */}
        <ToolkitSidebar 
          tools={tools}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onDownload={handleDownloadFullToolkit}
          isGenerating={isGenerating}
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 print:p-0">
          {/* Page Title - Hidden in Print */}
          <div className="print:hidden text-center mb-6">
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">
              Career Operating System Toolkit
            </h1>
            <p className="text-muted-foreground">
              Use the menu on the right to navigate between pages
            </p>
          </div>

          {/* Tool Description + Download Button */}
          {activeTool && (
            <div className="print:hidden text-center mb-6">
              <p className="text-muted-foreground mb-4">{activeTool.description}</p>
              <Button
                variant="gold"
                onClick={handleDownloadFullToolkit}
                disabled={isGenerating}
                className="gap-2"
                size="lg"
              >
                <Download className="w-5 h-5" />
                {isGenerating ? "Generating PDF..." : "Download Complete Toolkit PDF"}
              </Button>
            </div>
          )}

          {/* Active Tool Content */}
          <div className="print:hidden flex justify-center">
            {activeTool && (
              <div 
                ref={(el) => { pdfContainerRefs.current[activeTab] = el; }}
                className="bg-white shadow-xl rounded-lg overflow-hidden"
              >
                <activeTool.component />
              </div>
            )}
          </div>

          {/* Hidden container for full PDF generation - contains all pages */}
          <div 
            ref={fullPdfContainerRef}
            className="absolute -left-[9999px] top-0"
            aria-hidden="true"
          >
            {/* PDF-only pages first (Cover + TOC) */}
            {pdfOnlyPages.map((page) => (
              <page.component key={page.id} />
            ))}
            {/* Then all viewable tools */}
            {tools.map((tool) => (
              <tool.component key={tool.id} />
            ))}
          </div>

          {/* Print-only: Show all tools including cover and TOC */}
          <div className="hidden print:block">
            {pdfOnlyPages.map((page) => (
              <div key={page.id} className="bg-white">
                <page.component />
              </div>
            ))}
            {tools.map((tool) => (
              <div key={tool.id} className="bg-white">
                <tool.component />
              </div>
            ))}
          </div>

          {/* CTA Below Tool - Hidden in Print */}
          <div className="print:hidden mt-12 text-center max-w-2xl mx-auto">
            <p className="text-lg text-muted-foreground mb-4">
              Ready to build your complete Career Operating System?
            </p>
            <Link to="/200k-method">
              <Button variant="gold" size="lg" className="gap-2">
                Explore the 200K Method
              </Button>
            </Link>
          </div>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            @page {
              size: A4;
              margin: 0;
            }
            .pdf-page {
              page-break-after: always;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default CareerToolkit;
