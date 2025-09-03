import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseKey
  });
}

const supabase = createClient(supabaseUrl!, supabaseKey!);

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  order_id: string; // Our internal order ID
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      order_id 
    }: VerifyPaymentRequest = JSON.parse(event.body || '{}');

    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Get Razorpay settings from database
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('key, value')
      .eq('category', 'payment')
      .in('key', [
        'razorpay_environment',
        'razorpay_key_secret',
        'razorpay_test_key_secret'
      ]);

    if (settingsError) {
      console.error('Settings error:', settingsError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to load payment settings' })
      };
    }

    // Convert settings array to object
    const settings: { [key: string]: string } = {};
    settingsData?.forEach(setting => {
      settings[setting.key] = setting.value;
    });

    // Get appropriate secret based on environment
    const environment = settings.razorpay_environment || 'test';
    const keySecret = environment === 'test' 
      ? settings.razorpay_test_key_secret 
      : settings.razorpay_key_secret;

    if (!keySecret) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: `Razorpay ${environment} secret not configured` })
      };
    }

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      // Log failed verification attempt
      console.error('Payment signature verification failed', {
        order_id,
        razorpay_order_id,
        razorpay_payment_id,
        expected: expectedSignature,
        received: razorpay_signature
      });

      // Update order status to failed
      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          payment_error: 'Invalid payment signature',
          updated_at: new Date().toISOString()
        })
        .eq('id', order_id);

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Payment verification failed', 
          verified: false 
        })
      };
    }

    // Get additional credentials for fetching payment details
    const { data: credentialsData } = await supabase
      .from('settings')
      .select('key, value')
      .eq('category', 'payment')
      .in('key', [
        'razorpay_key_id',
        'razorpay_test_key_id'
      ]);

    const credentials: { [key: string]: string } = {};
    credentialsData?.forEach(setting => {
      credentials[setting.key] = setting.value;
    });

    const keyId = environment === 'test' 
      ? credentials.razorpay_test_key_id 
      : credentials.razorpay_key_id;

    // Fetch payment details from Razorpay
    let paymentDetails = null;
    try {
      const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`
        }
      });

      if (paymentResponse.ok) {
        paymentDetails = await paymentResponse.json();
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      // Continue without payment details if API call fails
    }

    // Update order status to paid
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        razorpay_order_id: razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id,
        payment_details: paymentDetails,
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating order:', updateError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to update order status' })
      };
    }

    // Log successful payment
    console.log('Payment verified successfully', {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      amount: (paymentDetails as any)?.amount || 'unknown',
      status: (paymentDetails as any)?.status || 'unknown'
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        verified: true,
        order: updatedOrder,
        payment_details: paymentDetails
      })
    };

  } catch (error) {
    console.error('Error in verify-razorpay-payment:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };
