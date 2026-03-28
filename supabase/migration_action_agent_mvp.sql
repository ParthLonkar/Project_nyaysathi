-- Action Agent MVP persistence fields
-- Safe to run multiple times

ALTER TABLE complaints ADD COLUMN IF NOT EXISTS escalation_flag BOOLEAN DEFAULT FALSE;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT FALSE;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS admin_classification TEXT DEFAULT 'Standard';
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS progress_percentage INT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_complaints_escalation_flag
  ON complaints(escalation_flag);

CREATE INDEX IF NOT EXISTS idx_complaints_admin_classification
  ON complaints(admin_classification);
