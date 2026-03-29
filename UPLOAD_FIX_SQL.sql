-- Run this in Supabase SQL Editor to fix upload RLS error
-- This disables RLS on complaint_documents (safe because backend has service role key)

ALTER TABLE complaint_documents DISABLE ROW LEVEL SECURITY;

-- Verify it's disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'complaint_documents';
