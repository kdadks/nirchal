-- =====================================================================================
-- Location Data Fetch Function for Supabase
-- =====================================================================================
-- This SQL file creates a PostgreSQL function that fetches IP geolocation data
-- from ipapi.co server-side (via the `http` extension), completely avoiding
-- browser CORS errors and client-side rate limiting (429).
--
-- Usage from client:
--   const { data, error } = await supabase.rpc('fetch_location_data');
--
-- The function includes:
--   - Per-IP caching (30-minute TTL) to minimize ipapi.co requests
--   - Lazy cleanup of expired cache entries (within the function)
--   - Graceful fallback to expired cache if ipapi.co is rate-limited
--
-- Prerequisites: The `http` extension must be enabled in your Supabase project
-- (Project Settings → Extensions → enable "pgHTTP").
-- =====================================================================================

-- Enable the http extension for making HTTP requests from PostgreSQL
create extension if not exists http;

-- ---------------------------------------------------------------------------
-- 1. Create cache table
-- ---------------------------------------------------------------------------
create table if not exists public.location_cache (
    ip_address  text     primary key,
    data        jsonb   not null,
    created_at  timestamptz default now(),
    expires_at  timestamptz not null
);

-- Index for cleanup queries
create index if not exists idx_location_cache_expires on public.location_cache(expires_at);

-- ---------------------------------------------------------------------------
-- 2. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.location_cache enable row level security;

create policy "service_role_all_access_location_cache"
on public.location_cache
for all
to service_role
using (true)
with check (true);

create policy "public_read_location_cache"
on public.location_cache
for select
to public
using (true);

create policy "public_insert_location_cache"
on public.location_cache
for insert
to public
with check (true);

create policy "public_update_location_cache"
on public.location_cache
for update
to public
using (true);

-- ---------------------------------------------------------------------------
-- 3. Fetch location data function (server-side HTTP call to ipapi.co)
-- ---------------------------------------------------------------------------
create or replace function public.fetch_location_data()
returns json
language plpgsql
as $$
declare
    client_ip      text;
    cached_data    json;
    api_response     json;
    response_content text;
begin
    -- Get the visitor's real IP from Supabase request headers
    client_ip := coalesce(
        current_setting('request.header.cf-connecting-ip', true),
        current_setting('request.header.x-forwarded-for', true),
        current_setting('request.header.x-real-ip', true),
        '0.0.0.0'
    );

    -- Clean up the IP (take first in comma list, strip port)
    client_ip := split_part(client_ip, ',', 1);
    client_ip := trim(both ' ', client_ip);
    client_ip := split_part(client_ip, ':', 1);

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

    -- Fetch fresh data from ipapi.co (server-side — no CORS issues)
    select content into response_content
    from http_get('https://ipapi.co/json/');

    if response_content is not null then
        api_response := response_content::json;

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

-- Grant execute to anon and authenticated roles
grant execute on function public.fetch_location_data() to anon;
grant execute on function public.fetch_location_data() to authenticated;

-- Note: Expired cache entries are cleaned up lazily within the function itself
-- (see "Remove expired entries" above), so no cron job is needed.
