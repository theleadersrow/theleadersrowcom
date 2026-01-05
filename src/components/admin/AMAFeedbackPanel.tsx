import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { RefreshCw, Star, ThumbsUp, MessageSquare, TrendingUp, Quote } from "lucide-react";
import { format } from "date-fns";

interface AMAFeedback {
  id: string;
  email: string;
  full_name: string | null;
  event_date: string;
  overall_rating: number;
  content_quality: number | null;
  speaker_quality: number | null;
  would_recommend: boolean | null;
  most_valuable: string | null;
  suggestions: string | null;
  topics_for_next: string | null;
  testimonial: string | null;
  allow_testimonial_use: boolean;
  created_at: string;
}

export function AMAFeedbackPanel() {
  const [feedback, setFeedback] = useState<AMAFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<AMAFeedback | null>(null);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ama_feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  // Calculate stats
  const totalResponses = feedback.length;
  const avgOverall = totalResponses > 0 
    ? (feedback.reduce((sum, f) => sum + f.overall_rating, 0) / totalResponses).toFixed(1)
    : "0";
  const avgContent = feedback.filter(f => f.content_quality).length > 0
    ? (feedback.filter(f => f.content_quality).reduce((sum, f) => sum + (f.content_quality || 0), 0) / feedback.filter(f => f.content_quality).length).toFixed(1)
    : "0";
  const avgSpeaker = feedback.filter(f => f.speaker_quality).length > 0
    ? (feedback.filter(f => f.speaker_quality).reduce((sum, f) => sum + (f.speaker_quality || 0), 0) / feedback.filter(f => f.speaker_quality).length).toFixed(1)
    : "0";
  const recommendRate = feedback.filter(f => f.would_recommend !== null).length > 0
    ? Math.round((feedback.filter(f => f.would_recommend === true).length / feedback.filter(f => f.would_recommend !== null).length) * 100)
    : 0;
  const testimonialCount = feedback.filter(f => f.testimonial && f.allow_testimonial_use).length;

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-muted-foreground">—</span>;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{avgOverall}/5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgContent}/5</div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
              <ThumbsUp className="w-4 h-4" />
              Would Recommend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{recommendRate}%</div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 flex items-center gap-2">
              <Quote className="w-4 h-4" />
              Testimonials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{testimonialCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Feedback Responses
            </CardTitle>
            <Button variant="outline" size="sm" onClick={fetchFeedback} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : feedback.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No feedback received yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name/Email</TableHead>
                    <TableHead>Overall</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Speaker</TableHead>
                    <TableHead>Recommend</TableHead>
                    <TableHead>Testimonial</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedback.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(f.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{f.full_name || "Anonymous"}</div>
                        <div className="text-xs text-muted-foreground">{f.email}</div>
                      </TableCell>
                      <TableCell>{renderStars(f.overall_rating)}</TableCell>
                      <TableCell>{renderStars(f.content_quality)}</TableCell>
                      <TableCell>{renderStars(f.speaker_quality)}</TableCell>
                      <TableCell>
                        {f.would_recommend === true && (
                          <Badge className="bg-green-500/20 text-green-600">Yes</Badge>
                        )}
                        {f.would_recommend === false && (
                          <Badge variant="destructive">No</Badge>
                        )}
                        {f.would_recommend === null && (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {f.testimonial && f.allow_testimonial_use ? (
                          <Badge className="bg-purple-500/20 text-purple-600">Available</Badge>
                        ) : f.testimonial ? (
                          <Badge variant="outline">Private</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedFeedback(f)}
                        >
                          View
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-medium">
                    {format(new Date(selectedFeedback.created_at), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Event Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedFeedback.event_date), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedFeedback.full_name || "Anonymous"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedFeedback.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-4 border-y">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Overall</p>
                  {renderStars(selectedFeedback.overall_rating)}
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Content</p>
                  {renderStars(selectedFeedback.content_quality)}
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Speaker</p>
                  {renderStars(selectedFeedback.speaker_quality)}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Would Recommend</p>
                <p className="font-medium">
                  {selectedFeedback.would_recommend === true ? "Yes" : 
                   selectedFeedback.would_recommend === false ? "No" : "Not specified"}
                </p>
              </div>

              {selectedFeedback.most_valuable && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Most Valuable</p>
                  <p className="bg-muted/50 rounded-lg p-3">{selectedFeedback.most_valuable}</p>
                </div>
              )}

              {selectedFeedback.suggestions && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Suggestions</p>
                  <p className="bg-muted/50 rounded-lg p-3">{selectedFeedback.suggestions}</p>
                </div>
              )}

              {selectedFeedback.topics_for_next && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Topics for Next</p>
                  <p className="bg-muted/50 rounded-lg p-3">{selectedFeedback.topics_for_next}</p>
                </div>
              )}

              {selectedFeedback.testimonial && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Quote className="w-4 h-4 text-purple-500" />
                    <p className="text-sm font-medium">Testimonial</p>
                    {selectedFeedback.allow_testimonial_use ? (
                      <Badge className="bg-green-500/20 text-green-600 text-xs">Can Use</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Private</Badge>
                    )}
                  </div>
                  <p className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3 italic">
                    "{selectedFeedback.testimonial}"
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}