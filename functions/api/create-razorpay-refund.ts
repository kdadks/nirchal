/**
 * Cloudflare Pages Function: Create Razorpay Refund
 * 
 * This function creates a refund in Razorpay for a successful payment.
 * Razorpay credentials are stored in Cloudflare environment variables (secrets).
 */

interface Env {
  // Razorpay (stored as secrets in Cloudflare)
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
}

interface CreateRefundRequest {
  payment_id: string;
  amount: number; // Amount in paise
  speed?: 'normal' | 'optimum';
  notes?: Record<string, string>;
  receipt?: string;
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
    console.log('Create Razorpay Refund - Request received');

    // Parse request body
    const requestData: CreateRefundRequest = await request.json();
    const { payment_id, amount, speed = 'normal', notes, receipt } = requestData;

    console.log('Refund request:', {
      payment_id,
      amount,
      speed,
      has_notes: !!notes
    });

    // Validate input
    if (!payment_id || !amount) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: payment_id, amount' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate environment variables
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      console.error('Missing Razorpay credentials');
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Create Basic Auth header for Razorpay
    const authString = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);

    // Prepare refund request payload
    const refundPayload: Record<string, any> = {
      amount,
      speed,
    };

    if (notes) {
      refundPayload.notes = notes;
    }

    if (receipt) {
      refundPayload.receipt = receipt;
    }

    console.log('Calling Razorpay API to create refund...');

    // Call Razorpay API to create refund
    const razorpayResponse = await fetch(
      `https://api.razorpay.com/v1/payments/${payment_id}/refund`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refundPayload),
      }
    );

    const responseData = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error('Razorpay API error:', responseData);
      return new Response(
        JSON.stringify({
          error: responseData.error?.description || 'Failed to create refund',
          code: responseData.error?.code,
          razorpay_error: responseData.error
        }),
        { status: razorpayResponse.status, headers: corsHeaders }
      );
    }

    console.log('Refund created successfully:', responseData.id);

    // Return success response
    return new Response(
      JSON.stringify(responseData),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error creating refund:', error);

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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  });
}
