/**
 * Cloudflare Pages Function: Check Razorpay Refund Status
 * 
 * This function checks the status of a refund in Razorpay.
 * Razorpay credentials are stored in Cloudflare environment variables (secrets).
 */

interface Env {
  // Razorpay (stored as secrets in Cloudflare)
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
}

interface CheckRefundStatusRequest {
  payment_id: string;
  refund_id: string;
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
    console.log('Check Razorpay Refund Status - Request received');

    // Parse request body
    const requestData: CheckRefundStatusRequest = await request.json();
    const { payment_id, refund_id } = requestData;

    console.log('Refund status check:', {
      payment_id,
      refund_id
    });

    // Validate input
    if (!payment_id || !refund_id) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: payment_id, refund_id' }),
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

    console.log('Calling Razorpay API to check refund status...');

    // Call Razorpay API to fetch refund details
    const razorpayResponse = await fetch(
      `https://api.razorpay.com/v1/payments/${payment_id}/refunds/${refund_id}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const responseData = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error('Razorpay API error:', responseData);
      return new Response(
        JSON.stringify({
          error: responseData.error?.description || 'Failed to fetch refund status',
          code: responseData.error?.code,
          razorpay_error: responseData.error
        }),
        { status: razorpayResponse.status, headers: corsHeaders }
      );
    }

    console.log('Refund status fetched successfully:', responseData.status);

    // Return success response
    return new Response(
      JSON.stringify(responseData),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error checking refund status:', error);

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
