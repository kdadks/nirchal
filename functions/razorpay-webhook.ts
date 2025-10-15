/**
 * Cloudflare Pages Function: Razorpay Webhook Handler
 * 
 * This function receives and processes webhook events from Razorpay
 * to update order statuses in real-time.
 */

interface Env {
  // Supabase
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  
  // Razorpay Webhook Secret
  RAZORPAY_WEBHOOK_SECRET: string;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Razorpay-Signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  try {
    console.log('Razorpay Webhook - Request received');

    // Get webhook signature from headers
    const signature = request.headers.get('x-razorpay-signature');
    
    if (!signature) {
      console.error('Missing Razorpay signature header');
      return new Response(
        JSON.stringify({ error: 'Missing signature header' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate environment variables
    if (!env.RAZORPAY_WEBHOOK_SECRET) {
      console.error('Webhook secret not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      console.error('Missing Supabase credentials');
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Get request body as text for signature verification
    const bodyText = await request.text();

    if (!bodyText) {
      console.error('No request body');
      return new Response(
        JSON.stringify({ error: 'No request body' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Verify webhook signature using Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(env.RAZORPAY_WEBHOOK_SECRET);
    const bodyData = encoder.encode(bodyText);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', key, bodyData);
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = signatureArray
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (expectedSignature !== signature) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('Webhook signature verified successfully');

    // Parse webhook payload
    const webhookPayload = JSON.parse(bodyText);
    const eventType = webhookPayload.event;
    const paymentEntity = webhookPayload.payload?.payment?.entity;
    const orderEntity = webhookPayload.payload?.order?.entity;

    console.log('Webhook event:', {
      event: eventType,
      paymentId: paymentEntity?.id,
      orderId: paymentEntity?.order_id || orderEntity?.id,
      status: paymentEntity?.status,
      amount: paymentEntity?.amount
    });

    // Handle different webhook events
    switch (eventType) {
      case 'payment.captured':
        await handlePaymentCaptured(env, paymentEntity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(env, paymentEntity);
        break;
      
      case 'order.paid':
        await handleOrderPaid(env, orderEntity, paymentEntity);
        break;
      
      default:
        console.log('Unhandled webhook event:', eventType);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        event: eventType,
        message: 'Webhook processed successfully'
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle payment captured event
async function handlePaymentCaptured(env: Env, payment: any) {
  try {
    console.log('Processing payment.captured event:', payment.id);
    
    // 🔒 DUPLICATE PAYMENT PROTECTION: Check if this payment ID is already processed
    const existingPaymentResponse = await fetch(
      `${env.SUPABASE_URL}/rest/v1/orders?payment_id=eq.${payment.id}&select=id,order_number,payment_status`,
      {
        headers: {
          'apikey': env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
        }
      }
    );

    if (existingPaymentResponse.ok) {
      const existingData = await existingPaymentResponse.json();
      if (existingData && existingData.length > 0) {
        console.warn('🚫 WEBHOOK DUPLICATE PAYMENT BLOCKED:', {
          payment_id: payment.id,
          existing_order: existingData[0].order_number,
          existing_status: existingData[0].payment_status
        });
        return; // Skip processing duplicate payment
      }
    }
    
    // Find the order using Razorpay order ID
    const orderResponse = await fetch(
      `${env.SUPABASE_URL}/rest/v1/orders?razorpay_order_id=eq.${payment.order_id}&select=*`,
      {
        headers: {
          'apikey': env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!orderResponse.ok) {
      console.error('Failed to fetch order for payment:', payment.order_id);
      return;
    }

    const orderData = await orderResponse.json();
    const order = orderData[0];

    if (!order) {
      console.error('Order not found for payment:', payment.order_id);
      return;
    }

    // 🔒 Additional protection: Check if order is already paid
    if (order.payment_status === 'paid') {
      console.warn('🚫 WEBHOOK ORDER ALREADY PAID:', {
        order_id: order.id,
        order_number: order.order_number,
        existing_payment_id: order.payment_id,
        new_payment_id: payment.id
      });
      return; // Skip processing for already paid orders
    }

    // Update order status to paid
    const updateResponse = await fetch(
      `${env.SUPABASE_URL}/rest/v1/orders?id=eq.${order.id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          payment_status: 'paid',
          payment_id: payment.id,
          payment_details: payment,
          updated_at: new Date().toISOString()
        })
      }
    );

    if (!updateResponse.ok) {
      console.error('Failed to update order status');
    } else {
      console.log('✅ Order status updated to paid:', order.order_number);
    }

  } catch (error) {
    console.error('Error handling payment.captured:', error);
  }
}

// Handle payment failed event
async function handlePaymentFailed(env: Env, payment: any) {
  try {
    console.log('Processing payment.failed event:', payment.id);
    
    // Find the order using Razorpay order ID
    const orderResponse = await fetch(
      `${env.SUPABASE_URL}/rest/v1/orders?razorpay_order_id=eq.${payment.order_id}&select=*`,
      {
        headers: {
          'apikey': env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!orderResponse.ok) {
      console.error('Failed to fetch order for failed payment:', payment.order_id);
      return;
    }

    const orderData = await orderResponse.json();
    const order = orderData[0];

    if (!order) {
      console.error('Order not found for failed payment:', payment.order_id);
      return;
    }

    // Update order status to failed
    const updateResponse = await fetch(
      `${env.SUPABASE_URL}/rest/v1/orders?id=eq.${order.id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          payment_status: 'failed',
          payment_error: payment.error_description || 'Payment failed',
          payment_details: payment,
          updated_at: new Date().toISOString()
        })
      }
    );

    if (!updateResponse.ok) {
      console.error('Failed to update order status to failed');
    } else {
      console.log('Order status updated to failed:', order.order_number);
    }

  } catch (error) {
    console.error('Error handling payment.failed:', error);
  }
}

// Handle order paid event
async function handleOrderPaid(env: Env, order: any, payment: any) {
  try {
    console.log('Processing order.paid event:', order.id);
    
    // Find the order using Razorpay order ID
    const orderResponse = await fetch(
      `${env.SUPABASE_URL}/rest/v1/orders?razorpay_order_id=eq.${order.id}&select=*`,
      {
        headers: {
          'apikey': env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!orderResponse.ok) {
      console.error('Failed to fetch order for order.paid event:', order.id);
      return;
    }

    const orderData = await orderResponse.json();
    const dbOrder = orderData[0];

    if (!dbOrder) {
      console.error('Order not found for order.paid event:', order.id);
      return;
    }

    // Update order status to paid if not already
    if (dbOrder.payment_status !== 'paid') {
      const updateResponse = await fetch(
        `${env.SUPABASE_URL}/rest/v1/orders?id=eq.${dbOrder.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            payment_status: 'paid',
            payment_id: payment?.id,
            payment_details: { order, payment },
            updated_at: new Date().toISOString()
          })
        }
      );

      if (!updateResponse.ok) {
        console.error('Failed to update order status for order.paid');
      } else {
        console.log('Order status updated to paid via order.paid event:', dbOrder.order_number);
      }
    }

  } catch (error) {
    console.error('Error handling order.paid:', error);
  }
}

// Handle OPTIONS request for CORS
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Razorpay-Signature',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  });
}
