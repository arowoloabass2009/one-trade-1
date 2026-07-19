-- ============================================================
-- ONE TRADE — Row Level Security Policies  v1.0
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- Enable RLS on all tables
alter table public.blog_posts              enable row level security;
alter table public.post_comments           enable row level security;
alter table public.newsletter_subscribers  enable row level security;
alter table public.contact_messages        enable row level security;

-- ── BLOG POSTS ────────────────────────────────────────────
-- Anyone (including anonymous) can read published posts
create policy "Public can read published posts"
  on public.blog_posts
  for select
  using (status = 'published');

-- Authenticated service role can do everything (admin operations)
-- All writes go through the service role / admin passcode flow
create policy "Anon full access to posts"
  on public.blog_posts
  for all
  using (true)
  with check (true);

-- ── POST COMMENTS ─────────────────────────────────────────
-- Anyone can read all comments on published posts
create policy "Public can read comments"
  on public.post_comments
  for select
  using (true);

-- Anyone (no auth required) can post a comment
create policy "Anyone can post comments"
  on public.post_comments
  for insert
  with check (true);

-- Admin can delete any comment (handled via service key or unrestricted anon for this app)
create policy "Anyone can delete comments"
  on public.post_comments
  for delete
  using (true);

-- ── NEWSLETTER SUBSCRIBERS ────────────────────────────────
-- Anyone can subscribe
create policy "Anyone can subscribe to newsletter"
  on public.newsletter_subscribers
  for insert
  with check (true);

-- Only service role can read subscribers list
create policy "No public read on subscribers"
  on public.newsletter_subscribers
  for select
  using (false);

-- ── CONTACT MESSAGES ──────────────────────────────────────
-- Anyone can send a contact message
create policy "Anyone can send contact messages"
  on public.contact_messages
  for insert
  with check (true);

-- No public read on contact messages (admin via Supabase dashboard)
create policy "No public read on contact messages"
  on public.contact_messages
  for select
  using (false);
