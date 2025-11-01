/**
 * Cloudflare Pages Function: Razorpay Webhook Handler
 * 
 * Handles webhook events from Razorpay for payment and refund status updates.
 * Webhook URL: https://your-domain.com/api/razorpay-webhook
 */

import { createClient } from '@supabase/supabase-js';

interface Env {
  RAZORPAY_WEBHOOK_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

interface RazorpayWebhookEvent {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: {
      entity: any;
    };
    refund?: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        currency: string;
        payment_id: string;
        notes: any;
        receipt: string | null;
        acquirer_data: any;
        created_at: number;
        batch_id: string | null;
        status: string;
        speed_processed: string;
        speed_requested: string;
      };
    };
  };
  created_at: number;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  console.log('Razorpay Webhook - Request received');

  try {
    // Get webhook signature from headers
    const signature = request.headers.get('X-Razorpay-Signature');
    
    if (!signature) {
      console.error('No webhook signature provided');
      return new Response(
        JSON.stringify({ error: 'No signature provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get request body
    const body = await request.text();
    
    // Verify webhook signature
    const crypto = await import('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Webhook signature verified');

    // Parse webhook payload
    const webhookEvent: RazorpayWebhookEvent = JSON.parse(body);
    
    console.log('Webhook event:', {
      event: webhookEvent.event,
      entity: webhookEvent.entity,
      contains: webhookEvent.contains,
    });

    // Initialize Supabase client with service role (bypass RLS)
    const supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Handle different webhook events
    switch (webhookEvent.event) {
      case 'refund.processed':
        await handleRefundProcessed(webhookEvent, supabase);
        break;
      
      case 'refund.failed':
        await handleRefundFailed(webhookEvent, supabase);
        break;
      
      case 'payment.captured':
        console.log('Payment captured event (already handled in checkout)');
        break;
      
      default:
        console.log(`Unhandled webhook event: ${webhookEvent.event}`);
    }

    return new Response(
      JSON.stringify({ status: 'success' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle refund.processed webhook event
 */
async function handleRefundProcessed(
  webhookEvent: RazorpayWebhookEvent,
  supabase: any
) {
  const refund = webhookEvent.payload.refund?.entity;
  
  if (!refund) {
    console.error('No refund entity in webhook payload');
    return;
  }

  console.log('Processing refund.processed:', {
    refund_id: refund.id,
    payment_id: refund.payment_id,
    amount: refund.amount,
    status: refund.status,
  });

  try {
    // Update refund transaction status in database
    const { data: transaction, error: updateError } = await supabase
      .from('razorpay_refund_transactions')
      .update({
        status: 'processed',
        razorpay_status: refund.status,
        processed_at: new Date().toISOString(),
        razorpay_response: refund,
      })
      .eq('razorpay_refund_id', refund.id)
      .select('*, return_request_id')
      .single();

    if (updateError) {
      console.error('Failed to update refund transaction:', updateError);
      return;
    }

    console.log('Refund transaction updated:', transaction);

    // Update return request status to refund_completed
    const { data: returnRequest, error: returnError } = await supabase
      .from('return_requests')
      .update({
        status: 'refund_completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction.return_request_id)
      .select(`
        *,
        return_items (
          *,
          product:product_id (
            id,
            name,
            images
          ),
          variant:variant_id (
            id,
            name,
            sku
          )
        ),
        order:order_id (
          order_number,
          customer_id,
          billing_email,
          billing_first_name,
          billing_last_name
        )
      `)
      .single();

    if (returnError) {
      console.error('Failed to update return request:', returnError);
      return;
    }

    console.log('Return request updated to refund_completed');

    // Add status history
    await supabase.from('return_status_history').insert({
      return_request_id: transaction.return_request_id,
      status: 'refund_completed',
      notes: `Refund processed by Razorpay: ${refund.id}`,
      created_by: null, // System-generated
    });

    // Send email notification to customer
    const customerEmail = returnRequest.order?.billing_email;
    const customerName = `${returnRequest.order?.billing_first_name || ''} ${returnRequest.order?.billing_last_name || ''}`.trim();

    if (customerEmail) {
      console.log('Sending refund completion email to:', customerEmail);
      
      // Prepare return request with items for email template
      const returnRequestWithItems = {
        ...returnRequest,
        customer_email: customerEmail,
        customer_first_name: returnRequest.order?.billing_first_name,
        customer_last_name: returnRequest.order?.billing_last_name,
      };

      // Send email via Supabase Edge Function or external service
      // Note: This needs to be implemented based on your email service setup
      try {
        const emailResponse = await fetch(`${env.SUPABASE_URL}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            type: 'refund_completed',
            to: customerEmail,
            data: {
              returnRequest: returnRequestWithItems,
              customerName,
              refundTransaction: transaction,
              refundDate: new Date().toLocaleDateString(),
            },
          }),
        });

        if (emailResponse.ok) {
          console.log('Refund completion email sent successfully');
        } else {
          console.error('Failed to send email:', await emailResponse.text());
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the webhook if email fails
      }
    } else {
      console.warn('No customer email found, skipping email notification');
    }

  } catch (error) {
    console.error('Error processing refund.processed webhook:', error);
    throw error;
  }
}

/**
 * Handle refund.failed webhook event
 */
async function handleRefundFailed(
  webhookEvent: RazorpayWebhookEvent,
  supabase: any
) {
  const refund = webhookEvent.payload.refund?.entity;
  
  if (!refund) {
    console.error('No refund entity in webhook payload');
    return;
  }

  console.log('Processing refund.failed:', {
    refund_id: refund.id,
    payment_id: refund.payment_id,
    amount: refund.amount,
    status: refund.status,
  });

  try {
    // Update refund transaction status to failed
    const { data: transaction, error: updateError } = await supabase
      .from('razorpay_refund_transactions')
      .update({
        status: 'failed',
        razorpay_status: refund.status,
        razorpay_response: refund,
      })
      .eq('razorpay_refund_id', refund.id)
      .select('return_request_id')
      .single();

    if (updateError) {
      console.error('Failed to update refund transaction:', updateError);
      return;
    }

    console.log('Refund transaction marked as failed');

    // Add status history
    await supabase.from('return_status_history').insert({
      return_request_id: transaction.return_request_id,
      status: 'refund_initiated', // Keep status as initiated since it failed
      notes: `Refund failed in Razorpay: ${refund.id}. Admin needs to retry.`,
      created_by: null,
    });

    console.log('Refund failure recorded. Admin needs to manually retry.');

  } catch (error) {
    console.error('Error processing refund.failed webhook:', error);
    throw error;
  }
}
