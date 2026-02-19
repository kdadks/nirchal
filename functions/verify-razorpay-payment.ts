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
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;

  // Email
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
  EMAIL_FROM_NAME: string;
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

    // Fetch payment details from Razorpay API
    let paymentDetails = null;
    if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
      try {
        const authHeader = `Basic ${btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)}`;
        const paymentResponse = await fetch(
          `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
          {
            headers: { 'Authorization': authHeader }
          }
        );
        
        if (paymentResponse.ok) {
          paymentDetails = await paymentResponse.json();
          console.log('✅ Fetched payment details from Razorpay API');
        }
      } catch (error) {
        console.warn('Failed to fetch payment details, will continue without them:', error);
      }
    }

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
    const updatePayload: any = {
      payment_status: 'paid',
      razorpay_payment_id: razorpay_payment_id,
      razorpay_order_id: razorpay_order_id,
      payment_transaction_id: razorpay_payment_id,
      updated_at: new Date().toISOString()
    };

    // Add payment details if we fetched them
    if (paymentDetails) {
      updatePayload.payment_details = paymentDetails;
      console.log('💾 Saving payment details:', {
        payment_id: paymentDetails.id,
        method: paymentDetails.method,
        amount: paymentDetails.amount
      });
    }

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
        body: JSON.stringify(updatePayload)
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

    // Fetch full order details to send admin notification
    try {
      const fullOrderResponse = await fetch(
        `${env.SUPABASE_URL}/rest/v1/orders?id=eq.${order_id}&select=order_number,billing_first_name,billing_last_name,billing_email,total_amount,payment_method`,
        {
          headers: {
            'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
          }
        }
      );

      if (fullOrderResponse.ok && env.RESEND_API_KEY) {
        const fullOrderData = await fullOrderResponse.json();
        const fullOrder = fullOrderData[0];

        if (fullOrder) {
          const customerName = `${fullOrder.billing_first_name || ''} ${fullOrder.billing_last_name || ''}`.trim() || 'Customer';
          const orderNumber = fullOrder.order_number || order_id;
          const totalAmount = (fullOrder.total_amount || 0).toLocaleString('en-IN');
          const paymentMethod = fullOrder.payment_method || 'Razorpay';
          const fromName = env.EMAIL_FROM_NAME || 'Nirchal';
          const fromAddress = env.EMAIL_FROM || 'support@nirchal.com';

          const adminHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">🎉 New Order Received!</h1>
              </div>
              <div style="padding: 30px; background-color: #ffffff;">
                <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                  <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Order Details</h2>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Order Number:</td><td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${orderNumber}</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Customer:</td><td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${customerName}</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Email:</td><td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${fullOrder.billing_email || 'N/A'}</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Total Amount:</td><td style="padding: 8px 0; color: #10b981; font-weight: 700; font-size: 18px;">₹${totalAmount}</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Payment Method:</td><td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${paymentMethod}</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Payment ID:</td><td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${razorpay_payment_id}</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Time:</td><td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td></tr>
                  </table>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                  <p style="color: #6b7280; margin: 0; font-size: 14px;">Please process this order promptly and update the customer with shipping details.</p>
                </div>
              </div>
              <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; margin: 0; font-size: 12px;">This is an automated notification from Nirchal e-commerce system.</p>
              </div>
            </div>
          `;

          const resendPayload = {
            from: `${fromName} <${fromAddress}>`,
            to: ['amit.ranjan78@gmail.com'],
            subject: `🛍️ New Order #${orderNumber} - ₹${totalAmount} - Nirchal`,
            html: adminHtml
          };

          const adminEmailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(resendPayload)
          });

          if (adminEmailResponse.ok) {
            console.log('✅ Admin order notification email sent for order:', orderNumber);
          } else {
            const errText = await adminEmailResponse.text();
            console.error('❌ Failed to send admin order notification:', errText);
          }
        }
      }
    } catch (notifyError) {
      console.error('❌ Error sending admin order notification:', notifyError);
      // Non-fatal: don't fail the payment verification response
    }

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
