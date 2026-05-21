-- Campañas de referidos entre participantes (solo plan Premium)
CREATE TABLE referral_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  prizes jsonb NOT NULL DEFAULT '[]',
  -- Formato: [{"rank":1,"description":"Cena para 2"},{"rank":2,"description":"Vale $5000"}]
  invite_message text,
  -- Mensaje personalizado que los participantes usan al compartir su link
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Solo 1 campaña activa por negocio
CREATE UNIQUE INDEX referral_campaigns_business_active
  ON referral_campaigns (business_id)
  WHERE is_active = true;

-- Rastrear quién refirió a quién dentro del prode
ALTER TABLE participants
  ADD COLUMN referred_by_participant_id uuid REFERENCES participants(id);
