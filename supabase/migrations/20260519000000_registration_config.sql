-- Campos de configuración de registro obligatorio por negocio
-- Por defecto ambos requeridos (comportamiento actual sin cambios)
ALTER TABLE businesses
  ADD COLUMN require_email boolean NOT NULL DEFAULT true,
  ADD COLUMN require_phone boolean NOT NULL DEFAULT true;

-- Email puede ser null para negocios que lo hacen opcional (plan Premium)
ALTER TABLE participants ALTER COLUMN email DROP NOT NULL;
ALTER TABLE participants ALTER COLUMN email SET DEFAULT NULL;

-- La unicidad de phone por negocio se maneja a nivel de aplicación (lookup previo al insert)
-- para no afectar datos históricos existentes.
