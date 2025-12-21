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
import { LogOut, Users, RefreshCw, Plus, Copy, Check, Edit, FileText, ChevronDown, ChevronRight, User, Mail, Brain, Quote, Receipt, UserCheck, Clock, Wrench, CalendarCheck, MessageSquare } from "lucide-react";
import { countries, getStatesForCountry, getCountryName, getStateName } from "@/lib/locationData";
import { LeadsTab } from "@/components/admin/LeadsTab";
import { AssessmentsTab } from "@/components/admin/AssessmentsTab";
import { TestimonialsTab } from "@/components/admin/TestimonialsTab";
import { ToolPurchasesTab } from "@/components/admin/ToolPurchasesTab";
import { BetaRegistrationsTab } from "@/components/admin/BetaRegistrationsTab";
import { CareerAdvisorTab } from "@/components/admin/CareerAdvisorTab";
import InvoiceList from "@/components/InvoiceList";

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
        <Tabs defaultValue="enrollments" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="enrollments" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Enrollments</span>
            </TabsTrigger>
            <TabsTrigger value="advisor" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Advisor</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">AI Tools</span>
            </TabsTrigger>
            <TabsTrigger value="beta" className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Beta Event</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Leads</span>
            </TabsTrigger>
            <TabsTrigger value="assessments" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Assessments</span>
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="flex items-center gap-2">
              <Quote className="h-4 w-4" />
              <span className="hidden sm:inline">Testimonials</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="advisor">
            <CareerAdvisorTab />
          </TabsContent>

          <TabsContent value="tools">
            <ToolPurchasesTab />
          </TabsContent>

          <TabsContent value="beta">
            <BetaRegistrationsTab />
          </TabsContent>

          <TabsContent value="enrollments" className="space-y-6">
        {/* Create Enrollment Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Enrollment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createEnrollment} className="space-y-4">
                {/* Personal Information */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>First Name *</Label>
                      <Input
                        placeholder="John"
                        value={newFirstName}
                        onChange={(e) => setNewFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name *</Label>
                      <Input
                        placeholder="Doe"
                        value={newLastName}
                        onChange={(e) => setNewLastName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Address & Occupation */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Address & Occupation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Select 
                        value={newCountry} 
                        onValueChange={(value) => {
                          setNewCountry(value);
                          setNewState(""); // Reset state when country changes
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                        <SelectContent>
                          {countries.map((c) => (
                            <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>State/Province</Label>
                      {availableStates.length > 0 ? (
                        <Select value={newState} onValueChange={setNewState}>
                          <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                          <SelectContent>
                            {availableStates.map((s) => (
                              <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          placeholder="State/Province"
                          value={newState}
                          onChange={(e) => setNewState(e.target.value)}
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        placeholder="New York"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Zip Code</Label>
                      <Input
                        placeholder="10001"
                        value={newZipCode}
                        onChange={(e) => setNewZipCode(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Occupation</Label>
                      <Input
                        placeholder="Product Manager"
                        value={newOccupation}
                        onChange={(e) => setNewOccupation(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Program Details */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Program Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Program *</Label>
                      <Select value={newProgramId} onValueChange={setNewProgramId}>
                        <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                        <SelectContent>
                          {programs.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Status</Label>
                      <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={newStartDate}
                        onChange={(e) => setNewStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Zoom Link</Label>
                      <Input
                        type="url"
                        placeholder="https://zoom.us/j/..."
                        value={newZoomLink}
                        onChange={(e) => setNewZoomLink(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Notes</Label>
                      <Input
                        placeholder="Any additional notes"
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Enrollment"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Enrollments Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <CardTitle>All Enrollments</CardTitle>
              <Badge variant="secondary">{enrollments.length} total</Badge>
            </div>
            <div className="flex gap-2">
              {!showForm && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" /> New Enrollment
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={refreshData} disabled={loadingData}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingData ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : enrollments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No enrollments yet. Click "New Enrollment" to create one.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Enrollment ID</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((e) => (
                      <Collapsible key={e.id} asChild open={expandedEnrollment === e.id}>
                        <>
                          <TableRow className="cursor-pointer hover:bg-muted/50">
                            <TableCell>
                              <CollapsibleTrigger asChild>
                                <button 
                                  onClick={() => toggleExpandedEnrollment(e.id)}
                                  className="p-1 hover:bg-muted rounded"
                                >
                                  {expandedEnrollment === e.id ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </button>
                              </CollapsibleTrigger>
                            </TableCell>
                            <TableCell>
                              <button 
                                onClick={() => toggleExpandedEnrollment(e.id)}
                                className="text-left font-medium hover:text-primary transition-colors"
                              >
                                {getFullName(e)}
                              </button>
                            </TableCell>
                            <TableCell>{e.programs?.name || "—"}</TableCell>
                            <TableCell>
                              {e.enrollment_code && (
                                <div className="flex items-center gap-2">
                                  <code className="bg-muted px-2 py-1 rounded text-xs">
                                    {e.enrollment_code}
                                  </code>
                                  <button onClick={() => copyCode(e.enrollment_code!)}>
                                    {copiedCode === e.enrollment_code ? (
                                      <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                    )}
                                  </button>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {e.start_date ? new Date(e.start_date).toLocaleDateString() : "—"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={e.payment_status === "paid" ? "default" : "secondary"}>
                                {e.payment_status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {e.user_id ? (
                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                  ✓ Enrolled
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-orange-500 border-orange-500">
                                  ⏳ Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(e)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Edit Enrollment</DialogTitle>
                                      {editingEnrollment?.enrollment_code && (
                                        <p className="text-sm text-muted-foreground">
                                          Enrollment ID: <code className="bg-muted px-2 py-1 rounded">{editingEnrollment.enrollment_code}</code>
                                        </p>
                                      )}
                                    </DialogHeader>
                                    <div className="space-y-6 py-4">
                                      {/* Personal Information */}
                                      <div className="space-y-3">
                                        <h4 className="font-medium text-sm text-muted-foreground">Personal Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <Label>First Name *</Label>
                                            <Input
                                              value={editFirstName}
                                              onChange={(ev) => setEditFirstName(ev.target.value)}
                                              required
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Last Name *</Label>
                                            <Input
                                              value={editLastName}
                                              onChange={(ev) => setEditLastName(ev.target.value)}
                                              required
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Email *</Label>
                                            <Input
                                              type="email"
                                              value={editEmail}
                                              onChange={(ev) => setEditEmail(ev.target.value)}
                                              required
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Phone</Label>
                                            <Input
                                              type="tel"
                                              value={editPhone}
                                              onChange={(ev) => setEditPhone(ev.target.value)}
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      {/* Address & Occupation */}
                                      <div className="space-y-3">
                                        <h4 className="font-medium text-sm text-muted-foreground">Address & Occupation</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                          <div className="space-y-2">
                                            <Label>Country</Label>
                                            <Select 
                                              value={editCountry} 
                                              onValueChange={(value) => {
                                                setEditCountry(value);
                                                setEditState("");
                                              }}
                                            >
                                              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                                              <SelectContent>
                                                {countries.map((c) => (
                                                  <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="space-y-2">
                                            <Label>State/Province</Label>
                                            {editAvailableStates.length > 0 ? (
                                              <Select value={editState} onValueChange={setEditState}>
                                                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                                                <SelectContent>
                                                  {editAvailableStates.map((s) => (
                                                    <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            ) : (
                                              <Input
                                                placeholder="State/Province"
                                                value={editState}
                                                onChange={(ev) => setEditState(ev.target.value)}
                                              />
                                            )}
                                          </div>
                                          <div className="space-y-2">
                                            <Label>City</Label>
                                            <Input
                                              value={editCity}
                                              onChange={(ev) => setEditCity(ev.target.value)}
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Zip Code</Label>
                                            <Input
                                              value={editZipCode}
                                              onChange={(ev) => setEditZipCode(ev.target.value)}
                                            />
                                          </div>
                                          <div className="space-y-2 md:col-span-2">
                                            <Label>Occupation</Label>
                                            <Input
                                              value={editOccupation}
                                              onChange={(ev) => setEditOccupation(ev.target.value)}
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      {/* Program Details */}
                                      <div className="space-y-3">
                                        <h4 className="font-medium text-sm text-muted-foreground">Program Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <Label>Program</Label>
                                            <Select value={editProgramId} onValueChange={setEditProgramId}>
                                              <SelectTrigger><SelectValue /></SelectTrigger>
                                              <SelectContent>
                                                {programs.map((p) => (
                                                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Payment Status</Label>
                                            <Select value={editPaymentStatus} onValueChange={setEditPaymentStatus}>
                                              <SelectTrigger><SelectValue /></SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Start Date</Label>
                                            <Input
                                              type="date"
                                              value={editStartDate}
                                              onChange={(ev) => setEditStartDate(ev.target.value)}
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Zoom Link</Label>
                                            <Input
                                              type="url"
                                              placeholder="https://zoom.us/j/..."
                                              value={editZoomLink}
                                              onChange={(ev) => setEditZoomLink(ev.target.value)}
                                            />
                                          </div>
                                          <div className="space-y-2 md:col-span-2">
                                            <Label>Notes</Label>
                                            <Textarea
                                              placeholder="Any additional notes"
                                              value={editNotes}
                                              onChange={(ev) => setEditNotes(ev.target.value)}
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      <Button onClick={updateEnrollment} disabled={isUpdating} className="w-full">
                                        {isUpdating ? "Saving..." : "Save Changes"}
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => loadResources(e.id)}>
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Resources for {getFullName(e)}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                        <Input
                                          placeholder="Resource title"
                                          value={newResourceTitle}
                                          onChange={(ev) => setNewResourceTitle(ev.target.value)}
                                        />
                                        <Input
                                          placeholder="URL"
                                          value={newResourceUrl}
                                          onChange={(ev) => setNewResourceUrl(ev.target.value)}
                                        />
                                        <div className="flex gap-2">
                                          <Select value={newResourceType} onValueChange={setNewResourceType}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="link">Link</SelectItem>
                                              <SelectItem value="video">Video</SelectItem>
                                              <SelectItem value="pdf">PDF</SelectItem>
                                              <SelectItem value="worksheet">Worksheet</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          <Button onClick={addResource} disabled={isAddingResource} size="sm">
                                            <Plus className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                      
                                      {resources.length > 0 ? (
                                        <div className="space-y-2">
                                          {resources.map((r) => (
                                            <div key={r.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                              <div>
                                                <span className="font-medium">{r.title}</span>
                                                <span className="text-xs text-muted-foreground ml-2">({r.type})</span>
                                              </div>
                                              <div className="flex gap-2">
                                                <a href={r.url} target="_blank" rel="noopener noreferrer">
                                                  <Button variant="ghost" size="sm">View</Button>
                                                </a>
                                                <Button 
                                                  variant="ghost" 
                                                  size="sm" 
                                                  onClick={() => deleteResource(r.id)}
                                                  className="text-destructive hover:text-destructive"
                                                >
                                                  Delete
                                                </Button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-muted-foreground text-center py-4">
                                          No resources added yet.
                                        </p>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </TableCell>
                          </TableRow>
                          <CollapsibleContent asChild>
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={7} className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {/* Contact Information */}
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                                      <User className="h-4 w-4" />
                                      Contact Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="ml-2">{e.email || e.profiles?.email || "—"}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Phone:</span>
                                        <span className="ml-2">{e.phone || "—"}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Occupation:</span>
                                        <span className="ml-2">{e.occupation || "—"}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Address:</span>
                                        <span className="ml-2">{formatAddress(e)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Portal Status */}
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-sm text-foreground">Portal Status</h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Portal Enrolled:</span>
                                        <span className="ml-2">
                                          {e.user_id ? (
                                            <Badge variant="default" className="text-xs">Yes</Badge>
                                          ) : (
                                            <Badge variant="secondary" className="text-xs">No</Badge>
                                          )}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Username (Email):</span>
                                        <span className="ml-2">{e.profiles?.email || "Not registered"}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Enrolled At:</span>
                                        <span className="ml-2">{new Date(e.enrolled_at).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Program Details */}
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-sm text-foreground">Program Details</h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Zoom Link:</span>
                                        <span className="ml-2">
                                          {e.zoom_link ? (
                                            <a 
                                              href={e.zoom_link} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-primary hover:underline"
                                            >
                                              Open Link
                                            </a>
                                          ) : "—"}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Notes:</span>
                                        <span className="ml-2">{e.notes || "—"}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Invoices Section */}
                                {(e.email || e.profiles?.email) && (
                                  <div className="mt-6 pt-6 border-t border-border">
                                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-2 mb-4">
                                      <Receipt className="h-4 w-4" />
                                      Invoices & Payments
                                    </h4>
                                    <InvoiceList 
                                      customerEmail={e.email || e.profiles?.email || ""} 
                                      compact 
                                    />
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          </CollapsibleContent>
                        </>
                      </Collapsible>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="leads">
            <LeadsTab />
          </TabsContent>

          <TabsContent value="assessments">
            <AssessmentsTab />
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
