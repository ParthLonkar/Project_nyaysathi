-- Optional migration: add updated_at support on complaints for future tracking/workflow updates.
-- Tracking endpoints should NOT depend on this migration immediately.

ALTER TABLE complaints
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

UPDATE complaints
SET updated_at = COALESCE(updated_at, submitted_at, created_at, now())
WHERE updated_at IS NULL;

CREATE OR REPLACE FUNCTION set_complaints_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_complaints_updated_at ON complaints;

CREATE TRIGGER trg_set_complaints_updated_at
BEFORE UPDATE ON complaints
FOR EACH ROW
EXECUTE FUNCTION set_complaints_updated_at();
