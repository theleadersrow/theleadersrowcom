import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Target, Plus, Check, Trash2, ChevronUp, ChevronDown, 
  Calendar, Edit2, X, Loader2 
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Goal {
  id: string;
  title: string;
  description?: string;
  target_date?: string;
  status: "in_progress" | "completed";
  progress: number;
  created_at: string;
}

interface GoalTrackerProps {
  sessionId: string;
  email?: string;
}

export function GoalTracker({ sessionId, email }: GoalTrackerProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editProgress, setEditProgress] = useState(0);

  useEffect(() => {
    loadGoals();
  }, [sessionId]);

  const loadGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('career_advisor_goals')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals((data || []) as Goal[]);
    } catch (error) {
      console.error("Error loading goals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoalTitle.trim()) return;

    try {
      const { data, error } = await supabase
        .from('career_advisor_goals')
        .insert([{
          session_id: sessionId,
          email: email || null,
          title: newGoalTitle.trim(),
          status: 'in_progress',
          progress: 0
        }])
        .select()
        .single();

      if (error) throw error;
      setGoals(prev => [data as Goal, ...prev]);
      setNewGoalTitle("");
      setIsAdding(false);
      toast.success("Goal added!");
    } catch (error) {
      console.error("Error adding goal:", error);
      toast.error("Failed to add goal");
    }
  };

  const updateProgress = async (goalId: string, newProgress: number) => {
    const status = newProgress >= 100 ? 'completed' : 'in_progress';
    
    try {
      const { error } = await supabase
        .from('career_advisor_goals')
        .update({ 
          progress: newProgress, 
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', goalId);

      if (error) throw error;
      
      setGoals(prev => prev.map(g => 
        g.id === goalId ? { ...g, progress: newProgress, status } : g
      ));
      setEditingId(null);
      
      if (status === 'completed') {
        toast.success("Congratulations! Goal completed! 🎉");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Failed to update progress");
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('career_advisor_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      setGoals(prev => prev.filter(g => g.id !== goalId));
      toast.success("Goal removed");
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    }
  };

  const activeGoals = goals.filter(g => g.status === 'in_progress');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const overallProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
    : 0;

  if (isLoading) {
    return (
      <div className="border rounded-lg p-3 bg-muted/30">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading goals...
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-muted/30 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-medium">Career Goals</span>
          <span className="text-xs text-muted-foreground">
            ({activeGoals.length} active, {completedGoals.length} completed)
          </span>
        </div>
        <div className="flex items-center gap-3">
          {goals.length > 0 && (
            <div className="flex items-center gap-2">
              <Progress value={overallProgress} className="w-16 h-2" />
              <span className="text-xs text-muted-foreground">{overallProgress}%</span>
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3 pt-0 space-y-3">
          {/* Add Goal */}
          {isAdding ? (
            <div className="flex gap-2">
              <Input
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                placeholder="Enter your goal..."
                className="flex-1 h-8 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                autoFocus
              />
              <Button size="sm" onClick={addGoal} className="h-8 px-3">
                <Check className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="h-8 px-2">
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="w-full h-8 text-xs gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add a career goal
            </Button>
          )}

          {/* Goals List */}
          {goals.length === 0 && !isAdding && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Set career goals to track your progress over time.
            </p>
          )}

          {goals.length > 0 && (
            <div className="space-y-2">
              {/* Active Goals */}
              {activeGoals.map((goal) => (
                <div key={goal.id} className="bg-background rounded-lg p-2.5 border">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium flex-1">{goal.title}</p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          setEditingId(goal.id);
                          setEditProgress(goal.progress);
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {editingId === goal.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editProgress}
                        onChange={(e) => setEditProgress(parseInt(e.target.value))}
                        className="flex-1 h-2"
                      />
                      <span className="text-xs w-8">{editProgress}%</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={() => updateProgress(goal.id, editProgress)}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Progress value={goal.progress} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground w-8">{goal.progress}%</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Completed Goals */}
              {completedGoals.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Completed</p>
                  {completedGoals.slice(0, 3).map((goal) => (
                    <div 
                      key={goal.id} 
                      className="flex items-center justify-between py-1.5 text-sm text-muted-foreground"
                    >
                      <span className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        <span className="line-through">{goal.title}</span>
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
