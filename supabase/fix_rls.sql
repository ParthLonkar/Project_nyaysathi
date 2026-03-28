-- CRITICAL FIX: Disable RLS on authentication tables
-- RLS was enabled but no policies were created, causing DENY-ALL default
-- This prevents the application from reading admin/staff accounts

ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE department_admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE department_staff DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled on other tables for security
-- ALTER TABLE staff_assignments DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE complaint_notes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE field_visits DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE department_analytics DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE staff_performance DISABLE ROW LEVEL SECURITY;

-- Verify RLS status
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('departments', 'department_admins', 'department_staff');
