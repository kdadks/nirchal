/**
 * Cloudflare Pages Function: Verify Razorpay Payment
 * 
 * This function verifies the payment signature from Razorpay to ensure
 * payment authenticity and prevent fraud.
 */

interface Env {
  // Supabase
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  
  // Razorpay
  RAZORPAY_KEY_SECRET: string;
}

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  order_id: string; // Our internal order ID
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  try {
    console.log('Verify Razorpay Payment - Request received');

    // Parse request body
    const requestData: VerifyPaymentRequest = await request.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      order_id 
    } = requestData;

    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate environment variables
    if (!env.RAZORPAY_KEY_SECRET) {
      console.error('Missing Razorpay secret');
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase credentials');
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('Verifying payment:', {
      order_id,
      razorpay_order_id,
      razorpay_payment_id
    });

    // Verify payment signature using Web Crypto API
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(env.RAZORPAY_KEY_SECRET);
    const bodyData = encoder.encode(body);

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

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.error('Payment signature verification failed', {
        order_id,
        razorpay_order_id,
        razorpay_payment_id,
        expected: expectedSignature.substring(0, 10) + '...',
        received: razorpay_signature.substring(0, 10) + '...'
      });

      // Update order status to failed
      await fetch(
        `${env.SUPABASE_URL}/rest/v1/orders?id=eq.${order_id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            payment_status: 'failed',
            payment_error: 'Invalid payment signature',
            updated_at: new Date().toISOString()
          })
        }
      );

      return new Response(
        JSON.stringify({ 
          error: 'Payment verification failed', 
          verified: false 
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('Payment signature verified successfully');

    // 🔒 DUPLICATE PAYMENT PROTECTION: Check if order is already paid
    const orderCheckResponse = await fetch(
      `${env.SUPABASE_URL}/rest/v1/orders?id=eq.${order_id}&select=payment_status`,
      {
        headers: {
          'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    );

    if (!orderCheckResponse.ok) {
      console.error('Failed to check order status');
      return new Response(
        JSON.stringify({ error: 'Failed to verify order status' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const orderData = await orderCheckResponse.json();
    const currentOrder = orderData[0];

    if (!currentOrder) {
      console.error('Order not found:', order_id);
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: corsHeaders }
      );
    }

    if (currentOrder.payment_status === 'paid') {
      console.warn('⚠️ DUPLICATE PAYMENT ATTEMPT BLOCKED:', {
        order_id,
        razorpay_payment_id,
        current_status: currentOrder.payment_status
      });
      
      return new Response(
        JSON.stringify({ 
          verified: true,
          already_processed: true,
          message: 'Payment already processed for this order',
          order_id 
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Update order with payment details
    const updateResponse = await fetch(
      `${env.SUPABASE_URL}/rest/v1/orders?id=eq.${order_id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          payment_status: 'paid',
          razorpay_payment_id: razorpay_payment_id,
          razorpay_order_id: razorpay_order_id,
          updated_at: new Date().toISOString()
        })
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Failed to update order:', {
        status: updateResponse.status,
        statusText: updateResponse.statusText,
        error: errorText,
        order_id
      });
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update order status',
          details: errorText,
          status: updateResponse.status
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('✅ Payment verified and order updated:', order_id);

    return new Response(
      JSON.stringify({ 
        verified: true,
        message: 'Payment verified successfully',
        order_id,
        payment_id: razorpay_payment_id
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error in verify-razorpay-payment:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle OPTIONS request for CORS
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  });
}
