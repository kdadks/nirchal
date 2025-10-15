/**
 * Cloudflare Pages Function: Create Razorpay Order
 * 
 * This function creates a Razorpay payment order with server-side security.
 * Razorpay credentials are stored in Cloudflare environment variables (secrets).
 */

interface Env {
  // Supabase
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  
  // Razorpay (stored as secrets in Cloudflare)
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
}

interface CreateOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
  customer_email: string;
  customer_phone: string;
  notes?: Record<string, string>;
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
    console.log('Create Razorpay Order - Request received');

    // Parse request body
    const requestData: CreateOrderRequest = await request.json();
    const { amount, currency, receipt, customer_email, customer_phone, notes } = requestData;

    console.log('Order request:', {
      amount,
      currency,
      receipt,
      customer_email,
      customer_phone: customer_phone ? 'provided' : 'not provided'
    });

    // Validate input
    if (!amount || !currency || !receipt || !customer_email) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
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

    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      console.error('Missing Supabase credentials');
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Fetch Razorpay settings from Supabase
    const settingsResponse = await fetch(
      `${env.SUPABASE_URL}/rest/v1/settings?category=eq.payment&key=in.(razorpay_enabled,razorpay_auto_capture,razorpay_company_name,razorpay_company_logo,razorpay_theme_color,razorpay_description,razorpay_timeout)`,
      {
        headers: {
          'apikey': env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!settingsResponse.ok) {
      console.error('Failed to fetch settings');
      return new Response(
        JSON.stringify({ error: 'Failed to load payment settings' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const settingsData = await settingsResponse.json();
    
    // Convert settings array to object
    const settings: { [key: string]: string } = {};
    settingsData.forEach((setting: { key: string; value: string }) => {
      settings[setting.key] = setting.value;
    });

    // Check if Razorpay is enabled
    if (settings.razorpay_enabled !== 'true') {
      return new Response(
        JSON.stringify({ error: 'Razorpay payment gateway is disabled' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Create Razorpay order
    const orderData = {
      amount: Math.round(amount * 100), // Convert to paise (smallest currency unit)
      currency: currency.toUpperCase(),
      receipt: receipt,
      notes: notes || {},
      payment_capture: settings.razorpay_auto_capture === 'true' ? 1 : 0
    };

    console.log('Creating Razorpay order:', { ...orderData, amount: `${orderData.amount} paise` });

    // Call Razorpay API
    const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(orderData)
    });

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json();
      console.error('Razorpay API error:', errorData);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create order', 
          details: errorData.error?.description 
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const razorpayOrder = await razorpayResponse.json();
    console.log('Razorpay order created:', razorpayOrder.id);

    // Return order details and checkout config
    return new Response(
      JSON.stringify({
        order: razorpayOrder,
        checkout_config: {
          key: env.RAZORPAY_KEY_ID,
          order_id: razorpayOrder.id,
          currency: currency.toUpperCase(),
          amount: razorpayOrder.amount,
          name: settings.razorpay_company_name || 'Nirchal',
          description: settings.razorpay_description || 'Payment for Nirchal order',
          image: settings.razorpay_company_logo,
          prefill: {
            email: customer_email,
            contact: customer_phone
          },
          theme: {
            color: settings.razorpay_theme_color || '#f59e0b'
          },
          timeout: parseInt(settings.razorpay_timeout || '900')
        }
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error in create-razorpay-order:', error);
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
