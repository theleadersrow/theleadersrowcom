import { Lightbulb, Target, FileText, PenLine, CheckSquare, Zap, MessageSquare } from "lucide-react";

interface ContentSection {
  type: string;
  title: string;
  content?: string;
  items?: any[];
  instructions?: string;
  template?: string;
  question?: string;
  options?: string[];
}

interface ModuleContent {
  title: string;
  subtitle: string;
  duration: string;
  objective: string;
  sections: ContentSection[];
}

interface Props {
  content: ModuleContent;
  moduleNumber: number;
  totalModules: number;
}

const CourseModuleContent = ({ content, moduleNumber, totalModules }: Props) => {
  const renderSection = (section: ContentSection, index: number) => {
    switch (section.type) {
      case "insight":
        return (
          <div key={index} className="bg-navy/5 dark:bg-navy/20 rounded-2xl p-6 sm:p-8 border-l-4 border-secondary">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-secondary" />
              <h3 className="font-serif text-xl font-semibold text-foreground">{section.title}</h3>
            </div>
            <div className="prose prose-sm sm:prose max-w-none text-muted-foreground">
              {section.content?.split('\n\n').map((paragraph, i) => (
                <p key={i} className="whitespace-pre-wrap">{paragraph}</p>
              ))}
            </div>
          </div>
        );

      case "framework":
        return (
          <div key={index} className="bg-card rounded-2xl p-6 sm:p-8 shadow-card">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-secondary" />
              <h3 className="font-serif text-xl font-semibold text-foreground">{section.title}</h3>
            </div>
            <div className="space-y-6">
              {section.items?.map((item, i) => (
                <div key={i} className="border-l-2 border-secondary/30 pl-4">
                  <h4 className="font-semibold text-foreground mb-2">{item.label}</h4>
                  <p className="text-muted-foreground mb-2">{item.description}</p>
                  {item.example && (
                    <p className="text-sm italic text-secondary bg-secondary/10 rounded-lg px-3 py-2">
                      {item.example}
                    </p>
                  )}
                  {item.options && (
                    <ul className="mt-2 space-y-1">
                      {item.options.map((option: string, j: number) => (
                        <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-secondary">•</span>
                          <span className="whitespace-pre-wrap">{option}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "example":
        return (
          <div key={index} className="bg-muted/50 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-secondary" />
              <h3 className="font-serif text-xl font-semibold text-foreground">{section.title}</h3>
            </div>
            <div className="prose prose-sm sm:prose max-w-none text-muted-foreground">
              {section.content?.split('\n\n').map((paragraph, i) => (
                <div key={i} className="mb-4 whitespace-pre-wrap">{paragraph}</div>
              ))}
            </div>
          </div>
        );

      case "exercise":
        return (
          <div key={index} className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border-2 border-secondary/20">
            <div className="flex items-center gap-2 mb-4">
              <PenLine className="w-5 h-5 text-secondary" />
              <h3 className="font-serif text-xl font-semibold text-foreground">{section.title}</h3>
            </div>
            {section.instructions && (
              <p className="text-muted-foreground mb-4">{section.instructions}</p>
            )}
            {section.template && (
              <div className="bg-muted/50 rounded-xl p-4 sm:p-6 font-mono text-sm whitespace-pre-wrap text-muted-foreground">
                {section.template}
              </div>
            )}
          </div>
        );

      case "checklist":
        return (
          <div key={index} className="bg-card rounded-2xl p-6 sm:p-8 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <CheckSquare className="w-5 h-5 text-secondary" />
              <h3 className="font-serif text-xl font-semibold text-foreground">{section.title}</h3>
            </div>
            <ul className="space-y-3">
              {section.items?.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded border-2 border-secondary/50 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case "action":
        return (
          <div key={index} className="bg-secondary/10 rounded-2xl p-6 sm:p-8 border border-secondary/30">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-secondary" />
              <h3 className="font-serif text-xl font-semibold text-foreground">{section.title}</h3>
            </div>
            <p className="text-foreground font-medium">{section.content}</p>
          </div>
        );

      case "visual":
        return (
          <div key={index} className="bg-card rounded-2xl p-6 sm:p-8 shadow-card">
            <h3 className="font-serif text-xl font-semibold text-foreground mb-4">{section.title}</h3>
            <div className="bg-muted/50 rounded-xl p-4 sm:p-6 font-mono text-sm whitespace-pre-wrap text-muted-foreground overflow-x-auto">
              {section.content}
            </div>
          </div>
        );

      case "scripts":
        return (
          <div key={index} className="bg-card rounded-2xl p-6 sm:p-8 shadow-card">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-secondary" />
              <h3 className="font-serif text-xl font-semibold text-foreground">{section.title}</h3>
            </div>
            <div className="space-y-4">
              {section.items?.map((item, i) => (
                <div key={i} className="bg-muted/50 rounded-xl p-4">
                  <h4 className="font-semibold text-foreground mb-2 text-sm">{item.label}</h4>
                  <p className="text-muted-foreground text-sm italic">"{item.script}"</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "template":
        return (
          <div key={index} className="bg-card rounded-2xl p-6 sm:p-8 shadow-card">
            <h3 className="font-serif text-xl font-semibold text-foreground mb-4">{section.title}</h3>
            <div className="bg-muted/50 rounded-xl p-4 sm:p-6 font-mono text-sm whitespace-pre-wrap text-muted-foreground">
              {section.content}
            </div>
          </div>
        );

      case "reflection":
        return (
          <div key={index} className="bg-navy/5 dark:bg-navy/20 rounded-2xl p-6 sm:p-8">
            <h3 className="font-serif text-xl font-semibold text-foreground mb-4">{section.title}</h3>
            <p className="text-foreground font-medium mb-4">{section.question}</p>
            {section.template && (
              <div className="bg-card rounded-xl p-4 font-mono text-sm whitespace-pre-wrap text-muted-foreground">
                {section.template}
              </div>
            )}
          </div>
        );

      case "completion":
        return (
          <div key={index} className="bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-2xl p-6 sm:p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-foreground mb-4">{section.title}</h3>
            <div className="prose prose-sm sm:prose max-w-2xl mx-auto text-muted-foreground">
              {section.content?.split('\n\n').map((paragraph, i) => (
                <p key={i} className="whitespace-pre-wrap">{paragraph}</p>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-up">
      {/* Module Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <span>Module {moduleNumber} of {totalModules}</span>
          <span>•</span>
          <span>{content.duration}</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground mb-2">
          {content.title}
        </h2>
        <p className="text-lg text-secondary font-medium mb-4">{content.subtitle}</p>
        <p className="text-muted-foreground max-w-2xl mx-auto">{content.objective}</p>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {content.sections.map((section, index) => renderSection(section, index))}
      </div>
    </div>
  );
};

export default CourseModuleContent;
