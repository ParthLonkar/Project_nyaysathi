-- Verify test account exists
SELECT id, username, admin_name, is_active, password_hash, department_id FROM department_admins WHERE username = 'admin_mc';

-- Check department exists
SELECT id, code, name FROM departments WHERE code = 'MC';

-- Check if admin can authenticate with the new hash
-- This just shows the data:
SELECT 
  da.id,
  da.username, 
  da.admin_name,
  da.is_active,
  da.department_id,
  d.code,
  d.name,
  LENGTH(da.password_hash) as hash_length
FROM department_admins da
JOIN departments d ON da.department_id = d.id
WHERE da.username = 'admin_mc';
