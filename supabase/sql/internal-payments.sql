-- Private data and password hashes must be seeded separately, never committed here.
create schema if not exists rio_internal_private;
revoke all on schema rio_internal_private from public, anon, authenticated;
grant usage on schema rio_internal_private to service_role;
create table rio_internal_private.documents (
 id text primary key, password_hash text not null, payload jsonb not null,
 window_start timestamptz not null default now(), attempts integer not null default 0
);
create table rio_internal_private.attempts (
 key text primary key, window_start timestamptz not null, attempts integer not null
);
alter table rio_internal_private.documents enable row level security;
alter table rio_internal_private.attempts enable row level security;
revoke all on all tables in schema rio_internal_private from public, anon, authenticated;
grant select, update on rio_internal_private.documents to service_role;
grant select, insert, update, delete on rio_internal_private.attempts to service_role;
create or replace function public.rio_internal_unlock(p_password text,p_ip_hash text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare d rio_internal_private.documents%rowtype; n integer; t timestamptz := clock_timestamp();
begin
 select * into d from rio_internal_private.documents where id='payments' for update;
 if not found then return jsonb_build_object('status',503); end if;
 if d.window_start < t - interval '1 hour' then
   update rio_internal_private.documents set window_start=t,attempts=0 where id='payments';
   d.attempts := 0;
 end if;
 if d.attempts >= 100 then return jsonb_build_object('status',429); end if;
 update rio_internal_private.documents set attempts=attempts+1 where id='payments';
 delete from rio_internal_private.attempts where window_start < t - interval '1 day';
 insert into rio_internal_private.attempts as a values(p_ip_hash,t,1)
 on conflict(key) do update set attempts=case when a.window_start < t-interval '15 minutes' then 1 else a.attempts+1 end,
 window_start=case when a.window_start < t-interval '15 minutes' then t else a.window_start end
 returning attempts into n;
 if n > 5 then return jsonb_build_object('status',429); end if;
 if p_password ~ '^[0-9]{4}$' and extensions.crypt(p_password,d.password_hash)=d.password_hash then
   return jsonb_build_object('status',200,'data',d.payload);
 end if;
 return jsonb_build_object('status',401);
end $$;
revoke all on function public.rio_internal_unlock(text,text) from public,anon,authenticated;
grant execute on function public.rio_internal_unlock(text,text) to service_role;
