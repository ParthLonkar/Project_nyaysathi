-- Migration: Disable RLS on complaint_documents table
-- This fixes the "new row violates row-level security policy" error
-- Run this in Supabase SQL Editor

BEGIN;

-- Check current RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'complaint_documents';

-- Disable RLS on complaint_documents
ALTER TABLE complaint_documents DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'complaint_documents';

COMMIT;
