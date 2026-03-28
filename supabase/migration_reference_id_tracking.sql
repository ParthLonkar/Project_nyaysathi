-- Public reference ID support for citizen complaint tracking
-- Safe to run multiple times

ALTER TABLE complaints
ADD COLUMN IF NOT EXISTS reference_id TEXT;

-- Backfill existing complaints that do not yet have reference IDs
WITH ranked AS (
  SELECT
    id,
    COALESCE(created_at, now()) AS created_time,
    ROW_NUMBER() OVER (ORDER BY COALESCE(created_at, now()), id) AS seq
  FROM complaints
  WHERE reference_id IS NULL
)
UPDATE complaints c
SET reference_id = 'Ref-' || TO_CHAR(r.created_time, 'YYYY') || '-' || LPAD(r.seq::text, 6, '0')
FROM ranked r
WHERE c.id = r.id
  AND c.reference_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_complaints_reference_id_unique
ON complaints(reference_id);
