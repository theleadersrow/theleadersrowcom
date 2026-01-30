import { useRef, useState } from "react";
import { Download, Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrueLevelScorecard } from "@/components/scorecard/TrueLevelScorecard";
import { Link } from "react-router-dom";

const Scorecard = () => {
  const scorecardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (!scorecardRef.current) return;
    
    setIsGenerating(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      
      const opt = {
        margin: 0,
        filename: "True-Level-Scorecard-200K-Method.pdf",
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

      await html2pdf().set(opt).from(scorecardRef.current).save();
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
              <span>Back to 200K Method</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handlePrint}
                className="gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button
                variant="gold"
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                {isGenerating ? "Generating..." : "Download PDF"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scorecard Preview */}
      <div className="container mx-auto px-4 py-8 print:p-0">
        <div className="flex justify-center print:block">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden print:shadow-none print:rounded-none">
            <TrueLevelScorecard ref={scorecardRef} />
          </div>
        </div>

        {/* CTA Below Scorecard - Hidden in Print */}
        <div className="print:hidden mt-12 text-center max-w-2xl mx-auto">
          <p className="text-lg text-muted-foreground mb-4">
            Ready to close the gap between where you are and where you want to be?
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
        }
      `}</style>
    </div>
  );
};

export default Scorecard;
