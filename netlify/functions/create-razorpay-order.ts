import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

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

interface CreateOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
  customer_email: string;
  customer_phone: string;
  notes?: Record<string, string>;
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
    console.log('Received request:', {
      method: event.httpMethod,
      body: event.body ? event.body.substring(0, 200) : 'No body'
    });

    const { amount, currency, receipt, customer_email, customer_phone, notes }: CreateOrderRequest = JSON.parse(event.body || '{}');

    console.log('Parsed request data:', {
      amount,
      currency,
      receipt,
      customer_email,
      customer_phone: customer_phone ? 'provided' : 'not provided'
    });

    // Validate input
    if (!amount || !currency || !receipt || !customer_email) {
      console.error('Missing required fields:', {
        amount: !!amount,
        currency: !!currency,
        receipt: !!receipt,
        customer_email: !!customer_email
      });
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
        'razorpay_enabled',
        'razorpay_environment', 
        'razorpay_key_id',
        'razorpay_key_secret',
        'razorpay_auto_capture'
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

    // Check if Razorpay is enabled
    if (settings.razorpay_enabled !== 'true') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Razorpay payment gateway is disabled' })
      };
    }

    // Get appropriate credentials based on environment
    const environment = settings.razorpay_environment || 'test';
    const keyId = settings.razorpay_key_id;
    const keySecret = settings.razorpay_key_secret;

    if (!keyId || !keySecret) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: `Razorpay ${environment} credentials not configured` })
      };
    }

    // Create Razorpay order
    const orderData = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency,
      receipt: receipt,
      notes: notes || {},
      payment_capture: settings.razorpay_auto_capture === 'true' ? 1 : 0
    };

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`
      },
      body: JSON.stringify(orderData)
    });

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json();
      console.error('Razorpay API error:', errorData);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to create order', 
          details: errorData.error?.description 
        })
      };
    }

    const razorpayOrder = await razorpayResponse.json();

    // Get checkout configuration
    const { data: companySettings } = await supabase
      .from('settings')
      .select('key, value')
      .eq('category', 'payment')
      .in('key', [
        'razorpay_company_name',
        'razorpay_company_logo',
        'razorpay_theme_color',
        'razorpay_description',
        'razorpay_timeout'
      ]);

    const companyConfig: { [key: string]: string } = {};
    companySettings?.forEach(setting => {
      companyConfig[setting.key] = setting.value;
    });

    // Return order details and checkout config
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        order: razorpayOrder,
        checkout_config: {
          key: keyId,
          order_id: razorpayOrder.id,
          currency: currency,
          amount: razorpayOrder.amount,
          name: companyConfig.razorpay_company_name || 'Nirchal',
          description: companyConfig.razorpay_description || 'Payment for Nirchal order',
          image: companyConfig.razorpay_company_logo,
          prefill: {
            email: customer_email,
            contact: customer_phone
          },
          theme: {
            color: companyConfig.razorpay_theme_color || '#f59e0b'
          },
          timeout: parseInt(companyConfig.razorpay_timeout || '900'),
          modal: {
            ondismiss: function() {
              console.log('Razorpay checkout dismissed');
            }
          }
        }
      })
    };

  } catch (error) {
    console.error('Error in create-razorpay-order function:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      event: {
        httpMethod: event.httpMethod,
        body: event.body ? event.body.substring(0, 200) : 'No body'
      }
    });
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
