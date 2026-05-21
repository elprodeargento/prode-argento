ALTER TABLE referral_campaigns
  ADD COLUMN IF NOT EXISTS invite_message text;

ALTER TABLE participants
  ADD COLUMN IF NOT EXISTS referred_by_participant_id uuid REFERENCES participants(id);
