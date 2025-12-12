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
import { Switch } from "@/components/ui/switch";
import { RefreshCw, Quote, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Testimonial {
  id: string;
  name: string;
  email: string;
  role: string | null;
  company: string | null;
  quote: string;
  outcome: string | null;
  rating: number | null;
  program: string | null;
  is_published: boolean;
  created_at: string;
}

export function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchTestimonials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTestimonials(data as Testimonial[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const togglePublish = async (id: string, currentStatus: boolean) => {
    setUpdating(id);
    const { error } = await supabase
      .from("testimonials")
      .update({ 
        is_published: !currentStatus,
        published_at: !currentStatus ? new Date().toISOString() : null
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update testimonial");
    } else {
      toast.success(currentStatus ? "Testimonial unpublished" : "Testimonial published to website");
      fetchTestimonials();
    }
    setUpdating(null);
  };

  const deleteTestimonial = async (id: string) => {
    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete testimonial");
    } else {
      toast.success("Testimonial deleted");
      fetchTestimonials();
    }
  };

  const publishedCount = testimonials.filter((t) => t.is_published).length;

  const getProgramLabel = (program: string | null) => {
    const labels: Record<string, string> = {
      "200k-method": "200K Method",
      "weekly-edge": "Weekly Edge",
      "ai-career-coach": "AI Career Coach",
      other: "Other",
    };
    return labels[program || ""] || program || "—";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Quote className="h-5 w-5" />
          Testimonials ({testimonials.length})
          <Badge variant="secondary" className="ml-2">
            {publishedCount} published
          </Badge>
        </CardTitle>
        <Button variant="outline" size="sm" onClick={fetchTestimonials}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No testimonials yet</div>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className={`border rounded-lg p-4 ${
                  testimonial.is_published
                    ? "border-green-200 bg-green-50/50"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{testimonial.name}</span>
                      {testimonial.role && (
                        <span className="text-muted-foreground text-sm">
                          • {testimonial.role}
                          {testimonial.company && ` at ${testimonial.company}`}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= (testimonial.rating || 0)
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-foreground text-sm leading-relaxed">
                      "{testimonial.quote}"
                    </p>

                    <div className="flex items-center gap-2 flex-wrap text-sm">
                      {testimonial.outcome && (
                        <Badge variant="outline" className="text-green-700">
                          {testimonial.outcome}
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        {getProgramLabel(testimonial.program)}
                      </Badge>
                      <span className="text-muted-foreground">
                        {new Date(testimonial.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">{testimonial.email}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {testimonial.is_published ? "Published" : "Draft"}
                      </span>
                      <Switch
                        checked={testimonial.is_published}
                        disabled={updating === testimonial.id}
                        onCheckedChange={() => togglePublish(testimonial.id, testimonial.is_published)}
                      />
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this testimonial from {testimonial.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteTestimonial(testimonial.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}