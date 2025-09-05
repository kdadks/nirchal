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

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Razorpay-Signature',
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
    console.log('Received webhook:', {
      method: event.httpMethod,
      headers: event.headers,
      bodyLength: event.body ? event.body.length : 0
    });

    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No request body' })
      };
    }

    // Get webhook signature from headers
    const signature = event.headers['x-razorpay-signature'] || event.headers['X-Razorpay-Signature'];
    
    if (!signature) {
      console.error('Missing Razorpay signature header');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing signature header' })
      };
    }

    // Get webhook secret from database
    const { data: webhookSecretData, error: secretError } = await supabase
      .from('settings')
      .select('value')
      .eq('category', 'payment')
      .eq('key', 'razorpay_webhook_secret')
      .single();

    if (secretError || !webhookSecretData?.value) {
      console.error('Webhook secret not configured:', secretError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Webhook secret not configured' })
      };
    }

    const webhookSecret = webhookSecretData.value;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(event.body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Invalid webhook signature', {
        expected: expectedSignature,
        received: signature
      });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid signature' })
      };
    }

    console.log('Webhook signature verified successfully');

    // Parse webhook payload
    const webhookPayload = JSON.parse(event.body);
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
        await handlePaymentCaptured(paymentEntity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(paymentEntity);
        break;
      
      case 'order.paid':
        await handleOrderPaid(orderEntity, paymentEntity);
        break;
      
      default:
        console.log('Unhandled webhook event:', eventType);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        event: eventType,
        message: 'Webhook processed successfully'
      })
    };

  } catch (error) {
    console.error('Webhook processing error:', error);
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

// Handle payment captured event
async function handlePaymentCaptured(payment: any) {
  try {
    console.log('Processing payment.captured event:', payment.id);
    
    // Find the order in our database using Razorpay order ID
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', payment.order_id)
      .single();

    if (orderError || !order) {
      console.error('Order not found for payment:', payment.order_id);
      return;
    }

    // Update order status to paid if not already
    if (order.payment_status !== 'paid') {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          razorpay_payment_id: payment.id,
          payment_details: payment,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('Failed to update order status:', updateError);
      } else {
        console.log('Order status updated to paid:', order.order_number);
      }
    }

  } catch (error) {
    console.error('Error handling payment.captured:', error);
  }
}

// Handle payment failed event
async function handlePaymentFailed(payment: any) {
  try {
    console.log('Processing payment.failed event:', payment.id);
    
    // Find the order in our database using Razorpay order ID
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', payment.order_id)
      .single();

    if (orderError || !order) {
      console.error('Order not found for failed payment:', payment.order_id);
      return;
    }

    // Update order status to failed
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'failed',
        payment_error: payment.error_description || 'Payment failed',
        payment_details: payment,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Failed to update order status to failed:', updateError);
    } else {
      console.log('Order status updated to failed:', order.order_number);
    }

  } catch (error) {
    console.error('Error handling payment.failed:', error);
  }
}

// Handle order paid event
async function handleOrderPaid(order: any, payment: any) {
  try {
    console.log('Processing order.paid event:', order.id);
    
    // Find the order in our database using Razorpay order ID
    const { data: dbOrder, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', order.id)
      .single();

    if (orderError || !dbOrder) {
      console.error('Order not found for order.paid event:', order.id);
      return;
    }

    // Update order status to paid if not already
    if (dbOrder.payment_status !== 'paid') {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          razorpay_payment_id: payment?.id,
          payment_details: { order, payment },
          updated_at: new Date().toISOString()
        })
        .eq('id', dbOrder.id);

      if (updateError) {
        console.error('Failed to update order status for order.paid:', updateError);
      } else {
        console.log('Order status updated to paid via order.paid event:', dbOrder.order_number);
      }
    }

  } catch (error) {
    console.error('Error handling order.paid:', error);
  }
}

export { handler };
