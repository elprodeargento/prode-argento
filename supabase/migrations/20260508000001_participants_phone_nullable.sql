-- Make phone nullable so participants without phone can still join the prode.
-- WhatsApp notifications are silently skipped for participants with no phone.
ALTER TABLE participants ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE participants ALTER COLUMN phone SET DEFAULT '';
