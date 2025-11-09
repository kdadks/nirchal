import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SendRequest {
  campaign_id: string;
}

async function sendEmailViResend(
  recipientEmail: string,
  recipientName: string | null,
  subject: string,
  htmlContent: string,
  senderEmail: string,
  senderName: string | null,
  campaignId: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: senderName 
          ? `${senderName} <${senderEmail}>`
          : senderEmail,
        to: recipientName 
          ? `${recipientName} <${recipientEmail}>`
          : recipientEmail,
        subject,
        html: htmlContent,
        reply_to: senderEmail,
        headers: {
          "X-Campaign-ID": campaignId,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

serve(async (req) => {
  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { campaign_id } = (await req.json()) as SendRequest;

    if (!campaign_id) {
      return new Response(JSON.stringify({ error: "campaign_id required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("email_campaigns")
      .select("*")
      .eq("id", campaign_id)
      .single();

    if (campaignError || !campaign) {
      return new Response(JSON.stringify({ error: "Campaign not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get all pending recipients
    const { data: recipients, error: recipientsError } = await supabase
      .from("email_campaign_recipients")
      .select("*")
      .eq("campaign_id", campaign_id)
      .eq("status", "pending")
      .limit(100); // Process in batches

    if (recipientsError || !recipients) {
      return new Response(JSON.stringify({ error: "Failed to fetch recipients" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Send emails to each recipient
    let sentCount = 0;
    let failedCount = 0;
    const updates: Array<{ id: string; status: string; error?: string; messageId?: string }> = [];

    for (const recipient of recipients) {
      const result = await sendEmailViResend(
        recipient.email,
        recipient.name,
        campaign.subject,
        campaign.html_content,
        campaign.sender_email,
        campaign.sender_name,
        campaign_id
      );

      if (result.success) {
        sentCount++;
        updates.push({
          id: recipient.id,
          status: "sent",
          messageId: result.messageId,
        });
      } else {
        failedCount++;
        updates.push({
          id: recipient.id,
          status: "failed",
          error: result.error,
        });
      }

      // Log the event
      await supabase
        .from("email_campaign_logs")
        .insert({
          campaign_id: campaign_id,
          recipient_id: recipient.id,
          event_type: result.success ? "sent" : "failed",
          event_details: {
            timestamp: new Date().toISOString(),
            messageId: result.messageId,
            error: result.error,
          },
        });
    }

    // Update recipient status in batch
    for (const update of updates) {
      const { id, status, error: errorMsg, messageId } = update;
      await supabase
        .from("email_campaign_recipients")
        .update({
          status,
          sent_at: status === "sent" ? new Date().toISOString() : null,
          failed_at: status === "failed" ? new Date().toISOString() : null,
          error_message: errorMsg || null,
          resend_message_id: messageId || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    }

    // Update campaign statistics
    const { data: stats } = await supabase
      .from("email_campaign_recipients")
      .select("status", { count: "exact" })
      .eq("campaign_id", campaign_id);

    // Stats available for future use (delivery rate tracking, etc.)
    void stats;

    await supabase
      .from("email_campaigns")
      .update({
        sent_count: (campaign.sent_count || 0) + sentCount,
        failed_count: (campaign.failed_count || 0) + failedCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", campaign_id);

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        failed: failedCount,
        message: `Sent to ${sentCount} recipients, ${failedCount} failed`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-email-campaign:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
