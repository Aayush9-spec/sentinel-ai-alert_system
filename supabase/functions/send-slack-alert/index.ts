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
    const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
    
    if (!slackWebhookUrl) {
      return new Response(
        JSON.stringify({ error: 'Slack webhook not configured' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { feedbackId } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch feedback details
    const { data: feedback, error: fetchError } = await supabase
      .from('feedback')
      .select('*')
      .eq('id', feedbackId)
      .single();

    if (fetchError || !feedback) {
      throw new Error('Feedback not found');
    }

    // Create Slack message
    const urgencyEmoji = feedback.urgency === 'HIGH' ? '🚨' : feedback.urgency === 'MEDIUM' ? '⚠️' : 'ℹ️';
    const sentimentEmoji = feedback.sentiment === 'positive' ? '😊' : feedback.sentiment === 'negative' ? '😞' : '😐';

    const slackMessage = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `${urgencyEmoji} New ${feedback.urgency} Priority Feedback`,
            emoji: true
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Source:*\n${feedback.source.toUpperCase()}`
            },
            {
              type: "mrkdwn",
              text: `*Author:*\n${feedback.author}`
            },
            {
              type: "mrkdwn",
              text: `*Sentiment:* ${sentimentEmoji}\n${feedback.sentiment?.toUpperCase()}`
            },
            {
              type: "mrkdwn",
              text: `*Urgency:*\n${feedback.urgency}`
            }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Feedback:*\n_${feedback.text}_`
          }
        }
      ]
    };

    if (feedback.keywords && feedback.keywords.length > 0) {
      slackMessage.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Keywords:* ${feedback.keywords.join(', ')}`
        }
      });
    }

    if (feedback.suggested_response) {
      slackMessage.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*AI Suggested Response:*\n${feedback.suggested_response}`
        }
      });
    }

    slackMessage.blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: ` `
      }
    });

    slackMessage.blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `_Automated alert from SentinelAI | ${new Date().toLocaleString()}_`
      }
    });

    // Send to Slack
    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Slack alert sent successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in send-slack-alert function:', error);
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
