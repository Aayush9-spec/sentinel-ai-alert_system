import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database, Loader2 } from "lucide-react";

export const SampleDataButton = () => {
  const [loading, setLoading] = useState(false);

  const sampleFeedback = [
    {
      source: 'twitter',
      author: '@frustrated_user',
      text: 'The app keeps crashing when I try to upload files. This is the worst experience ever! I need help ASAP!',
      sentiment: 'negative' as const,
      urgency: 'HIGH' as const,
      keywords: ['crashing', 'upload', 'worst', 'experience', 'help'],
      sentiment_score: 0.15,
      rating: 1,
      suggested_response: 'We sincerely apologize for the frustrating experience with file uploads. Our team is investigating this crash issue immediately. Please DM us your device details so we can prioritize a fix for you.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 min ago
    },
    {
      source: 'reviews',
      author: 'John Doe',
      text: 'Great product! The new dashboard UI is clean and intuitive. Love the real-time updates feature.',
      sentiment: 'positive' as const,
      urgency: 'LOW' as const,
      keywords: ['great', 'dashboard', 'clean', 'intuitive', 'updates'],
      sentiment_score: 0.92,
      rating: 5,
      suggested_response: 'Thank you so much for the positive feedback! We\'re thrilled you\'re enjoying the new dashboard and real-time updates. Your support means a lot to our team!',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 min ago
    },
    {
      source: 'email',
      author: 'sarah.johnson@example.com',
      text: 'I\'ve been waiting for a response to my support ticket for 3 days. The billing issue is still not resolved.',
      sentiment: 'negative' as const,
      urgency: 'HIGH' as const,
      keywords: ['waiting', 'support', 'ticket', 'billing', 'issue'],
      sentiment_score: 0.25,
      rating: null,
      suggested_response: 'We deeply apologize for the delay in responding to your support ticket. Billing issues are our top priority. I\'m escalating your case to our billing team right now, and you\'ll receive a response within 2 hours.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
    },
    {
      source: 'chat',
      author: 'Mike_92',
      text: 'The performance has improved significantly after the latest update. Thanks for listening to user feedback!',
      sentiment: 'positive' as const,
      urgency: 'LOW' as const,
      keywords: ['performance', 'improved', 'update', 'thanks', 'feedback'],
      sentiment_score: 0.88,
      rating: null,
      suggested_response: 'We\'re so happy to hear the performance improvements are working well for you! Your feedback helped us identify and fix those issues. Thank you for being part of our community!',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() // 1.5 hours ago
    },
    {
      source: 'forum',
      author: 'tech_enthusiast',
      text: 'Having some minor issues with the dark mode theme. Certain buttons are hard to see. Otherwise solid app.',
      sentiment: 'neutral' as const,
      urgency: 'MEDIUM' as const,
      keywords: ['issues', 'dark', 'mode', 'buttons', 'solid'],
      sentiment_score: 0.55,
      rating: 3,
      suggested_response: 'Thank you for reporting the dark mode visibility issues. We\'re working on improving the contrast for better accessibility. Could you let us know which specific buttons are affected so we can prioritize the fix?',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
    },
    {
      source: 'twitter',
      author: '@power_user_pro',
      text: 'The new API endpoints are exactly what we needed for our integration. Documentation is excellent too!',
      sentiment: 'positive' as const,
      urgency: 'LOW' as const,
      keywords: ['API', 'endpoints', 'needed', 'integration', 'excellent'],
      sentiment_score: 0.95,
      rating: null,
      suggested_response: 'Fantastic to hear our API endpoints are working perfectly for your integration! We put a lot of effort into the documentation, so your feedback is really rewarding. Let us know if you need any additional features!',
      timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString() // 2.5 hours ago
    },
    {
      source: 'reviews',
      author: 'Lisa Chen',
      text: 'App is okay but the mobile version desperately needs work. Too many features are desktop-only.',
      sentiment: 'neutral' as const,
      urgency: 'MEDIUM' as const,
      keywords: ['okay', 'mobile', 'needs', 'work', 'desktop'],
      sentiment_score: 0.45,
      rating: 3,
      suggested_response: 'Thank you for the honest feedback about our mobile experience. We\'re currently working on a mobile-first redesign to bring feature parity to all platforms. This is a top priority for our Q2 roadmap.',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString() // 3 hours ago
    },
    {
      source: 'email',
      author: 'support@companyxyz.com',
      text: 'Outstanding customer service! The team went above and beyond to help us migrate our data. Highly recommended!',
      sentiment: 'positive' as const,
      urgency: 'LOW' as const,
      keywords: ['outstanding', 'service', 'above', 'beyond', 'recommended'],
      sentiment_score: 0.98,
      rating: null,
      suggested_response: 'Thank you so much for the kind words! We\'re thrilled we could make your data migration smooth. Our team loves helping customers succeed, and your recommendation means the world to us!',
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString() // 4 hours ago
    }
  ];

  const handleAddSampleData = async () => {
    setLoading(true);
    try {
      // Check if sample data already exists
      const { data: existingData, error: checkError } = await supabase
        .from('feedback')
        .select('id')
        .limit(1);

      if (checkError) throw checkError;

      if (existingData && existingData.length > 0) {
        toast.error('Sample data already exists. Clear the database first.');
        return;
      }

      const { error } = await supabase
        .from('feedback')
        .insert(sampleFeedback);

      if (error) throw error;

      toast.success(`Added ${sampleFeedback.length} sample feedback items!`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add sample data';
      console.error('Error adding sample data:', error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddSampleData}
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : (
        <>
          <Database className="h-4 w-4" />
          Add Sample Data
        </>
      )}
    </Button>
  );
};
