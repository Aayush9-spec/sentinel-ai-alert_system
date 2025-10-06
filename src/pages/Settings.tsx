import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Settings as SettingsIcon, Bell, Mail, MessageSquare, Save, Loader2 } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface UserSettings {
  email_critical_incidents: boolean;
  email_negative_mentions: boolean;
  email_weekly_summary: boolean;
  slack_alerts: boolean;
}

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState<UserSettings>({
    email_critical_incidents: true,
    email_negative_mentions: true,
    email_weekly_summary: true,
    slack_alerts: false,
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
      
      // Fetch user settings
      const { data: userSettings } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      
      if (userSettings) {
        setSettings({
          email_critical_incidents: userSettings.email_critical_incidents,
          email_negative_mentions: userSettings.email_negative_mentions,
          email_weekly_summary: userSettings.email_weekly_summary,
          slack_alerts: userSettings.slack_alerts,
        });
      }
      
      setLoading(false);
    };
    
    checkUser();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);

    try {
      if (!user) throw new Error("No user found");

      // Upsert settings
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          ...settings,
        });

      if (error) throw error;

      toast.success("Settings saved successfully!");
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-gradient-to-r from-card/95 via-card/90 to-card/95 backdrop-blur-md sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-info to-primary bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your notification preferences</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="grid gap-6">
          {/* Email Notifications Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Email Notifications</h2>
                <p className="text-sm text-muted-foreground">Configure when you receive email alerts</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="flex-1">
                  <Label htmlFor="critical" className="text-base font-semibold text-foreground cursor-pointer">
                    Critical Incidents
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get notified immediately about HIGH urgency feedback
                  </p>
                </div>
                <Switch
                  id="critical"
                  checked={settings.email_critical_incidents}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, email_critical_incidents: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-warning/5 border border-warning/20">
                <div className="flex-1">
                  <Label htmlFor="negative" className="text-base font-semibold text-foreground cursor-pointer">
                    Negative Mentions
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive alerts for negative sentiment feedback
                  </p>
                </div>
                <Switch
                  id="negative"
                  checked={settings.email_negative_mentions}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, email_negative_mentions: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-info/5 border border-info/20">
                <div className="flex-1">
                  <Label htmlFor="weekly" className="text-base font-semibold text-foreground cursor-pointer">
                    Weekly Summary
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get a weekly digest of all feedback and insights
                  </p>
                </div>
                <Switch
                  id="weekly"
                  checked={settings.email_weekly_summary}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, email_weekly_summary: checked })
                  }
                />
              </div>
            </div>
          </Card>

          {/* Slack Notifications Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-info" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Slack Integration</h2>
                <p className="text-sm text-muted-foreground">Manage Slack notification settings</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex-1">
                  <Label htmlFor="slack" className="text-base font-semibold text-foreground cursor-pointer">
                    Slack Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Send high-priority alerts to your Slack workspace
                  </p>
                </div>
                <Switch
                  id="slack"
                  checked={settings.slack_alerts}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, slack_alerts: checked })
                  }
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground px-4">
                💡 Slack integration requires SLACK_WEBHOOK_URL to be configured in Supabase
              </p>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
            >
              Cancel
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
