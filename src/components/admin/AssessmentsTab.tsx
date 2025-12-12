import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Brain, Download } from "lucide-react";
import { toast } from "sonner";

interface AssessmentSession {
  id: string;
  email: string | null;
  status: string | null;
  inferred_level: string | null;
  created_at: string;
  scored_at: string | null;
}

export function AssessmentsTab() {
  const [sessions, setSessions] = useState<AssessmentSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("assessment_sessions")
      .select("id, email, status, inferred_level, created_at, scored_at")
      .not("email", "is", null)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSessions(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const exportCSV = () => {
    const headers = ["Email", "Status", "Inferred Level", "Started", "Scored"];
    const rows = sessions.map((s) => [
      s.email || "",
      s.status || "",
      s.inferred_level || "",
      new Date(s.created_at).toLocaleDateString(),
      s.scored_at ? new Date(s.scored_at).toLocaleDateString() : "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assessments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Assessments exported");
  };

  const getStatusBadge = (status: string | null) => {
    const colors: Record<string, string> = {
      not_started: "bg-gray-100 text-gray-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      submitted: "bg-blue-100 text-blue-800",
      scored: "bg-green-100 text-green-800",
    };
    return colors[status || "not_started"] || "bg-gray-100 text-gray-800";
  };

  const completedCount = sessions.filter((s) => s.status === "scored").length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Assessment Takers ({sessions.length})
          <Badge variant="secondary" className="ml-2">
            {completedCount} completed
          </Badge>
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSessions}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No assessments yet</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Inferred Level</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Scored</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.email}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(session.status)}>
                        {session.status || "not_started"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {session.inferred_level ? (
                        <Badge variant="outline">{session.inferred_level}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(session.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {session.scored_at
                        ? new Date(session.scored_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}