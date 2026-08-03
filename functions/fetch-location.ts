// Cloudflare Pages Function — geolocation using CF-native metadata (primary) + ipwhois.app (enrichment)
// Primary source: request.cf — free, no rate limits, always set by Cloudflare on every request.
// Enrichment: ipwhois.app — adds country name; skipped on any failure (rate limit, timeout, etc.).
// Path: /functions/fetch-location

interface CfProperties {
  country?: string;
  city?: string;
  region?: string;
  regionCode?: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
  postalCode?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export async function onRequest(context: { request: Request; env: any }) {
  const { request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'GET' && request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // CF-native geo object — always present on Cloudflare Pages, no external call needed
  const cf = (request as any).cf as CfProperties | undefined;

  const clientIP =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '';

  // cf.country is the ISO 3166-1 alpha-2 code; 'XX' means Cloudflare couldn't determine it
  const countryCode = cf?.country || request.headers.get('cf-ipcountry') || '';
  if (!countryCode || countryCode === 'XX' || countryCode === 'T1') {
    return new Response(
      JSON.stringify({ error: 'Location data unavailable' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Baseline response from CF metadata — this alone is enough for currency detection
  const result: Record<string, any> = {
    success: true,
    ip: clientIP,
    country_code: countryCode,
    country: countryCode,       // overwritten below if ipwhois.app enrichment succeeds
    country_name: countryCode,  // normalized alias expected by consumers
    city: cf?.city || null,
    region: cf?.region || null,
    latitude: cf?.latitude || null,
    longitude: cf?.longitude || null,
  };

  // Optional enrichment: get the human-readable country name from ipwhois.app
  // Abort after 2 s so a slow/rate-limited response never blocks the reply
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 2000);

    const ipRes = await fetch(`https://ipwhois.app/json/${clientIP}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(tid);

    if (ipRes.ok) {
      const enriched = await ipRes.json();
      if (enriched.success !== false && enriched.country) {
        result.country      = enriched.country;
        result.country_name = enriched.country;
        if (enriched.city)      result.city      = enriched.city;
        if (enriched.region)    result.region    = enriched.region;
        if (enriched.latitude)  result.latitude  = enriched.latitude;
        if (enriched.longitude) result.longitude = enriched.longitude;
      }
    }
  } catch {
    // ipwhois.app unavailable (rate-limited, timeout, network) — CF data is sufficient
  }

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}
