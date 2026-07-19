-- ============================================================
-- ONE TRADE — Initial Database Schema  v1.0
-- Project: uhxlogllucxqhereqsev.supabase.co
-- Run this FIRST in your Supabase SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── BLOG POSTS ────────────────────────────────────────────
create table if not exists public.blog_posts (
  id          uuid primary key default uuid_generate_v4(),
  title       text          not null,
  excerpt     text          not null,
  content     text          not null,
  category    text          not null
                check (category in ('analysis','education','strategy','news')),
  emoji       text          not null default '📊',
  author      text          not null default 'One Trade Editorial',
  status      text          not null default 'published'
                check (status in ('published','draft')),
  read_time   integer       not null default 5,
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);

-- ── POST COMMENTS ─────────────────────────────────────────
create table if not exists public.post_comments (
  id            uuid primary key default uuid_generate_v4(),
  post_id       uuid          not null references public.blog_posts(id) on delete cascade,
  author_name   text          not null,
  author_email  text,
  body          text          not null,
  created_at    timestamptz   not null default now()
);

-- ── NEWSLETTER SUBSCRIBERS ────────────────────────────────
create table if not exists public.newsletter_subscribers (
  id            uuid primary key default uuid_generate_v4(),
  email         text          not null unique,
  subscribed_at timestamptz   not null default now()
);

-- ── CONTACT MESSAGES ──────────────────────────────────────
create table if not exists public.contact_messages (
  id          uuid primary key default uuid_generate_v4(),
  name        text          not null,
  email       text          not null,
  phone       text,
  subject     text,
  message     text          not null,
  created_at  timestamptz   not null default now()
);

-- ── UPDATED_AT TRIGGER FUNCTION ───────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_blog_posts_updated_at
  before update on public.blog_posts
  for each row execute procedure public.set_updated_at();

-- ── SEED: DEFAULT BLOG POSTS ──────────────────────────────
insert into public.blog_posts (title, excerpt, content, category, emoji, author, status, read_time) values

(
  'The Complete Guide to EUR/USD Trading in 2024',
  'Master the world''s most traded currency pair with proven entry/exit strategies, risk management, and market timing secrets used by professional traders.',
  '###Introduction###
The EUR/USD currency pair accounts for over 24% of all global forex transactions, making it the most liquid and widely traded pair in the world. Understanding its dynamics is fundamental to becoming a successful forex trader.

###Why EUR/USD Dominates Forex Markets###
The EUR/USD pair benefits from exceptional liquidity, tight spreads, and abundant market data. It reacts predictably to key economic events from both the Eurozone and the United States, making technical and fundamental analysis highly reliable.

Key drivers include: ECB monetary policy decisions, Federal Reserve interest rate announcements, US non-farm payroll data, Eurozone GDP and inflation reports, and geopolitical developments in Europe.

###Proven Entry Strategies###
One Trade analysts recommend a multi-timeframe approach. Begin with the H4 chart to identify the dominant trend, drop to H1 for structure confirmation, and use the M15 for precision entries. Our proprietary kill zone system focuses on the London Open (7:00-10:00 GMT) and New York Open (13:00-16:00 GMT) for the highest probability setups.

###Risk Management Protocol###
Never risk more than 1-2% of your account per trade. Place stops beyond structural levels — not arbitrary pip distances. Target a minimum 1:2 risk-to-reward ratio on all EUR/USD positions.

###Conclusion###
With disciplined execution and the right tools, EUR/USD trading can be a highly consistent source of returns. Download the One Trade app to access our live EUR/USD signals and expert commentary.',
  'analysis', '📊', 'One Trade Research Team', 'published', 7
),

(
  'Forex Risk Management: The Rule Every Profitable Trader Lives By',
  'Discover the exact risk management framework used by institutional traders. This single system protects your capital and ensures long-term profitability no matter the market conditions.',
  '###Why Risk Management Is Everything###
Ask any consistently profitable forex trader what their secret is, and 9 out of 10 will tell you the same thing: it''s not about finding winners — it''s about managing losers.

The greatest threat to any trading account is not a series of losing trades. It is ONE catastrophically oversized losing trade that wipes out months of gains in a single session. Proper risk management makes this impossible.

###The 1% Rule###
The foundation of our framework is simple: never risk more than 1% of your total account balance on any single trade. On a $10,000 account, that means a maximum loss per trade of $100. This ensures that even a streak of 20 consecutive losses only reduces your account by 20%.

###Position Sizing Formula###
Position Size = (Account Risk divided by Stop Loss in Pips) multiplied by Pip Value

This formula ensures your position size automatically adjusts to your stop distance, keeping your risk consistent regardless of market volatility.

###The Risk-Reward Imperative###
Every trade you take should have a minimum 1:2 risk-to-reward ratio. This means for every pip you risk, you target at least 2 pips of profit. With this setup, you can be wrong 60% of the time and still be profitable.

###Conclusion###
Download the One Trade app to access our built-in position size calculator and risk management dashboard, designed to keep your trading disciplined and your capital protected.',
  'education', '🎓', 'One Trade Editorial', 'published', 6
),

(
  'Inside the London Session: How Institutional Money Moves Forex',
  'The London trading session generates more volume than any other. Learn how smart money operates during these crucial hours and how you can trade alongside institutional players.',
  '###The Most Important 8 Hours in Forex###
The London trading session (8:00 AM to 4:00 PM GMT) accounts for approximately 35% of all daily forex transactions. It is during this window that the major currency moves occur, trends are established, and the biggest opportunities arise.

###How Banks and Institutions Trade###
Institutional players — banks, hedge funds, central banks — do not trade like retail traders. They operate with strategies designed to hunt liquidity, fill large orders at favorable prices, and stop out retail participants before moving in their true direction.

###The Liquidity Hunt###
At the start of the London session, you will frequently observe a sharp move against the previous day''s trend — sweeping the stops of retail traders. This liquidity grab is then followed by a sharp reversal as institutional orders get filled. One Trade signals are specifically calibrated to identify these setups.

###The London Kill Zone###
Our analysts have identified that the highest probability trading window is 7:00 to 10:00 AM GMT. During this 3-hour period, the overlap of European market opens creates explosive volatility and clear directional moves.

###How to Trade This###
Wait for the initial sweep of overnight highs or lows during the first 30-60 minutes of the session. Look for a strong reversal candle on the M15 chart with institutional order flow confirmation. Enter with a tight stop, targeting previous structure for a minimum 1:3 RR.

###Conclusion###
The London session is where fortunes are made in forex. Master it using One Trade live session analysis and real-time signal alerts.',
  'strategy', '🏦', 'Senior Analyst, One Trade', 'published', 8
)

on conflict do nothing;
