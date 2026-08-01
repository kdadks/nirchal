-- Switch geolocation provider from ipapi.co to ipwhois.app (ipwhois.io)
-- ipwhois.app: free, HTTPS, 10k req/month, no API key
-- Response uses "success": false for errors (vs ipapi.co "error": true)
-- and "country" for the country name (vs ipapi.co "country_name")
-- The normalized response adds "country_name" = "country" for backwards compat.

-- Clear stale cache entries from the old provider
delete from public.location_cache;

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

    -- Take first address from comma-separated list, trim whitespace
    client_ip := split_part(client_ip, ',', 1);
    client_ip := trim(both ' ', client_ip);

    -- Use inet cast to strip port suffixes (IPv4) while preserving full IPv6 addresses
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

    -- Remove expired entries for this IP before inserting fresh data
    delete from public.location_cache
    where ip_address = client_ip
      and expires_at < now();

    -- Fetch from ipwhois.app (server-side — no CORS issues, no API key needed)
    begin
        select content into response_text
        from http_get('https://ipwhois.app/json/' || client_ip);

        if response_text is not null then
            api_response := response_text::jsonb;

            -- ipwhois.app signals failure with "success": false
            if (api_response->>'success')::boolean = false then
                -- error response — skip caching, fall through to fallback
            else
                -- Normalize: add country_name alias so existing clients need no changes
                api_response := api_response || jsonb_build_object('country_name', api_response->>'country');

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
