/**
 * Cloudflare Pages Function: Razorpay Refund Webhook Handler
 * 
 * This function handles webhook events from Razorpay for refund status updates.
 * It verifies the webhook signature and updates the database accordingly.
 */

interface Env {
  // Razorpay
  RAZORPAY_WEBHOOK_SECRET: string;
  
  // Supabase
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

interface WebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    refund: {
      entity: {
        id: string;
        payment_id: string;
        amount: number;
        currency: string;
        status: string;
        created_at: number;
        notes?: Record<string, string>;
        speed_processed: string;
      };
    };
    payment?: {
      entity: {
        id: string;
        amount: number;
        currency: string;
      };
    };
  };
  created_at: number;
}

/**
 * Verify Razorpay webhook signature
 */
async function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return computedSignature === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Razorpay-Signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  try {
    console.log('[Razorpay Webhook] Request received');

    // Get webhook signature from headers
    const signature = request.headers.get('X-Razorpay-Signature');
    if (!signature) {
      console.error('[Razorpay Webhook] Missing signature');
      return new Response(
        JSON.stringify({ error: 'Missing webhook signature' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get request body
    const bodyText = await request.text();
    
    // Verify webhook signature
    if (env.RAZORPAY_WEBHOOK_SECRET) {
      const isValid = await verifyWebhookSignature(bodyText, signature, env.RAZORPAY_WEBHOOK_SECRET);
      if (!isValid) {
        console.error('[Razorpay Webhook] Invalid signature');
        return new Response(
          JSON.stringify({ error: 'Invalid webhook signature' }),
          { status: 401, headers: corsHeaders }
        );
      }
    }

    // Parse webhook payload
    const webhookData: WebhookPayload = JSON.parse(bodyText);
    const { event, payload } = webhookData;

    console.log(`[Razorpay Webhook] Event: ${event}`);

    // Only process refund events
    if (!event.startsWith('refund.')) {
      console.log(`[Razorpay Webhook] Ignoring non-refund event: ${event}`);
      return new Response(
        JSON.stringify({ message: 'Event ignored' }),
        { status: 200, headers: corsHeaders }
      );
    }

    const refund = payload.refund.entity;
    console.log(`[Razorpay Webhook] Processing refund: ${refund.id}, status: ${refund.status}`);

    // Get return request ID from notes
    const returnRequestId = refund.notes?.return_request_id;
    if (!returnRequestId) {
      console.error('[Razorpay Webhook] No return_request_id in refund notes');
      return new Response(
        JSON.stringify({ error: 'Missing return_request_id in refund notes' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate Supabase credentials
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[Razorpay Webhook] Missing Supabase credentials');
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Update refund transaction in database
    const updateResponse = await fetch(
      `${env.SUPABASE_URL}/rest/v1/razorpay_refund_transactions?razorpay_refund_id=eq.${refund.id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          status: refund.status,
          razorpay_status: refund.status,
          razorpay_response: payload.refund.entity,
          processed_at: refund.status === 'processed' ? new Date().toISOString() : null,
          failed_at: refund.status === 'failed' ? new Date().toISOString() : null,
        }),
      }
    );

    if (!updateResponse.ok) {
      console.error('[Razorpay Webhook] Failed to update refund transaction');
      const errorData = await updateResponse.text();
      console.error('Error:', errorData);
      throw new Error('Failed to update refund transaction');
    }

    console.log('[Razorpay Webhook] Updated refund transaction');

    // Update return request status based on refund status
    let returnStatus: string | undefined;
    let statusNotes: string;

    if (refund.status === 'processed') {
      returnStatus = 'refund_completed';
      statusNotes = `Refund processed successfully. Refund ID: ${refund.id}`;
    } else if (refund.status === 'failed') {
      returnStatus = 'approved'; // Reset to approved so admin can retry
      statusNotes = `Refund failed. Refund ID: ${refund.id}`;
    } else {
      statusNotes = `Refund status: ${refund.status}. Refund ID: ${refund.id}`;
    }

    if (returnStatus) {
      // Update return request status
      const returnUpdateResponse = await fetch(
        `${env.SUPABASE_URL}/rest/v1/return_requests?id=eq.${returnRequestId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: returnStatus,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      if (!returnUpdateResponse.ok) {
        console.error('[Razorpay Webhook] Failed to update return request status');
      } else {
        console.log(`[Razorpay Webhook] Updated return request status to: ${returnStatus}`);
      }

      // Add status history entry
      const historyResponse = await fetch(
        `${env.SUPABASE_URL}/rest/v1/return_status_history`,
        {
          method: 'POST',
          headers: {
            'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            return_request_id: returnRequestId,
            status: returnStatus,
            notes: statusNotes,
            created_by: null, // System-generated
          }),
        }
      );

      if (!historyResponse.ok) {
        console.error('[Razorpay Webhook] Failed to add status history');
      }
    }

    console.log('[Razorpay Webhook] Successfully processed webhook');

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed successfully' }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[Razorpay Webhook] Error processing webhook:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-Razorpay-Signature',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  });
}
