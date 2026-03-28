-- ============================================================================
-- Fix Schema Constraints - Remove auth.users dependencies
-- ============================================================================

-- Fix: Make user_id nullable in department_admins
ALTER TABLE department_admins 
DROP CONSTRAINT department_admins_user_id_fkey;

ALTER TABLE department_admins 
ALTER COLUMN user_id DROP NOT NULL;

-- Fix: Make user_id nullable in department_staff
ALTER TABLE department_staff 
DROP CONSTRAINT department_staff_user_id_fkey;

ALTER TABLE department_staff 
ALTER COLUMN user_id DROP NOT NULL;

-- Fix: Make admin_id optional in department_staff
ALTER TABLE department_staff 
DROP CONSTRAINT department_staff_admin_id_fkey;

ALTER TABLE department_staff 
ADD CONSTRAINT department_staff_admin_id_fkey 
FOREIGN KEY (admin_id) REFERENCES department_admins(id) ON DELETE SET NULL;

ALTER TABLE department_staff 
ALTER COLUMN admin_id DROP NOT NULL;

-- ============================================================================
-- Insert Test Data
-- ============================================================================

-- Insert test admin for MC department
INSERT INTO department_admins (department_id, admin_name, email, phone, username, password_hash, is_active)
SELECT id, 'Test Admin', 'admin@test.local', '9999999999', 'admin_mc', '$2a$10$hSvssQsfQHTJVb7x8KsQAuQ3wJxkRrTGx5MgEqf5TfVNXkV8CkzOG', true
FROM departments WHERE code = 'MC'
ON CONFLICT (username) DO NOTHING;

-- Insert test staff for MC department
INSERT INTO department_staff (department_id, admin_id, staff_name, email, phone, username, password_hash, role, is_active, assigned_area)
SELECT d.id, da.id, 'Test Field Officer', 'staff@test.local', '8888888888', 'staff_mc_001', '$2a$10$hSvssQsfQHTJVb7x8KsQAuQ3wJxkRrTGx5MgEqf5TfVNXkV8CkzOG', 'field_officer', true, 'Zone 1'
FROM departments d
JOIN department_admins da ON d.id = da.department_id
WHERE d.code = 'MC' AND da.username = 'admin_mc'
ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- Done!
-- ============================================================================
-- Test credentials created:
-- Admin: admin_mc / test123
-- Staff: staff_mc_001 / test123
