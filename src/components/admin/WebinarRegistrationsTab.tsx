import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { RefreshCw, Users, Download, Search, Calendar, Mail, CheckCircle, Filter, X } from "lucide-react";
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

interface ColumnFilters {
  name: string;
  email: string;
  status: string;
  registered_after: string;
}

export function WebinarRegistrationsTab() {
  const [registrations, setRegistrations] = useState<WebinarRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Column filters
  const [showFilters, setShowFilters] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({
    name: "",
    email: "",
    status: "all",
    registered_after: "",
  });

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

  // Apply column filters
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
      // Status filter
      if (columnFilters.status !== "all" && reg.status !== columnFilters.status) {
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
      status: "all",
      registered_after: "",
    });
  };

  const hasActiveFilters = useMemo(() => {
    return columnFilters.name !== "" ||
      columnFilters.email !== "" ||
      columnFilters.status !== "all" ||
      columnFilters.registered_after !== "";
  }, [columnFilters]);

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
    toast.success(`Exported ${filteredRegistrations.length} registration(s) to CSV`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "email_sent":
        return <Badge className="bg-green-500/20 text-green-600">Email Sent</Badge>;
      case "attended":
        return <Badge className="bg-blue-500/20 text-blue-600">Attended</Badge>;
      case "no_show":
        return <Badge variant="destructive">No Show</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700">Pending</Badge>;
      default:
        return <Badge variant="outline">Registered</Badge>;
    }
  };

  const updateRegistrationStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("webinar_registrations")
        .update({ 
          status: newStatus,
          confirmation_sent: newStatus === "email_sent"
        })
        .eq("id", id);

      if (error) throw error;

      setRegistrations(prev => prev.map(reg => 
        reg.id === id 
          ? { ...reg, status: newStatus, confirmation_sent: newStatus === "email_sent" } 
          : reg
      ));
      toast.success(`Status updated to "${newStatus}"`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const markSelectedAsEmailSent = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      const { error } = await supabase
        .from("webinar_registrations")
        .update({ status: "email_sent", confirmation_sent: true })
        .in("id", selectedIds);

      if (error) throw error;

      setRegistrations(prev => prev.map(reg => 
        selectedIds.includes(reg.id) 
          ? { ...reg, status: "email_sent", confirmation_sent: true } 
          : reg
      ));
      setSelectedIds([]);
      toast.success(`Marked ${selectedIds.length} registration(s) as email sent`);
    } catch (error) {
      console.error("Error updating statuses:", error);
      toast.error("Failed to update statuses");
    }
  };

  const pendingCount = registrations.filter(r => r.status === "pending").length;
  const emailSentCount = registrations.filter(r => r.status === "email_sent" || r.confirmation_sent).length;
  const attendedCount = registrations.filter(r => r.status === "attended").length;
  const noShowCount = registrations.filter(r => r.status === "no_show").length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total
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
            <div className="text-lg font-semibold">Jan 15, 2026</div>
            <div className="text-sm text-muted-foreground">7:30 PM Central</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Emails Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{emailSentCount}</div>
            <div className="text-sm text-muted-foreground">{pendingCount} pending</div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
              Attended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{attendedCount}</div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
              No Show
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{noShowCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            The 200K Method Webinar
          </CardTitle>
          
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
            {selectedIds.length > 0 && (
              <Button variant="secondary" size="sm" onClick={markSelectedAsEmailSent}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Email Sent ({selectedIds.length})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={fetchRegistrations} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV} disabled={filteredRegistrations.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export {hasActiveFilters ? `(${filteredRegistrations.length})` : ""}
            </Button>
          </div>
        </div>

        {/* Column Filters */}
        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                <Label className="text-xs mb-1.5 block">Status</Label>
                <Select
                  value={columnFilters.status}
                  onValueChange={(value) => setColumnFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="email_sent">Email Sent</SelectItem>
                    <SelectItem value="attended">Attended</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
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
      </div>

      {/* Registrations Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {hasActiveFilters ? "No registrations match your filters." : "No registrations yet."}
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
                    <TableHead>Registered</TableHead>
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
                      <TableCell>
                        <Select
                          value={reg.status}
                          onValueChange={(value) => updateRegistrationStatus(reg.id, value)}
                        >
                          <SelectTrigger className="h-8 w-[130px]">
                            <SelectValue>{getStatusBadge(reg.status)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-background border shadow-lg z-50">
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="email_sent">Email Sent</SelectItem>
                            <SelectItem value="attended">Attended</SelectItem>
                            <SelectItem value="no_show">No Show</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(reg.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </TableCell>
                    </TableRow>
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
