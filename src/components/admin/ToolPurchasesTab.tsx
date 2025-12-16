import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { RefreshCw, FileText, Linkedin, XCircle, Clock, CheckCircle, AlertCircle, Mail, CalendarClock, Send } from "lucide-react";
import { format, formatDistanceToNow, isPast, differenceInDays } from "date-fns";

interface ToolPurchase {
  id: string;
  email: string;
  tool_type: string;
  stripe_session_id: string | null;
  purchased_at: string;
  expires_at: string;
  usage_count: number;
  last_used_at: string | null;
  status: string;
  results_summary: any;
  reminder_sent_at: string | null;
}

export function ToolPurchasesTab() {
  const [purchases, setPurchases] = useState<ToolPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "resume_suite" | "linkedin_signal">("all");
  const [view, setView] = useState<"all" | "expiring" | "reminders">("all");

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("tool_purchases")
        .select("*")
        .order("purchased_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("tool_type", filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      toast.error("Failed to load purchases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [filter]);

  const cancelPurchase = async (id: string) => {
    try {
      const { error } = await supabase
        .from("tool_purchases")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Purchase cancelled");
      fetchPurchases();
    } catch (error) {
      console.error("Error cancelling purchase:", error);
      toast.error("Failed to cancel purchase");
    }
  };

  const expireOldPurchases = async () => {
    try {
      const { error } = await supabase
        .from("tool_purchases")
        .update({ status: "expired" })
        .eq("status", "active")
        .lt("expires_at", new Date().toISOString());

      if (error) throw error;
      toast.success("Expired purchases updated");
      fetchPurchases();
    } catch (error) {
      console.error("Error expiring purchases:", error);
      toast.error("Failed to expire purchases");
    }
  };

  const sendManualReminder = async (purchaseId: string, email: string) => {
    try {
      toast.loading("Sending reminder...", { id: "reminder" });
      const { data, error } = await supabase.functions.invoke("send-expiry-reminders", {
        body: { purchase_id: purchaseId },
      });

      if (error) throw error;
      
      toast.success(`Reminder sent to ${email}`, { id: "reminder" });
      fetchPurchases();
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error("Failed to send reminder", { id: "reminder" });
    }
  };

  const getToolLabel = (toolType: string) => {
    return toolType === "resume_suite" ? "Resume Intelligence Suite" : "LinkedIn Signal Score";
  };

  const getToolIcon = (toolType: string) => {
    return toolType === "resume_suite" ? (
      <FileText className="w-4 h-4 text-amber-600" />
    ) : (
      <Linkedin className="w-4 h-4 text-blue-600" />
    );
  };

  const getStatusBadge = (purchase: ToolPurchase) => {
    const isExpired = isPast(new Date(purchase.expires_at));
    
    if (purchase.status === "cancelled") {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    if (purchase.status === "expired" || isExpired) {
      return <Badge variant="secondary">Expired</Badge>;
    }
    return <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">Active</Badge>;
  };

  const resumePurchases = purchases.filter(p => p.tool_type === "resume_suite");
  const linkedinPurchases = purchases.filter(p => p.tool_type === "linkedin_signal");
  const activePurchases = purchases.filter(p => p.status === "active" && !isPast(new Date(p.expires_at)));
  
  // Expiring soon (within 7 days)
  const expiringSoon = purchases.filter(p => {
    if (p.status !== "active") return false;
    const expiresAt = new Date(p.expires_at);
    if (isPast(expiresAt)) return false;
    const daysLeft = differenceInDays(expiresAt, new Date());
    return daysLeft <= 7;
  });

  // Purchases with reminders sent
  const remindersSent = purchases.filter(p => p.reminder_sent_at !== null);

  // Get filtered data based on view
  const getDisplayPurchases = () => {
    switch (view) {
      case "expiring":
        return expiringSoon;
      case "reminders":
        return remindersSent;
      default:
        return purchases;
    }
  };

  const displayPurchases = getDisplayPurchases();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchases.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activePurchases.length}</div>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-600">
              <CalendarClock className="w-4 h-4" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{expiringSoon.length}</div>
            <p className="text-xs text-muted-foreground">within 7 days</p>
          </CardContent>
        </Card>
        <Card className="border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-600">
              <Mail className="w-4 h-4" />
              Reminders Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{remindersSent.length}</div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              Resume Suite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{resumePurchases.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* View Tabs */}
      <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-1">
            All Purchases
          </TabsTrigger>
          <TabsTrigger value="expiring" className="flex items-center gap-1">
            <CalendarClock className="w-3 h-3" />
            Expiring ({expiringSoon.length})
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center gap-1">
            <Mail className="w-3 h-3" />
            Reminders ({remindersSent.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tool Type Filter & Actions */}
      <div className="flex items-center justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All Tools</TabsTrigger>
            <TabsTrigger value="resume_suite" className="flex items-center gap-1">
              <FileText className="w-3 h-3" /> Resume
            </TabsTrigger>
            <TabsTrigger value="linkedin_signal" className="flex items-center gap-1">
              <Linkedin className="w-3 h-3" /> LinkedIn
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expireOldPurchases}>
            <Clock className="w-4 h-4 mr-2" />
            Expire Old
          </Button>
          <Button variant="outline" size="sm" onClick={fetchPurchases}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Purchases Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            {view === "expiring" && "Expiring Soon (within 7 days)"}
            {view === "reminders" && "Reminder Email History"}
            {view === "all" && "All Purchases"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : displayPurchases.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {view === "expiring" && "No purchases expiring soon"}
              {view === "reminders" && "No reminder emails sent yet"}
              {view === "all" && "No purchases found"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tool</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Purchased</TableHead>
                  <TableHead>Expires</TableHead>
                  {view === "expiring" && <TableHead>Days Left</TableHead>}
                  {view === "reminders" && <TableHead>Reminder Sent</TableHead>}
                  <TableHead>Usage</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayPurchases.map((purchase) => {
                  const daysLeft = differenceInDays(new Date(purchase.expires_at), new Date());
                  
                  return (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getToolIcon(purchase.tool_type)}
                          <span className="text-sm">{getToolLabel(purchase.tool_type)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{purchase.email}</TableCell>
                      <TableCell>{getStatusBadge(purchase)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(purchase.purchased_at), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(purchase.expires_at), "MMM d, yyyy")}
                          <div className="text-xs text-muted-foreground">
                            {isPast(new Date(purchase.expires_at)) 
                              ? "Expired" 
                              : `${formatDistanceToNow(new Date(purchase.expires_at))} left`}
                          </div>
                        </div>
                      </TableCell>
                      {view === "expiring" && (
                        <TableCell>
                          <Badge 
                            variant={daysLeft <= 3 ? "destructive" : "outline"}
                            className={daysLeft <= 3 ? "" : "border-orange-500 text-orange-600"}
                          >
                            {daysLeft} day{daysLeft !== 1 ? "s" : ""}
                          </Badge>
                        </TableCell>
                      )}
                      {view === "reminders" && (
                        <TableCell>
                          {purchase.reminder_sent_at ? (
                            <div className="flex items-center gap-1 text-sm text-purple-600">
                              <CheckCircle className="w-3 h-3" />
                              {format(new Date(purchase.reminder_sent_at), "MMM d, h:mm a")}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Not sent</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge variant="outline">{purchase.usage_count} times</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {purchase.status === "active" && !isPast(new Date(purchase.expires_at)) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => sendManualReminder(purchase.id, purchase.email)}
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                title="Send reminder email"
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => cancelPurchase(purchase.id)}
                                className="text-destructive hover:text-destructive"
                                title="Cancel purchase"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
