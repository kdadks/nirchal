/**
 * Cloudflare Pages Function: Razorpay Webhook Handler
 * 
 * This function receives and processes webhook events from Razorpay
 * to update order statuses in real-time.
 */

interface Env {
  // Supabase
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  
  // Razorpay
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET: string;
}

function createBasicAuthHeader(keyId: string, keySecret: string) {
  const raw = `${keyId}:${keySecret}`;
  if (typeof btoa === 'function') {
    return `Basic ${btoa(raw)}`;
  }
  // @ts-ignore - Buffer is available in Node bundler during build
  return `Basic ${Buffer.from(raw).toString('base64')}`;
}

async function fetchPaymentDetailsFromRazorpay(env: Env, paymentId?: string, orderId?: string) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    console.error('❌ Missing Razorpay API credentials in environment variables');
    return null;
  }

  const authHeader = createBasicAuthHeader(env.RAZORPAY_KEY_ID, env.RAZORPAY_KEY_SECRET);

  try {
    if (paymentId) {
      const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': authHeader
        }
      });

      if (paymentResponse.ok) {
        const paymentDetails = await paymentResponse.json();
        console.log('✅ Fetched payment via paymentId:', {
          payment_id: paymentDetails.id,
          method: paymentDetails.method,
          amount: paymentDetails.amount,
          status: paymentDetails.status
        });
        return paymentDetails;
      }

      const errorText = await paymentResponse.text();
      console.error('❌ Razorpay /payments/{id} error:', {
        status: paymentResponse.status,
        error: errorText,
        paymentId
      });
    }

    if (orderId) {
      console.log('📡 Fetching payments list for order:', orderId);
      const paymentsResponse = await fetch(`https://api.razorpay.com/v1/orders/${orderId}/payments`, {
        headers: {
          'Authorization': authHeader
        }
      });

      if (paymentsResponse.ok) {
        const data = await paymentsResponse.json();
        const paymentDetails = data?.items?.[0] || null;

        if (paymentDetails) {
          console.log('✅ Fetched payment via order payments list:', {
            payment_id: paymentDetails.id,
            method: paymentDetails.method,
            amount: paymentDetails.amount,
            status: paymentDetails.status
          });
          return paymentDetails;
        }

        console.warn('⚠️ No payments found for order:', {
          orderId,
          itemsCount: Array.isArray(data?.items) ? data.items.length : 0
        });
      } else {
        const errorText = await paymentsResponse.text();
        console.error('❌ Razorpay /orders/{id}/payments error:', {
          status: paymentsResponse.status,
          error: errorText,
          orderId
        });
      }
    }
  } catch (error) {
    console.error('❌ Error fetching payment details from Razorpay API:', {
      error: error instanceof Error ? error.message : String(error),
      paymentId,
      orderId
    });
  }

  console.warn('⚠️ No payment details returned from Razorpay API after lookup attempts', {
    paymentId,
    orderId
  });
  return null;
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

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
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

    console.log('🔔 Webhook event received:', {
      event: eventType,
      paymentId: paymentEntity?.id,
      orderId: paymentEntity?.order_id || orderEntity?.id,
      status: paymentEntity?.status,
      amount: paymentEntity?.amount,
      timestamp: new Date().toISOString()
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
    console.log('🎯 Processing payment.captured event:', {
      payment_id: payment.id,
      order_id: payment.order_id,
      amount: payment.amount,
      method: payment.method,
      status: payment.status
    });
    
    // 🔒 DUPLICATE PAYMENT PROTECTION: Check if this payment ID is already processed
    const existingPaymentResponse = await fetch(
      `${env.SUPABASE_URL}/rest/v1/orders?razorpay_payment_id=eq.${payment.id}&select=id,order_number,payment_status`,
      {
        headers: {
          'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
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
          'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
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

    const paymentDetails = await fetchPaymentDetailsFromRazorpay(env, payment.id, payment.order_id) || payment;
    if (!paymentDetails) {
      console.warn('⚠️ Payment details still missing after Razorpay fetch fallback (payment.captured)', {
        payment_id: payment.id,
        order_id: payment.order_id
      });
    }

    // Update order status to paid
    console.log('💾 Updating order with payment details:', {
      order_id: order.id,
      order_number: order.order_number,
      updating_payment_id: payment.id,
      updating_order_id: payment.order_id,
      payment_details_size: JSON.stringify(paymentDetails).length,
      has_payment_method: !!paymentDetails?.method,
      has_payment_amount: !!paymentDetails?.amount
    });

    const updateResponse = await fetch(
      `${env.SUPABASE_URL}/rest/v1/orders?id=eq.${order.id}`,
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
          razorpay_payment_id: payment.id,
          razorpay_order_id: payment.order_id,
          payment_details: paymentDetails,
          updated_at: new Date().toISOString()
        })
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('❌ Failed to update order status:', {
        status: updateResponse.status,
        statusText: updateResponse.statusText,
        error: errorText,
        order_id: order.id,
        order_number: order.order_number
      });
      return;
    }

    console.log('✅ Order status updated to paid:', order.order_number);
    console.log('📝 Payment details saved:', {
      order_id: order.id,
      order_number: order.order_number,
      payment_id: payment.id,
      payment_method: paymentDetails?.method,
      payment_amount: paymentDetails?.amount,
      payment_details_type: typeof paymentDetails,
      payment_details_keys: paymentDetails ? Object.keys(paymentDetails).length : 0
    });

    // ✅ NOW UPDATE INVENTORY: Payment is confirmed, decrement stock
    await updateInventoryForOrder(env, order.id);

  } catch (error) {
    console.error('❌ Error handling payment.captured:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      payment_id: payment?.id
    });
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
          'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
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
          'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
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
    console.log('🎯 Processing order.paid event:', {
      razorpay_order_id: order.id,
      razorpay_payment_id: payment?.id,
      payment_status: payment?.status
    });
    
    // Find the order using Razorpay order ID
    const orderResponse = await fetch(
      `${env.SUPABASE_URL}/rest/v1/orders?razorpay_order_id=eq.${order.id}&select=*`,
      {
        headers: {
          'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    );

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('❌ Failed to fetch order for order.paid event:', {
        razorpay_order_id: order.id,
        status: orderResponse.status,
        error: errorText
      });
      return;
    }

    const orderData = await orderResponse.json();
    const dbOrder = orderData[0];

    if (!dbOrder) {
      console.error('❌ Order not found for order.paid event:', {
        razorpay_order_id: order.id,
        searched_field: 'razorpay_order_id',
        note: 'Order might not have razorpay_order_id set yet, or was not created properly'
      });
      return;
    }

    console.log('✅ Found order:', {
      order_id: dbOrder.id,
      order_number: dbOrder.order_number,
      current_payment_status: dbOrder.payment_status,
      has_payment_details: !!dbOrder.payment_details
    });

    // Check if we need to update payment_details even if order is already paid
    const needsUpdate = dbOrder.payment_status !== 'paid' || !dbOrder.payment_details;
    
    if (needsUpdate) {
      console.log('💾 Updating order via order.paid event:', {
        order_id: dbOrder.id,
        order_number: dbOrder.order_number,
        current_status: dbOrder.payment_status,
        has_payment_details: !!dbOrder.payment_details,
        payment_object_exists: !!payment,
        payment_id: payment?.id
      });

      const paymentDetails = await fetchPaymentDetailsFromRazorpay(env, payment?.id, order?.id) || payment;
      if (!paymentDetails) {
        console.warn('⚠️ Payment details still missing after Razorpay fetch fallback (order.paid)', {
          razorpay_order_id: order?.id,
          payment_id: payment?.id
        });
      }

      const updatePayload = {
        payment_status: 'paid',
        razorpay_payment_id: payment?.id || dbOrder.razorpay_payment_id,
        razorpay_order_id: order?.id || dbOrder.razorpay_order_id,
        payment_details: paymentDetails || { order, payment },
        updated_at: new Date().toISOString()
      };

      console.log('📤 Sending update to database:', {
        order_id: dbOrder.id,
        has_payment_details: !!updatePayload.payment_details,
        payment_details_type: typeof updatePayload.payment_details,
        payment_details_size: JSON.stringify(updatePayload.payment_details).length,
        payment_details_keys: Object.keys(updatePayload.payment_details || {}).slice(0, 10)
      });

      const updateResponse = await fetch(
        `${env.SUPABASE_URL}/rest/v1/orders?id=eq.${dbOrder.id}`,
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
        console.error('❌ Failed to update order status for order.paid:', {
          status: updateResponse.status,
          error: errorText,
          order_id: dbOrder.id
        });
      } else {
        console.log('✅ Order status updated via order.paid event:', {
          order_number: dbOrder.order_number,
          payment_id: payment?.id,
          payment_details_added: !!paymentDetails
        });
      }
    } else {
      console.log('ℹ️ Order already paid and has payment_details, skipping update:', dbOrder.order_number);
    }

  } catch (error) {
    console.error('Error handling order.paid:', error);
  }
}

// Update inventory after payment confirmation
async function updateInventoryForOrder(env: Env, orderId: string) {
  try {
    console.log('📦 Updating inventory for order:', orderId);

    // Get order items
    const itemsResponse = await fetch(
      `${env.SUPABASE_URL}/rest/v1/order_items?order_id=eq.${orderId}&select=*`,
      {
        headers: {
          'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    );

    if (!itemsResponse.ok) {
      console.error('Failed to fetch order items');
      return;
    }

    const items = await itemsResponse.json();

    for (const item of items) {
      try {
        // Find inventory record for this product/variant
        let inventoryUrl = `${env.SUPABASE_URL}/rest/v1/inventory?product_id=eq.${item.product_id}`;
        
        if (item.product_variant_id) {
          inventoryUrl += `&variant_id=eq.${item.product_variant_id}`;
        } else {
          inventoryUrl += `&variant_id=is.null`;
        }

        const inventoryResponse = await fetch(inventoryUrl, {
          headers: {
            'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
          }
        });

        if (!inventoryResponse.ok) {
          console.error(`Failed to fetch inventory for product ${item.product_id}`);
          continue;
        }

        const inventoryRecords = await inventoryResponse.json();

        if (!inventoryRecords || inventoryRecords.length === 0) {
          console.warn(`No inventory record found for product ${item.product_id}`);
          continue;
        }

        const inventoryRecord = inventoryRecords[0];
        const oldQuantity = inventoryRecord.quantity;
        const newQuantity = Math.max(0, oldQuantity - item.quantity);

        // Update inventory quantity
        const updateResponse = await fetch(
          `${env.SUPABASE_URL}/rest/v1/inventory?id=eq.${inventoryRecord.id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              quantity: newQuantity,
              updated_at: new Date().toISOString()
            })
          }
        );

        if (!updateResponse.ok) {
          console.error(`Failed to update inventory for product ${item.product_id}`);
          continue;
        }

        // Create inventory history record
        await fetch(
          `${env.SUPABASE_URL}/rest/v1/inventory_history`,
          {
            method: 'POST',
            headers: {
              'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              inventory_id: inventoryRecord.id,
              previous_quantity: oldQuantity,
              new_quantity: newQuantity,
              change_type: 'STOCK_OUT',
              reason: `Order ${orderId} - Payment Confirmed`,
              created_by: null,
              created_at: new Date().toISOString()
            })
          }
        );

        console.log(`✅ Inventory updated: ${item.product_name} (${oldQuantity} → ${newQuantity})`);

      } catch (error) {
        console.error(`Error processing inventory for item:`, error);
      }
    }

    console.log('✅ Inventory update completed for order:', orderId);

  } catch (error) {
    console.error('Error updating inventory:', error);
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
