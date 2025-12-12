import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  LogOut, 
  BookOpen, 
  Calendar, 
  CreditCard, 
  FileText, 
  Video, 
  Download,
  User,
  Loader2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Receipt
} from "lucide-react";
import { toast } from "sonner";
import InvoiceList from "@/components/InvoiceList";

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
}

interface Program {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  start_date: string | null;
}

interface Enrollment {
  id: string;
  program_id: string;
  payment_status: string;
  enrolled_at: string;
  zoom_link: string | null;
  start_date: string | null;
  programs: Program;
}

interface EnrollmentResource {
  id: string;
  title: string;
  url: string;
  type: string;
}

interface Content {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string;
  sort_order: number;
  program_id: string;
}

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [enrollmentResources, setEnrollmentResources] = useState<Record<string, EnrollmentResource[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("programs");
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      
      if (profileData) setProfile(profileData);

      // Fetch enrollments with program details
      const { data: enrollmentData } = await supabase
        .from("enrollments")
        .select(`
          *,
          programs:program_id (
            id,
            name,
            slug,
            description,
            start_date
          )
        `)
        .eq("user_id", user!.id);
      
      if (enrollmentData) {
        setEnrollments(enrollmentData as unknown as Enrollment[]);
        
        // Fetch resources for each enrollment
        const resourceMap: Record<string, EnrollmentResource[]> = {};
        for (const e of enrollmentData) {
          const { data: resources } = await supabase
            .from("enrollment_resources")
            .select("id, title, url, type")
            .eq("enrollment_id", e.id);
          if (resources) {
            resourceMap[e.id] = resources;
          }
        }
        setEnrollmentResources(resourceMap);
      }

      // Fetch content for enrolled programs
      const { data: contentData } = await supabase
        .from("content")
        .select("*")
        .order("sort_order", { ascending: true });
      
      if (contentData) setContent(contentData);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
    toast.success("Signed out successfully");
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      paid: "bg-green-500/20 text-green-600 border-green-500/30",
      pending: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
      refunded: "bg-red-500/20 text-red-600 border-red-500/30",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-5 h-5" />;
      case "template": return <FileText className="w-5 h-5" />;
      case "worksheet": return <Download className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Ongoing";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  const paidEnrollments = enrollments.filter(e => e.payment_status === "paid");
  const enrolledProgramIds = paidEnrollments.map(e => e.program_id);
  const accessibleContent = content.filter(c => enrolledProgramIds.includes(c.program_id));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-navy border-b border-border/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="font-serif text-xl font-semibold text-cream">
                The Leader's Row
              </Link>
              <span className="text-cream/40">|</span>
              <span className="text-cream/60 text-sm">Member Portal</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-cream/80">
                <User className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">{profile?.full_name || profile?.email}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-cream/60 hover:text-cream hover:bg-cream/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold text-foreground mb-2">
            Welcome back, {profile?.full_name?.split(" ")[0] || "Member"}!
          </h1>
          <p className="text-muted-foreground">
            Access your programs, resources, and track your progress.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="programs" className="gap-2">
              <BookOpen className="w-4 h-4" />
              My Programs
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-2">
              <FileText className="w-4 h-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2">
              <Receipt className="w-4 h-4" />
              Invoices
            </TabsTrigger>
          </TabsList>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-6">
            {enrollments.length === 0 ? (
              <div className="bg-card rounded-2xl p-8 text-center border border-border/50">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Programs Yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't been enrolled in any programs yet.
                </p>
                <Button variant="gold" asChild>
                  <Link to="/">Explore Programs</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {enrollments.map((enrollment) => {
                  const programContent = content.filter(c => c.program_id === enrollment.program_id);
                  const isExpanded = expandedProgram === enrollment.id;
                  const isPaid = enrollment.payment_status === "paid";
                  
                  return (
                    <div 
                      key={enrollment.id}
                      className="bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden"
                    >
                      {/* Program Header - Clickable */}
                      <div 
                        className={`p-6 ${isPaid ? 'cursor-pointer hover:bg-muted/30' : ''} transition-colors`}
                        onClick={() => isPaid && setExpandedProgram(isExpanded ? null : enrollment.id)}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {isPaid && (
                                <div className="text-secondary">
                                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                </div>
                              )}
                              <h3 className="text-xl font-semibold text-foreground">
                                {enrollment.programs.name}
                              </h3>
                              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPaymentStatusBadge(enrollment.payment_status)}`}>
                                {enrollment.payment_status.charAt(0).toUpperCase() + enrollment.payment_status.slice(1)}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-sm mb-4 ml-8">
                              {enrollment.programs.description}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm ml-8">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4 text-secondary" />
                                <span>Enrolled: {formatDate(enrollment.enrolled_at)}</span>
                              </div>
                              {(enrollment.start_date || enrollment.programs.start_date) && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="w-4 h-4 text-secondary" />
                                  <span>Starts: {formatDate(enrollment.start_date || enrollment.programs.start_date)}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <CreditCard className="w-4 h-4 text-secondary" />
                                <span>Payment: {enrollment.payment_status}</span>
                              </div>
                            </div>
                            {enrollment.zoom_link && isPaid && (
                              <div className="mt-4 ml-8">
                                <a
                                  href={enrollment.zoom_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-colors"
                                >
                                  <Video className="w-4 h-4" />
                                  Join Zoom Session
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Course Content */}
                      {isExpanded && isPaid && (
                        <div className="border-t border-border/50 bg-muted/20 p-6">
                          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-secondary" />
                            Course Modules ({programContent.length})
                          </h4>
                          
                          {programContent.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">
                              Course content coming soon...
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {programContent.map((module) => (
                                <Collapsible 
                                  key={module.id} 
                                  open={expandedModule === module.id}
                                  onOpenChange={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                                >
                                  <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                                          <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                          <h5 className="font-medium text-foreground">{module.title}</h5>
                                          <p className="text-sm text-muted-foreground line-clamp-1">{module.description}</p>
                                        </div>
                                      </div>
                                      {expandedModule === module.id ? (
                                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                      ) : (
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                      )}
                                    </CollapsibleTrigger>
                                    
                                    <CollapsibleContent>
                                      <div className="px-4 pb-4 pt-2 border-t border-border/30">
                                        <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                                        <a
                                          href={module.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm font-medium"
                                        >
                                          <Download className="w-4 h-4" />
                                          Download Course Material
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </div>
                                    </CollapsibleContent>
                                  </div>
                                </Collapsible>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            {paidEnrollments.length === 0 ? (
              <div className="bg-card rounded-2xl p-8 text-center border border-border/50">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Resources Available</h3>
                <p className="text-muted-foreground">
                  {enrollments.length === 0 
                    ? "Enroll in a program to access resources."
                    : "Resources will be available once your payment is confirmed."}
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {paidEnrollments.map((enrollment) => {
                  const programContent = accessibleContent.filter(
                    c => c.program_id === enrollment.program_id
                  );
                  const resources = enrollmentResources[enrollment.id] || [];
                  
                  if (programContent.length === 0 && resources.length === 0) return null;

                  return (
                    <div key={enrollment.id} className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        {enrollment.programs.name} Resources
                      </h3>
                      <div className="grid gap-3">
                        {/* Enrollment-specific resources */}
                        {resources.map((item) => (
                          <a
                            key={item.id}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-card rounded-xl p-4 border border-border/50 hover:border-secondary/50 transition-colors flex items-center gap-4 group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary/20 transition-colors">
                              {getContentIcon(item.type)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground group-hover:text-secondary transition-colors">
                                {item.title}
                              </h4>
                            </div>
                            <span className="text-xs text-muted-foreground capitalize px-2 py-1 bg-muted rounded">
                              {item.type}
                            </span>
                          </a>
                        ))}
                        {/* Program content */}
                        {programContent.map((item) => (
                          <a
                            key={item.id}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-card rounded-xl p-4 border border-border/50 hover:border-secondary/50 transition-colors flex items-center gap-4 group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary/20 transition-colors">
                              {getContentIcon(item.type)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground group-hover:text-secondary transition-colors">
                                {item.title}
                              </h4>
                              {item.description && (
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground capitalize px-2 py-1 bg-muted rounded">
                              {item.type}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <div className="bg-card rounded-2xl p-6 border border-border/50">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-secondary" />
                Payment History
              </h3>
              {profile?.email ? (
                <InvoiceList customerEmail={profile.email} />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Unable to load invoices. Please try again later.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
