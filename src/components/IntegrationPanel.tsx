import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Twitter, Mail, MessageSquare, Loader2 } from "lucide-react";

export const IntegrationPanel = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [twitterQuery, setTwitterQuery] = useState("your_brand OR @your_brand");
  const [emailRecipient, setEmailRecipient] = useState("");

  const handleTwitterMonitor = async () => {
    setLoading("twitter");
    try {
      const { data, error } = await supabase.functions.invoke('monitor-twitter', {
        body: { query: twitterQuery }
      });

      if (error) throw error;

      toast.success(`Twitter monitoring complete! Processed ${data.processed} tweets`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to monitor Twitter';
      console.error('Twitter monitoring error:', error);
      toast.error(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const handleEmailAlert = async () => {
    if (!emailRecipient || !emailRecipient.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading("email");
    try {
      // Get the first HIGH urgency feedback
      const { data: feedback, error: fetchError } = await supabase
        .from('feedback')
        .select('*')
        .eq('urgency', 'HIGH')
        .limit(1)
        .maybeSingle();

      if (fetchError || !feedback) {
        toast.error('No HIGH urgency feedback found to send');
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-email-alert', {
        body: { 
          feedbackId: feedback.id,
          recipientEmail: emailRecipient
        }
      });

      if (error) throw error;

      toast.success(`Email alert sent to ${emailRecipient}!`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
      console.error('Email alert error:', error);
      toast.error(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const handleSlackAlert = async () => {
    setLoading("slack");
    try {
      // Get the first HIGH urgency feedback
      const { data: feedback, error: fetchError } = await supabase
        .from('feedback')
        .select('*')
        .eq('urgency', 'HIGH')
        .limit(1)
        .maybeSingle();

      if (fetchError || !feedback) {
        toast.error('No HIGH urgency feedback found to send');
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-slack-alert', {
        body: { feedbackId: feedback.id }
      });

      if (error) throw error;

      toast.success('Slack alert sent successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send Slack alert';
      console.error('Slack alert error:', error);
      toast.error(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-gradient-to-br from-card via-card/95 to-card/90 border-border/50">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-2">Integration Testing</h3>
        <p className="text-sm text-muted-foreground">Test your monitoring and alert integrations</p>
      </div>

      {/* Twitter Monitoring */}
      <div className="space-y-3 pb-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Twitter className="h-5 w-5 text-primary" />
          <h4 className="font-semibold text-foreground">Twitter Monitoring</h4>
        </div>
        <Input
          placeholder="Enter search query (e.g., @your_brand)"
          value={twitterQuery}
          onChange={(e) => setTwitterQuery(e.target.value)}
          className="bg-background/50"
        />
        <Button
          onClick={handleTwitterMonitor}
          disabled={loading !== null || !twitterQuery}
          className="w-full"
        >
          {loading === "twitter" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Monitoring...
            </>
          ) : (
            <>
              <Twitter className="h-4 w-4 mr-2" />
              Monitor Twitter
            </>
          )}
        </Button>
      </div>

      {/* Email Alerts */}
      <div className="space-y-3 pb-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h4 className="font-semibold text-foreground">Email Alerts</h4>
        </div>
        <Input
          type="email"
          placeholder="Enter recipient email"
          value={emailRecipient}
          onChange={(e) => setEmailRecipient(e.target.value)}
          className="bg-background/50"
        />
        <Button
          onClick={handleEmailAlert}
          disabled={loading !== null || !emailRecipient}
          variant="outline"
          className="w-full"
        >
          {loading === "email" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Send Test Alert
            </>
          )}
        </Button>
      </div>

      {/* Slack Alerts */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <h4 className="font-semibold text-foreground">Slack Alerts</h4>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            Optional
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Configure SLACK_WEBHOOK_URL secret in Supabase to enable Slack notifications
        </p>
        <Button
          onClick={handleSlackAlert}
          disabled={true}
          variant="outline"
          className="w-full opacity-50"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Not Configured
        </Button>
      </div>
    </Card>
  );
};
