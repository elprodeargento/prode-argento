-- Campo puntos en businesses
alter table businesses
  add column if not exists referral_points int not null default 0;

-- Tabla de referidos
create table if not exists referrals (
  id            uuid primary key default gen_random_uuid(),
  referrer_id   uuid not null references businesses(id) on delete cascade,
  referred_id   uuid not null references businesses(id) on delete cascade,
  status        text not null default 'pending' check (status in ('pending', 'paid')),
  points_awarded int not null default 0,
  created_at    timestamptz not null default now(),
  unique(referred_id)
);

alter table referrals enable row level security;

create policy "referrals_read_own" on referrals
  for select using (
    referrer_id in (
      select id from businesses where admin_user_id = auth.uid()
    )
    or
    referred_id in (
      select id from businesses where admin_user_id = auth.uid()
    )
  );

create policy "referrals_insert" on referrals
  for insert with check (true);

create policy "referrals_update" on referrals
  for update using (true);

-- Función RPC para incrementar puntos
create or replace function increment_referral_points(business_id uuid, points int)
returns void language plpgsql as $$
begin
  update businesses
  set referral_points = referral_points + points
  where id = business_id;
end;
$$;
