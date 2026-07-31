-- =====================================================================================
-- Fix: Use client IP for geolocation instead of server IP
-- =====================================================================================
-- The previous implementation called https://ipapi.co/json/ which returns the
-- PostgreSQL server's location. This caused incorrect currency detection when
-- the server is outside India.
--
-- This migration fixes the function to pass the visitor's real IP address
-- extracted from the cf-connecting-ip header, ensuring geolocation returns
-- the correct country for each user.

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

    client_ip := split_part(client_ip, ',', 1);
    client_ip := trim(both ' ', client_ip);
    client_ip := split_part(client_ip, ':', 1);

    select data::json into cached_data
    from public.location_cache
    where ip_address = client_ip
      and expires_at > now();

    if cached_data is not null then
        return cached_data;
    end if;

    select content into response_text
    from http_get('https://ipapi.co/' || client_ip || '/json/');

    if response_text is not null then
        api_response := response_text::json;

        insert into public.location_cache (ip_address, data, expires_at)
        values (client_ip, api_response::jsonb, now() + interval '30 minutes')
        on conflict (ip_address)
        do update set
            data        = excluded.data,
            created_at  = now(),
            expires_at  = now() + interval '30 minutes';

        return api_response;
    end if;

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

drop policy if exists "public_delete_location_cache" on public.location_cache;
create policy "public_delete_location_cache"
on public.location_cache
for delete
to public
using (true);
