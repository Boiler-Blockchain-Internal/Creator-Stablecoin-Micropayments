-- =============================================================================
-- Migration: create_profiles
--
-- Supabase Auth stores login identities in auth.users, a table we don't own and
-- shouldn't modify. App-specific user data (username, role, etc.) lives in our
-- own public.profiles table, linked 1:1 to auth.users by the same id.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. The profiles table
-- -----------------------------------------------------------------------------
create table public.profiles (
  -- Same uuid as the auth.users row. "on delete cascade" means that deleting a
  -- user from auth.users automatically deletes their profile, so we never
  -- leave orphaned profiles behind.
  id uuid primary key references auth.users (id) on delete cascade,

  -- Nullable because the profile is created at sign-up, before the user has
  -- picked a username. UNIQUE still allows many NULLs in Postgres, so lots of
  -- users can exist without a username yet.
  -- Note: uniqueness is case-sensitive ('Alice' and 'alice' are different).
  username text unique,

  display_name text,

  -- Every new user starts as a buyer. The CHECK constraint makes the database
  -- reject any value other than 'buyer' or 'creator', even if app code has a bug.
  role text not null default 'buyer'
    check (role in ('buyer', 'creator')),

  -- Only trusted server-side code should flip this. Section 4 makes sure
  -- regular users can't update it themselves.
  creator_verified boolean not null default false,

  created_at timestamptz not null default now()
);


-- -----------------------------------------------------------------------------
-- 2. Auto-create a profile when a user signs up
--
-- A trigger is a function that Postgres runs automatically on an event. Here
-- the event is "a row was inserted into auth.users" (a sign-up).
-- -----------------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
-- SECURITY DEFINER: the function runs with the privileges of its owner (the
-- migration role), not the caller's. That is needed because the code doing
-- the sign-up insert (Supabase Auth) has no permission to write to
-- public.profiles, and Section 3 adds no insert policy for anyone.
security definer
-- With SECURITY DEFINER, an attacker could create a same-named table in a
-- schema earlier on the search_path and hijack the function. Setting
-- search_path to '' makes Postgres resolve nothing implicitly, which is why
-- every name below is fully qualified (public.profiles).
set search_path = ''
as $$
begin
  -- Only the id is set. Every other column takes its default, so role is
  -- always 'buyer' at sign-up. We deliberately do NOT copy role from
  -- new.raw_user_meta_data, because a client can put anything in sign-up
  -- metadata and would be able to make themselves a creator.
  insert into public.profiles (id)
  values (new.id);

  -- For AFTER triggers the return value is ignored, but plpgsql requires one.
  return new;
end;
$$;

-- Attach the function to auth.users. "for each row" runs it once per new user.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- -----------------------------------------------------------------------------
-- 3. Row Level Security (RLS)
--
-- Supabase exposes tables through its public API using the "anon" role
-- (not logged in) and the "authenticated" role (logged in). Once RLS is
-- enabled, every row is hidden and locked by default. Policies then open up
-- exactly what's allowed. With no policy for an action, the action is denied.
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Anyone, logged in or not, can read every profile (public creator pages,
-- usernames, etc.). Everything in this table is meant to be public.
create policy "Profiles are viewable by everyone"
  on public.profiles
  for select
  to anon, authenticated
  using (true);

-- A logged-in user may update only their own row.
--   USING      -> which existing rows they're allowed to target
--   WITH CHECK -> what the row must look like after the update (this stops
--                 someone from changing the id to point at another user)
-- (select auth.uid()) behaves the same as auth.uid(). Wrapping it in a
-- subquery lets Postgres evaluate it once per query instead of once per row,
-- which is Supabase's recommended form for performance.
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- No INSERT policy: profiles are created only by the trigger above, which
--   bypasses RLS because it is SECURITY DEFINER.
-- No DELETE policy: profiles are deleted only by the cascade from auth.users.


-- -----------------------------------------------------------------------------
-- 4. Column-level privileges
--
-- RLS controls which ROWS a user can touch. It can't restrict COLUMNS. Without
-- this section, a user could update their own row with
-- { role: 'creator', creator_verified: true }, and the update policy would
-- allow it because it's their row.
--
-- Postgres GRANTs work separately from RLS: an action must pass both checks.
-- We remove the table-wide UPDATE that Supabase grants by default, then give
-- back UPDATE on only the two columns users are allowed to change.
-- -----------------------------------------------------------------------------
revoke update on public.profiles from authenticated;
grant update (username, display_name) on public.profiles to authenticated;
