import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkbookSection {
  title: string;
  content: string;
}

interface WorkbookContent {
  title: string;
  subtitle: string;
  sections: WorkbookSection[];
}

interface Props {
  content: WorkbookContent;
}

const CourseWorkbook = ({ content }: Props) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <Download className="w-4 h-4" />
          <span>Downloadable Resource</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground mb-2">
          {content.title}
        </h2>
        <p className="text-lg text-muted-foreground mb-6">{content.subtitle}</p>
        <Button 
          variant="gold" 
          onClick={handlePrint}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Print / Save as PDF
        </Button>
      </div>

      {/* Workbook Content */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden print:shadow-none print:rounded-none">
        {/* Print Header */}
        <div className="hidden print:block p-8 border-b border-border text-center">
          <h1 className="font-serif text-2xl font-semibold">{content.title}</h1>
          <p className="text-muted-foreground">{content.subtitle}</p>
          <p className="text-sm text-muted-foreground mt-2">The Leader's Row • theleadersrow.com</p>
        </div>

        <div className="p-6 sm:p-8 lg:p-10 space-y-10 print:space-y-8">
          {content.sections.map((section, index) => (
            <div 
              key={index} 
              className="border-b border-border pb-10 last:border-b-0 last:pb-0 print:break-inside-avoid"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground">
                  {section.title}
                </h3>
              </div>
              
              <div className="bg-muted/30 rounded-xl p-5 sm:p-6 print:bg-transparent print:border print:border-border">
                <pre className="font-mono text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {section.content}
                </pre>
              </div>
            </div>
          ))}
        </div>

        {/* Print Footer */}
        <div className="hidden print:block p-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© The Leader's Row • Executive Communication & Influence Course</p>
          <p>For personal use only. Do not redistribute.</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-secondary/10 rounded-2xl p-6 sm:p-8 border border-secondary/30">
        <h4 className="font-semibold text-foreground mb-3">How to Use This Workbook</h4>
        <ul className="space-y-2 text-muted-foreground text-sm">
          <li className="flex items-start gap-2">
            <span className="text-secondary">1.</span>
            <span>Click "Print / Save as PDF" to download a copy</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-secondary">2.</span>
            <span>Complete each worksheet as you work through the modules</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-secondary">3.</span>
            <span>Keep your completed packet as a reference for future high-stakes communications</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-secondary">4.</span>
            <span>Use the templates before every important meeting, presentation, or executive update</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CourseWorkbook;
