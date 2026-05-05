-- Allow users to insert their own business record
create policy "businesses_insert" on businesses
  for insert with check (auth.uid() = admin_user_id);

-- Allow public read of businesses (needed for participants to see the landing page)
create policy "businesses_public_read" on businesses
  for select using (true);
