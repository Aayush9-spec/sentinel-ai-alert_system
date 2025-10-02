import { Badge } from "@/components/ui/badge";

import { FeedbackSentiment } from "@/types/feedback";

interface SentimentBadgeProps {
  sentiment: FeedbackSentiment | null | string;
}

const sentimentConfig = {
  positive: {
    emoji: '😊',
    label: 'Positive',
    className: 'bg-success/10 text-success hover:bg-success/20 border-success/20',
  },
  neutral: {
    emoji: '😐',
    label: 'Neutral',
    className: 'bg-muted text-neutral hover:bg-muted border-border',
  },
  negative: {
    emoji: '😡',
    label: 'Negative',
    className: 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20',
  },
};

export function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  if (!sentiment || !(sentiment in sentimentConfig)) return null;

  const config = sentimentConfig[sentiment as keyof typeof sentimentConfig];

  return (
    <Badge variant="outline" className={config.className}>
      <span className="mr-1">{config.emoji}</span>
      {config.label}
    </Badge>
  );
}
