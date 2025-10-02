import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { UrgencyFilter, SourceFilter, SentimentFilter } from "@/types/feedback";

interface FeedbackFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  urgencyFilter: UrgencyFilter;
  onUrgencyChange: (value: UrgencyFilter) => void;
  sourceFilter: SourceFilter;
  onSourceChange: (value: SourceFilter) => void;
  sentimentFilter: SentimentFilter;
  onSentimentChange: (value: SentimentFilter) => void;
}

export function FeedbackFilters({
  searchQuery,
  onSearchChange,
  urgencyFilter,
  onUrgencyChange,
  sourceFilter,
  onSourceChange,
  sentimentFilter,
  onSentimentChange,
}: FeedbackFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search feedback..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-background border-border/50"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Select value={urgencyFilter} onValueChange={onUrgencyChange}>
          <SelectTrigger className="bg-background border-border/50">
            <SelectValue placeholder="Filter by urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Urgencies</SelectItem>
            <SelectItem value="HIGH">🔴 High Priority</SelectItem>
            <SelectItem value="MEDIUM">🟡 Medium Priority</SelectItem>
            <SelectItem value="LOW">🟢 Low Priority</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={onSourceChange}>
          <SelectTrigger className="bg-background border-border/50">
            <SelectValue placeholder="Filter by source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
            <SelectItem value="reviews">Reviews</SelectItem>
            <SelectItem value="forum">Forum</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="chat">Chat</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sentimentFilter} onValueChange={onSentimentChange}>
          <SelectTrigger className="bg-background border-border/50">
            <SelectValue placeholder="Filter by sentiment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sentiments</SelectItem>
            <SelectItem value="positive">😊 Positive</SelectItem>
            <SelectItem value="neutral">😐 Neutral</SelectItem>
            <SelectItem value="negative">😡 Negative</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
