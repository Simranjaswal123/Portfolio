-- =====================================================================
-- Row Level Security (RLS) policies for the portfolio database
-- =====================================================================
--
-- HOW TO USE
--   Review this file, then paste it into the Supabase dashboard:
--   SQL Editor > New query > Run.
--   It is NOT run automatically by the app. It never deletes data and never
--   disables RLS. The only thing it removes is policies with the exact names
--   used below (so the file can be run again safely).
--
-- WHY THESE POLICIES
--   * The Express backend talks to Supabase with the SECRET key (service role).
--     That key BYPASSES RLS, so the backend keeps working whatever is in here.
--   * The browser only holds the PUBLISHABLE key, which is visible to everyone.
--     Anyone can copy it and query Supabase directly, skipping Express entirely.
--     RLS is what protects the data from that.
--
-- WHAT THIS DOES
--   * profiles, projects, skills, experience, education:
--       anyone (anonymous or signed in) can READ. Nobody can write directly.
--   * contact_messages:
--       NO policies at all. With RLS on and no policy, the publishable key can
--       neither read, insert, update nor delete. Messages only go in and out
--       through the Express API (insert is public, everything else needs admin).
--   * No policy lets a signed-in user modify portfolio data directly. A policy
--     such as "authenticated users can write" would let ANY account created in
--     your Supabase project edit your portfolio, so it is deliberately left out.
--     All admin writes go through Express (requireAuth) with the secret key.
-- =====================================================================


-- Make sure RLS is on for all six tables (safe to repeat; it is already on).
alter table public.profiles          enable row level security;
alter table public.projects          enable row level security;
alter table public.skills            enable row level security;
alter table public.experience        enable row level security;
alter table public.education         enable row level security;
alter table public.contact_messages  enable row level security;


-- ---------------------------------------------------------------------
-- Public portfolio content: read-only for everyone
-- ---------------------------------------------------------------------

drop policy if exists "Public can read profiles" on public.profiles;
create policy "Public can read profiles"
  on public.profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read projects" on public.projects;
create policy "Public can read projects"
  on public.projects for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read skills" on public.skills;
create policy "Public can read skills"
  on public.skills for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read experience" on public.experience;
create policy "Public can read experience"
  on public.experience for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read education" on public.education;
create policy "Public can read education"
  on public.education for select
  to anon, authenticated
  using (true);


-- ---------------------------------------------------------------------
-- contact_messages: intentionally NO policies (see the notes at the top).
-- ---------------------------------------------------------------------


-- ---------------------------------------------------------------------
-- OPTIONAL extra layer (commented out). RLS already blocks writes; this also
-- removes the underlying table permissions from the browser roles. It does not
-- affect the backend. Un-comment only if you want it.
-- ---------------------------------------------------------------------
-- revoke all on public.contact_messages from anon, authenticated;
-- revoke insert, update, delete on public.profiles, public.projects,
--   public.skills, public.experience, public.education from anon, authenticated;


-- ---------------------------------------------------------------------
-- CHECK IT WORKED (run these separately, after the script above)
-- ---------------------------------------------------------------------
-- 1) Should list RLS = true for all six tables:
--      select tablename, rowsecurity from pg_tables
--      where schemaname = 'public'
--        and tablename in ('profiles','projects','skills','experience','education','contact_messages');
--
-- 2) Should list exactly five "Public can read ..." SELECT policies and NOTHING for contact_messages:
--      select tablename, policyname, cmd, roles from pg_policies
--      where schemaname = 'public' order by tablename;
