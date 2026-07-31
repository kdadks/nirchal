-- =====================================================================================
-- Fix: IPv6 address corruption in fetch_location_data
-- =====================================================================================
-- The split_part(client_ip, ':', 1) on line 31 of migration
-- 20260802000001_fix_location_client_ip.sql was intended to strip port
-- numbers from IPv4 addresses (e.g. 192.168.1.1:54321 → 192.168.1.1).
-- However, IPv6 addresses contain colons as part of the address itself,
-- so this split destroyed them:
--   ::1           → ''  (empty string — malformed URL to ipapi.co)
--   2001:db8::1   → '2001'  (truncated — also malformed)
--
-- This caused HTTP 500 errors in the fetch_location_data RPC whenever a
-- visitor connected over IPv6, which broke currency detection and
-- geolocation for those users.
--
-- The fix replaces split_part with a cast to the inet type. PostgreSQL's
-- inet type:
--   - Accepts IPv4 addresses with an optional port suffix and strips the port
--   - Correctly preserves full IPv6 addresses (including ::1 shorthand)
--   - Returns a normalized text representation without any port
--
-- If the IP cannot be parsed as inet (malformed input), we fall back to
-- '0.0.0.0' so the function never 500s on bad header values.

create or replace function public.fetch_location_data()
returns json
language plpgsql
as $$
declare
    client_ip      text;
    cached_data    json;
    api_response   json;
    response_text   text;
begin
    client_ip := coalesce(
        current_setting('request.header.cf-connecting-ip', true),
        current_setting('request.header.x-forwarded-for', true),
        current_setting('request.header.x-real-ip', true),
        '0.0.0.0'
    );

    -- Clean up the IP: take the first address in a comma-separated list
    -- (e.g. X-Forwarded-For can contain "client, proxy1, proxy2")
    client_ip := split_part(client_ip, ',', 1);
    client_ip := trim(both ' ', client_ip);

    -- Parse the IP with the inet type to strip port suffixes for IPv4
    -- while preserving IPv6 addresses that contain colons.
    -- The previous approach, split_part(client_ip, ':', 1), corrupted
    -- IPv6 addresses (e.g. ::1 → empty, 2001:db8::1 → 2001).
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
    select content into response_text
    from http_get('https://ipapi.co/' || client_ip || '/json/');

    if response_text is not null then
        api_response := response_text::json;

        -- Cache the result for 30 minutes
        insert into public.location_cache (ip_address, data, expires_at)
        values (client_ip, api_response::jsonb, now() + interval '30 minutes')
        on conflict (ip_address)
        do update set
            data        = excluded.data,
            created_at  = now(),
            expires_at  = now() + interval '30 minutes';

        return api_response;
    end if;

    -- API call failed — fall back to expired cache if available
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

drop policy if exists "public_delete_location_cache" on public.location_cache;
create policy "public_delete_location_cache"
on public.location_cache
for delete
to public
using (true);
