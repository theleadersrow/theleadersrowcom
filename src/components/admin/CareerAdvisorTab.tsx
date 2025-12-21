import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { RefreshCw, Send, MessageSquare, Crown, Clock, DollarSign, Calendar, Eye, Bell } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface AdvisorSubscriber {
  id: string;
  email: string;
  name: string | null;
  customerId: string;
  subscriptionId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  amount: number;
  currency: string;
  interval: string;
  created: Date;
}

interface ChatSession {
  id: string;
  session_id: string;
  email: string | null;
  messages: unknown;
  user_profile_type: string | null;
  user_profile_context: string | null;
  created_at: string;
  updated_at: string;
}

interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: Date;
  description: string | null;
}

export const CareerAdvisorTab = () => {
  const [subscribers, setSubscribers] = useState<AdvisorSubscriber[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<PaymentHistory[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load chat sessions from database
      const { data: chats, error: chatsError } = await supabase
        .from("career_advisor_chats")
        .select("*")
        .order("updated_at", { ascending: false });

      if (chatsError) {
        console.error("Error loading chat sessions:", chatsError);
      } else {
        setChatSessions(chats || []);
      }

      // Load subscribers from Stripe via edge function
      const { data: subData, error: subError } = await supabase.functions.invoke(
        "get-advisor-subscribers"
      );

      if (subError) {
        console.error("Error loading subscribers:", subError);
        toast.error("Failed to load subscriber data");
      } else if (subData?.subscribers) {
        setSubscribers(
          subData.subscribers.map((sub: any) => ({
            ...sub,
            currentPeriodStart: new Date(sub.currentPeriodStart),
            currentPeriodEnd: new Date(sub.currentPeriodEnd),
            created: new Date(sub.created),
          }))
        );
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    }
    setLoading(false);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success("Data refreshed");
  };

  const sendExpiryReminder = async (email: string, daysUntilExpiry: number) => {
    setSendingReminder(email);
    try {
      const { data, error } = await supabase.functions.invoke(
        "send-advisor-expiry-reminder",
        {
          body: { email, daysUntilExpiry },
        }
      );

      if (error) throw error;
      toast.success(`Reminder sent to ${email}`);
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error("Failed to send reminder");
    }
    setSendingReminder(null);
  };

  const loadPaymentHistory = async (customerId: string) => {
    setLoadingPayments(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "get-advisor-payments",
        {
          body: { customerId },
        }
      );

      if (error) throw error;
      setSelectedPayments(
        (data?.payments || []).map((p: any) => ({
          ...p,
          created: new Date(p.created),
        }))
      );
    } catch (error) {
      console.error("Error loading payments:", error);
      toast.error("Failed to load payment history");
    }
    setLoadingPayments(false);
  };

  const getDaysUntilExpiry = (endDate: Date) => {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (status: string, cancelAtPeriodEnd: boolean) => {
    if (cancelAtPeriodEnd) {
      return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Canceling</Badge>;
    }
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Active</Badge>;
      case "past_due":
        return <Badge variant="destructive">Past Due</Badge>;
      case "canceled":
        return <Badge variant="secondary">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Crown className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{subscribers.filter(s => s.status === "active").length}</p>
                <p className="text-sm text-muted-foreground">Active Subscribers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{chatSessions.length}</p>
                <p className="text-sm text-muted-foreground">Total Chat Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {subscribers.filter(s => getDaysUntilExpiry(s.currentPeriodEnd) <= 7 && s.status === "active").length}
                </p>
                <p className="text-sm text-muted-foreground">Expiring Soon (7 days)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    subscribers.filter(s => s.status === "active").reduce((acc, s) => acc + s.amount, 0),
                    "usd"
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscribers Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Career Advisor Pro Subscribers
          </CardTitle>
          <Button variant="outline" size="sm" onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {subscribers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No subscribers yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((sub) => {
                  const daysUntilExpiry = getDaysUntilExpiry(sub.currentPeriodEnd);
                  const isExpiringSoon = daysUntilExpiry <= 7 && sub.status === "active";

                  return (
                    <TableRow key={sub.id} className={isExpiringSoon ? "bg-amber-500/5" : ""}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{sub.name || "—"}</p>
                          <p className="text-sm text-muted-foreground">{sub.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(sub.status, sub.cancelAtPeriodEnd)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(sub.created, "MMM d, yyyy")}</p>
                          <p className="text-muted-foreground">
                            {formatDistanceToNow(sub.created, { addSuffix: true })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(sub.currentPeriodEnd, "MMM d, yyyy")}</p>
                          {sub.status === "active" && (
                            <p className={`text-xs ${isExpiringSoon ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
                              {daysUntilExpiry <= 0 ? "Expires today" : `${daysUntilExpiry} days left`}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{formatCurrency(sub.amount, sub.currency)}</p>
                        <p className="text-xs text-muted-foreground">/{sub.interval}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadPaymentHistory(sub.customerId)}
                              >
                                <DollarSign className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>Payment History - {sub.email}</DialogTitle>
                              </DialogHeader>
                              {loadingPayments ? (
                                <div className="flex justify-center py-8">
                                  <RefreshCw className="h-6 w-6 animate-spin" />
                                </div>
                              ) : (
                                <ScrollArea className="max-h-[400px]">
                                  {selectedPayments.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-4">No payments found</p>
                                  ) : (
                                    <div className="space-y-3">
                                      {selectedPayments.map((payment) => (
                                        <div
                                          key={payment.id}
                                          className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                          <div>
                                            <p className="font-medium">
                                              {formatCurrency(payment.amount, payment.currency)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                              {format(payment.created, "MMM d, yyyy 'at' h:mm a")}
                                            </p>
                                          </div>
                                          <Badge
                                            variant={payment.status === "succeeded" ? "default" : "destructive"}
                                            className={payment.status === "succeeded" ? "bg-emerald-500" : ""}
                                          >
                                            {payment.status}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </ScrollArea>
                              )}
                            </DialogContent>
                          </Dialog>

                          {sub.status === "active" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => sendExpiryReminder(sub.email, daysUntilExpiry)}
                              disabled={sendingReminder === sub.email}
                            >
                              {sendingReminder === sub.email ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Bell className="h-4 w-4" />
                              )}
                            </Button>
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

      {/* Chat Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Chat Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chatSessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No chat sessions yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chatSessions.slice(0, 20).map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-mono text-xs">
                      {session.session_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{session.email || "Anonymous"}</TableCell>
                    <TableCell>
                      {session.user_profile_type ? (
                        <Badge variant="outline" className="capitalize">
                          {session.user_profile_type}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {Array.isArray(session.messages) ? (session.messages as any[]).length : 0} messages
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedChat(session)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              Chat Session - {session.email || "Anonymous"}
                              {session.user_profile_type && (
                                <Badge variant="outline" className="capitalize ml-2">
                                  {session.user_profile_type}
                                </Badge>
                              )}
                            </DialogTitle>
                            {session.user_profile_context && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Context: {session.user_profile_context}
                              </p>
                            )}
                          </DialogHeader>
                          <ScrollArea className="max-h-[60vh]">
                            <div className="space-y-4 pr-4">
                              {Array.isArray(session.messages) &&
                                session.messages.map((msg: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className={`p-3 rounded-lg ${
                                      msg.role === "user"
                                        ? "bg-primary/10 ml-8"
                                        : "bg-muted mr-8"
                                    }`}
                                  >
                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                      {msg.role === "user" ? "User" : "Advisor"}
                                    </p>
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                  </div>
                                ))}
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
