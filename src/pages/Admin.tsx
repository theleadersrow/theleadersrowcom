import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LogOut, Users, RefreshCw, Plus, Copy, Check, Edit, FileText, ChevronDown, ChevronRight, User, Mail, Brain, Quote, Receipt, UserCheck, Clock, Wrench, CalendarCheck, MessageSquare, Mic, GraduationCap, Video } from "lucide-react";
import { countries, getStatesForCountry, getCountryName, getStateName } from "@/lib/locationData";
import { LeadsTab } from "@/components/admin/LeadsTab";
import { AssessmentsTab } from "@/components/admin/AssessmentsTab";
import { TestimonialsTab } from "@/components/admin/TestimonialsTab";
import { ToolPurchasesTab } from "@/components/admin/ToolPurchasesTab";
import { BetaRegistrationsTab } from "@/components/admin/BetaRegistrationsTab";
import { CareerAdvisorTab } from "@/components/admin/CareerAdvisorTab";
import { AMARegistrationsTab } from "@/components/admin/AMARegistrationsTab";
import { WebinarRegistrationsTab } from "@/components/admin/WebinarRegistrationsTab";
import { EnrollmentsTab } from "@/components/admin/EnrollmentsTab";
import InvoiceList from "@/components/InvoiceList";
import MembersTab from "@/components/admin/MembersTab";

interface Enrollment {
  id: string;
  enrolled_at: string;
  payment_status: string;
  user_id: string | null;
  program_id: string;
  enrollment_code: string | null;
  email: string | null;
  zoom_link: string | null;
  notes: string | null;
  start_date: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zip_code: string | null;
  occupation: string | null;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
  programs: {
    name: string;
    start_date: string | null;
  } | null;
}

interface Program {
  id: string;
  name: string;
}

interface Resource {
  id: string;
  title: string;
  url: string;
  type: string;
}

