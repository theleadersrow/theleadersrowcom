import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Plus, Search, Filter, Sparkles, Copy, 
  Edit, Trash2, BookOpen, Clock, TrendingUp, Users,
  Target, Brain, Zap, BarChart3, Crown, Download
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface STARBankLibraryProps {
  sessionToken: string;
  onBack: () => void;
}

interface STARStory {
  id: string;
  title: string;
  theme_tags: string[];
  situation: string;
  task: string;
  action: string;
  result: string;
  metrics: { label: string; value: string }[];
  scope: { users: string; revenue: string; cost: string; team_size: string };
  stakeholders: string[];
  competency_tags: string[];
  level_signal: string;
  confidence_score: number;
  version_30sec: string;
  version_2min: string;
  version_deep_dive: string;
  best_categories: string[];
  usage_count: number;
  last_used_at: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  product_sense: "Product Sense",
  strategy: "Strategy",
  execution: "Execution",
  data_metrics: "Data & Metrics",
  influence: "Influence",
  leadership: "Leadership",
};

const LEVELS = ["PM", "Senior", "Principal", "GPM", "Director"];

export function STARBankLibrary({ sessionToken, onBack }: STARBankLibraryProps) {
  const [stories, setStories] = useState<STARStory[]>([]);
  const [filteredStories, setFilteredStories] = useState<STARStory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedStory, setSelectedStory] = useState<STARStory | null>(null);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [newStory, setNewStory] = useState({
    title: "",
    situation: "",
    task: "",
    action: "",
    result: "",
    competency_tags: [] as string[],
    level_signal: "Senior",
    metrics: [] as { label: string; value: string }[],
    stakeholders: [] as string[],
    theme_tags: [] as string[]
  });

  useEffect(() => {
    loadStories();
  }, [sessionToken]);

  useEffect(() => {
    filterStories();
  }, [stories, searchQuery, filterCategory, filterLevel]);

  const loadStories = async () => {
    try {
      const { data, error } = await supabase
        .from("star_bank")
        .select("*")
        .eq("session_token", sessionToken)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStories((data || []).map(s => ({
        ...s,
        metrics: (s.metrics as any[]) || [],
        scope: (s.scope as any) || {},
      })));
    } catch (e) {
      console.error("Error loading stories:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const filterStories = () => {
    let filtered = [...stories];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(query) ||
        s.situation.toLowerCase().includes(query) ||
        s.result.toLowerCase().includes(query) ||
        s.theme_tags.some(t => t.toLowerCase().includes(query))
      );
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(s => 
        s.competency_tags.includes(filterCategory) ||
        s.best_categories?.includes(filterCategory)
      );
    }

    if (filterLevel !== "all") {
      filtered = filtered.filter(s => s.level_signal === filterLevel);
    }

    setFilteredStories(filtered);
  };

  const handleAddStory = async () => {
    if (!newStory.title || !newStory.situation || !newStory.task || !newStory.action || !newStory.result) {
      toast.error("Please fill in all STAR fields");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("star_bank")
        .insert({
          session_token: sessionToken,
          title: newStory.title,
          situation: newStory.situation,
          task: newStory.task,
          action: newStory.action,
          result: newStory.result,
          competency_tags: newStory.competency_tags,
          level_signal: newStory.level_signal,
          metrics: newStory.metrics,
          stakeholders: newStory.stakeholders,
          theme_tags: newStory.theme_tags
        })
        .select()
        .single();

      if (error) throw error;

      setStories(prev => [data as any, ...prev]);
      setShowAddDialog(false);
      setNewStory({
        title: "",
        situation: "",
        task: "",
        action: "",
        result: "",
        competency_tags: [],
        level_signal: "Senior",
        metrics: [],
        stakeholders: [],
        theme_tags: []
      });
      toast.success("Story added to your STAR bank!");
    } catch (e) {
      console.error("Error adding story:", e);
      toast.error("Failed to add story");
    }
  };

  const handleGenerateVariants = async (story: STARStory) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-star-variants", {
        body: { storyId: story.id, story }
      });

      if (error) throw error;

      // Update story with generated variants
      await supabase
        .from("star_bank")
        .update({
          version_30sec: data.version_30sec,
          version_2min: data.version_2min,
          version_deep_dive: data.version_deep_dive,
          best_categories: data.best_categories
        })
        .eq("id", story.id);

      // Update local state
      setStories(prev => prev.map(s => 
        s.id === story.id 
          ? { ...s, ...data } 
          : s
      ));

      if (selectedStory?.id === story.id) {
        setSelectedStory({ ...selectedStory, ...data });
      }

      toast.success("Variants generated!");
    } catch (e) {
      console.error("Error generating variants:", e);
      toast.error("Failed to generate variants");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteStory = async (id: string) => {
    try {
      await supabase.from("star_bank").delete().eq("id", id);
      setStories(prev => prev.filter(s => s.id !== id));
      toast.success("Story deleted");
    } catch (e) {
      toast.error("Failed to delete story");
    }
  };

  const handleExportBank = () => {
    const content = stories.map(s => `
# ${s.title}
Level: ${s.level_signal}
Categories: ${s.competency_tags.join(", ")}

## Situation
${s.situation}

## Task
${s.task}

## Action
${s.action}

## Result
${s.result}

---
`).join("\n");

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "star-bank.md";
    a.click();
  };

  const toggleCompetencyTag = (tag: string) => {
    setNewStory(prev => ({
      ...prev,
      competency_tags: prev.competency_tags.includes(tag)
        ? prev.competency_tags.filter(t => t !== tag)
        : [...prev.competency_tags, tag]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-emerald-500" />
              STAR Bank Library
            </h1>
            <p className="text-muted-foreground">
              {stories.length} stories in your library
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportBank}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Story
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New STAR Story</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Story Title</Label>
                  <Input
                    value={newStory.title}
                    onChange={e => setNewStory(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Led payment platform redesign"
                  />
                </div>
                <div>
                  <Label>Situation</Label>
                  <Textarea
                    value={newStory.situation}
                    onChange={e => setNewStory(prev => ({ ...prev, situation: e.target.value }))}
                    placeholder="Set the context. What was the challenge or opportunity?"
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <Label>Task</Label>
                  <Textarea
                    value={newStory.task}
                    onChange={e => setNewStory(prev => ({ ...prev, task: e.target.value }))}
                    placeholder="What was your specific responsibility or goal?"
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <Label>Action</Label>
                  <Textarea
                    value={newStory.action}
                    onChange={e => setNewStory(prev => ({ ...prev, action: e.target.value }))}
                    placeholder="What did YOU specifically do? Be detailed about your contributions."
                    className="min-h-[100px]"
                  />
                </div>
                <div>
                  <Label>Result</Label>
                  <Textarea
                    value={newStory.result}
                    onChange={e => setNewStory(prev => ({ ...prev, result: e.target.value }))}
                    placeholder="What was the outcome? Include metrics and impact."
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <Label>Competency Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <Badge
                        key={key}
                        variant={newStory.competency_tags.includes(key) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleCompetencyTag(key)}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Level Signal</Label>
                  <Select 
                    value={newStory.level_signal}
                    onValueChange={v => setNewStory(prev => ({ ...prev, level_signal: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddStory} className="w-full">
                  Add to STAR Bank
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search stories..."
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterLevel} onValueChange={setFilterLevel}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {LEVELS.map(level => (
              <SelectItem key={level} value={level}>{level}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stories Grid */}
      {filteredStories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No stories yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start building your STAR story library to ace behavioral interviews
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Your First Story
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStories.map(story => (
            <Card 
              key={story.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedStory(story);
                setShowStoryModal(true);
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{story.title}</CardTitle>
                  <Badge variant="outline">{story.level_signal}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {story.result}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {story.competency_tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {CATEGORY_LABELS[tag] || tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Used {story.usage_count}x
                  </span>
                  {story.version_30sec && (
                    <Badge variant="outline" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" /> Variants ready
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Story Detail Modal */}
      <Dialog open={showStoryModal} onOpenChange={setShowStoryModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedStory && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <DialogTitle className="text-xl">{selectedStory.title}</DialogTitle>
                  <Badge>{selectedStory.level_signal}</Badge>
                </div>
              </DialogHeader>
              <Tabs defaultValue="full" className="mt-4">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="full">Full STAR</TabsTrigger>
                  <TabsTrigger value="30sec">30 sec</TabsTrigger>
                  <TabsTrigger value="2min">2 min</TabsTrigger>
                  <TabsTrigger value="deep">Deep Dive</TabsTrigger>
                </TabsList>
                
                <TabsContent value="full" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Situation</Label>
                    <p className="mt-1">{selectedStory.situation}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Task</Label>
                    <p className="mt-1">{selectedStory.task}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Action</Label>
                    <p className="mt-1">{selectedStory.action}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Result</Label>
                    <p className="mt-1">{selectedStory.result}</p>
                  </div>
                </TabsContent>

                <TabsContent value="30sec" className="mt-4">
                  {selectedStory.version_30sec ? (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p>{selectedStory.version_30sec}</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">Generate interview-ready versions with AI</p>
                      <Button onClick={() => handleGenerateVariants(selectedStory)} disabled={isGenerating}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        {isGenerating ? "Generating..." : "Generate Variants"}
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="2min" className="mt-4">
                  {selectedStory.version_2min ? (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="whitespace-pre-wrap">{selectedStory.version_2min}</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">Generate interview-ready versions with AI</p>
                      <Button onClick={() => handleGenerateVariants(selectedStory)} disabled={isGenerating}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        {isGenerating ? "Generating..." : "Generate Variants"}
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="deep" className="mt-4">
                  {selectedStory.version_deep_dive ? (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="whitespace-pre-wrap">{selectedStory.version_deep_dive}</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">Generate interview-ready versions with AI</p>
                      <Button onClick={() => handleGenerateVariants(selectedStory)} disabled={isGenerating}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        {isGenerating ? "Generating..." : "Generate Variants"}
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex flex-wrap gap-2 mt-4">
                <Label className="w-full text-sm text-muted-foreground">Best used for:</Label>
                {(selectedStory.best_categories || selectedStory.competency_tags).map(cat => (
                  <Badge key={cat} variant="secondary">
                    {CATEGORY_LABELS[cat] || cat}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => {
                  navigator.clipboard.writeText(
                    `${selectedStory.situation}\n\n${selectedStory.task}\n\n${selectedStory.action}\n\n${selectedStory.result}`
                  );
                  toast.success("Copied to clipboard!");
                }}>
                  <Copy className="h-4 w-4 mr-2" /> Copy
                </Button>
                <Button variant="outline" onClick={() => handleDeleteStory(selectedStory.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
