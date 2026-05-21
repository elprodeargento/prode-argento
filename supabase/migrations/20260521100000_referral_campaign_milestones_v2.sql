-- Replace flat milestone_every/milestone_prize with configurable milestones array
ALTER TABLE referral_campaigns
  DROP COLUMN IF EXISTS milestone_every,
  DROP COLUMN IF EXISTS milestone_prize,
  ADD COLUMN IF NOT EXISTS milestones jsonb NOT NULL DEFAULT '[]';
-- Format: [{"at": 5, "prize": "Cena para 2"}, {"at": 10, "prize": "Vale $5000"}]
