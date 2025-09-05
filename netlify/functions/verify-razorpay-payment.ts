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
        'razorpay_key_id',
        'razorpay_key_secret'
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
    const keySecret = settings.razorpay_key_secret;

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

      // Note: Payment failure email will be sent by client-side code
      console.log('Payment verification failed - client should handle failure email notification');

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Payment verification failed', 
          verified: false 
        })
      };
    }

    // 🔒 DUPLICATE PAYMENT PROTECTION: Check if order is already paid
    const { data: currentOrder, error: orderCheckError } = await supabase
      .from('orders')
      .select('payment_status, razorpay_payment_id, total_amount, order_number')
      .eq('id', order_id)
      .single();

    if (orderCheckError) {
      console.error('Error checking order status:', orderCheckError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to verify order status' })
      };
    }

    // If order is already paid, prevent duplicate payment processing
    if (currentOrder.payment_status === 'paid') {
      console.warn('🚫 DUPLICATE PAYMENT ATTEMPT BLOCKED:', {
        order_id,
        order_number: currentOrder.order_number,
        existing_payment_id: currentOrder.razorpay_payment_id,
        new_payment_id: razorpay_payment_id,
        amount: currentOrder.total_amount
      });

      return {
        statusCode: 409, // Conflict status code
        headers,
        body: JSON.stringify({
          error: 'Order has already been paid',
          verified: false,
          duplicate_payment: true,
          existing_payment_id: currentOrder.razorpay_payment_id,
          order_number: currentOrder.order_number,
          message: 'This order has already been successfully paid. No additional payment is required.'
        })
      };
    }

    // Additional protection: Check if this exact payment ID has already been processed
    const { data: existingPayment } = await supabase
      .from('orders')
      .select('id, order_number, payment_status')
      .eq('razorpay_payment_id', razorpay_payment_id)
      .neq('id', order_id) // Exclude current order
      .single();

    if (existingPayment) {
      console.warn('🚫 PAYMENT ID ALREADY USED:', {
        payment_id: razorpay_payment_id,
        existing_order: existingPayment.order_number,
        current_order_id: order_id,
        existing_status: existingPayment.payment_status
      });

      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          error: 'Payment ID has already been used for another order',
          verified: false,
          duplicate_payment_id: true,
          existing_order: existingPayment.order_number,
          message: 'This payment has already been processed for a different order.'
        })
      };
    }

    // Get additional credentials for fetching payment details
    const keyId = settings.razorpay_key_id;

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

    // Send payment success email (optional server-side backup)
    try {
      // Note: We'll primarily rely on client-side email sending
      // This is a backup in case client-side fails
      console.log('Payment verification successful - client should handle email notifications');
    } catch (emailError) {
      console.error('Server-side email notification setup error:', emailError);
    }

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
