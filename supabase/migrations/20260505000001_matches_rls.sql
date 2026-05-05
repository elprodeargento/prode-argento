-- Enable RLS for matches
alter table matches enable row level security;

-- Allow public read of matches
create policy "matches_public_read" on matches
  for select using (true);
