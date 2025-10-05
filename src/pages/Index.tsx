import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Feedback, UrgencyFilter, SourceFilter, SentimentFilter } from "@/types/feedback";
import { DashboardStats } from "@/components/DashboardStats";
import { FeedbackFilters } from "@/components/FeedbackFilters";
import { FeedbackCard } from "@/components/FeedbackCard";
import { TrendChart } from "@/components/TrendChart";
import { IntegrationPanel } from "@/components/IntegrationPanel";
import { SampleDataButton } from "@/components/SampleDataButton";
import { Loader2, AlertCircle, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>("all");

  // Auth check
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session && event !== 'INITIAL_SESSION') {
        navigate("/auth");
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    }).catch((error) => {
      console.error("Session error:", error);
      // Clear any bad tokens
      localStorage.removeItem('sb-dnoxmoyrzzakrmpbdrrn-auth-token');
      navigate("/auth");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fetch feedback data
  useEffect(() => {
    if (!user) return;

    async function fetchFeedback() {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from("feedback")
          .select("*")
          .order("timestamp", { ascending: false });

        if (fetchError) throw fetchError;

        setFeedback(data || []);
        toast.success("Dashboard loaded successfully!");
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError("Failed to load feedback data");
        toast.error("Failed to load feedback data");
      } finally {
        setLoading(false);
      }
    }

    fetchFeedback();

    // Set up real-time subscription
    const channel = supabase
      .channel("feedback-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "feedback",
        },
        (payload) => {
          console.log("Real-time update:", payload);
          fetchFeedback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Apply filters
  useEffect(() => {
    let filtered = [...feedback];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.text.toLowerCase().includes(query) ||
          f.author.toLowerCase().includes(query) ||
          f.keywords?.some((k) => k.toLowerCase().includes(query))
      );
    }

    // Urgency filter
    if (urgencyFilter !== "all") {
      filtered = filtered.filter((f) => f.urgency === urgencyFilter);
    }

    // Source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter((f) => f.source === sourceFilter);
    }

    // Sentiment filter
    if (sentimentFilter !== "all") {
      filtered = filtered.filter((f) => f.sentiment === sentimentFilter);
    }

    // Sort by urgency (HIGH first)
    filtered.sort((a, b) => {
      const urgencyOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return (urgencyOrder[a.urgency || 'LOW'] || 2) - (urgencyOrder[b.urgency || 'LOW'] || 2);
    });

    setFilteredFeedback(filtered);
  }, [feedback, searchQuery, urgencyFilter, sourceFilter, sentimentFilter]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-gradient-to-r from-card/95 via-card/90 to-card/95 backdrop-blur-md sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-info to-primary bg-clip-text text-transparent animate-pulse">
                SentinelAI Command Center
              </h1>
              <p className="text-sm text-muted-foreground mt-1 font-medium">Real-time Customer Sentiment Monitoring</p>
            </div>
            <div className="flex items-center gap-4">
              <SampleDataButton />
              <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-success font-semibold">Live</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.email}</span>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 3-Column Layout */}
      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
          {/* Column 1: KPIs & Trending */}
          <div className="lg:col-span-3 space-y-6 overflow-y-auto">
            <DashboardStats feedback={feedback} />
            <TrendChart feedback={feedback} />
            <IntegrationPanel />
          </div>

          {/* Column 2: Live Triage Feed */}
          <div className="lg:col-span-5 space-y-4 overflow-y-auto">
            <div className="sticky top-0 bg-background pb-4 z-10">
              <FeedbackFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                urgencyFilter={urgencyFilter}
                onUrgencyChange={setUrgencyFilter}
                sourceFilter={sourceFilter}
                onSourceChange={setSourceFilter}
                sentimentFilter={sentimentFilter}
                onSentimentChange={setSentimentFilter}
              />
              <div className="flex items-center justify-between mt-4">
                <h2 className="text-lg font-bold text-foreground">
                  Live Feed ({filteredFeedback.length})
                </h2>
                {filteredFeedback.length !== feedback.length && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setUrgencyFilter("all");
                      setSourceFilter("all");
                      setSentimentFilter("all");
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {filteredFeedback.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No feedback matches your filters
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFeedback.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedFeedback(item)}
                    className={`cursor-pointer transition-all ${
                      selectedFeedback?.id === item.id
                        ? "ring-2 ring-primary"
                        : "hover:shadow-[var(--shadow-hover)]"
                    }`}
                  >
                    <FeedbackCard feedback={item} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 3: AI Co-Pilot Panel */}
          <div className="lg:col-span-4 overflow-y-auto">
            {selectedFeedback ? (
              <div className="bg-gradient-to-br from-card via-card/95 to-card/90 border border-border/50 rounded-xl p-6 shadow-[var(--shadow-glow)] space-y-6 sticky top-0 backdrop-blur-sm hover:border-primary/20 transition-all">
                <div className="flex items-start justify-between border-b border-border/50 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      AI Co-Pilot
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">Powered by SentinelAI</p>
                  </div>
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="text-muted-foreground hover:text-foreground text-lg hover:scale-110 transition-all hover:rotate-90"
                  >
                    ✕
                  </button>
                </div>

                {/* AI Analysis */}
                <div className="space-y-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <h4 className="text-sm font-bold text-primary uppercase tracking-wide">AI Analysis</h4>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {selectedFeedback.urgency === "HIGH"
                      ? "🚨 Critical issue requiring immediate attention. Customer is frustrated and may churn if not addressed quickly."
                      : selectedFeedback.sentiment === "negative"
                      ? "⚠️ Negative sentiment detected. Customer needs reassurance and a clear resolution path."
                      : "✅ Positive feedback. Great opportunity to strengthen customer relationship."}
                  </p>
                </div>

                {/* AI Suggested Response */}
                {selectedFeedback.suggested_response && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wide">Suggested Response</h4>
                    <div className="bg-secondary/20 border border-border rounded-lg p-4 hover:bg-secondary/30 transition-all">
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {selectedFeedback.suggested_response}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={async () => {
                        await navigator.clipboard.writeText(selectedFeedback.suggested_response!);
                        toast.success("Response copied!");
                      }}
                      className="w-full bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                    >
                      Copy Response
                    </Button>
                  </div>
                )}

                {/* Action Center */}
                <div className="space-y-3 border-t border-border/50 pt-6">
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">Action Center</h4>
                  
                  <Button variant="outline" className="w-full justify-start gap-2 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all">
                    <User className="h-4 w-4" />
                    Assign to Team Member
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start gap-2 hover:bg-info/10 hover:border-info/30 hover:text-info transition-all">
                    <AlertCircle className="h-4 w-4" />
                    Change Status
                  </Button>
                  
                  {selectedFeedback.urgency === "HIGH" && (
                    <Button variant="destructive" className="w-full justify-start gap-2 animate-pulse hover:scale-[1.02] transition-all shadow-lg">
                      🚨 Escalate Issue
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-card/50 via-card/40 to-card/30 border border-border/30 rounded-xl p-12 text-center backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-primary/50" />
                  </div>
                  <p className="text-muted-foreground font-medium">Select a feedback item to view AI analysis and actions</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
