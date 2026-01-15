import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, RefreshCw, Plus, Copy, Check, Edit, FileText, ChevronDown, ChevronRight, User, Receipt } from "lucide-react";
import { countries, getStatesForCountry, getCountryName, getStateName } from "@/lib/locationData";
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

export function EnrollmentsTab() {
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
  
  const editAvailableStates = getStatesForCountry(editCountry);

  // Resources
  const [resourceEnrollmentId, setResourceEnrollmentId] = useState<string | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceUrl, setNewResourceUrl] = useState("");
  const [newResourceType, setNewResourceType] = useState("link");
  const [isAddingResource, setIsAddingResource] = useState(false);

  const availableStates = getStatesForCountry(newCountry);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
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

  return (
    <div className="space-y-6">
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
                        setNewState("");
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

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Enrollment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Enrollments Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Enrollments ({enrollments.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New Enrollment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No enrollments yet</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((e) => (
                    <Collapsible key={e.id} asChild>
                      <>
                        <TableRow className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <CollapsibleTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-0 h-6 w-6"
                                onClick={() => toggleExpandedEnrollment(e.id)}
                              >
                                {expandedEnrollment === e.id ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {getFullName(e)}
                            </div>
                          </TableCell>
                          <TableCell>{e.email || e.profiles?.email || "—"}</TableCell>
                          <TableCell>{e.programs?.name || "—"}</TableCell>
                          <TableCell>
                            {e.enrollment_code ? (
                              <div className="flex items-center gap-1">
                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                  {e.enrollment_code}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => copyCode(e.enrollment_code!)}
                                >
                                  {copiedCode === e.enrollment_code ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            ) : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={e.payment_status === "paid" ? "default" : "secondary"}>
                              {e.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(e.enrolled_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0"
                                    onClick={() => openEditDialog(e)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Edit Enrollment</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>First Name *</Label>
                                        <Input
                                          value={editFirstName}
                                          onChange={(e) => setEditFirstName(e.target.value)}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Last Name *</Label>
                                        <Input
                                          value={editLastName}
                                          onChange={(e) => setEditLastName(e.target.value)}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Email *</Label>
                                        <Input
                                          type="email"
                                          value={editEmail}
                                          onChange={(e) => setEditEmail(e.target.value)}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input
                                          type="tel"
                                          value={editPhone}
                                          onChange={(e) => setEditPhone(e.target.value)}
                                        />
                                      </div>
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
                                            value={editState}
                                            onChange={(e) => setEditState(e.target.value)}
                                          />
                                        )}
                                      </div>
                                      <div className="space-y-2">
                                        <Label>City</Label>
                                        <Input
                                          value={editCity}
                                          onChange={(e) => setEditCity(e.target.value)}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Zip Code</Label>
                                        <Input
                                          value={editZipCode}
                                          onChange={(e) => setEditZipCode(e.target.value)}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Occupation</Label>
                                        <Input
                                          value={editOccupation}
                                          onChange={(e) => setEditOccupation(e.target.value)}
                                        />
                                      </div>
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
                                          onChange={(e) => setEditStartDate(e.target.value)}
                                        />
                                      </div>
                                      <div className="space-y-2 col-span-2">
                                        <Label>Zoom Link</Label>
                                        <Input
                                          type="url"
                                          value={editZoomLink}
                                          onChange={(e) => setEditZoomLink(e.target.value)}
                                        />
                                      </div>
                                      <div className="space-y-2 col-span-2">
                                        <Label>Notes</Label>
                                        <Input
                                          value={editNotes}
                                          onChange={(e) => setEditNotes(e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <Button 
                                        variant="outline" 
                                        onClick={() => setEditingEnrollment(null)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button onClick={updateEnrollment} disabled={isUpdating}>
                                        {isUpdating ? "Saving..." : "Save Changes"}
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0"
                                    onClick={() => loadResources(e.id)}
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Manage Resources</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label>Title</Label>
                                      <Input
                                        placeholder="Resource title"
                                        value={newResourceTitle}
                                        onChange={(e) => setNewResourceTitle(e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>URL</Label>
                                      <Input
                                        type="url"
                                        placeholder="https://..."
                                        value={newResourceUrl}
                                        onChange={(e) => setNewResourceUrl(e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Type</Label>
                                      <Select value={newResourceType} onValueChange={setNewResourceType}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="link">Link</SelectItem>
                                          <SelectItem value="video">Video</SelectItem>
                                          <SelectItem value="document">Document</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <Button 
                                      onClick={addResource} 
                                      disabled={isAddingResource}
                                      className="w-full"
                                    >
                                      {isAddingResource ? "Adding..." : "Add Resource"}
                                    </Button>
                                    
                                    {resources.length > 0 && (
                                      <div className="border-t pt-4 space-y-2">
                                        <h4 className="font-medium text-sm">Existing Resources</h4>
                                        {resources.map((r) => (
                                          <div key={r.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                            <div>
                                              <div className="font-medium text-sm">{r.title}</div>
                                              <div className="text-xs text-muted-foreground">{r.type}</div>
                                            </div>
                                            <div className="flex gap-2">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => window.open(r.url, '_blank')}
                                              >
                                                Open
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive"
                                                onClick={() => deleteResource(r.id)}
                                              >
                                                Delete
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableCell colSpan={8} className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Contact Information */}
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-sm text-foreground">Contact Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Phone:</span>
                                      <span className="ml-2">{e.phone || "—"}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Address:</span>
                                      <span className="ml-2">{formatAddress(e)}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Occupation:</span>
                                      <span className="ml-2">{e.occupation || "—"}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Account Information */}
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-sm text-foreground">Account Information</h4>
                                  <div className="space-y-2 text-sm">
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
    </div>
  );
}
