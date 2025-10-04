import { Badge } from "@/components/ui/badge";
import { Twitter, Star, MessageSquare, Mail, MessageCircle } from "lucide-react";

import { FeedbackSource } from "@/types/feedback";

interface SourceBadgeProps {
  source: FeedbackSource | string;
}

const sourceConfig = {
  twitter: {
    icon: Twitter,
    label: 'Twitter',
    className: 'bg-info/10 text-info hover:bg-info/20 border-info/20',
  },
  reviews: {
    icon: Star,
    label: 'Reviews',
    className: 'bg-warning/10 text-warning-foreground hover:bg-warning/20 border-warning/20',
  },
  forum: {
    icon: MessageSquare,
    label: 'Forum',
    className: 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20',
  },
  email: {
    icon: Mail,
    label: 'Email',
    className: 'bg-success/10 text-success hover:bg-success/20 border-success/20',
  },
  chat: {
    icon: MessageCircle,
    label: 'Chat',
    className: 'bg-secondary/30 text-secondary-foreground hover:bg-secondary/40 border-secondary/20',
  },
};

export function SourceBadge({ source }: SourceBadgeProps) {
  if (!(source in sourceConfig)) return null;
  
  const config = sourceConfig[source as keyof typeof sourceConfig];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
