// Cloudflare Pages Function for fetching IP geolocation data from ipapi.co
// Path: /functions/fetch-location

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// In-memory cache keyed by client IP (TTL 30 min) to reduce ipapi.co rate-limit hits
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000;

export async function onRequest(context: { request: Request; env: any }) {
  const { request } = context;

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Only allow GET / POST (supabase.functions.invoke sends POST)
  if (request.method !== 'GET' && request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Determine client IP for caching
    const clientIP =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Return cached result if fresh
    const cached = cache.get(clientIP);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Fetch fresh location data from ipapi.co (server-side — no CORS issues)
    // IMPORTANT: Pass the client IP in the URL so ipapi.co returns the visitor's location
    // NOT the server's location. This is the fix for the production issue where
    // ip: "0.0.0.0", city: undefined, country: undefined
    const response = await fetch(`https://ipapi.co/${clientIP}/json/`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`ipapi.co returned status ${response.status}`);
    }

    const data = await response.json();
    cache.set(clientIP, { data, timestamp: Date.now() });

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('[fetch-location] Error:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to fetch location data',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}
