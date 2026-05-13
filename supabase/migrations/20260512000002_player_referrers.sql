create table player_referrers (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  name            text not null,
  referral_code   text not null unique,
  total_referrals int not null default 0,
  pending_amount  int not null default 0,
  created_at      timestamptz not null default now()
);

alter table player_referrers enable row level security;

create policy "player_referrers_public_read" on player_referrers
  for select using (true);

create policy "player_referrers_insert" on player_referrers
  for insert with check (true);

create policy "player_referrers_update" on player_referrers
  for update using (true);

-- Agregar referral_code a businesses para trackear qué jugador refirió
alter table businesses
  add column if not exists player_referral_code text;
