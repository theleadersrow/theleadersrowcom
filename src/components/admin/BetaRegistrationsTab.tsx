import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  RefreshCw, Users, Clock, CheckCircle, Mail, Send, 
  MoreHorizontal, UserCheck, UserX, Video, Calendar,
  Download, Bell
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
}

export function BetaRegistrationsTab() {
  const [registrations, setRegistrations] = useState<BetaRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "invited" | "waitlisted">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Invite dialog
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [zoomLink, setZoomLink] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [sendingInvites, setSendingInvites] = useState(false);
  
  // Reminder dialog
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [reminderMessage, setReminderMessage] = useState("");
  const [sendingReminders, setSendingReminders] = useState(false);

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
      const filteredIds = registrations
        .filter(r => statusFilter === "all" || r.status === statusFilter)
        .map(r => r.id);
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
    const pendingSelected = registrations.filter(
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
    const pendingSelected = registrations.filter(
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
    const invitedSelected = registrations.filter(
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
    const invitedSelected = registrations.filter(
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

  const waitlistSelected = async () => {
    const pendingSelected = registrations.filter(
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
    const rows = registrations.map(r => [
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
          {selectedIds.length > 0 && (
            <>
              <Button size="sm" onClick={openInviteDialog}>
                <Send className="w-4 h-4 mr-2" />
                Invite Selected ({selectedIds.filter(id => 
                  registrations.find(r => r.id === id)?.status === "pending"
                ).length})
              </Button>
              <Button size="sm" variant="outline" onClick={openReminderDialog}>
                <Bell className="w-4 h-4 mr-2" />
                Send Reminders
              </Button>
              <Button size="sm" variant="secondary" onClick={waitlistSelected}>
                <UserX className="w-4 h-4 mr-2" />
                Waitlist
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={fetchRegistrations}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Registrations Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Beta Event: January 6, 2026
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No registrations yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === registrations.length && registrations.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
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
                {registrations.map((reg) => (
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
              This will send invitations to {selectedIds.filter(id => 
                registrations.find(r => r.id === id)?.status === "pending"
              ).length} pending applicant(s).
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
              This will send reminders to {selectedIds.filter(id => 
                registrations.find(r => r.id === id)?.status === "invited"
              ).length} invited participant(s).
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
    </div>
  );
}
