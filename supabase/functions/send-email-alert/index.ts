import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feedbackId, recipientEmail } = await req.json();

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

    // Generate email content based on urgency
    const subject = feedback.urgency === 'HIGH' 
      ? `🚨 URGENT: Critical Feedback Alert from ${feedback.source}`
      : `⚠️ New ${feedback.urgency} Priority Feedback from ${feedback.source}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">SentinelAI Alert</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Real-time Customer Sentiment Monitoring</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${feedback.urgency === 'HIGH' ? '#ef4444' : feedback.urgency === 'MEDIUM' ? '#f59e0b' : '#10b981'};">
            <h2 style="margin-top: 0; color: #1f2937;">Feedback Details</h2>
            
            <div style="margin: 15px 0;">
              <strong style="color: #6b7280;">Source:</strong>
              <span style="color: #1f2937;"> ${feedback.source.toUpperCase()}</span>
            </div>
            
            <div style="margin: 15px 0;">
              <strong style="color: #6b7280;">Author:</strong>
              <span style="color: #1f2937;"> ${feedback.author}</span>
            </div>
            
            <div style="margin: 15px 0;">
              <strong style="color: #6b7280;">Sentiment:</strong>
              <span style="background: ${feedback.sentiment === 'positive' ? '#dcfce7' : feedback.sentiment === 'negative' ? '#fee2e2' : '#e5e7eb'}; color: ${feedback.sentiment === 'positive' ? '#166534' : feedback.sentiment === 'negative' ? '#991b1b' : '#374151'}; padding: 4px 12px; border-radius: 12px; font-size: 14px;"> ${feedback.sentiment?.toUpperCase()}</span>
            </div>
            
            <div style="margin: 15px 0;">
              <strong style="color: #6b7280;">Urgency:</strong>
              <span style="background: ${feedback.urgency === 'HIGH' ? '#fee2e2' : feedback.urgency === 'MEDIUM' ? '#fef3c7' : '#dcfce7'}; color: ${feedback.urgency === 'HIGH' ? '#991b1b' : feedback.urgency === 'MEDIUM' ? '#92400e' : '#166534'}; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: bold;"> ${feedback.urgency}</span>
            </div>
            
            <div style="margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 6px;">
              <strong style="color: #6b7280; display: block; margin-bottom: 8px;">Feedback Text:</strong>
              <p style="color: #1f2937; line-height: 1.6; margin: 0;">${feedback.text}</p>
            </div>
            
            ${feedback.keywords && feedback.keywords.length > 0 ? `
              <div style="margin: 15px 0;">
                <strong style="color: #6b7280; display: block; margin-bottom: 8px;">Keywords:</strong>
                ${feedback.keywords.map((keyword: string) => `<span style="background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 12px; font-size: 13px; margin-right: 6px; display: inline-block; margin-bottom: 6px;">${keyword}</span>`).join('')}
              </div>
            ` : ''}
            
            ${feedback.suggested_response ? `
              <div style="margin: 20px 0; padding: 15px; background: #eff6ff; border-radius: 6px; border-left: 3px solid #3b82f6;">
                <strong style="color: #1e40af; display: block; margin-bottom: 8px;">AI Suggested Response:</strong>
                <p style="color: #1f2937; line-height: 1.6; margin: 0; font-style: italic;">${feedback.suggested_response}</p>
              </div>
            ` : ''}
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
            <p>This is an automated alert from SentinelAI</p>
            <p style="margin: 10px 0 0 0;">Login to your dashboard for more details and actions</p>
          </div>
        </div>
      </div>
    `;

    // Send email using Resend API directly
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "SentinelAI <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: subject,
        html: html,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const emailData = await emailResponse.json();

    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailData.id,
      message: 'Alert email sent successfully' 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
