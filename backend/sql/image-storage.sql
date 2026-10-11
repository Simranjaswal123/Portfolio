-- =====================================================================
-- Image storage: buckets, gallery tables and their policies
-- =====================================================================
--
-- HOW TO USE
--   Review this file, then paste it into the Supabase dashboard:
--   SQL Editor > New query > Run.
--   It is NOT run by the app. It only creates things that are missing and never
--   deletes data. (The one DROP is for the two read policies defined below, so the
--   file is safe to run again.)
--
-- WHAT IT CREATES
--   1. Three Storage buckets: profile-images, project-images, experience-images.
--      They are PUBLIC, which only means "anyone with the link can VIEW a file", so
--      the portfolio can show the pictures. The bucket also refuses anything that is
--      not a JPEG/PNG/WebP and anything over 5 MB.
--   2. project_images and experience_images: one row per extra image. Only the
--      link to the image is stored here; the picture itself lives in Storage.
--      Deleting a project or experience entry deletes its image rows too.
--
-- WHO MAY CHANGE FILES AND ROWS
--   Only the Express backend, which uses the SECRET key (that key bypasses RLS) and
--   first checks that the caller is the admin. So:
--     * Storage: NO policies are created on storage.objects. With none, the
--       publishable key can neither upload, replace nor delete files.
--     * The two new tables get a read-only policy for everyone and NO write
--       policies, the same as projects, skills and the other portfolio tables.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Buckets (change the 5 MB limit here if you change MAX_IMAGE_BYTES)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('profile-images',    'profile-images',    true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('project-images',    'project-images',    true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('experience-images', 'experience-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;


-- ---------------------------------------------------------------------
-- 2. Gallery tables
-- ---------------------------------------------------------------------
create table if not exists public.project_images (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects (id) on delete cascade,
  image_url     text not null,
  alt_text      text,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists public.experience_images (
  id            uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experience (id) on delete cascade,
  image_url     text not null,
  alt_text      text,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists project_images_project_id_idx       on public.project_images (project_id, display_order);
create index if not exists experience_images_experience_id_idx on public.experience_images (experience_id, display_order);


-- ---------------------------------------------------------------------
-- 3. Row Level Security: public read, no direct writes
-- ---------------------------------------------------------------------
alter table public.project_images    enable row level security;
alter table public.experience_images enable row level security;

drop policy if exists "Public can read project images" on public.project_images;
create policy "Public can read project images"
  on public.project_images for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read experience images" on public.experience_images;
create policy "Public can read experience images"
  on public.experience_images for select
  to anon, authenticated
  using (true);


-- ---------------------------------------------------------------------
-- CHECK IT WORKED (run these separately, after the script above)
-- ---------------------------------------------------------------------
-- 1) Three public buckets with a 5 MB limit:
--      select id, public, file_size_limit, allowed_mime_types from storage.buckets
--      where id in ('profile-images', 'project-images', 'experience-images');
--
-- 2) RLS on for both new tables:
--      select tablename, rowsecurity from pg_tables
--      where schemaname = 'public' and tablename in ('project_images', 'experience_images');
--
-- 3) Only SELECT policies on the two tables, and NONE on storage.objects for these buckets:
--      select tablename, policyname, cmd from pg_policies
--      where (schemaname = 'public' and tablename in ('project_images', 'experience_images'))
--         or (schemaname = 'storage' and tablename = 'objects');
