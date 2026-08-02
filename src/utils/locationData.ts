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

/**
 * Fetch geolocation via the Cloudflare Pages function (/fetch-location).
 * Cloudflare injects cf-connecting-ip on every request, so the worker
 * always sees the real client IP — no header-format issues.
 * Returns null on any failure so callers can use their own fallback.
 */
export async function fetchLocationData(): Promise<LocationData | null> {
  try {
    const response = await fetch('/fetch-location', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (!data || data.error || data.success === false) return null;

    return data as LocationData;
  } catch {
    return null;
  }
}
