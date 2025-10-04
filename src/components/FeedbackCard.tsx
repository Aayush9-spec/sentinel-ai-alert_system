import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SentimentBadge } from "./SentimentBadge";
import { UrgencyBadge } from "./UrgencyBadge";
import { SourceBadge } from "./SourceBadge";
import { Feedback } from "@/types/feedback";
import { formatDistanceToNow } from "date-fns";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FeedbackCardProps {
  feedback: Feedback;
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyResponse = async () => {
    if (!feedback.suggested_response) return;
    
    await navigator.clipboard.writeText(feedback.suggested_response);
    setCopied(true);
    toast.success("Response copied to clipboard!");
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="transition-all hover:shadow-[var(--shadow-glow)] border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 hover:border-primary/30 backdrop-blur-sm">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <SourceBadge source={feedback.source} />
            <SentimentBadge sentiment={feedback.sentiment} />
          </div>
          <UrgencyBadge urgency={feedback.urgency} />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">{feedback.author}</p>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(feedback.timestamp), { addSuffix: true })}
            </p>
          </div>
          {feedback.rating && (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-lg ${
                    i < feedback.rating! ? "text-amber-500" : "text-muted"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-foreground leading-relaxed">{feedback.text}</p>

        {feedback.keywords && feedback.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {feedback.keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        )}

        {feedback.suggested_response && (
          <div className="mt-4 rounded-lg bg-primary/5 p-4 border border-primary/20 backdrop-blur-sm hover:bg-primary/10 transition-all">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm font-bold text-primary uppercase tracking-wide">AI Suggested Response</p>
              <button
                onClick={handleCopyResponse}
                className="text-primary hover:text-primary/80 transition-all hover:scale-110 active:scale-95"
                aria-label="Copy response"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">{feedback.suggested_response}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
