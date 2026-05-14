-- Remove case-sensitive unique constraint
ALTER TABLE participants DROP CONSTRAINT participants_business_id_email_key;

-- Normalize existing emails to lowercase
UPDATE participants SET email = LOWER(email);

-- Remove duplicate case-variant registrations (keep the oldest)
DELETE FROM participants p1
USING participants p2
WHERE p1.business_id = p2.business_id
  AND LOWER(p1.email) = LOWER(p2.email)
  AND p1.registered_at > p2.registered_at;

-- Add case-insensitive unique index
CREATE UNIQUE INDEX participants_business_id_email_ci_idx
  ON participants (business_id, LOWER(email));
