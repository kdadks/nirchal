import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExchangeRateResponse {
  success: boolean;
  rates?: {
    USD: number;
    EUR: number;
  };
  error?: string;
}

/**
 * Fetch exchange rates from XE.com currency API
 * Note: xe.com doesn't provide a free API, so we're using exchangerate-api as primary source
 * You can replace this with xe.com API if you have API credentials
 */
async function fetchExchangeRates(): Promise<{ USD: number; EUR: number }> {
  try {
    // Try primary API: exchangerate-api.com (free tier)
    console.log('[Exchange Rates] Fetching from exchangerate-api.com...');
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.rates || !data.rates.USD || !data.rates.EUR) {
      throw new Error('Invalid response format from API');
    }

    // Convert from INR to foreign currency to foreign currency to INR
    const usdRate = 1 / data.rates.USD; // INR per USD
    const eurRate = 1 / data.rates.EUR; // INR per EUR

    console.log('[Exchange Rates] Fetched rates:', {
      USD: usdRate.toFixed(2),
      EUR: eurRate.toFixed(2),
    });

    return {
      USD: Math.round(usdRate * 100) / 100, // Round to 2 decimal places
      EUR: Math.round(eurRate * 100) / 100,
    };
  } catch (error) {
    console.error('[Exchange Rates] Error fetching from primary API:', error);
    
    // Fallback to backup API
    try {
      console.log('[Exchange Rates] Trying backup API: open.er-api.com...');
      const backupResponse = await fetch('https://open.er-api.com/v6/latest/INR');
      
      if (!backupResponse.ok) {
        throw new Error(`Backup API returned status ${backupResponse.status}`);
      }

      const backupData = await backupResponse.json();
      
      if (!backupData.rates || !backupData.rates.USD || !backupData.rates.EUR) {
        throw new Error('Invalid response format from backup API');
      }

      const usdRate = 1 / backupData.rates.USD;
      const eurRate = 1 / backupData.rates.EUR;

      console.log('[Exchange Rates] Fetched rates from backup:', {
        USD: usdRate.toFixed(2),
        EUR: eurRate.toFixed(2),
      });

      return {
        USD: Math.round(usdRate * 100) / 100,
        EUR: Math.round(eurRate * 100) / 100,
      };
    } catch (backupError) {
      console.error('[Exchange Rates] Backup API also failed:', backupError);
      throw new Error('All exchange rate APIs failed');
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[Exchange Rates] Starting rate fetch...');

    // Fetch latest rates
    const rates = await fetchExchangeRates();

    // Update USD rate
    const { error: usdError } = await supabase
      .from('exchange_rates')
      .update({
        rate: rates.USD,
        updated_at: new Date().toISOString(),
        source: 'xe.com',
      })
      .eq('currency', 'USD');

    if (usdError) {
      console.error('[Exchange Rates] Error updating USD rate:', usdError);
      throw usdError;
    }

    // Update EUR rate
    const { error: eurError } = await supabase
      .from('exchange_rates')
      .update({
        rate: rates.EUR,
        updated_at: new Date().toISOString(),
        source: 'xe.com',
      })
      .eq('currency', 'EUR');

    if (eurError) {
      console.error('[Exchange Rates] Error updating EUR rate:', eurError);
      throw eurError;
    }

    console.log('[Exchange Rates] Successfully updated rates in database');

    const response: ExchangeRateResponse = {
      success: true,
      rates: {
        USD: rates.USD,
        EUR: rates.EUR,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('[Exchange Rates] Function error:', error);

    const errorResponse: ExchangeRateResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
