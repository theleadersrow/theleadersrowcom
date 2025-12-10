import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LogOut, Users, RefreshCw, Plus, Copy, Check } from "lucide-react";

interface Enrollment {
  id: string;
  enrolled_at: string;
  payment_status: string;
  user_id: string | null;
  program_id: string;
  enrollment_code: string | null;
  email: string | null;
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

const Admin = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newProgramId, setNewProgramId] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("pending");
  const [isCreating, setIsCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
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
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(data);
      
      if (!data) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/dashboard");
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
            id,
            enrolled_at,
            payment_status,
            user_id,
            program_id,
            enrollment_code,
            email,
            profiles!enrollments_user_id_fkey (
              full_name,
              email
            ),
            programs!enrollments_program_id_fkey (
              name,
              start_date
            )
          `)
          .order("enrolled_at", { ascending: false }),
        supabase.from("programs").select("id, name")
      ]);

      if (enrollmentsRes.error) {
        console.error("Error fetching enrollments:", enrollmentsRes.error);
        toast.error("Failed to load enrollments");
      } else {
        setEnrollments(enrollmentsRes.data as unknown as Enrollment[]);
      }

      if (programsRes.data) {
        setPrograms(programsRes.data);
      }

      setLoadingData(false);
    };

    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const refreshData = async () => {
    setLoadingData(true);
    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        id,
        enrolled_at,
        payment_status,
        user_id,
        program_id,
        enrollment_code,
        email,
        profiles!enrollments_user_id_fkey (
          full_name,
          email
        ),
        programs!enrollments_program_id_fkey (
          name,
          start_date
        )
      `)
      .order("enrolled_at", { ascending: false });

    if (error) {
      toast.error("Failed to refresh data");
    } else {
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

    setIsCreating(true);

    try {
      const { data, error } = await supabase
        .from("enrollments")
        .insert({
          program_id: newProgramId,
          email: newEmail || null,
          payment_status: newPaymentStatus,
          user_id: null,
        })
        .select("enrollment_code")
        .single();

      if (error) {
        toast.error("Failed to create enrollment");
        console.error(error);
      } else {
        toast.success(`Enrollment created! Code: ${data.enrollment_code}`);
        setNewEmail("");
        setNewProgramId("");
        setNewPaymentStatus("pending");
        setShowForm(false);
        refreshData();
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Admin Portal
          </h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Member View
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Create Enrollment Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Enrollment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createEnrollment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Member Email (optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="member@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="program">Program</Label>
                    <Select value={newProgramId} onValueChange={setNewProgramId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Payment Status</Label>
                    <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
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
                  <Plus className="h-4 w-4 mr-2" />
                  New Enrollment
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
                      <TableHead>Enrollment Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Enrolled Date</TableHead>
                      <TableHead>Payment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          {enrollment.enrollment_code ? (
                            <div className="flex items-center gap-2">
                              <code className="bg-muted px-2 py-1 rounded text-xs">
                                {enrollment.enrollment_code}
                              </code>
                              <button
                                onClick={() => copyCode(enrollment.enrollment_code!)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                {copiedCode === enrollment.enrollment_code ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={enrollment.user_id ? "default" : "secondary"}>
                            {enrollment.user_id ? "Claimed" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {enrollment.profiles?.full_name || "—"}
                        </TableCell>
                        <TableCell>
                          {enrollment.profiles?.email || enrollment.email || "—"}
                        </TableCell>
                        <TableCell>{enrollment.programs?.name || "—"}</TableCell>
                        <TableCell>
                          {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={enrollment.payment_status === "paid" ? "default" : "secondary"}
                          >
                            {enrollment.payment_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
