import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Feedback } from "@/types/feedback";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TrendChartProps {
  feedback: Feedback[];
}

export function TrendChart({ feedback }: TrendChartProps) {
  // Analyze keyword trends
  const keywordCounts: Record<string, number> = {};
  
  feedback.forEach(f => {
    if (f.keywords) {
      f.keywords.forEach(keyword => {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
      });
    }
  });

  // Sort by frequency
  const sortedKeywords = Object.entries(keywordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Calculate if trending up (for demo, we'll mark urgent keywords as trending)
  const urgentKeywords = new Set(['scam', 'fraud', 'crash', 'bug', 'refund', 'delivery']);

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 hover:shadow-[var(--shadow-hover)] transition-all">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Trending Topics</CardTitle>
        <CardDescription>Most mentioned issues and topics</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedKeywords.length === 0 ? (
          <p className="text-sm text-muted-foreground">No trending topics yet</p>
        ) : (
          <div className="space-y-4">
            {sortedKeywords.map(([keyword, count]) => {
              const isTrending = urgentKeywords.has(keyword.toLowerCase());
              const percentage = Math.round((count / feedback.length) * 100);
              
              return (
                <div key={keyword} className="space-y-2 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold capitalize text-foreground group-hover:text-primary transition-colors">{keyword}</span>
                      {isTrending && (
                        <div className="flex items-center gap-1 text-urgent animate-pulse">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span className="text-xs font-bold uppercase tracking-wide">Alert</span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isTrending ? 'bg-gradient-to-r from-urgent to-urgent/70' : 'bg-gradient-to-r from-primary to-info'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
