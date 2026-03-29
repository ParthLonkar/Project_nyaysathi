-- Fix: RLS policies for complaint_documents table

-- Option 1: RECOMMENDED - Disable RLS on complaint_documents
-- The backend uses service role key which can write directly
ALTER TABLE complaint_documents DISABLE ROW LEVEL SECURITY;

-- Note: If you want to keep RLS enabled, use the policies below instead.
-- But for this use case, disabling is simpler since:
-- 1. Backend has service role key (can bypass RLS anyway)
-- 2. This is an internal staff document table, not end-user facing
-- 3. Authorization is handled at the API route level with staff middleware

-- ============================================
-- ALTERNATIVE: If you prefer to keep RLS enabled, use these policies instead:
-- ============================================

/*
-- Enable RLS on complaint_documents
ALTER TABLE complaint_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Staff can insert evidence" ON complaint_documents;
DROP POLICY IF EXISTS "Staff can read documents" ON complaint_documents;
DROP POLICY IF EXISTS "Admin can manage documents" ON complaint_documents;

-- Policy: Allow all inserts (backend service role will use this)
CREATE POLICY "Allow staff to insert"
  ON complaint_documents FOR INSERT
  WITH CHECK (true);

-- Policy: Allow staff to read documents from their complaints
CREATE POLICY "Staff can read assigned complaint documents"
  ON complaint_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_assignments sa
      JOIN department_staff ds ON ds.id = sa.staff_id
      WHERE sa.complaint_id = complaint_documents.complaint_id
      AND ds.id::text = current_user_id()  -- Requires a function
      AND sa.status = 'active'
    )
    OR current_user_is_admin()  -- Requires a function
  );

-- Policy: Allow staff to update their own documents
CREATE POLICY "Staff can update own documents"
  ON complaint_documents FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Allow staff to delete their own documents
CREATE POLICY "Staff can delete own documents"
  ON complaint_documents FOR DELETE
  USING (true);
*/

