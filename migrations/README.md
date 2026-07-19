# One Trade — Database Migrations

## Supabase Project
- **Project URL:** https://uhxlogllucxqhereqsev.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/uhxlogllucxqhereqsev

## Run Order

Go to your Supabase Dashboard → SQL Editor → run each file **in order**:

1. `001_initial_schema.sql` — Creates all tables + seeds 3 default blog posts
2. `002_rls_policies.sql`   — Row Level Security (public read/write for this app)
3. `003_storage.sql`        — Blog media storage bucket

## Tables Created

| Table                    | Purpose                                  |
|--------------------------|------------------------------------------|
| `blog_posts`             | Admin-managed blog articles              |
| `post_comments`          | Public comments on blog posts            |
| `newsletter_subscribers` | Email newsletter subscriptions           |
| `contact_messages`       | Contact form submissions                 |

## Architecture Notes

- **No user auth required** — this is a public landing page. Visitors comment and subscribe anonymously.
- **Admin access** is passcode-protected (`sham2026`) on the frontend. All DB writes use the `anon` key with permissive RLS.
- **Realtime** — comments on open posts stream live via Supabase Realtime channel subscriptions.
- **Fallback** — if Supabase is unreachable, the app falls back to `localStorage` automatically.
