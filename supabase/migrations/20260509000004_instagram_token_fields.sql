ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS ig_token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ig_account_type TEXT;
