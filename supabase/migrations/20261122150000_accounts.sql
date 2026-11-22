-- Accounts, report library, weekly sector list, and contact messages.
-- The one-month free date matches src/access-dates.mjs: add one calendar month,
-- and let a day that does not exist spill forward the way Date.setUTCMonth does.
-- 2026-11-22 -> 2026-12-22. 2026-01-31 -> 2026-03-03.

create type public.membership_tier as enum ('reader', 'subscriber', 'premium');
create type public.report_direction as enum ('long', 'short');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  tier public.membership_tier not null default 'reader',
  created_at timestamptz not null default now()
);

create table public.reports (
  slug text primary key,
  title text not null,
  ticker text not null,
  tickers text[] not null,
  industry text not null,
  direction public.report_direction not null,
  published_on date not null,
  pdf_path text not null unique,
  pdf_filename text not null,
  href text not null
);

create table public.weekly_5_5 (
  id bigint generated always as identity primary key,
  week_of date not null,
  side text not null check (side in ('long', 'short')),
  position smallint not null check (position between 1 and 5),
  sector text not null,
  etf text,
  thesis text not null,
  example boolean not null default false,
  unique (week_of, side, position)
);

create table public.contact_messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now(),
  constraint contact_name_len check (char_length(name) between 1 and 120),
  constraint contact_email_len check (char_length(email) between 3 and 200),
  constraint contact_message_len check (char_length(message) between 1 and 4000)
);

create function public.free_on(published date)
returns date
language sql
immutable
as $$
  select (
    make_date(
      extract(year from published)::int + case when extract(month from published)::int = 12 then 1 else 0 end,
      case when extract(month from published)::int = 12 then 1 else extract(month from published)::int + 1 end,
      1
    ) + (extract(day from published)::int - 1)
  )::date;
$$;

create function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and tier in ('subscriber', 'premium')
  );
$$;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    nullif(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.sync_user_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email = new.email
  where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.sync_user_email();

create function public.protect_profile_tier()
returns trigger
language plpgsql
as $$
begin
  if new.tier is distinct from old.tier then
    if coalesce(auth.role(), '') = 'service_role' or auth.uid() is null then
      return new;
    end if;
    raise exception 'Membership tier cannot be changed from the account page.';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_tier
  before update on public.profiles
  for each row execute function public.protect_profile_tier();

create function public.weekly_week_dates()
returns table (week_of date, example boolean)
language sql
stable
security definer
set search_path = public
as $$
  select week_of, bool_or(example) as example
  from public.weekly_5_5
  group by week_of
  order by week_of desc;
$$;

alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.weekly_5_5 enable row level security;
alter table public.contact_messages enable row level security;

create policy "read own profile"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy "update own display name"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "public read reports"
  on public.reports
  for select
  to anon, authenticated
  using (true);

create policy "read open or member weeks"
  on public.weekly_5_5
  for select
  to anon, authenticated
  using (
    example
    or public.free_on(week_of) <= (timezone('utc', now()))::date
    or public.is_member()
  );

create policy "submit a contact message"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

grant select on public.reports to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.weekly_5_5 to anon, authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant execute on function public.free_on(date) to anon, authenticated;
grant execute on function public.is_member() to anon, authenticated;
grant execute on function public.weekly_week_dates() to anon, authenticated;

revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;

insert into storage.buckets (id, name, public)
values ('reports', 'reports', false)
on conflict (id) do nothing;

create policy "read report pdfs by membership or age"
  on storage.objects
  for select
  to anon, authenticated
  using (
    bucket_id = 'reports'
    and (
      exists (
        select 1
        from public.reports
        where pdf_path = storage.objects.name
          and public.free_on(published_on) <= (timezone('utc', now()))::date
      )
      or public.is_member()
    )
  );
