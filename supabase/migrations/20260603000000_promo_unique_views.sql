-- Capamos views al número de participantes del business (techo real de únicos históricos)
UPDATE promos p
SET views = LEAST(p.views, (
  SELECT COUNT(*) FROM participants pt WHERE pt.business_id = p.business_id
));

-- Tabla para tracking único de vistas
CREATE TABLE IF NOT EXISTS promo_views (
  promo_id   uuid NOT NULL REFERENCES promos(id) ON DELETE CASCADE,
  viewer_key text NOT NULL,
  viewed_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT promo_views_unique UNIQUE (promo_id, viewer_key)
);

-- Reemplazar función (firma cambia: agrega viewer_key)
DROP FUNCTION IF EXISTS increment_promo_views(uuid);

CREATE OR REPLACE FUNCTION increment_promo_views(promo_id uuid, viewer_key text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO promo_views (promo_id, viewer_key)
  VALUES (promo_id, viewer_key)
  ON CONFLICT ON CONSTRAINT promo_views_unique DO NOTHING;

  IF FOUND THEN
    UPDATE promos SET views = views + 1 WHERE id = promo_id;
  END IF;
END;
$$;
