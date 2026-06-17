-- Add developer card fields (avatar + tagline) to existing agents table
-- Run this in Supabase Dashboard → SQL Editor

alter table agents add column if not exists avatar_url text;  -- 头像
alter table agents add column if not exists tagline text;     -- 简介 (一句话)

-- ── Storage bucket for avatars ──────────────────────────────
-- Create a public bucket so uploaded avatars can be displayed.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Allow anyone to read avatars (public bucket)
create policy "Public avatar read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Allow uploads to the avatars bucket
-- (For now this allows anon uploads — tighten later when you add auth)
create policy "Anyone can upload avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars');
