CREATE TABLE IF NOT EXISTS notification_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  channel     TEXT NOT NULL CHECK (channel IN ('whatsapp', 'push')),
  recipients  TEXT NOT NULL,
  message     TEXT NOT NULL,
  sent        INT NOT NULL DEFAULT 0,
  failed      INT NOT NULL DEFAULT 0,
  skipped     INT NOT NULL DEFAULT 0,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notification_logs_business_id_sent_at_idx
  ON notification_logs(business_id, sent_at DESC);
