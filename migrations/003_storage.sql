-- ============================================================
-- ONE TRADE — Storage Buckets  v1.0
-- Run AFTER 002_rls_policies.sql
-- ============================================================

-- Blog media bucket (public — for post cover images)
insert into storage.buckets (id, name, public)
values ('blog-media', 'blog-media', true)
on conflict (id) do nothing;

-- ── Blog media: public read, open write (admin-controlled) ─
create policy "Anyone can view blog media"
  on storage.objects
  for select
  using (bucket_id = 'blog-media');

create policy "Anyone can upload blog media"
  on storage.objects
  for insert
  with check (bucket_id = 'blog-media');

create policy "Anyone can update blog media"
  on storage.objects
  for update
  using (bucket_id = 'blog-media');
