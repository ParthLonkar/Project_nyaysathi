-- Migration: Add staff_id to complaint_documents table
-- Tracks which staff member uploaded the evidence file

ALTER TABLE complaint_documents 
ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES auth.users(id);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_complaint_documents_staff_id 
ON complaint_documents(staff_id);

-- Update any existing timestamps to be accurate
ALTER TABLE complaint_documents
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
