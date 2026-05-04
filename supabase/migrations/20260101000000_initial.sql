-- ──────────────────────────────────────────
--  PRODE MUNDIAL 2026 — Initial migration
-- ──────────────────────────────────────────

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";  -- for fast text search

-- ── ENUMS ──
create type plan_type    as enum ('free','premium','pro');
create type match_status as enum ('scheduled','live','finished');
create type match_stage  as enum ('group','r32','r16','qf','sf','final');

-- ── BUSINESSES ──
create table businesses (
  id                  uuid primary key default uuid_generate_v4(),
  slug                text unique not null,
  name                text not null,
  admin_user_id       uuid references auth.users(id) on delete cascade,
  admin_email         text not null,
  logo_url            text,
  primary_color       text not null default '#002B72',
  banner_urls         text[] not null default '{}',
  welcome_msg         text not null default '¡Bienvenido al prode!',
  registration_deadline timestamptz,
  plan                plan_type not null default 'free',
  active              boolean not null default true,
  ig_user_id          text,
  ig_access_token     text,
  ig_hashtags         text[] not null default '{}',
  mp_payment_id       text,
  paid_at             timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_businesses_slug on businesses(slug);
create index idx_businesses_admin on businesses(admin_user_id);

-- ── PARTICIPANTS ──
create table participants (
  id              uuid primary key default uuid_generate_v4(),
  business_id     uuid not null references businesses(id) on delete cascade,
  google_uid      text,
  name            text not null,
  email           text not null,
  phone           text not null,
  remember_me     boolean not null default false,
  accepted_terms  boolean not null default false,
  total_points    int not null default 0,
  rank            int,
  registered_at   timestamptz not null default now(),
  unique(business_id, email)
);

create index idx_participants_business on participants(business_id);
create index idx_participants_email    on participants(email);

-- ── MATCHES ──
create table matches (
  id          serial primary key,
  stage       match_stage not null,
  "group"     text,
  home_team   text not null,
  away_team   text not null,
  home_flag   text not null default '',
  away_flag   text not null default '',
  kickoff_at  timestamptz not null,
  home_score  int,
  away_score  int,
  status      match_status not null default 'scheduled',
  fd_match_id int unique,            -- football-data.org reference
  scored_at   timestamptz            -- set when scoring is complete
);

create index idx_matches_status    on matches(status);
create index idx_matches_kickoff   on matches(kickoff_at);

-- ── PREDICTIONS ──
create table predictions (
  id              uuid primary key default uuid_generate_v4(),
  participant_id  uuid not null references participants(id) on delete cascade,
  business_id     uuid not null references businesses(id) on delete cascade,
  match_id        int  not null references matches(id) on delete cascade,
  home_pred       int  not null,
  away_pred       int  not null,
  points_earned   int  not null default 0,
  submitted_at    timestamptz not null default now(),
  unique(participant_id, match_id)  -- one prediction per participant per match
);

create index idx_predictions_participant on predictions(participant_id);
create index idx_predictions_business    on predictions(business_id);
create index idx_predictions_match       on predictions(match_id);

-- ── PRIZES ──
create table prizes (
  id          uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  rank        int  not null,
  description text not null,
  image_url   text,
  unique(business_id, rank)
);

-- ── PROMOS ──
create table promos (
  id          uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  category    text not null,
  description text not null,
  image_url   text,
  lat         numeric(10,7) not null,
  lon         numeric(10,7) not null,
  radius_km   numeric(5,2)  not null default 1.0,
  valid_from  timestamptz   not null,
  valid_until timestamptz   not null,
  active      boolean       not null default true,
  views       int           not null default 0,
  created_at  timestamptz   not null default now()
);

create index idx_promos_business on promos(business_id);
create index idx_promos_active   on promos(active, valid_until);

-- ── LEADERBOARD CACHE ──
create table leaderboard_cache (
  business_id     uuid not null references businesses(id) on delete cascade,
  participant_id  uuid not null references participants(id) on delete cascade,
  total_points    int  not null default 0,
  exact_results   int  not null default 0,
  correct_winners int  not null default 0,
  rank            int  not null default 0,
  updated_at      timestamptz not null default now(),
  primary key (business_id, participant_id)
);

create index idx_leaderboard_rank on leaderboard_cache(business_id, rank);

-- ── FUNCTIONS ──

-- Stats for empresa dashboard
create or replace function get_empresa_stats(business_id uuid)
returns table(total_participants bigint, predictions_loaded bigint, coverage_pct numeric)
language sql security definer as $$
  select
    count(distinct p.id)::bigint                              as total_participants,
    count(distinct pred.participant_id)::bigint               as predictions_loaded,
    case when count(distinct p.id) = 0 then 0
         else round(count(distinct pred.participant_id)::numeric / count(distinct p.id) * 100, 1)
    end                                                       as coverage_pct
  from participants p
  left join predictions pred on pred.participant_id = p.id
  where p.business_id = get_empresa_stats.business_id;
$$;

-- Recalculate leaderboard for a business
create or replace function recalculate_leaderboard(p_business_id uuid)
returns void language plpgsql security definer as $$
begin
  insert into leaderboard_cache(business_id, participant_id, total_points, exact_results, correct_winners, rank, updated_at)
  select
    p.business_id,
    p.id,
    coalesce(sum(pred.points_earned), 0),
    coalesce(sum(case when pred.points_earned = 3 then 1 else 0 end), 0),
    coalesce(sum(case when pred.points_earned = 1 then 1 else 0 end), 0),
    row_number() over (order by coalesce(sum(pred.points_earned), 0) desc),
    now()
  from participants p
  left join predictions pred on pred.participant_id = p.id
  where p.business_id = p_business_id
  group by p.id, p.business_id
  on conflict (business_id, participant_id) do update set
    total_points    = excluded.total_points,
    exact_results   = excluded.exact_results,
    correct_winners = excluded.correct_winners,
    rank            = excluded.rank,
    updated_at      = excluded.updated_at;

  -- Also update participants.total_points
  update participants pa
  set
    total_points = lc.total_points,
    rank         = lc.rank
  from leaderboard_cache lc
  where lc.participant_id = pa.id
    and lc.business_id    = p_business_id;
end;
$$;

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger businesses_updated_at
  before update on businesses
  for each row execute function set_updated_at();

-- ── ROW LEVEL SECURITY ──
alter table businesses       enable row level security;
alter table participants     enable row level security;
alter table predictions      enable row level security;
alter table prizes           enable row level security;
alter table promos           enable row level security;
alter table leaderboard_cache enable row level security;

-- Businesses: admin can do everything
create policy "businesses_admin" on businesses
  for all using (auth.uid() = admin_user_id);

-- Participants: can see their own business's data
create policy "participants_read" on participants
  for select using (true);  -- public leaderboard

create policy "participants_insert" on participants
  for insert with check (true);  -- anyone can register

-- Predictions: participants manage their own
create policy "predictions_own" on predictions
  for all using (
    participant_id in (
      select id from participants where email = auth.jwt()->>'email'
    )
  );

-- Prizes: public read
create policy "prizes_read" on prizes for select using (true);

-- Promos: public read
create policy "promos_read" on promos
  for select using (active = true and valid_until > now());

-- Leaderboard: public read
create policy "leaderboard_read" on leaderboard_cache for select using (true);
