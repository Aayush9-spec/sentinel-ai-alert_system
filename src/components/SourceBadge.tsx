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
    className: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20',
  },
  reviews: {
    icon: Star,
    label: 'Reviews',
    className: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20',
  },
  forum: {
    icon: MessageSquare,
    label: 'Forum',
    className: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20',
  },
  email: {
    icon: Mail,
    label: 'Email',
    className: 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20',
  },
  chat: {
    icon: MessageCircle,
    label: 'Chat',
    className: 'bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 border-pink-500/20',
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