const Admin = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedEnrollment, setExpandedEnrollment] = useState<string | null>(null);
  
  // New enrollment form
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [newZipCode, setNewZipCode] = useState("");
  const [newOccupation, setNewOccupation] = useState("");
  const [newProgramId, setNewProgramId] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("pending");
  const [newZoomLink, setNewZoomLink] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Edit enrollment
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editZipCode, setEditZipCode] = useState("");
  const [editOccupation, setEditOccupation] = useState("");
  const [editPaymentStatus, setEditPaymentStatus] = useState("");
  const [editZoomLink, setEditZoomLink] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editProgramId, setEditProgramId] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Get states for edit form
  const editAvailableStates = getStatesForCountry(editCountry);

  // Resources
  const [resourceEnrollmentId, setResourceEnrollmentId] = useState<string | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceUrl, setNewResourceUrl] = useState("");
  const [newResourceType, setNewResourceType] = useState("link");
  const [isAddingResource, setIsAddingResource] = useState(false);

  // Get states based on selected country
  const availableStates = getStatesForCountry(newCountry);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin-login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) return;
      
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (error) {
        setIsAdmin(false);
        return;
      }

      setIsAdmin(data);
      
      if (!data) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/admin-login");
      }
    };

    if (user) {
      checkAdminRole();
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAdmin) return;

      const [enrollmentsRes, programsRes] = await Promise.all([
        supabase
          .from("enrollments")
          .select(`
            id, enrolled_at, payment_status, user_id, program_id,
            enrollment_code, email, zoom_link, notes, start_date,
            first_name, last_name, phone, city, state, country, zip_code, occupation,
            profiles!enrollments_user_id_fkey (full_name, email),
            programs!enrollments_program_id_fkey (name, start_date)
          `)
          .order("enrolled_at", { ascending: false }),
        supabase.from("programs").select("id, name")
      ]);

      if (!enrollmentsRes.error) {
        setEnrollments(enrollmentsRes.data as unknown as Enrollment[]);
      }
      if (programsRes.data) {
        setPrograms(programsRes.data);
      }
      setLoadingData(false);
    };

    if (isAdmin) fetchData();
  }, [isAdmin]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin-login");
  };

  const refreshData = async () => {
    setLoadingData(true);
    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        id, enrolled_at, payment_status, user_id, program_id,
        enrollment_code, email, zoom_link, notes, start_date,
        first_name, last_name, phone, city, state, country, zip_code, occupation,
        profiles!enrollments_user_id_fkey (full_name, email),
        programs!enrollments_program_id_fkey (name, start_date)
      `)
      .order("enrolled_at", { ascending: false });

    if (!error) {
      setEnrollments(data as unknown as Enrollment[]);
      toast.success("Data refreshed");
    }
    setLoadingData(false);
  };

  const createEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgramId) {
      toast.error("Please select a program");
      return;
    }
    if (!newEmail || !newFirstName || !newLastName) {
      toast.error("Please fill in required fields (First Name, Last Name, Email)");
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from("enrollments")
        .insert({
          program_id: newProgramId,
          first_name: newFirstName,
          last_name: newLastName,
          email: newEmail,
          phone: newPhone || null,
          city: newCity || null,
          state: newState || null,
          country: newCountry || null,
          zip_code: newZipCode || null,
          occupation: newOccupation || null,
          payment_status: newPaymentStatus,
          zoom_link: newZoomLink || null,
          start_date: newStartDate || null,
          notes: newNotes || null,
          user_id: null,
        })
        .select("enrollment_code")
        .single();

      if (error) {
        toast.error("Failed to create enrollment");
      } else {
        toast.success(`Enrollment created! Code: ${data.enrollment_code}`);
        setNewFirstName("");
        setNewLastName("");
        setNewEmail("");
        setNewPhone("");
        setNewCity("");
        setNewState("");
        setNewCountry("");
        setNewZipCode("");
        setNewOccupation("");
        setNewProgramId("");
        setNewPaymentStatus("pending");
        setNewZoomLink("");
        setNewStartDate("");
        setNewNotes("");
        setShowForm(false);
        refreshData();
      }
    } finally {
      setIsCreating(false);
    }
  };

  const openEditDialog = (enrollment: Enrollment) => {
    setEditingEnrollment(enrollment);
    setEditFirstName(enrollment.first_name || "");
    setEditLastName(enrollment.last_name || "");
    setEditEmail(enrollment.email || "");
    setEditPhone(enrollment.phone || "");
    setEditCity(enrollment.city || "");
    setEditState(enrollment.state || "");
    setEditCountry(enrollment.country || "");
    setEditZipCode(enrollment.zip_code || "");
    setEditOccupation(enrollment.occupation || "");
    setEditPaymentStatus(enrollment.payment_status);
    setEditZoomLink(enrollment.zoom_link || "");
    setEditStartDate(enrollment.start_date || "");
    setEditNotes(enrollment.notes || "");
    setEditProgramId(enrollment.program_id);
  };

  const updateEnrollment = async () => {
    if (!editingEnrollment) return;
    if (!editEmail || !editFirstName || !editLastName) {
      toast.error("First Name, Last Name, and Email are required");
      return;
    }
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("enrollments")
        .update({
          first_name: editFirstName,
          last_name: editLastName,
          email: editEmail,
          phone: editPhone || null,
          city: editCity || null,
          state: editState || null,
          country: editCountry || null,
          zip_code: editZipCode || null,
          occupation: editOccupation || null,
          payment_status: editPaymentStatus,
          zoom_link: editZoomLink || null,
          start_date: editStartDate || null,
          notes: editNotes || null,
          program_id: editProgramId,
        })
        .eq("id", editingEnrollment.id);

      if (error) {
        toast.error("Failed to update enrollment");
      } else {
        toast.success("Enrollment updated");
        setEditingEnrollment(null);
        refreshData();
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const loadResources = async (enrollmentId: string) => {
    setResourceEnrollmentId(enrollmentId);
    const { data } = await supabase
      .from("enrollment_resources")
      .select("*")
      .eq("enrollment_id", enrollmentId)
      .order("created_at", { ascending: false });
    
    setResources(data || []);
  };

  const addResource = async () => {
    if (!resourceEnrollmentId || !newResourceTitle || !newResourceUrl) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsAddingResource(true);
    try {
      const { error } = await supabase
        .from("enrollment_resources")
        .insert({
          enrollment_id: resourceEnrollmentId,
          title: newResourceTitle,
          url: newResourceUrl,
          type: newResourceType,
        });

      if (error) {
        toast.error("Failed to add resource");
      } else {
        toast.success("Resource added");
        setNewResourceTitle("");
        setNewResourceUrl("");
        loadResources(resourceEnrollmentId);
      }
    } finally {
      setIsAddingResource(false);
    }
  };

  const deleteResource = async (resourceId: string) => {
    const { error } = await supabase
      .from("enrollment_resources")
      .delete()
      .eq("id", resourceId);

    if (!error && resourceEnrollmentId) {
      toast.success("Resource deleted");
      loadResources(resourceEnrollmentId);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Code copied");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleExpandedEnrollment = (id: string) => {
    setExpandedEnrollment(expandedEnrollment === id ? null : id);
  };

  const getFullName = (e: Enrollment) => {
    if (e.first_name && e.last_name) {
      return `${e.first_name} ${e.last_name}`;
    }
    return e.profiles?.full_name || "—";
  };

  const formatAddress = (e: Enrollment) => {
    const parts = [e.city, e.state, e.zip_code, e.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "—";
  };

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-display font-bold text-foreground">Admin Portal</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Member View
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Tabs defaultValue="200k-method" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="200k-method" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">200K Method</span>
            </TabsTrigger>
            <TabsTrigger value="ai-coach" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">AI Coach</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Members</span>
            </TabsTrigger>
            <TabsTrigger value="advisor" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Advisor</span>
            </TabsTrigger>
            <TabsTrigger value="ama" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span className="hidden sm:inline">AMA</span>
            </TabsTrigger>
            <TabsTrigger value="webinar" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Webinar</span>
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="flex items-center gap-2">
              <Quote className="h-4 w-4" />
              <span className="hidden sm:inline">Testimonials</span>
            </TabsTrigger>
          </TabsList>

          {/* 200K Method Tab with sub-tabs */}
          <TabsContent value="200k-method">
            <Tabs defaultValue="enrollments" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="enrollments" className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Enrollments
                </TabsTrigger>
                <TabsTrigger value="leads" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Leads
                </TabsTrigger>
              </TabsList>
              <TabsContent value="enrollments" className="space-y-6">
                <EnrollmentsTab />
              </TabsContent>
              <TabsContent value="leads">
                <LeadsTab />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* AI Coach Tab with sub-tabs - adding Assessments here as well */}
          <TabsContent value="ai-coach">
            <Tabs defaultValue="beta" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="beta" className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4" />
                  Beta Events
                </TabsTrigger>
                <TabsTrigger value="tools" className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  AI Tools
                </TabsTrigger>
              </TabsList>
              <TabsContent value="beta">
                <BetaRegistrationsTab />
              </TabsContent>
              <TabsContent value="tools">
                <ToolPurchasesTab />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="members">
            <MembersTab />
          </TabsContent>

          <TabsContent value="advisor">
            <CareerAdvisorTab />
          </TabsContent>

          <TabsContent value="ama">
            <AMARegistrationsTab />
          </TabsContent>

          <TabsContent value="webinar">
            <WebinarRegistrationsTab />
          </TabsContent>

          <TabsContent value="testimonials">
            <TestimonialsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
