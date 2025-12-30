import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  RefreshCw, Users, Clock, CheckCircle, Mail, Send, 
  MoreHorizontal, UserCheck, UserX, Trash2,
  Download, Bell, Search
} from "lucide-react";
import { format } from "date-fns";

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
        await supabase.functions.invoke("send-beta-invite-email", {
          body: {
            name: reg.full_name,
            email: reg.email,
            zoomLink: eventLink.trim(),
            customMessage: `${eventDate ? `Event Date: ${eventDate}\n\n` : ''}${customMessage.trim()}`,
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
            customMessage: reminderMessage.trim() || "This is a reminder about the upcoming AMA event. We look forward to seeing you there!",
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
    const headers = ["Name", "Email", "Role", "Question", "Status", "Registered At"];
    const rows = filteredRegistrations.map(r => [
      r.full_name,
      r.email,
      r.current_position,
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
                      <TableCell className="max-w-[200px] truncate" title={reg.target_roles}>
                        {reg.target_roles || "—"}
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
              <Label>Event Date & Time</Label>
              <Input
                placeholder="January 15, 2025 at 6-7pm CST"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
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
            <p className="text-sm text-muted-foreground">
              This will send invites to {selectedPendingCount} pending registration(s).
            </p>
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
            <div className="space-y-2">
              <Label>Reminder Message</Label>
              <Textarea
                placeholder="Reminder about the upcoming AMA event..."
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                rows={4}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This will send reminders to {selectedInvitedCount} invited attendee(s).
            </p>
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
    </div>
  );
}
