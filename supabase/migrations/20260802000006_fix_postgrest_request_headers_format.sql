-- Fix: Use PostgREST v11+ request.headers JSON format to read client IP
-- =====================================================================================
-- PostgREST v11+ stores all request headers in a single JSON GUC:
--   current_setting('request.headers', true)::json
--
-- Previous migrations used the old v1-v10 format:
--   current_setting('request.header.cf-connecting-ip', true)  -- always NULL on v11+
--
-- Because the old format always returned NULL, client_ip fell back to '0.0.0.0'.
-- ipwhois.app returns {"success": false} for 0.0.0.0, so every call ended with
--   {"error": "Location data unavailable"}.
-- =====================================================================================

create or replace function public.fetch_location_data()
returns json
language plpgsql
as $$
declare
    client_ip      text;
    cached_data    json;
    api_response   jsonb;
    response_text  text;
    req_headers    json;
begin
    -- PostgREST v11+ stores all request headers as a JSON string in 'request.headers'.
    -- Fall back gracefully if the setting is absent (e.g. direct PL/pgSQL call in tests).
    begin
        req_headers := current_setting('request.headers', true)::json;
    exception
        when others then
            req_headers := '{}'::json;
    end;

    client_ip := coalesce(
        req_headers->>'cf-connecting-ip',
        req_headers->>'x-forwarded-for',
        req_headers->>'x-real-ip',
        '0.0.0.0'
    );

    -- Take first address from comma-separated list, trim whitespace
    client_ip := split_part(client_ip, ',', 1);
    client_ip := trim(both ' ' from client_ip);

    -- Use inet cast to normalise the address (strips port on IPv4, preserves IPv6)
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
                -- Normalise: add country_name alias for backward compat
                api_response := api_response || jsonb_build_object('country_name', api_response->>'country');

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

    -- API call failed — fall back to expired cache if available
    select data::json into cached_data
    from public.location_cache
    where ip_address = client_ip;

    if cached_data is not null then
        return cached_data;
    end if;

    return json_build_object('error', 'Location data unavailable');
end;
$$;

grant execute on function public.fetch_location_data() to anon;
grant execute on function public.fetch_location_data() to authenticated;
