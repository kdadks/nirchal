import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface RetryRequest {
  campaign_id: string;
  max_retries?: number;
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
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { campaign_id, max_retries = 3 } = (await req.json()) as RetryRequest;

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

    // Get failed recipients that haven't exceeded max retries
    const { data: failedRecipients, error: recipientsError } = await supabase
      .from("email_campaign_recipients")
      .select("*")
      .eq("campaign_id", campaign_id)
      .eq("status", "failed")
      .lt("retry_count", max_retries);

    if (recipientsError || !failedRecipients) {
      return new Response(JSON.stringify({ error: "Failed to fetch recipients" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Retry sending
    let successCount = 0;
    let stillFailedCount = 0;

    for (const recipient of failedRecipients) {
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
        successCount++;
        await supabase
          .from("email_campaign_recipients")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            resend_message_id: result.messageId,
            retry_count: recipient.retry_count + 1,
            last_retry_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", recipient.id);
      } else {
        stillFailedCount++;
        await supabase
          .from("email_campaign_recipients")
          .update({
            retry_count: recipient.retry_count + 1,
            last_retry_at: new Date().toISOString(),
            error_message: result.error,
            updated_at: new Date().toISOString(),
          })
          .eq("id", recipient.id);
      }

      // Log the retry event
      await supabase
        .from("email_campaign_logs")
        .insert({
          campaign_id: campaign_id,
          recipient_id: recipient.id,
          event_type: "retry",
          event_details: {
            timestamp: new Date().toISOString(),
            retryCount: recipient.retry_count + 1,
            success: result.success,
            messageId: result.messageId,
            error: result.error,
          },
        });
    }

    // Update campaign statistics
    await supabase
      .from("email_campaigns")
      .update({
        sent_count: campaign.sent_count + successCount,
        failed_count: Math.max(0, campaign.failed_count - successCount + stillFailedCount),
        updated_at: new Date().toISOString(),
      })
      .eq("id", campaign_id);

    return new Response(
      JSON.stringify({
        success: true,
        retried: failedRecipients.length,
        newlySuccessful: successCount,
        stillFailed: stillFailedCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in retry-failed-emails:", error);
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
