import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bearerToken = Deno.env.get('TWITTER_BEARER_TOKEN');
    if (!bearerToken) {
      throw new Error('TWITTER_BEARER_TOKEN not configured');
    }

    const { query = 'your_brand_name' } = await req.json();

    // Search for recent tweets
    const response = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=10&tweet.fields=created_at,author_id,public_metrics`,
      {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Twitter API error:', error);
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Process and store tweets
    const tweets = data.data || [];
    const feedbackItems = [];

    for (const tweet of tweets) {
      // Simple sentiment analysis based on keywords
      const text = tweet.text.toLowerCase();
      let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
      let urgency: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';

      // Sentiment detection
      if (text.includes('love') || text.includes('great') || text.includes('awesome') || text.includes('excellent')) {
        sentiment = 'positive';
      } else if (text.includes('hate') || text.includes('terrible') || text.includes('worst') || text.includes('bad')) {
        sentiment = 'negative';
        urgency = 'HIGH';
      } else if (text.includes('issue') || text.includes('problem') || text.includes('help')) {
        sentiment = 'negative';
        urgency = 'MEDIUM';
      }

      // Extract keywords
      const keywords = text.split(' ')
        .filter((word: string) => word.length > 4)
        .slice(0, 5);

      const feedbackItem = {
        source: 'twitter',
        author: `@user_${tweet.author_id}`,
        text: tweet.text,
        timestamp: new Date(tweet.created_at).toISOString(),
        sentiment,
        urgency,
        keywords,
        rating: null,
        sentiment_score: sentiment === 'positive' ? 0.8 : sentiment === 'negative' ? 0.2 : 0.5,
        suggested_response: sentiment === 'negative' 
          ? `Thank you for reaching out! We're sorry to hear about your experience. Our team is looking into this right away. Please DM us for immediate assistance.`
          : `Thank you for your feedback! We appreciate you taking the time to share your thoughts with us.`
      };

      feedbackItems.push(feedbackItem);
    }

    // Insert into database
    if (feedbackItems.length > 0) {
      const { error: insertError } = await supabase
        .from('feedback')
        .insert(feedbackItems);

      if (insertError) {
        console.error('Error inserting feedback:', insertError);
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: feedbackItems.length,
        message: `Successfully processed ${feedbackItems.length} tweets` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in monitor-twitter function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
