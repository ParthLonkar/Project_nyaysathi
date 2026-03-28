-- Diagnostic query: Check which tables exist in your database
-- Run this in Supabase SQL Editor to see what's actually set up

SELECT 
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
