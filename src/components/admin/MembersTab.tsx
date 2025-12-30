import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Plus, Edit, Trash2, BookOpen, RefreshCw } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

interface Enrollment {
  id: string;
  user_id: string;
  program_id: string;
  payment_status: string;
  enrolled_at: string;
  program?: {
    name: string;
    slug: string;
  };
}

interface Program {
  id: string;
  name: string;
  slug: string;
}

const MembersTab = () => {
  const [members, setMembers] = useState<Profile[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", email: "" });
  const [selectedProgramId, setSelectedProgramId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all profiles (members)
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all enrollments with program info
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select(`
          *,
          program:programs(name, slug)
        `)
        .not("user_id", "is", null);

      if (enrollmentsError) throw enrollmentsError;

      // Fetch all programs
      const { data: programsData, error: programsError } = await supabase
        .from("programs")
        .select("id, name, slug")
        .order("name");

      if (programsError) throw programsError;

      setMembers(profilesData || []);
      setEnrollments(enrollmentsData || []);
      setPrograms(programsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load members data");
    } finally {
      setLoading(false);
    }
  };

  const getMemberEnrollments = (userId: string) => {
    return enrollments.filter((e) => e.user_id === userId);
  };

  const handleEditMember = (member: Profile) => {
    setSelectedMember(member);
    setEditForm({
      full_name: member.full_name || "",
      email: member.email,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedMember) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: editForm.full_name })
        .eq("id", selectedMember.id);

      if (error) throw error;

      toast.success("Member updated successfully");
      setIsEditDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error updating member:", error);
      toast.error("Failed to update member");
    }
  };

  const handleDeleteMember = async (member: Profile) => {
    if (!confirm(`Are you sure you want to remove ${member.full_name || member.email}? This will also remove all their enrollments.`)) {
      return;
    }

    try {
      // Delete enrollments first
      await supabase
        .from("enrollments")
        .delete()
        .eq("user_id", member.id);

      // Note: We can't delete from auth.users directly, but we can remove profile
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", member.id);

      if (error) throw error;

      toast.success("Member removed successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Failed to remove member");
    }
  };

  const handleOpenEnrollDialog = (member: Profile) => {
    setSelectedMember(member);
    setSelectedProgramId("");
    setIsEnrollDialogOpen(true);
  };

  const handleAddEnrollment = async () => {
    if (!selectedMember || !selectedProgramId) return;

    try {
      const { error } = await supabase.from("enrollments").insert({
        user_id: selectedMember.id,
        program_id: selectedProgramId,
        payment_status: "paid",
        email: selectedMember.email,
      });

      if (error) throw error;

      toast.success("Enrollment added successfully");
      setIsEnrollDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error adding enrollment:", error);
      toast.error("Failed to add enrollment");
    }
  };

  const handleRemoveEnrollment = async (enrollmentId: string) => {
    if (!confirm("Are you sure you want to remove this enrollment?")) return;

    try {
      const { error } = await supabase
        .from("enrollments")
        .delete()
        .eq("id", enrollmentId);

      if (error) throw error;

      toast.success("Enrollment removed");
      fetchData();
    } catch (error) {
      console.error("Error removing enrollment:", error);
      toast.error("Failed to remove enrollment");
    }
  };

  const handleUpdatePaymentStatus = async (enrollmentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("enrollments")
        .update({ payment_status: status })
        .eq("id", enrollmentId);

      if (error) throw error;

      toast.success("Payment status updated");
      fetchData();
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    }
  };

  const filteredMembers = members.filter(
    (member) =>
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const getPaymentBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Members & Enrollments ({members.length})
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline" size="icon" onClick={fetchData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Enrollments</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No members found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => {
                    const memberEnrollments = getMemberEnrollments(member.id);
                    return (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.full_name || "—"}
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          {new Date(member.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {memberEnrollments.length === 0 ? (
                              <span className="text-muted-foreground text-sm">No enrollments</span>
                            ) : (
                              memberEnrollments.map((enrollment) => (
                                <div key={enrollment.id} className="flex items-center gap-2">
                                  <Badge variant={getPaymentBadgeVariant(enrollment.payment_status)}>
                                    {enrollment.program?.name || "Unknown"}
                                  </Badge>
                                  <Select
                                    value={enrollment.payment_status}
                                    onValueChange={(value) =>
                                      handleUpdatePaymentStatus(enrollment.id, value)
                                    }
                                  >
                                    <SelectTrigger className="h-6 w-24 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="paid">Paid</SelectItem>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleRemoveEnrollment(enrollment.id)}
                                  >
                                    <Trash2 className="w-3 h-3 text-destructive" />
                                  </Button>
                                </div>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEnrollDialog(member)}
                              title="Add enrollment"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditMember(member)}
                              title="Edit member"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMember(member)}
                              title="Delete member"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={editForm.full_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, full_name: e.target.value })
                }
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input value={editForm.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Enrollment Dialog */}
      <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Enrollment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Add enrollment for: <strong>{selectedMember?.full_name || selectedMember?.email}</strong>
            </p>
            <div>
              <label className="text-sm font-medium">Select Program</label>
              <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a program..." />
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEnrollment} disabled={!selectedProgramId}>
                Add Enrollment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MembersTab;
