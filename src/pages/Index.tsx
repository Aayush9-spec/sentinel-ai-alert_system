import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Feedback, UrgencyFilter, SourceFilter, SentimentFilter } from "@/types/feedback";
import { DashboardStats } from "@/components/DashboardStats";
import { FeedbackFilters } from "@/components/FeedbackFilters";
import { FeedbackCard } from "@/components/FeedbackCard";
import { TrendChart } from "@/components/TrendChart";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>("all");

  // Fetch feedback data
  useEffect(() => {
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
          // Refetch on any change
          fetchFeedback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  if (loading) {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                SentinelAI
              </h1>
              <p className="text-muted-foreground mt-1">Customer Sentiment Monitoring Dashboard</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Live monitoring
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <DashboardStats feedback={feedback} />

        {/* Filters */}
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

        {/* Trending Topics */}
        <TrendChart feedback={feedback} />

        {/* Feedback Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Feedback ({filteredFeedback.length})
            </h2>
            {filteredFeedback.length !== feedback.length && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setUrgencyFilter("all");
                  setSourceFilter("all");
                  setSentimentFilter("all");
                }}
                className="text-sm text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {filteredFeedback.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No feedback matches your filters
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredFeedback.map((item) => (
                <FeedbackCard key={item.id} feedback={item} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
