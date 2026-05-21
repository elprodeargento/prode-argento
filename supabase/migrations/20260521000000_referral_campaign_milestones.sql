ALTER TABLE referral_campaigns
  ADD COLUMN IF NOT EXISTS milestone_every int NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS milestone_prize text;
