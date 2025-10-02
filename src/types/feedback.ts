import { Database } from "@/integrations/supabase/types";

export type Feedback = Database['public']['Tables']['feedback']['Row'];

export type FeedbackSource = 'twitter' | 'reviews' | 'forum' | 'email' | 'chat';
export type FeedbackSentiment = 'positive' | 'neutral' | 'negative';
export type FeedbackUrgency = 'HIGH' | 'MEDIUM' | 'LOW';

export type UrgencyFilter = 'all' | 'HIGH' | 'MEDIUM' | 'LOW';
export type SourceFilter = 'all' | 'twitter' | 'reviews' | 'forum' | 'email' | 'chat';
export type SentimentFilter = 'all' | 'positive' | 'neutral' | 'negative';
