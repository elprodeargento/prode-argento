alter table businesses
  add column if not exists player_referrer_code text;

create table if not exists player_referral_history (
  id uuid primary key default gen_random_uuid(),
  referral_code text not null references player_referrers(referral_code),
  business_name text not null,
  business_slug text not null,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  created_at timestamptz not null default now()
);

alter table player_referral_history enable row level security;

create policy "player_referral_history_read" on player_referral_history
  for select using (true);

create policy "player_referral_history_insert" on player_referral_history
  for insert with check (true);

create policy "player_referral_history_update" on player_referral_history
  for update using (true);
