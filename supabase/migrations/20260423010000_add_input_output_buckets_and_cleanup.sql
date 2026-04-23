insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'generation-inputs',
    'generation-inputs',
    true,
    262144000,
    array[
        'image/jpeg',
        'image/png',
        'image/webp',
        'video/mp4',
        'video/quicktime',
        'video/webm',
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/x-wav',
        'audio/mp4'
    ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'generation-outputs',
    'generation-outputs',
    true,
    524288000,
    array['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view generation inputs" on storage.objects;
create policy "Public can view generation inputs"
    on storage.objects for select
    to public
    using (bucket_id = 'generation-inputs');

drop policy if exists "Public can view generation outputs" on storage.objects;
create policy "Public can view generation outputs"
    on storage.objects for select
    to public
    using (bucket_id = 'generation-outputs');

drop policy if exists "Service role can manage generation inputs" on storage.objects;
create policy "Service role can manage generation inputs"
    on storage.objects for all
    to service_role
    using (bucket_id = 'generation-inputs')
    with check (bucket_id = 'generation-inputs');

drop policy if exists "Service role can manage generation outputs" on storage.objects;
create policy "Service role can manage generation outputs"
    on storage.objects for all
    to service_role
    using (bucket_id = 'generation-outputs')
    with check (bucket_id = 'generation-outputs');

create extension if not exists pg_cron;

create or replace function public.cleanup_staged_generation_inputs(p_retention interval default interval '24 hours')
returns integer
language plpgsql
security definer
set search_path = public, storage
as $$
declare
    v_deleted integer := 0;
begin
    with doomed as (
        select id
        from storage.objects
        where bucket_id = 'generation-inputs'
          and name like '%/staged/%'
          and created_at < now() - p_retention
        limit 1000
    ),
    deleted as (
        delete from storage.objects o
        using doomed
        where o.id = doomed.id
        returning 1
    )
    select count(*) into v_deleted from deleted;

    return coalesce(v_deleted, 0);
end;
$$;

alter function public.cleanup_staged_generation_inputs(interval) set search_path = public, storage;
grant execute on function public.cleanup_staged_generation_inputs(interval) to service_role;

do $$
begin
    if not exists (
        select 1
        from cron.job
        where jobname = 'seedance-cleanup-staged-inputs'
    ) then
        perform cron.schedule(
            'seedance-cleanup-staged-inputs',
            '15 3 * * *',
            $$select public.cleanup_staged_generation_inputs(interval '24 hours');$$
        );
    end if;
end
$$;
