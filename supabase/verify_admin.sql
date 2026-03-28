-- Check if admin account exists
SELECT 
  id,
  username,
  admin_name,
  is_active,
  password_hash,
  department_id
FROM department_admins 
WHERE username = 'admin';

-- Also check the departments
SELECT id, code, name FROM departments WHERE code = 'MC';
