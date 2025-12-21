import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Bell, Mail, Clock, Check, Loader2, Settings, 
  ChevronDown, ChevronUp, Send
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface NudgeSettingsProps {
  sessionId: string;
  email?: string;
}

const NUDGE_SETTINGS_KEY = "career_advisor_nudge_settings";

interface NudgePreferences {
  enabled: boolean;
  email: string;
  frequency: "daily" | "weekly" | "biweekly";
  lastSent?: string;
}

export function NudgeSettings({ sessionId, email: initialEmail }: NudgeSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [preferences, setPreferences] = useState<NudgePreferences>({
    enabled: false,
    email: initialEmail || "",
    frequency: "weekly",
  });

  useEffect(() => {
    // Load saved preferences
    const saved = localStorage.getItem(NUDGE_SETTINGS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences(prev => ({ ...prev, ...parsed, email: initialEmail || parsed.email }));
      } catch (e) {
        console.error("Error loading nudge settings:", e);
      }
    } else if (initialEmail) {
      setPreferences(prev => ({ ...prev, email: initialEmail }));
    }
  }, [initialEmail]);

  const savePreferences = (updates: Partial<NudgePreferences>) => {
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);
    localStorage.setItem(NUDGE_SETTINGS_KEY, JSON.stringify(newPrefs));
  };

  const sendTestNudge = async () => {
    if (!preferences.email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-advisor-nudge", {
        body: {
          email: preferences.email.trim(),
          sessionId,
          type: "manual",
        },
      });

      if (error) throw error;

      toast.success("Progress check-in sent! Check your inbox.");
      savePreferences({ lastSent: new Date().toISOString() });
    } catch (error) {
      console.error("Error sending nudge:", error);
      toast.error("Failed to send. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case "daily": return "Daily";
      case "weekly": return "Weekly";
      case "biweekly": return "Every 2 weeks";
      default: return freq;
    }
  };

  return (
    <div className="border rounded-lg bg-muted/30 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium">Progress Reminders</span>
          {preferences.enabled && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {getFrequencyLabel(preferences.frequency)}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-3 pt-0 space-y-4">
          <p className="text-xs text-muted-foreground">
            Get email reminders about your goals and action items to stay on track.
          </p>

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="nudge-email" className="text-xs">Email Address</Label>
            <Input
              id="nudge-email"
              type="email"
              value={preferences.email}
              onChange={(e) => savePreferences({ email: e.target.value })}
              placeholder="your@email.com"
              className="h-9 text-sm"
            />
          </div>

          {/* Frequency Selection */}
          <div className="space-y-2">
            <Label className="text-xs">Reminder Frequency</Label>
            <div className="flex gap-2">
              {(["daily", "weekly", "biweekly"] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => savePreferences({ frequency: freq })}
                  className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-colors ${
                    preferences.frequency === freq
                      ? "bg-violet-100 border-violet-300 text-violet-700"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  {getFrequencyLabel(freq)}
                </button>
              ))}
            </div>
          </div>

          {/* Enable Toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="nudge-enabled" className="text-sm">
                Auto-send reminders
              </Label>
            </div>
            <Switch
              id="nudge-enabled"
              checked={preferences.enabled}
              onCheckedChange={(checked) => savePreferences({ enabled: checked })}
            />
          </div>

          {/* Send Now Button */}
          <Button
            onClick={sendTestNudge}
            disabled={isSending || !preferences.email.trim()}
            variant="outline"
            className="w-full gap-2"
            size="sm"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Progress Check-In Now
              </>
            )}
          </Button>

          {preferences.lastSent && (
            <p className="text-xs text-muted-foreground text-center">
              Last sent: {new Date(preferences.lastSent).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
