-- AI persistence MVP migration for NyaySathi
-- Safe to run multiple times (uses IF NOT EXISTS guards)

-- 1) Extend complaints table with top-level AI-mapped fields
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS legal_strategy TEXT;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS recommended_actions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS escalation_risk TEXT;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS manual_review BOOLEAN DEFAULT FALSE;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS citizen_name TEXT;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS citizen_phone TEXT;

-- 2) Attachment metadata table linked to complaints
CREATE TABLE IF NOT EXISTS complaint_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_complaint_attachments_complaint_id
  ON complaint_attachments(complaint_id);

CREATE INDEX IF NOT EXISTS idx_complaint_attachments_uploaded_at
  ON complaint_attachments(uploaded_at DESC);

-- 3) Storage bucket for complaint attachments (public URL optional)
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-attachments', 'complaint-attachments', true)
ON CONFLICT (id) DO NOTHING;
