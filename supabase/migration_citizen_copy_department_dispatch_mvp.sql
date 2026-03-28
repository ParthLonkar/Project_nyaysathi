-- Citizen Copy + Department Dispatch MVP
-- Run this after existing complaint/attachment migrations.

CREATE TABLE IF NOT EXISTS complaint_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_complaint_documents_complaint_id
  ON complaint_documents(complaint_id);

CREATE INDEX IF NOT EXISTS idx_complaint_documents_created_at
  ON complaint_documents(created_at DESC);

INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-documents', 'complaint-documents', true)
ON CONFLICT (id) DO NOTHING;
