import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  BookOpen,
  Download,
  ChevronRight
} from "lucide-react";
import { 
  executiveCommunicationCourse,
  module1Content,
  module2Content,
  module3Content,
  module4Content,
  module5Content,
  workbookContent
} from "@/data/courses/executive-communication";
import CourseModuleContent from "@/components/courses/CourseModuleContent";
import CourseWorkbook from "@/components/courses/CourseWorkbook";

const moduleContents = [
  module1Content,
  module2Content,
  module3Content,
  module4Content,
  module5Content
];

const CourseDetail = () => {
  const { courseId } = useParams();
  const [currentModule, setCurrentModule] = useState(0); // 0 = overview, 1-5 = modules, 6 = workbook
  const [completedModules, setCompletedModules] = useState<number[]>([]);

  // For now, only support the executive-communication course
  if (courseId !== "executive-communication") {
    return <Navigate to="/courses" replace />;
  }

  const course = executiveCommunicationCourse;

  const handleModuleComplete = (moduleIndex: number) => {
    if (!completedModules.includes(moduleIndex)) {
      setCompletedModules([...completedModules, moduleIndex]);
    }
  };

  const handleNext = () => {
    if (currentModule < 6) {
      if (currentModule > 0) {
        handleModuleComplete(currentModule);
      }
      setCurrentModule(currentModule + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentModule > 0) {
      setCurrentModule(currentModule - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigateToModule = (index: number) => {
    setCurrentModule(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isModuleComplete = (index: number) => completedModules.includes(index);
  const progress = (completedModules.length / 5) * 100;

  return (
    <Layout>
      {/* Course Header */}
      <section className="pt-24 pb-4 bg-navy">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-cream/60 text-sm mb-4">
            <Link to="/courses" className="hover:text-cream transition-colors">
              Courses
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-cream">{course.title}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-cream">
                {course.title}
              </h1>
              <p className="text-secondary text-sm sm:text-base mt-1">{course.subtitle}</p>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-cream/60 text-sm">
                <Clock className="w-4 h-4" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-cream/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-cream text-sm font-medium">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Module Navigation */}
      <section className="bg-card border-b border-border sticky top-20 z-40">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => handleNavigateToModule(0)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                currentModule === 0
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Overview
            </button>
            
            {course.modulesList.map((module, index) => (
              <button
                key={module.id}
                onClick={() => handleNavigateToModule(index + 1)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  currentModule === index + 1
                    ? "bg-secondary text-secondary-foreground"
                    : isModuleComplete(index + 1)
                    ? "text-secondary hover:bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {isModuleComplete(index + 1) && (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Module {module.id}</span>
              </button>
            ))}

            <button
              onClick={() => handleNavigateToModule(6)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                currentModule === 6
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Download className="w-4 h-4" />
              Workbook
            </button>
          </div>
        </div>
      </section>

      {/* Content Area */}
      <section className="section-padding bg-background min-h-[60vh]">
        <div className="container-narrow mx-auto px-4 sm:px-6 lg:px-8">
          {/* Overview */}
          {currentModule === 0 && (
            <div className="animate-fade-up">
              <div className="text-center mb-10">
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground mb-4">
                  {course.title}
                </h2>
                <p className="text-lg text-secondary font-medium mb-4">{course.subtitle}</p>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  {course.description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-secondary" />
                    After 60 Minutes, You'll Be Able To
                  </h3>
                  <ul className="space-y-3">
                    {course.outcomes.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-secondary text-xs font-bold">{index + 1}</span>
                        </div>
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                    What's Included
                  </h3>
                  <ul className="space-y-3">
                    {course.includes.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Why It Works */}
              <div className="bg-muted/50 rounded-2xl p-6 sm:p-8 mb-10">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-4 text-center">
                  Why This Course Works
                </h3>
                <div className="grid sm:grid-cols-3 gap-6">
                  {course.whyItWorks.map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-3">
                        <span className="text-secondary font-bold">{index + 1}</span>
                      </div>
                      <p className="text-muted-foreground text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Module List */}
              <div className="mb-10">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-6 text-center">
                  Course Roadmap
                </h3>
                <div className="space-y-3">
                  {course.modulesList.map((module, index) => (
                    <button
                      key={module.id}
                      onClick={() => handleNavigateToModule(index + 1)}
                      className="w-full flex items-center justify-between bg-card rounded-xl p-4 border border-border hover:border-secondary/50 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                          {isModuleComplete(index + 1) ? (
                            <CheckCircle2 className="w-5 h-5 text-secondary" />
                          ) : (
                            <span className="text-secondary font-bold">{module.id}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground group-hover:text-secondary transition-colors">
                            {module.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">{module.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-sm">{module.duration}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start CTA */}
              <div className="text-center">
                <Button 
                  variant="gold" 
                  size="lg" 
                  onClick={handleNext}
                  className="group"
                >
                  Start Module 1
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Module Content */}
          {currentModule >= 1 && currentModule <= 5 && (
            <CourseModuleContent 
              content={moduleContents[currentModule - 1]} 
              moduleNumber={currentModule}
              totalModules={5}
            />
          )}

          {/* Workbook */}
          {currentModule === 6 && (
            <CourseWorkbook content={workbookContent} />
          )}

          {/* Navigation */}
          {currentModule > 0 && (
            <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                className="group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                {currentModule === 1 ? "Overview" : currentModule === 6 ? "Module 5" : `Module ${currentModule - 1}`}
              </Button>

              {currentModule < 6 && (
                <Button 
                  variant="gold" 
                  onClick={handleNext}
                  className="group"
                >
                  {currentModule === 5 ? "Download Workbook" : `Module ${currentModule + 1}`}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              )}

              {currentModule === 6 && (
                <Link to="/courses">
                  <Button variant="gold" className="group">
                    Back to Courses
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default CourseDetail;
