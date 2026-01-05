import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  RefreshCw, Users, Clock, CheckCircle, Mail, Send, 
  MoreHorizontal, UserCheck, UserX, Trash2,
  Download, Bell, Search, Star, Eye
} from "lucide-react";
import { format } from "date-fns";
import { AMAFeedbackPanel } from "./AMAFeedbackPanel";

interface AMARegistration {
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

export function AMARegistrationsTab() {
  const [registrations, setRegistrations] = useState<AMARegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "invited">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Invite dialog
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [eventLink, setEventLink] = useState("");
  const [eventDate, setEventDate] = useState("");
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

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Email preview
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewType, setPreviewType] = useState<"invite" | "reminder">("invite");

  // Reminder dialog with event details
  const [reminderEventDate, setReminderEventDate] = useState("");
  const [reminderZoomLink, setReminderZoomLink] = useState("");

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("beta_event_registrations")
        .select("*")
        .eq("tool_type", "ama_event")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error("Error fetching AMA registrations:", error);
      toast.error("Failed to load AMA registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [statusFilter]);

  const filteredRegistrations = useMemo(() => {
    if (!searchTerm) return registrations;
    const term = searchTerm.toLowerCase();
    return registrations.filter(reg => 
      reg.full_name.toLowerCase().includes(term) ||
      reg.email.toLowerCase().includes(term) ||
      reg.current_position.toLowerCase().includes(term)
    );
  }, [registrations, searchTerm]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredRegistrations.map(r => r.id));
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

  const updateStatus = async (id: string, status: string) => {
    try {
      const updates: Record<string, unknown> = { status };
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

  const openInviteDialog = () => {
    const pendingSelected = filteredRegistrations.filter(
      r => selectedIds.includes(r.id) && r.status === "pending"
    );
    if (pendingSelected.length === 0) {
      toast.error("Please select pending registrations to invite");
      return;
    }
    // Auto-populate with next AMA event details
    setEventDate("Wednesday, January 21, 2026 at 7-9pm CST");
    setInviteDialogOpen(true);
  };

  const sendInvites = async () => {
    if (!eventLink.trim()) {
      toast.error("Please enter the event link");
      return;
    }

    setSendingInvites(true);
    const pendingSelected = filteredRegistrations.filter(
      r => selectedIds.includes(r.id) && r.status === "pending"
    );

    try {
      for (const reg of pendingSelected) {
        await supabase.functions.invoke("send-ama-invite-email", {
          body: {
            name: reg.full_name,
            email: reg.email,
            zoomLink: eventLink.trim(),
            eventDateTime: eventDate.trim(),
            customMessage: customMessage.trim() || undefined,
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
      setEventLink("");
      setEventDate("");
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
    // Auto-populate with next AMA event details
    setReminderEventDate("Wednesday, January 21, 2026 at 7-9pm CST");
    setReminderDialogOpen(true);
  };

  const sendReminders = async () => {
    setSendingReminders(true);
    const invitedSelected = filteredRegistrations.filter(
      r => selectedIds.includes(r.id) && r.status === "invited"
    );

    try {
      for (const reg of invitedSelected) {
        await supabase.functions.invoke("send-ama-reminder-email", {
          body: {
            name: reg.full_name,
            email: reg.email,
            eventDateTime: reminderEventDate.trim() || undefined,
            zoomLink: reminderZoomLink.trim() || undefined,
            customMessage: reminderMessage.trim() || undefined,
          },
        });
      }

      toast.success(`Sent ${invitedSelected.length} reminder(s)`);
      setReminderDialogOpen(false);
      setReminderMessage("");
      setReminderEventDate("");
      setReminderZoomLink("");
      setSelectedIds([]);
    } catch (error) {
      console.error("Error sending reminders:", error);
      toast.error("Failed to send some reminders");
    } finally {
      setSendingReminders(false);
    }
  };

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

  const openDeleteDialog = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select registrations to delete");
      return;
    }
    setDeleteDialogOpen(true);
  };

  const deleteSelected = async () => {
    setDeleting(true);
    try {
      for (const id of selectedIds) {
        await supabase
          .from("beta_event_registrations")
          .delete()
          .eq("id", id);
      }
      toast.success(`Deleted ${selectedIds.length} registration(s)`);
      setDeleteDialogOpen(false);
      setSelectedIds([]);
      fetchRegistrations();
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete some registrations");
    } finally {
      setDeleting(false);
    }
  };

  const deleteSingle = async (id: string) => {
    try {
      const { error } = await supabase
        .from("beta_event_registrations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Registration deleted");
      fetchRegistrations();
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete registration");
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Role", "Event Date", "Question", "Status", "Registered At"];
    const rows = filteredRegistrations.map(r => [
      r.full_name,
      r.email,
      r.current_position,
      r.event_date ? format(new Date(r.event_date), "yyyy-MM-dd") : "",
      r.target_roles,
      r.status,
      format(new Date(r.created_at), "yyyy-MM-dd HH:mm"),
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ama-registrations-${format(new Date(), "yyyy-MM-dd")}.csv`;
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

  const pendingCount = registrations.filter(r => r.status === "pending").length;
  const invitedCount = registrations.filter(r => r.status === "invited").length;

  const selectedPendingCount = selectedIds.filter(id => 
    filteredRegistrations.find(r => r.id === id)?.status === "pending"
  ).length;

  const selectedInvitedCount = selectedIds.filter(id => 
    filteredRegistrations.find(r => r.id === id)?.status === "invited"
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total AMA Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrations.length}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-600">
              <Clock className="w-4 h-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              Invited
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{invitedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              AMA Event Registrations
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={fetchRegistrations} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("pending")}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === "invited" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("invited")}
              >
                Invited
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-muted rounded-lg mb-4">
              <span className="text-sm font-medium">{selectedIds.length} selected</span>
              <div className="h-4 w-px bg-border" />
              {selectedPendingCount > 0 && (
                <Button size="sm" onClick={openInviteDialog}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invite ({selectedPendingCount})
                </Button>
              )}
              {selectedInvitedCount > 0 && (
                <Button size="sm" variant="outline" onClick={openReminderDialog}>
                  <Bell className="w-4 h-4 mr-2" />
                  Send Reminder ({selectedInvitedCount})
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={openBulkEmailDialog}>
                <Mail className="w-4 h-4 mr-2" />
                Bulk Message
              </Button>
              <Button size="sm" variant="destructive" onClick={openDeleteDialog}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No AMA registrations found
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
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
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Event Date</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="w-12"></TableHead>
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
                      <TableCell className="font-medium">{reg.full_name}</TableCell>
                      <TableCell>{reg.email}</TableCell>
                      <TableCell>{reg.current_position}</TableCell>
                      <TableCell className="text-sm">
                        {reg.event_date ? format(new Date(reg.event_date), "MMM d, yyyy") : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        {reg.target_roles ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help truncate block">
                                  {reg.target_roles.length > 30 
                                    ? `${reg.target_roles.substring(0, 30)}...` 
                                    : reg.target_roles}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[400px] whitespace-pre-wrap">
                                <p className="text-sm">{reg.target_roles}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(reg.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(reg.created_at), "MMM d, yyyy")}
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
                              <DropdownMenuItem onClick={() => updateStatus(reg.id, "invited")}>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Mark as Invited
                              </DropdownMenuItem>
                            )}
                            {reg.status === "invited" && (
                              <DropdownMenuItem onClick={() => updateStatus(reg.id, "pending")}>
                                <UserX className="w-4 h-4 mr-2" />
                                Mark as Pending
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => deleteSingle(reg.id)}
                              className="text-destructive"
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send AMA Event Invite</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Event Link (Zoom/Meet) *</Label>
              <Input
                placeholder="https://zoom.us/j/..."
                value={eventLink}
                onChange={(e) => setEventLink(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Event Day, Date & Time *</Label>
              <Input
                placeholder="Wednesday, January 21, 2026 at 7-9pm CST"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Auto-filled with next AMA date. Edit if needed.</p>
            </div>
            <div className="space-y-2">
              <Label>Custom Message (optional)</Label>
              <Textarea
                placeholder="Add any additional information..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                This will send invites to {selectedPendingCount} pending registration(s).
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setPreviewType("invite"); setPreviewDialogOpen(true); }}
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send AMA Event Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Event Day, Date & Time</Label>
              <Input
                placeholder="Wednesday, January 21, 2026 at 7-9pm CST"
                value={reminderEventDate}
                onChange={(e) => setReminderEventDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Zoom Link (optional)</Label>
              <Input
                placeholder="https://zoom.us/j/..."
                value={reminderZoomLink}
                onChange={(e) => setReminderZoomLink(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Custom Message (optional)</Label>
              <Textarea
                placeholder="Add any additional reminders or notes..."
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                This will send reminders to {selectedInvitedCount} invited attendee(s).
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setPreviewType("reminder"); setPreviewDialogOpen(true); }}
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Bulk Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email Subject *</Label>
              <Input
                placeholder="Subject line..."
                value={bulkEmailSubject}
                onChange={(e) => setBulkEmailSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                placeholder="Your message..."
                value={bulkEmailMessage}
                onChange={(e) => setBulkEmailMessage(e.target.value)}
                rows={5}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This will send an email to {selectedIds.length} recipient(s).
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendBulkEmail} disabled={sendingBulkEmail}>
              {sendingBulkEmail ? "Sending..." : "Send Emails"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Registrations</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete {selectedIds.length} registration(s)?</p>
            <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteSelected} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Email Preview - {previewType === "invite" ? "AMA Invite" : "AMA Reminder"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {previewType === "invite" ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b">
                  <p className="text-sm"><strong>Subject:</strong> 🎤 You're Invited! Monthly AMA: Career Acceleration - {eventDate || "Wednesday, January 21, 2026 at 7-9pm CST"}</p>
                  <p className="text-sm"><strong>From:</strong> The Leader's Row &lt;hello@theleadersrow.com&gt;</p>
                </div>
                <div className="p-0 bg-background">
                  <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ background: 'linear-gradient(135deg, #1a1f2e 0%, #2d3548 100%)', padding: '30px', textAlign: 'center' }}>
                      <h1 style={{ color: '#d4a853', margin: 0, fontSize: '28px' }}>🎤 You're Invited!</h1>
                      <p style={{ color: '#e0e0e0', marginTop: '10px', fontSize: '18px' }}>Monthly AMA: Career Acceleration</p>
                    </div>
                    
                    {/* Body */}
                    <div style={{ padding: '30px' }}>
                      <p style={{ fontSize: '16px', marginBottom: '20px' }}>Hi [First Name],</p>
                      
                      <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                        Thank you for registering for our <strong>Monthly AMA (Ask Me Anything): Career Acceleration</strong> session! Here are your event details:
                      </p>
                      
                      {/* Event Details Box */}
                      <div style={{ background: '#1a1f2e', color: '#fff', padding: '25px', borderRadius: '8px', margin: '25px 0' }}>
                        <h3 style={{ color: '#d4a853', margin: '0 0 15px 0', fontSize: '18px' }}>📅 Event Details</h3>
                        <p style={{ margin: '8px 0', fontSize: '15px' }}>🗓️ <strong>Date & Time:</strong> {eventDate || "Wednesday, January 21, 2026 at 7-9pm CST"}</p>
                        <p style={{ margin: '8px 0', fontSize: '15px' }}>💻 <strong>Format:</strong> Live Zoom Q&A Session</p>
                        <p style={{ margin: '8px 0', fontSize: '15px' }}>⏱️ <strong>Duration:</strong> 2 hours</p>
                      </div>
                      
                      {/* Zoom Button */}
                      <div style={{ textAlign: 'center', margin: '30px 0' }}>
                        <span style={{ background: 'linear-gradient(135deg, #d4a853 0%, #b8942e 100%)', color: '#1a1f2e', padding: '16px 32px', borderRadius: '8px', fontWeight: 700, display: 'inline-block', fontSize: '16px' }}>
                          🎥 Join Zoom Meeting
                        </span>
                      </div>
                      
                      {eventLink && (
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '25px', textAlign: 'center' }}>
                          <strong>Zoom Link:</strong> <span style={{ color: '#d4a853' }}>{eventLink}</span>
                        </p>
                      )}
                      
                      {customMessage && (
                        <div style={{ background: '#f8f9fa', borderLeft: '4px solid #d4a853', padding: '15px 20px', borderRadius: '0 8px 8px 0', margin: '25px 0' }}>
                          <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>{customMessage}</p>
                        </div>
                      )}
                      
                      {/* What to Expect */}
                      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', margin: '25px 0' }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#1a1f2e', fontSize: '16px' }}>📝 What to Expect</h3>
                        <ul style={{ fontSize: '14px', paddingLeft: '20px', margin: 0, color: '#555' }}>
                          <li style={{ marginBottom: '8px' }}>Live, unscripted Q&A with career experts</li>
                          <li style={{ marginBottom: '8px' }}>Direct answers to your career questions</li>
                          <li style={{ marginBottom: '8px' }}>Topics: leveling up, negotiating offers, career transitions, executive presence</li>
                          <li style={{ marginBottom: '8px' }}>Hear from peers facing similar challenges</li>
                        </ul>
                      </div>
                      
                      {/* Tips */}
                      <div style={{ background: '#fff9e6', padding: '20px', borderRadius: '8px', margin: '25px 0' }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#1a1f2e', fontSize: '16px' }}>💡 Tips for the Session</h3>
                        <ul style={{ fontSize: '14px', paddingLeft: '20px', margin: 0, color: '#555' }}>
                          <li style={{ marginBottom: '8px' }}>Join a few minutes early to get settled</li>
                          <li style={{ marginBottom: '8px' }}>Have your questions ready (or think of new ones during the session!)</li>
                          <li style={{ marginBottom: '8px' }}>Use the chat or raise hand feature to ask questions</li>
                          <li style={{ marginBottom: '8px' }}>Take notes on insights that resonate with you</li>
                        </ul>
                      </div>
                      
                      <p style={{ fontSize: '16px', marginTop: '30px' }}>
                        We're excited to have you join us for this interactive session!
                      </p>
                      
                      <p style={{ fontSize: '14px', color: '#666', marginTop: '20px' }}>
                        Questions? Reply to this email or reach out to us at <span style={{ color: '#d4a853' }}>theleadersrow@gmail.com</span>
                      </p>
                      
                      <p style={{ fontSize: '16px', marginTop: '25px', marginBottom: 0 }}>
                        See you there!<br/><br/>
                        <strong>The Leader's Row Team</strong>
                      </p>
                    </div>
                    
                    {/* Footer */}
                    <div style={{ textAlign: 'center', padding: '20px', color: '#888', fontSize: '12px' }}>
                      <p style={{ margin: '5px 0' }}>© 2026 The Leader's Row. All rights reserved.</p>
                      <p style={{ margin: '5px 0' }}><span style={{ color: '#d4a853' }}>theleadersrow.com</span></p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b">
                  <p className="text-sm"><strong>Subject:</strong> 🔔 Reminder: Your AMA Session is Coming Up!</p>
                  <p className="text-sm"><strong>From:</strong> Leaders Row &lt;events@rimocareers.com&gt;</p>
                </div>
                <div className="p-0 bg-background">
                  <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px', backgroundColor: '#f5f5f5' }}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔔</div>
                        <h1 style={{ color: '#1a1a1a', fontSize: '24px', margin: 0 }}>Event Reminder</h1>
                        <p style={{ color: '#6b7280', marginTop: '5px' }}>Your AMA Session is Coming Up!</p>
                      </div>
                      
                      <p style={{ fontSize: '16px' }}>Hi [Name],</p>
                      
                      <p style={{ fontSize: '16px' }}>This is a friendly reminder about the upcoming <strong>Monthly Career Acceleration AMA</strong> session!</p>
                      
                      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '25px', margin: '25px 0', color: 'white', textAlign: 'center' }}>
                        <h2 style={{ margin: '0 0 15px 0', fontSize: '20px' }}>📅 Event Details</h2>
                        <p style={{ margin: '5px 0', fontSize: '18px' }}><strong>{reminderEventDate || "Wednesday, January 21, 2026 at 7-9pm CST"}</strong></p>
                      </div>
                      
                      {reminderMessage && (
                        <div style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b', borderRadius: '0 8px 8px 0', padding: '15px', margin: '20px 0' }}>
                          <p style={{ margin: 0, color: '#92400e' }}>{reminderMessage}</p>
                        </div>
                      )}
                      
                      {reminderZoomLink && (
                        <div style={{ textAlign: 'center', margin: '30px 0' }}>
                          <span style={{ display: 'inline-block', background: '#2563eb', color: 'white', padding: '16px 40px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' }}>Join Zoom Meeting</span>
                        </div>
                      )}
                      
                      <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '20px', margin: '20px 0' }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#166534', fontSize: '16px' }}>💡 Quick Reminders:</h3>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#15803d' }}>
                          <li style={{ marginBottom: '8px' }}>Join 5 minutes early to test your audio/video</li>
                          <li style={{ marginBottom: '8px' }}>Have your questions ready</li>
                          <li style={{ marginBottom: '8px' }}>Bring a notepad to capture insights</li>
                          <li>Engage with other attendees' questions for bonus value</li>
                        </ul>
                      </div>
                      
                      <p style={{ fontSize: '16px' }}>We're excited to see you there!</p>
                      
                      <p style={{ marginTop: '30px', fontSize: '16px' }}>
                        Best regards,<br/>
                        <strong>The Leaders Row Team</strong>
                      </p>
                    </div>
                    
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>
                        You're receiving this because you registered for the Leaders Row Monthly AMA.<br/>
                        <span style={{ color: '#6b7280' }}>Contact Support</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Tab Section */}
      <div className="mt-8 pt-8 border-t">
        <Tabs defaultValue="registrations" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="registrations" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Registrations
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Feedback
            </TabsTrigger>
          </TabsList>
          <TabsContent value="registrations">
            <p className="text-sm text-muted-foreground">
              Registration data is shown in the table above.
            </p>
          </TabsContent>
          <TabsContent value="feedback">
            <AMAFeedbackPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
