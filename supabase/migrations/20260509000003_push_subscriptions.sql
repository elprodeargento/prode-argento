CREATE TABLE IF NOT EXISTS push_subscriptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id  uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  fcm_token       text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(participant_id, fcm_token)
);

CREATE TABLE IF NOT EXISTS admin_push_subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  fcm_token   text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id, fcm_token)
);
