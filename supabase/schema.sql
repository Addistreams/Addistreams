create type public.track_status as enum ('Queued', 'Approved', 'Rejected');
create type public.account_role as enum ('creator', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Creator',
  role public.account_role not null default 'creator',
  upload_credits integer not null default 10 check (upload_credits >= 0),
  created_at timestamptz not null default now()
);

create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  file_path text not null unique,
  status public.track_status not null default 'Queued',
  file_size bigint not null check (file_size > 0),
  mastering integer not null default 0 check (mastering between -6 and 6),
  created_at timestamptz not null default now()
);

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

revoke all on function public.create_profile_for_new_user() from public, anon, authenticated;

create function public.submit_track(
  track_title text,
  track_file_path text,
  track_file_size bigint,
  track_mastering integer
)
returns public.tracks
language plpgsql
security invoker
set search_path = ''
as $$
declare
  submitted_track public.tracks;
begin
  if split_part(track_file_path, '/', 1) <> (select auth.uid())::text then
    raise exception 'Invalid audio storage path';
  end if;

  update public.profiles
  set upload_credits = upload_credits - 1
  where id = (select auth.uid()) and upload_credits > 0;

  if not found then
    raise exception 'No upload credits remaining';
  end if;

  insert into public.tracks (user_id, title, file_path, file_size, mastering)
  values ((select auth.uid()), track_title, track_file_path, track_file_size, track_mastering)
  returning * into submitted_track;

  return submitted_track;
end;
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
revoke all on function public.submit_track(text, text, bigint, integer) from public, anon;

alter table public.profiles enable row level security;
alter table public.tracks enable row level security;

create policy "Users can read their own profile or admins can read all"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "Creators can read their own tracks and admins can read all"
  on public.tracks for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "Only admins can moderate tracks"
  on public.tracks for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.profiles, public.tracks to authenticated;
grant update (status) on public.tracks to authenticated;
grant execute on function public.submit_track(text, text, bigint, integer) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tracks', 'tracks', false, 52428800, array['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/x-wav'])
on conflict (id) do nothing;

create policy "Creators upload their own audio"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'tracks' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Creators and admins listen to authorized audio"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'tracks'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin()))
  );

create policy "Creators can remove their own audio"
  on storage.objects for delete to authenticated
  using (bucket_id = 'tracks' and (storage.foldername(name))[1] = (select auth.uid())::text);