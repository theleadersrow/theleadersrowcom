import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  RefreshCw, Users, Clock, CheckCircle, Mail, Send, 
  MoreHorizontal, UserCheck, UserX, Video, Calendar,
  Download, Bell, Filter, X, Search, Plus, Pencil, Trash2
} from "lucide-react";
import { format } from "date-fns";

interface BetaRegistration {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  current_position: string;
  company: string | null;
  job_search_status: string;
  target_roles: string;
  linkedin_url: string | null;
  understands_beta_terms: boolean;
  agrees_to_communication: boolean;
  status: string;
  created_at: string;
  invited_at: string | null;
  zoom_link_sent: boolean;
  tool_type: string;
  subscribe_to_newsletter: boolean;
  event_date: string | null;
}

interface ColumnFilters {
  name: string;
  email: string;
  tool_type: string;
  job_search_status: string;
  position: string;
  company: string;
  target_roles: string;
  registered_after: string;
}

export function BetaRegistrationsTab() {
  const [registrations, setRegistrations] = useState<BetaRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "invited" | "waitlisted">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Column filters
  const [showFilters, setShowFilters] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({
    name: "",
    email: "",
    tool_type: "all",
    job_search_status: "all",
    position: "",
    company: "",
    target_roles: "",
    registered_after: "",
  });
  
  // Update event date dialog
  const [updateDateDialogOpen, setUpdateDateDialogOpen] = useState(false);
  const [newEventDate, setNewEventDate] = useState("");
  const [updatingDates, setUpdatingDates] = useState(false);
  
  // Invite dialog
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [zoomLink, setZoomLink] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [sendingInvites, setSendingInvites] = useState(false);
  
  // Reminder dialog
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [reminderMessage, setReminderMessage] = useState("");
  const [sendingReminders, setSendingReminders] = useState(false);

  // Bulk email dialog
  const [bulkEmailDialogOpen, setBulkEmailDialogOpen] = useState(false);
  const [bulkEmailSubject, setBulkEmailSubject] = useState("");
  const [bulkEmailMessage, setBulkEmailMessage] = useState("");
  const [sendingBulkEmail, setSendingBulkEmail] = useState(false);

  // Add/Edit registration dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<BetaRegistration | null>(null);
  const [savingRegistration, setSavingRegistration] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    current_position: "",
    company: "",
    job_search_status: "actively_interviewing",
    target_roles: "",
    linkedin_url: "",
    tool_type: "resume_suite",
    status: "pending",
    understands_beta_terms: true,
    agrees_to_communication: true,
    subscribe_to_newsletter: false,
  });

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("beta_event_registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast.error("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [statusFilter]);

  // Apply column filters client-side
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      // Name filter
      if (columnFilters.name && !reg.full_name.toLowerCase().includes(columnFilters.name.toLowerCase())) {
        return false;
      }
      // Email filter
      if (columnFilters.email && !reg.email.toLowerCase().includes(columnFilters.email.toLowerCase())) {
        return false;
      }
      // Tool type filter
      if (columnFilters.tool_type !== "all" && reg.tool_type !== columnFilters.tool_type) {
        return false;
      }
      // Job search status filter
      if (columnFilters.job_search_status !== "all" && reg.job_search_status !== columnFilters.job_search_status) {
        return false;
      }
      // Position filter
      if (columnFilters.position && !reg.current_position.toLowerCase().includes(columnFilters.position.toLowerCase())) {
        return false;
      }
      // Company filter
      if (columnFilters.company && !(reg.company || "").toLowerCase().includes(columnFilters.company.toLowerCase())) {
        return false;
      }
      // Target roles filter
      if (columnFilters.target_roles && !reg.target_roles.toLowerCase().includes(columnFilters.target_roles.toLowerCase())) {
        return false;
      }
      // Registered after filter
      if (columnFilters.registered_after) {
        const filterDate = new Date(columnFilters.registered_after);
        const regDate = new Date(reg.created_at);
        if (regDate < filterDate) {
          return false;
        }
      }
      return true;
    });
  }, [registrations, columnFilters]);

  const clearFilters = () => {
    setColumnFilters({
      name: "",
      email: "",
      tool_type: "all",
      job_search_status: "all",
      position: "",
      company: "",
      target_roles: "",
      registered_after: "",
    });
  };

  const hasActiveFilters = useMemo(() => {
    return columnFilters.name !== "" ||
      columnFilters.email !== "" ||
      columnFilters.tool_type !== "all" ||
      columnFilters.job_search_status !== "all" ||
      columnFilters.position !== "" ||
      columnFilters.company !== "" ||
      columnFilters.target_roles !== "" ||
      columnFilters.registered_after !== "";
  }, [columnFilters]);

  // Bulk update event dates
  const updateEventDates = async () => {
    if (!newEventDate) {
      toast.error("Please enter a date");
      return;
    }
    if (selectedIds.length === 0) {
      toast.error("Please select registrations to update");
      return;
    }

    setUpdatingDates(true);
    try {
      const { error } = await supabase
        .from("beta_event_registrations")
        .update({ event_date: newEventDate })
        .in("id", selectedIds);

      if (error) throw error;
      toast.success(`Updated event date for ${selectedIds.length} registration(s)`);
      setUpdateDateDialogOpen(false);
      setNewEventDate("");
      setSelectedIds([]);
      fetchRegistrations();
    } catch (error) {
      console.error("Error updating event dates:", error);
      toast.error("Failed to update event dates");
    } finally {
      setUpdatingDates(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const updates: any = { status };
      if (status === "invited") {
        updates.invited_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from("beta_event_registrations")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      toast.success(`Status updated to ${status}`);
      fetchRegistrations();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const filteredIds = filteredRegistrations.map(r => r.id);
      setSelectedIds(filteredIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(i => i !== id));
    }
  };

  const openInviteDialog = () => {
    const pendingSelected = filteredRegistrations.filter(
      r => selectedIds.includes(r.id) && r.status === "pending"
    );
    if (pendingSelected.length === 0) {
      toast.error("Please select pending registrations to invite");
      return;
    }
    setInviteDialogOpen(true);
  };

  const sendInvites = async () => {
    if (!zoomLink.trim()) {
      toast.error("Please enter the Zoom link");
      return;
    }

    setSendingInvites(true);
    const pendingSelected = filteredRegistrations.filter(
      r => selectedIds.includes(r.id) && r.status === "pending"
    );

    try {
      for (const reg of pendingSelected) {
        await supabase.functions.invoke("send-beta-invite-email", {
          body: {
            name: reg.full_name,
            email: reg.email,
            zoomLink: zoomLink.trim(),
            customMessage: customMessage.trim(),
            toolType: reg.tool_type,
          },
        });

        await supabase
          .from("beta_event_registrations")
          .update({
            status: "invited",
            invited_at: new Date().toISOString(),
            zoom_link_sent: true,
          })
          .eq("id", reg.id);
      }

      toast.success(`Sent ${pendingSelected.length} invite(s)`);
      setInviteDialogOpen(false);
      setZoomLink("");
      setCustomMessage("");
      setSelectedIds([]);
      fetchRegistrations();
    } catch (error) {
      console.error("Error sending invites:", error);
      toast.error("Failed to send some invites");
    } finally {
      setSendingInvites(false);
    }
  };

  const openReminderDialog = () => {
    const invitedSelected = filteredRegistrations.filter(
      r => selectedIds.includes(r.id) && r.status === "invited"
    );
    if (invitedSelected.length === 0) {
      toast.error("Please select invited registrations to send reminders");
      return;
    }
    setReminderDialogOpen(true);
  };

  const sendReminders = async () => {
    setSendingReminders(true);
    const invitedSelected = filteredRegistrations.filter(
      r => selectedIds.includes(r.id) && r.status === "invited"
    );

    try {
      for (const reg of invitedSelected) {
        await supabase.functions.invoke("send-beta-reminder-email", {
          body: {
            name: reg.full_name,
            email: reg.email,
            customMessage: reminderMessage.trim(),
          },
        });
      }

      toast.success(`Sent ${invitedSelected.length} reminder(s)`);
      setReminderDialogOpen(false);
      setReminderMessage("");
      setSelectedIds([]);
    } catch (error) {
      console.error("Error sending reminders:", error);
      toast.error("Failed to send some reminders");
    } finally {
      setSendingReminders(false);
    }
  };

  // Bulk email function (for custom emails to any selected candidates)
  const openBulkEmailDialog = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one registration to email");
      return;
    }
    setBulkEmailDialogOpen(true);
  };

  const sendBulkEmail = async () => {
    if (!bulkEmailSubject.trim()) {
      toast.error("Please enter an email subject");
      return;
    }
    if (!bulkEmailMessage.trim()) {
      toast.error("Please enter an email message");
      return;
    }

    setSendingBulkEmail(true);
    const selectedRegistrations = filteredRegistrations.filter(
      r => selectedIds.includes(r.id)
    );

    try {
      for (const reg of selectedRegistrations) {
        await supabase.functions.invoke("send-beta-bulk-email", {
          body: {
            name: reg.full_name,
            email: reg.email,
            subject: bulkEmailSubject.trim(),
            message: bulkEmailMessage.trim(),
          },
        });
      }

      toast.success(`Sent ${selectedRegistrations.length} email(s)`);
      setBulkEmailDialogOpen(false);
      setBulkEmailSubject("");
      setBulkEmailMessage("");
      setSelectedIds([]);
    } catch (error) {
      console.error("Error sending bulk emails:", error);
      toast.error("Failed to send some emails");
    } finally {
      setSendingBulkEmail(false);
    }
  };

  // Add new registration
  const openAddDialog = () => {
    setEditingRegistration(null);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      current_position: "",
      company: "",
      job_search_status: "actively_interviewing",
      target_roles: "",
      linkedin_url: "",
      tool_type: "resume_suite",
      status: "pending",
      understands_beta_terms: true,
      agrees_to_communication: true,
      subscribe_to_newsletter: false,
    });
    setEditDialogOpen(true);
  };

  // Edit existing registration
  const openEditDialog = (reg: BetaRegistration) => {
    setEditingRegistration(reg);
    setFormData({
      full_name: reg.full_name,
      email: reg.email,
      phone: reg.phone,
      current_position: reg.current_position,
      company: reg.company || "",
      job_search_status: reg.job_search_status,
      target_roles: reg.target_roles,
      linkedin_url: reg.linkedin_url || "",
      tool_type: reg.tool_type,
      status: reg.status,
      understands_beta_terms: reg.understands_beta_terms,
      agrees_to_communication: reg.agrees_to_communication,
      subscribe_to_newsletter: reg.subscribe_to_newsletter || false,
    });
    setEditDialogOpen(true);
  };

  // Save registration (add or update)
  const saveRegistration = async () => {
    if (!formData.full_name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error("Please fill in required fields (name, email, phone)");
      return;
    }

    setSavingRegistration(true);
    try {
      const dataToSave = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        current_position: formData.current_position.trim(),
        company: formData.company.trim() || null,
        job_search_status: formData.job_search_status,
        target_roles: formData.target_roles.trim(),
        linkedin_url: formData.linkedin_url.trim() || null,
        tool_type: formData.tool_type,
        status: formData.status,
        understands_beta_terms: formData.understands_beta_terms,
        agrees_to_communication: formData.agrees_to_communication,
        subscribe_to_newsletter: formData.subscribe_to_newsletter,
      };

      if (editingRegistration) {
        // Update existing
        const { error } = await supabase
          .from("beta_event_registrations")
          .update(dataToSave)
          .eq("id", editingRegistration.id);

        if (error) throw error;
        toast.success("Registration updated successfully");
      } else {
        // Create new
        const { error } = await supabase
          .from("beta_event_registrations")
          .insert(dataToSave);

        if (error) throw error;
        toast.success("Registration added successfully");
      }

      setEditDialogOpen(false);
      fetchRegistrations();
    } catch (error: any) {
      console.error("Error saving registration:", error);
      toast.error(error.message || "Failed to save registration");
    } finally {
      setSavingRegistration(false);
    }
  };

  // Delete registration
  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const deleteRegistration = async () => {
    if (!deletingId) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("beta_event_registrations")
        .delete()
        .eq("id", deletingId);

      if (error) throw error;
      toast.success("Registration deleted");
      setDeleteDialogOpen(false);
      setDeletingId(null);
      setSelectedIds(selectedIds.filter(id => id !== deletingId));
      fetchRegistrations();
    } catch (error) {
      console.error("Error deleting registration:", error);
      toast.error("Failed to delete registration");
    } finally {
      setDeleting(false);
    }
  };

  // Bulk delete
  const bulkDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      const { error } = await supabase
        .from("beta_event_registrations")
        .delete()
        .in("id", selectedIds);

      if (error) throw error;
      toast.success(`Deleted ${selectedIds.length} registration(s)`);
      setSelectedIds([]);
      fetchRegistrations();
    } catch (error) {
      console.error("Error bulk deleting:", error);
      toast.error("Failed to delete some registrations");
    }
  };

  const waitlistSelected = async () => {
    const pendingSelected = filteredRegistrations.filter(
      r => selectedIds.includes(r.id) && r.status === "pending"
    );
    
    if (pendingSelected.length === 0) {
      toast.error("Please select pending registrations to waitlist");
      return;
    }

    try {
      for (const reg of pendingSelected) {
        await supabase
          .from("beta_event_registrations")
          .update({ status: "waitlisted" })
          .eq("id", reg.id);
      }

      toast.success(`Waitlisted ${pendingSelected.length} registration(s)`);
      setSelectedIds([]);
      fetchRegistrations();
    } catch (error) {
      console.error("Error waitlisting:", error);
      toast.error("Failed to waitlist some registrations");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Name", "Email", "Phone", "Position", "Company", 
      "Status", "Target Roles", "Job Search Status", "LinkedIn", "Applied At"
    ];
    const rows = filteredRegistrations.map(r => [
      r.full_name,
      r.email,
      r.phone,
      r.current_position,
      r.company || "",
      r.status,
      r.target_roles,
      r.job_search_status,
      r.linkedin_url || "",
      format(new Date(r.created_at), "yyyy-MM-dd HH:mm"),
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `beta-registrations-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to CSV");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "invited":
        return <Badge className="bg-green-500/20 text-green-600">Invited</Badge>;
      case "waitlisted":
        return <Badge variant="secondary">Waitlisted</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getJobSearchLabel = (status: string) => {
    switch (status) {
      case "actively_interviewing":
        return "Actively Interviewing";
      case "preparing_soon":
        return "Preparing (1-2 months)";
      case "exploring":
        return "Exploring (3+ months)";
      default:
        return status;
    }
  };

  const pendingCount = registrations.filter(r => r.status === "pending").length;
  const invitedCount = registrations.filter(r => r.status === "invited").length;
  const waitlistedCount = registrations.filter(r => r.status === "waitlisted").length;

  const selectedPendingCount = selectedIds.filter(id => 
    filteredRegistrations.find(r => r.id === id)?.status === "pending"
  ).length;

  const selectedInvitedCount = selectedIds.filter(id => 
    filteredRegistrations.find(r => r.id === id)?.status === "invited"
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrations.length}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-600">
              <Clock className="w-4 h-4" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600">
              <UserCheck className="w-4 h-4" />
              Invited
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{invitedCount}</div>
            <p className="text-xs text-muted-foreground">of 20 spots</p>
          </CardContent>
        </Card>
        <Card className="border-gray-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <UserX className="w-4 h-4" />
              Waitlisted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{waitlistedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <TabsList>
              <TabsTrigger value="all">All ({registrations.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
              <TabsTrigger value="invited">Invited ({invitedCount})</TabsTrigger>
              <TabsTrigger value="waitlisted">Waitlisted ({waitlistedCount})</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={showFilters ? "default" : "outline"} 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge className="ml-2 bg-primary-foreground text-primary h-5 px-1.5">
                  Active
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={fetchRegistrations}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Registration
            </Button>
          </div>
        </div>

        {/* Column Filters */}
        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div>
                <Label className="text-xs mb-1.5 block">Name</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter name..."
                    value={columnFilters.name}
                    onChange={(e) => setColumnFilters(prev => ({ ...prev, name: e.target.value }))}
                    className="pl-8 h-9"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Email</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter email..."
                    value={columnFilters.email}
                    onChange={(e) => setColumnFilters(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-8 h-9"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Tool Type</Label>
                <Select
                  value={columnFilters.tool_type}
                  onValueChange={(value) => setColumnFilters(prev => ({ ...prev, tool_type: value }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All tools" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tools</SelectItem>
                    <SelectItem value="resume_suite">Resume Suite</SelectItem>
                    <SelectItem value="linkedin_signal">LinkedIn Signal</SelectItem>
                    <SelectItem value="interview_prep">Interview Prep</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Job Search Status</Label>
                <Select
                  value={columnFilters.job_search_status}
                  onValueChange={(value) => setColumnFilters(prev => ({ ...prev, job_search_status: value }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="actively_interviewing">Actively Interviewing</SelectItem>
                    <SelectItem value="preparing_soon">Preparing (1-2 months)</SelectItem>
                    <SelectItem value="exploring">Exploring (3+ months)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Position</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter position..."
                    value={columnFilters.position}
                    onChange={(e) => setColumnFilters(prev => ({ ...prev, position: e.target.value }))}
                    className="pl-8 h-9"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Company</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter company..."
                    value={columnFilters.company}
                    onChange={(e) => setColumnFilters(prev => ({ ...prev, company: e.target.value }))}
                    className="pl-8 h-9"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Target Roles</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter roles..."
                    value={columnFilters.target_roles}
                    onChange={(e) => setColumnFilters(prev => ({ ...prev, target_roles: e.target.value }))}
                    className="pl-8 h-9"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Registered After</Label>
                <Input
                  type="date"
                  value={columnFilters.registered_after}
                  onChange={(e) => setColumnFilters(prev => ({ ...prev, registered_after: e.target.value }))}
                  className="h-9"
                />
              </div>
            </div>
            {hasActiveFilters && (
              <div className="mt-3 text-sm text-muted-foreground">
                Showing {filteredRegistrations.length} of {registrations.length} registrations
              </div>
            )}
          </Card>
        )}

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <Card className="p-3 bg-primary/5 border-primary/20">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium">
                {selectedIds.length} selected
              </span>
              <div className="h-4 w-px bg-border" />
              <Button size="sm" onClick={openInviteDialog} disabled={selectedPendingCount === 0}>
                <Send className="w-4 h-4 mr-2" />
                Invite ({selectedPendingCount})
              </Button>
              <Button size="sm" variant="outline" onClick={openReminderDialog} disabled={selectedInvitedCount === 0}>
                <Bell className="w-4 h-4 mr-2" />
                Send Reminders ({selectedInvitedCount})
              </Button>
              <Button size="sm" variant="outline" onClick={openBulkEmailDialog}>
                <Mail className="w-4 h-4 mr-2" />
                Bulk Email ({selectedIds.length})
              </Button>
              <Button size="sm" variant="outline" onClick={() => setUpdateDateDialogOpen(true)}>
                <Calendar className="w-4 h-4 mr-2" />
                Update Event Date
              </Button>
              <Button size="sm" variant="secondary" onClick={waitlistSelected} disabled={selectedPendingCount === 0}>
                <UserX className="w-4 h-4 mr-2" />
                Waitlist ({selectedPendingCount})
              </Button>
              <Button size="sm" variant="destructive" onClick={bulkDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedIds.length})
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
                <X className="w-4 h-4 mr-2" />
                Clear Selection
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Registrations Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Registrations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {hasActiveFilters ? "No registrations match your filters" : "No registrations yet"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === filteredRegistrations.length && filteredRegistrations.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Tool</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Job Search</TableHead>
                  <TableHead>Target Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(reg.id)}
                        onCheckedChange={(checked) => handleSelectOne(reg.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reg.full_name}</div>
                        {reg.company && (
                          <div className="text-xs text-muted-foreground">{reg.company}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          reg.tool_type === "resume_suite" 
                            ? "border-amber-500/50 text-amber-700 bg-amber-500/10" 
                            : reg.tool_type === "linkedin_signal"
                            ? "border-blue-500/50 text-blue-700 bg-blue-500/10"
                            : reg.tool_type === "interview_prep"
                            ? "border-emerald-500/50 text-emerald-700 bg-emerald-500/10"
                            : "border-purple-500/50 text-purple-700 bg-purple-500/10"
                        }
                      >
                        {reg.tool_type === "resume_suite" ? "Resume" 
                          : reg.tool_type === "linkedin_signal" ? "LinkedIn" 
                          : reg.tool_type === "interview_prep" ? "Interview"
                          : "Advisor"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{reg.email}</div>
                        <div className="text-xs text-muted-foreground">{reg.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={reg.current_position}>
                      {reg.current_position}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {getJobSearchLabel(reg.job_search_status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={reg.target_roles}>
                      {reg.target_roles}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(reg.status)}
                        {reg.zoom_link_sent && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <Video className="w-3 h-3" />
                            Zoom sent
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{format(new Date(reg.created_at), "MMM d, yyyy")}</div>
                        <div className="text-xs text-muted-foreground">{format(new Date(reg.created_at), "h:mm a")}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {reg.status === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => {
                                setSelectedIds([reg.id]);
                                setInviteDialogOpen(true);
                              }}>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Invite
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(reg.id, "waitlisted")}>
                                <UserX className="w-4 h-4 mr-2" />
                                Waitlist
                              </DropdownMenuItem>
                            </>
                          )}
                          {reg.status === "invited" && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedIds([reg.id]);
                              setReminderDialogOpen(true);
                            }}>
                              <Bell className="w-4 h-4 mr-2" />
                              Send Reminder
                            </DropdownMenuItem>
                          )}
                          {reg.status === "waitlisted" && (
                            <DropdownMenuItem onClick={() => updateStatus(reg.id, "pending")}>
                              <Clock className="w-4 h-4 mr-2" />
                              Move to Pending
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditDialog(reg)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Registration
                          </DropdownMenuItem>
                          {reg.linkedin_url && (
                            <DropdownMenuItem asChild>
                              <a href={reg.linkedin_url} target="_blank" rel="noopener noreferrer">
                                View LinkedIn
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <a href={`mailto:${reg.email}`}>
                              <Mail className="w-4 h-4 mr-2" />
                              Email Directly
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => openDeleteDialog(reg.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Invite with Zoom Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Zoom Meeting Link *</Label>
              <Input
                value={zoomLink}
                onChange={(e) => setZoomLink(e.target.value)}
                placeholder="https://zoom.us/j/..."
              />
            </div>
            <div>
              <Label>Custom Message (optional)</Label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add any additional notes for the invitees..."
                rows={3}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              This will send invitations to {selectedPendingCount} pending applicant(s).
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendInvites} disabled={sendingInvites}>
              {sendingInvites ? "Sending..." : "Send Invites"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reminder Dialog */}
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Event Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Reminder Message (optional)</Label>
              <Textarea
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                placeholder="Add any additional notes for the reminder..."
                rows={3}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              This will send reminders to {selectedInvitedCount} invited participant(s).
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReminderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendReminders} disabled={sendingReminders}>
              {sendingReminders ? "Sending..." : "Send Reminders"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Email Dialog */}
      <Dialog open={bulkEmailDialogOpen} onOpenChange={setBulkEmailDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Bulk Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Email Subject *</Label>
              <Input
                value={bulkEmailSubject}
                onChange={(e) => setBulkEmailSubject(e.target.value)}
                placeholder="Enter email subject..."
              />
            </div>
            <div>
              <Label>Email Message *</Label>
              <Textarea
                value={bulkEmailMessage}
                onChange={(e) => setBulkEmailMessage(e.target.value)}
                placeholder="Enter your message here. Use {name} to personalize with recipient's name..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tip: Use {"{name}"} in your message to include the recipient's name.
              </p>
            </div>
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <strong>Recipients ({selectedIds.length}):</strong>
              <div className="mt-2 max-h-24 overflow-y-auto space-y-1">
                {filteredRegistrations
                  .filter(r => selectedIds.includes(r.id))
                  .map(r => (
                    <div key={r.id} className="text-xs">
                      {r.full_name} ({r.email})
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendBulkEmail} disabled={sendingBulkEmail}>
              {sendingBulkEmail ? "Sending..." : `Send to ${selectedIds.length} Recipients`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Registration Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRegistration ? "Edit Registration" : "Add New Registration"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <Label>Current Position</Label>
                <Input
                  value={formData.current_position}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_position: e.target.value }))}
                  placeholder="Product Manager"
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <Label>Target Roles</Label>
                <Input
                  value={formData.target_roles}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_roles: e.target.value }))}
                  placeholder="Senior PM, Director of Product"
                />
              </div>
              <div>
                <Label>LinkedIn URL</Label>
                <Input
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <Label>Tool Type</Label>
                <Select
                  value={formData.tool_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tool_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resume_suite">Resume Suite</SelectItem>
                    <SelectItem value="linkedin_signal">LinkedIn Signal</SelectItem>
                    <SelectItem value="interview_prep">Interview Prep</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Job Search Status</Label>
                <Select
                  value={formData.job_search_status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, job_search_status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actively_interviewing">Actively Interviewing</SelectItem>
                    <SelectItem value="preparing_soon">Preparing (1-2 months)</SelectItem>
                    <SelectItem value="exploring">Exploring (3+ months)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="invited">Invited</SelectItem>
                    <SelectItem value="waitlisted">Waitlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="agrees_communication"
                  checked={formData.agrees_to_communication}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agrees_to_communication: !!checked }))}
                />
                <Label htmlFor="agrees_communication" className="text-sm font-normal">Agrees to communication</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="understands_terms"
                  checked={formData.understands_beta_terms}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, understands_beta_terms: !!checked }))}
                />
                <Label htmlFor="understands_terms" className="text-sm font-normal">Understands beta terms</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="subscribe_newsletter"
                  checked={formData.subscribe_to_newsletter}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, subscribe_to_newsletter: !!checked }))}
                />
                <Label htmlFor="subscribe_newsletter" className="text-sm font-normal">Subscribe to newsletter</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveRegistration} disabled={savingRegistration}>
              {savingRegistration ? "Saving..." : (editingRegistration ? "Update" : "Add Registration")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Registration</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete this registration? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteRegistration} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Event Date Dialog */}
      <Dialog open={updateDateDialogOpen} onOpenChange={setUpdateDateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Event Date</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>New Event Date</Label>
              <Input
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              This will update the event date for {selectedIds.length} selected registration(s).
            </div>
            <div className="text-sm bg-muted/50 p-3 rounded-lg">
              <strong>Quick dates:</strong>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setNewEventDate("2026-01-14")}
                >
                  Jan 14 (Resume)
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setNewEventDate("2026-01-15")}
                >
                  Jan 15 (LinkedIn)
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setNewEventDate("2026-01-09")}
                >
                  Jan 9 (Interview)
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateEventDates} disabled={updatingDates || !newEventDate}>
              {updatingDates ? "Updating..." : "Update Dates"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
