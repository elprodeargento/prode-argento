create table weekly_prizes (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  week_index  int  not null,
  rank        int  not null,
  description text not null,
  unique(business_id, week_index, rank)
);

alter table weekly_prizes enable row level security;

-- Admin puede gestionar sus premios semanales
create policy "weekly_prizes_admin" on weekly_prizes
  for all using (
    business_id in (
      select id from businesses where admin_user_id = auth.uid()
    )
  );

-- Lectura pública
create policy "weekly_prizes_read" on weekly_prizes
  for select using (true);
