import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Play, Zap, Target, BookOpen, Settings, Clock, 
  Brain, TrendingUp, Users, BarChart3, Crown, Sparkles,
  ChevronRight, Briefcase, Building2
} from "lucide-react";
import type { InterviewUserProfile, SessionConfig } from "@/pages/PMInterview";

interface InterviewHomeProps {
  userProfile: InterviewUserProfile;
  onUpdateProfile: (profile: InterviewUserProfile) => void;
  onStartSession: (config: SessionConfig) => void;
  onViewSTARBank: () => void;
}

const CATEGORIES = [
  { id: "product_sense", label: "Product Sense", icon: Brain, color: "bg-purple-500/10 text-purple-600 border-purple-200" },
  { id: "strategy", label: "Strategy", icon: Target, color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  { id: "execution", label: "Execution", icon: Zap, color: "bg-orange-500/10 text-orange-600 border-orange-200" },
  { id: "data_metrics", label: "Data & Metrics", icon: BarChart3, color: "bg-green-500/10 text-green-600 border-green-200" },
  { id: "influence", label: "Influence", icon: Users, color: "bg-pink-500/10 text-pink-600 border-pink-200" },
  { id: "leadership", label: "Leadership", icon: Crown, color: "bg-amber-500/10 text-amber-600 border-amber-200" },
];

const LEVELS = ["PM", "Senior", "Principal", "GPM", "Director"];
const COMPANY_TYPES = ["FAANG", "Startup", "Enterprise", "Growth", "Other"];

export function InterviewHome({ userProfile, onUpdateProfile, onStartSession, onViewSTARBank }: InterviewHomeProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [editProfile, setEditProfile] = useState(userProfile);

  const handleStartFullLoop = () => {
    onStartSession({
      interviewType: "full_loop",
      selectedCategories: CATEGORIES.map(c => c.id),
      targetLevel: userProfile.targetRoleLevel,
      targetCompany: userProfile.targetCompanyType
    });
  };

  const handleStartCategoryDrill = () => {
    if (selectedCategories.length > 0) {
      onStartSession({
        interviewType: "category_drill",
        selectedCategories,
        targetLevel: userProfile.targetRoleLevel,
        targetCompany: userProfile.targetCompanyType
      });
      setShowCategoryPicker(false);
    }
  };

  const handleStartRapidFire = () => {
    onStartSession({
      interviewType: "rapid_fire",
      selectedCategories: CATEGORIES.map(c => c.id),
      targetLevel: userProfile.targetRoleLevel,
      targetCompany: userProfile.targetCompanyType
    });
  };

  const handleSaveProfile = () => {
    onUpdateProfile(editProfile);
    setShowSettings(false);
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          PM Interview Intelligence
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Practice Like a <span className="text-secondary">Hiring Committee</span> is Watching
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          AI-powered mock interviews with real-time scoring, level calibration, and personalized coaching 
          to help you land your target PM role.
        </p>
      </div>

      {/* Target Role Settings Panel */}
      <Card className="mb-8 border-2 border-dashed border-muted-foreground/20">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Target:</span>
                <Badge variant="secondary" className="font-semibold">
                  {userProfile.targetRoleLevel} PM
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Company:</span>
                <Badge variant="outline">
                  {userProfile.targetCompanyType}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Domain:</span>
                <Badge variant="outline">
                  {userProfile.domainFocus || "General"}
                </Badge>
              </div>
            </div>
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Target Role Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      value={editProfile.name}
                      onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editProfile.email}
                      onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Level</Label>
                    <Select 
                      value={editProfile.targetRoleLevel} 
                      onValueChange={(v) => setEditProfile({ ...editProfile, targetRoleLevel: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEVELS.map(level => (
                          <SelectItem key={level} value={level}>{level} PM</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Company Type</Label>
                    <Select 
                      value={editProfile.targetCompanyType} 
                      onValueChange={(v) => setEditProfile({ ...editProfile, targetCompanyType: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domain">Domain Focus</Label>
                    <Input
                      id="domain"
                      value={editProfile.domainFocus}
                      onChange={(e) => setEditProfile({ ...editProfile, domainFocus: e.target.value })}
                      placeholder="e.g., B2B SaaS, Consumer, AI/ML"
                    />
                  </div>
                  <Button onClick={handleSaveProfile} className="w-full">
                    Save Settings
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Interview Mode Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Full Loop */}
        <Card className="group hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer" onClick={handleStartFullLoop}>
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
              <Play className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Full Loop</CardTitle>
            <CardDescription>Complete interview simulation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Clock className="h-4 w-4" />
              <span>45-60 min</span>
              <span className="mx-2">•</span>
              <span>12-15 questions</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Covers all 6 PM categories with real-time scoring and committee feedback.
            </p>
            <Button className="w-full group-hover:bg-primary">
              Start Interview <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Category Drill */}
        <Dialog open={showCategoryPicker} onOpenChange={setShowCategoryPicker}>
          <DialogTrigger asChild>
            <Card className="group hover:border-secondary/50 hover:shadow-lg transition-all cursor-pointer">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-2 group-hover:bg-secondary/20 transition-colors">
                  <Target className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">Category Drill</CardTitle>
                <CardDescription>Focus on specific areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock className="h-4 w-4" />
                  <span>20-30 min</span>
                  <span className="mx-2">•</span>
                  <span>5-8 questions</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Deep dive into 1-2 categories to strengthen weak areas.
                </p>
                <Button variant="secondary" className="w-full">
                  Choose Categories <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Select Categories to Drill</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-4">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{cat.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {isSelected ? "Selected" : "Click to select"}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <Button 
              onClick={handleStartCategoryDrill} 
              disabled={selectedCategories.length === 0}
              className="w-full"
            >
              Start Drill ({selectedCategories.length} selected)
            </Button>
          </DialogContent>
        </Dialog>

        {/* Rapid Fire */}
        <Card className="group hover:border-orange-500/50 hover:shadow-lg transition-all cursor-pointer" onClick={handleStartRapidFire}>
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-2 group-hover:bg-orange-500/20 transition-colors">
              <Zap className="h-6 w-6 text-orange-500" />
            </div>
            <CardTitle className="text-xl">Rapid Fire</CardTitle>
            <CardDescription>Quick practice session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Clock className="h-4 w-4" />
              <span>10 min</span>
              <span className="mx-2">•</span>
              <span>5 questions</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Fast-paced questions to sharpen your instincts under pressure.
            </p>
            <Button variant="outline" className="w-full border-orange-500/50 text-orange-600 hover:bg-orange-500/10">
              Quick Start <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* STAR Bank */}
        <Card className="group hover:border-emerald-500/50 hover:shadow-lg transition-all cursor-pointer" onClick={onViewSTARBank}>
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-2 group-hover:bg-emerald-500/20 transition-colors">
              <BookOpen className="h-6 w-6 text-emerald-500" />
            </div>
            <CardTitle className="text-xl">STAR Bank</CardTitle>
            <CardDescription>Your story library</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <TrendingUp className="h-4 w-4" />
              <span>Build your narrative</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Curate and polish stories that prove your capabilities across all dimensions.
            </p>
            <Button variant="outline" className="w-full border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10">
              View Library <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Category Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">PM Interview Dimensions</CardTitle>
          <CardDescription>
            Every question and answer is evaluated across these 6 core competencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <div key={cat.id} className={`p-4 rounded-lg border ${cat.color}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{cat.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {cat.id === "product_sense" && "User empathy, problem selection, prioritization logic"}
                    {cat.id === "strategy" && "Long-term thinking, market awareness, sequencing"}
                    {cat.id === "execution" && "Shipping ability, ambiguity handling, cross-functional leadership"}
                    {cat.id === "data_metrics" && "Metric hierarchy, experimentation, judgment under uncertainty"}
                    {cat.id === "influence" && "Conflict resolution, influence without authority, communication"}
                    {cat.id === "leadership" && "People leadership, self-awareness, scaling impact"}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
