-- ============================================================================
-- EMERGENCY FIX: Disable RLS on complaint_documents temporarily
-- This is a quick fix to unblock file uploads while we debug
-- ============================================================================

-- Step 1: Add missing columns if not present
ALTER TABLE complaint_documents 
ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES auth.users(id);

ALTER TABLE complaint_documents
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Step 2: DISABLE RLS temporarily (this will unblock uploads immediately)
ALTER TABLE complaint_documents DISABLE ROW LEVEL SECURITY;

-- Step 3: Verify (run these to confirm)
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'complaint_documents';
-- \d complaint_documents

-- NEXT: After uploads work again, we'll re-enable RLS with proper policies
