ALTER TABLE participants
  ADD COLUMN IF NOT EXISTS is_disabled boolean NOT NULL DEFAULT false;
