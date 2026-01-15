import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RefreshCw, Users, Download, Search, Calendar, Mail, CheckCircle, Send, MailCheck } from "lucide-react";
import { format } from "date-fns";

interface WebinarRegistration {
  id: string;
  full_name: string;
  email: string;
  webinar_title: string;
  webinar_date: string;
  status: string;
  confirmation_sent: boolean;
  created_at: string;
}

const DEFAULT_ZOOM_LINK = "https://zoom.us/j/97216217059?pwd=OMqa5Bi6L4BBeoDfnO9tCdGK6AAShn.1";
const DEFAULT_EMAIL_SUBJECT = "Reminder: The 200K Method Webinar - Thursday, January 15th";
const DEFAULT_EMAIL_BODY = `Hi there,

This is a reminder that The 200K Method webinar is happening soon!

📅 Date: Thursday, January 15th, 2026
⏰ Time: 7:30 PM Central (1 hour)
📍 Where: Zoom

🔗 Join Zoom Meeting:
{zoom_link}

What You'll Learn:
• The exact framework used to land $200K+ offers
• How to position yourself for senior roles
• Negotiation strategies that maximize compensation
• Live Q&A with real examples

See you there!
The Leader's Row Team`;

export function WebinarRegistrationsTab() {
  const [registrations, setRegistrations] = useState<WebinarRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Email dialog state
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [bulkEmailDialogOpen, setBulkEmailDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<WebinarRegistration | null>(null);
  const [emailSubject, setEmailSubject] = useState(DEFAULT_EMAIL_SUBJECT);
  const [emailBody, setEmailBody] = useState(DEFAULT_EMAIL_BODY);
  const [zoomLink, setZoomLink] = useState(DEFAULT_ZOOM_LINK);
  const [isSending, setIsSending] = useState(false);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("webinar_registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error("Error fetching webinar registrations:", error);
      toast.error("Failed to load webinar registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const filteredRegistrations = registrations.filter(reg => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      reg.full_name.toLowerCase().includes(term) ||
      reg.email.toLowerCase().includes(term)
    );
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredRegistrations.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const openSingleEmailDialog = (registration: WebinarRegistration) => {
    setSelectedRegistration(registration);
    setEmailSubject(DEFAULT_EMAIL_SUBJECT);
    setEmailBody(DEFAULT_EMAIL_BODY);
    setZoomLink(DEFAULT_ZOOM_LINK);
    setEmailDialogOpen(true);
  };

  const openBulkEmailDialog = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one registrant");
      return;
    }
    setEmailSubject(DEFAULT_EMAIL_SUBJECT);
    setEmailBody(DEFAULT_EMAIL_BODY);
    setZoomLink(DEFAULT_ZOOM_LINK);
    setBulkEmailDialogOpen(true);
  };

  const getFormattedEmail = (name: string, zoom: string) => {
    return emailBody
      .replace(/{name}/g, name.split(" ")[0])
      .replace(/{zoom_link}/g, zoom || "[ZOOM LINK]");
  };

  const sendSingleEmail = async () => {
    if (!selectedRegistration || !zoomLink.trim()) {
      toast.error("Please enter the Zoom link");
      return;
    }

    setIsSending(true);
    try {
      const formattedBody = getFormattedEmail(selectedRegistration.full_name, zoomLink);
      
      const { error } = await supabase.functions.invoke("send-webinar-email", {
        body: {
          to: selectedRegistration.email,
          name: selectedRegistration.full_name,
          subject: emailSubject,
          body: formattedBody,
          zoomLink: zoomLink,
        },
      });

      if (error) throw error;

      toast.success(`Email sent to ${selectedRegistration.email}`);
      setEmailDialogOpen(false);
      setSelectedRegistration(null);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  const sendBulkEmails = async () => {
    if (!zoomLink.trim()) {
      toast.error("Please enter the Zoom link");
      return;
    }

    const selectedRegistrations = registrations.filter(r => selectedIds.includes(r.id));
    if (selectedRegistrations.length === 0) {
      toast.error("No registrants selected");
      return;
    }

    setIsSending(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const reg of selectedRegistrations) {
        const formattedBody = getFormattedEmail(reg.full_name, zoomLink);
        
        try {
          const { error } = await supabase.functions.invoke("send-webinar-email", {
            body: {
              to: reg.email,
              name: reg.full_name,
              subject: emailSubject,
              body: formattedBody,
              zoomLink: zoomLink,
            },
          });

          if (error) {
            console.error(`Error sending to ${reg.email}:`, error);
            failCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`Error sending to ${reg.email}:`, err);
          failCount++;
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (failCount === 0) {
        toast.success(`Successfully sent ${successCount} email(s)`);
      } else {
        toast.warning(`Sent ${successCount} email(s), ${failCount} failed`);
      }

      setBulkEmailDialogOpen(false);
      setSelectedIds([]);
    } catch (error) {
      console.error("Error sending bulk emails:", error);
      toast.error("Failed to send emails");
    } finally {
      setIsSending(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Webinar", "Webinar Date", "Status", "Registered At"];
    const rows = filteredRegistrations.map(r => [
      r.full_name,
      r.email,
      r.webinar_title,
      r.webinar_date ? format(new Date(r.webinar_date), "yyyy-MM-dd HH:mm") : "",
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
    a.download = `webinar-registrations-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to CSV");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "attended":
        return <Badge className="bg-green-500/20 text-green-600">Attended</Badge>;
      case "no_show":
        return <Badge variant="destructive">No Show</Badge>;
      default:
        return <Badge variant="outline">Registered</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Webinar Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">Jan 15, 2025</div>
            <div className="text-sm text-muted-foreground">7:30 PM Central</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Confirmations Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {registrations.filter(r => r.confirmation_sent).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registrations Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              The 200K Method Webinar
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {selectedIds.length > 0 && (
                <Button variant="default" size="sm" onClick={openBulkEmailDialog}>
                  <Send className="w-4 h-4 mr-2" />
                  Send to {selectedIds.length} Selected
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={fetchRegistrations} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV} disabled={registrations.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No registrations match your search." : "No registrations yet."}
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
                    <TableHead>Status</TableHead>
                    <TableHead>Confirmation</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(reg.id)}
                          onCheckedChange={(checked) => handleSelectOne(reg.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{reg.full_name}</TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${reg.email}`}
                          className="text-secondary hover:underline flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" />
                          {reg.email}
                        </a>
                      </TableCell>
                      <TableCell>{getStatusBadge(reg.status)}</TableCell>
                      <TableCell>
                        {reg.confirmation_sent ? (
                          <Badge variant="outline" className="text-green-600 border-green-600/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Sent
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(reg.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openSingleEmailDialog(reg)}
                        >
                          <MailCheck className="w-4 h-4 mr-1" />
                          Send Email
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Single Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Send Email to {selectedRegistration?.full_name}
            </DialogTitle>
            <DialogDescription>
              Customize and send an email to this registrant
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="zoom-link">Zoom Link (Required)</Label>
              <Input
                id="zoom-link"
                placeholder="https://zoom.us/j/..."
                value={zoomLink}
                onChange={(e) => setZoomLink(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-body">
                Email Body <span className="text-muted-foreground text-xs">(Use {"{name}"} and {"{zoom_link}"} as placeholders)</span>
              </Label>
              <Textarea
                id="email-body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            {zoomLink && selectedRegistration && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="bg-muted/50 p-4 rounded-lg text-sm whitespace-pre-wrap border">
                  {getFormattedEmail(selectedRegistration.full_name, zoomLink)}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendSingleEmail} disabled={isSending || !zoomLink.trim()}>
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Email Dialog */}
      <Dialog open={bulkEmailDialogOpen} onOpenChange={setBulkEmailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send Bulk Email ({selectedIds.length} recipients)
            </DialogTitle>
            <DialogDescription>
              This email will be sent to all selected registrants
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm font-medium mb-2">Recipients:</p>
              <div className="flex flex-wrap gap-1">
                {registrations
                  .filter(r => selectedIds.includes(r.id))
                  .slice(0, 10)
                  .map(r => (
                    <Badge key={r.id} variant="secondary" className="text-xs">
                      {r.full_name}
                    </Badge>
                  ))}
                {selectedIds.length > 10 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedIds.length - 10} more
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-zoom-link">Zoom Link (Required)</Label>
              <Input
                id="bulk-zoom-link"
                placeholder="https://zoom.us/j/..."
                value={zoomLink}
                onChange={(e) => setZoomLink(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bulk-email-subject">Subject</Label>
              <Input
                id="bulk-email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bulk-email-body">
                Email Body <span className="text-muted-foreground text-xs">(Use {"{name}"} and {"{zoom_link}"} as placeholders)</span>
              </Label>
              <Textarea
                id="bulk-email-body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            {zoomLink && (
              <div className="space-y-2">
                <Label>Preview (for first recipient)</Label>
                <div className="bg-muted/50 p-4 rounded-lg text-sm whitespace-pre-wrap border">
                  {getFormattedEmail(
                    registrations.find(r => selectedIds.includes(r.id))?.full_name || "User",
                    zoomLink
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendBulkEmails} disabled={isSending || !zoomLink.trim()}>
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send to {selectedIds.length} Recipients
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
