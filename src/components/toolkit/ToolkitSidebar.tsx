import { useState } from "react";
import { ChevronLeft, ChevronRight, Download, BookOpen, List, Target, Crosshair, Shield, FileText, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Tool {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: React.ElementType;
}

interface ToolkitSidebarProps {
  tools: Tool[];
  activeTab: string;
  onTabChange: (id: string) => void;
  onDownload: () => void;
  isGenerating: boolean;
}

const ToolkitSidebar = ({ tools, activeTab, onTabChange, onDownload, isGenerating }: ToolkitSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const showSidebar = isOpen || isHovering;

  return (
    <>
      {/* Hover trigger zone on the right edge */}
      <div 
        className="fixed right-0 top-1/2 -translate-y-1/2 w-4 h-48 z-40 print:hidden"
        onMouseEnter={() => setIsHovering(true)}
      />

      {/* Toggle button - always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed right-0 top-1/2 -translate-y-1/2 z-50 print:hidden",
          "bg-primary text-primary-foreground p-2 rounded-l-lg shadow-lg",
          "transition-all duration-300 hover:bg-primary/90",
          showSidebar ? "translate-x-0 opacity-0" : "translate-x-0"
        )}
        aria-label="Open navigation"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Sidebar panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-72 bg-card border-l border-border shadow-2xl z-50 print:hidden",
          "transition-transform duration-300 ease-out",
          showSidebar ? "translate-x-0" : "translate-x-full"
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Close button */}
        <button
          onClick={() => {
            setIsOpen(false);
            setIsHovering(false);
          }}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-primary text-primary-foreground p-2 rounded-l-lg shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Close navigation"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Sidebar content */}
        <div className="h-full flex flex-col p-4 overflow-y-auto">
          {/* Header */}
          <div className="mb-4 pb-4 border-b border-border">
            <h3 className="font-serif text-lg font-bold text-foreground">
              Toolkit Pages
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Navigate between pages
            </p>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 space-y-1">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              const isActive = activeTab === tool.id;
              
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    onTabChange(tool.id);
                    setIsOpen(false);
                    setIsHovering(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                    "hover:bg-muted/80",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-foreground hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold",
                    isActive 
                      ? "bg-primary-foreground/20 text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      isActive ? "text-primary-foreground" : "text-foreground"
                    )}>
                      {tool.shortTitle}
                    </p>
                    <p className={cn(
                      "text-xs truncate",
                      isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {tool.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Download button */}
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              variant="gold"
              onClick={onDownload}
              disabled={isGenerating}
              className="w-full gap-2"
              size="sm"
            >
              <Download className="w-4 h-4" />
              {isGenerating ? "Generating..." : "Download PDF"}
            </Button>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden print:hidden"
          onClick={() => {
            setIsOpen(false);
            setIsHovering(false);
          }}
        />
      )}
    </>
  );
};

export { ToolkitSidebar };
