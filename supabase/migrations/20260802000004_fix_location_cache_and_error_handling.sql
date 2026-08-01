-- =====================================================================================
-- Fix: Clear stale ipapi.co error cache + improve error handling in fetch_location_data
-- =====================================================================================
-- After applying migration 20260802000003 (inet cast for IPv6), some visitors
-- still receive {"error": true} because the location_cache table contains stale
-- cached error responses from ipapi.co (e.g. for invalid/unresolvable IPs on
-- localhost or private networks). When the function found these cached entries,
-- it returned them directly without checking whether they were ipapi.co errors.
--
-- This migration:
--   1. Clears ALL entries from location_cache (30-minute TTL means data will be
--      re-fetched on the next request)
--   2. Recreates the function with proactive checking: ipapi.co responses that
--      contain an "error" key are NOT cached and NOT returned to the client
--      — the function falls through to the expired-cache fallback or returns
--      its own {"error": "Location data unavailable"} message

-- ---------------------------------------------------------------------------
-- 1. Clear stale cache entries
-- ---------------------------------------------------------------------------
-- Remove all cached entries, including any that contain ipapi.co error responses
-- ({"error": true}) that were cached by the previous function version.
-- The cache is only 30-minute TTL anyway, so clearing it has minimal impact.
delete from public.location_cache;

-- ---------------------------------------------------------------------------
-- 2. Recreate the function with ipapi.co error response checking
-- ---------------------------------------------------------------------------
create or replace function public.fetch_location_data()
returns json
language plpgsql
as $$
declare
    client_ip      text;
    cached_data    json;
    api_response   jsonb;
    response_text  text;
begin
    client_ip := coalesce(
        current_setting('request.header.cf-connecting-ip', true),
        current_setting('request.header.x-forwarded-for', true),
        current_setting('request.header.x-real-ip', true),
        '0.0.0.0'
    );

    -- Clean up the IP: take the first address in a comma-separated list
    client_ip := split_part(client_ip, ',', 1);
    client_ip := trim(both ' ', client_ip);

    -- Use inet type to strip port suffixes for IPv4 while preserving
    -- full IPv6 addresses. The old split_part(client_ip, ':', 1) destroyed
    -- IPv6 addresses (::1 → '', 2001:db8::1 → '2001').
    begin
        client_ip := nullif(client_ip, '')::inet::text;
    exception
        when invalid_text_representation then
            client_ip := '0.0.0.0';
    end;

    -- Check cache first (30-minute TTL)
    select data::json into cached_data
    from public.location_cache
    where ip_address = client_ip
      and expires_at > now();

    if cached_data is not null then
        return cached_data;
    end if;

    -- Remove expired entries for this IP before inserting new data
    delete from public.location_cache
    where ip_address = client_ip
      and expires_at < now();

    -- Fetch fresh data from ipapi.co using the visitor's real IP
    -- (server-side HTTP call — no CORS or client-side rate limiting issues)
    begin
        select content into response_text
        from http_get('https://ipapi.co/' || client_ip || '/json/');

        if response_text is not null then
            api_response := response_text::jsonb;

            -- Check if ipapi.co returned an error response
            -- (e.g. {"error": true} for rate-limited, invalid, or
            -- unresolvable IPs). Do not cache or return these.
            if api_response ? 'error' then
                -- ipapi.co error — skip caching, fall through to fallback
            else
                -- Cache the successful result for 30 minutes
                insert into public.location_cache (ip_address, data, expires_at)
                values (client_ip, api_response, now() + interval '30 minutes')
                on conflict (ip_address)
                do update set
                    data        = excluded.data,
                    created_at  = now(),
                    expires_at  = now() + interval '30 minutes';

                return api_response;
            end if;
        end if;
    exception
        when others then
            -- http_get failed or JSON parsing threw — fall through to fallback
            response_text := null;
    end;

    -- API call failed or returned error — fall back to expired cache if available
    select data::json into cached_data
    from public.location_cache
    where ip_address = client_ip;

    if cached_data is not null then
        return cached_data;
    end if;

    -- No data available at all
    return json_build_object('error', 'Location data unavailable');
end;
$$;

grant execute on function public.fetch_location_data() to anon;
grant execute on function public.fetch_location_data() to authenticated;

-- Re-apply the delete policy (idempotent)
drop policy if exists "public_delete_location_cache" on public.location_cache;
create policy "public_delete_location_cache"
on public.location_cache
for delete
to public
using (true);
