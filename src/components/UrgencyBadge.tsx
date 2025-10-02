import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { FeedbackUrgency } from "@/types/feedback";

interface UrgencyBadgeProps {
  urgency: FeedbackUrgency | null | string;
  className?: string;
}

const urgencyConfig = {
  HIGH: {
    emoji: '🔴',
    label: 'High Priority',
    className: 'bg-urgent/10 text-urgent hover:bg-urgent/20 border-urgent/30 animate-pulse',
  },
  MEDIUM: {
    emoji: '🟡',
    label: 'Medium Priority',
    className: 'bg-warning/10 text-warning-foreground hover:bg-warning/20 border-warning/30',
  },
  LOW: {
    emoji: '🟢',
    label: 'Low Priority',
    className: 'bg-success/10 text-success hover:bg-success/20 border-success/20',
  },
};

export function UrgencyBadge({ urgency, className }: UrgencyBadgeProps) {
  if (!urgency || !(urgency in urgencyConfig)) return null;

  const config = urgencyConfig[urgency as keyof typeof urgencyConfig];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      <span className="mr-1">{config.emoji}</span>
      {config.label}
    </Badge>
  );
}
