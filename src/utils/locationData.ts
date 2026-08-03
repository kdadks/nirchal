export interface LocationData {
  ip?: string;
  country_code?: string;
  country?: string;
  country_name?: string;
  city?: string;
  region?: string;
  latitude?: number | null;
  longitude?: number | null;
}

/** Fallback: free public IP geolocation (no API key, ~45k req/day free tier). */
async function fetchLocationFallback(): Promise<LocationData | null> {
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('https://ipwho.is/', {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(tid);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.success || !data?.country_code) return null;
    return {
      ip: data.ip,
      country_code: data.country_code,
      country: data.country_code,
      country_name: data.country,
      city: data.city,
      region: data.region,
    } satisfies LocationData;
  } catch {
    return null;
  }
}

/**
 * Fetch geolocation via the Cloudflare Pages function (/fetch-location).
 * Falls back to ipwho.is if the CF function is unavailable or returns no data.
 * Returns null only when both sources fail.
 */
export async function fetchLocationData(): Promise<LocationData | null> {
  try {
    const response = await fetch('/fetch-location', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      if (data && !data.error && data.success !== false) {
        return data as LocationData;
      }
    }
  } catch {
    // CF function unreachable — fall through to public fallback
  }

  return fetchLocationFallback();
}
