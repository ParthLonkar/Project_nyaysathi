-- Check what admin accounts exist
SELECT 
  id, 
  username, 
  admin_name, 
  email, 
  is_active,
  LENGTH(password_hash) as password_hash_length,
  SUBSTRING(password_hash, 1, 20) as password_hash_start,
  department_id
FROM department_admins
LIMIT 10;

-- Check the MC department
SELECT id, code, name FROM departments WHERE code = 'MC';

-- Check the admin_mc account specifically
SELECT 
  id, 
  username,
  password_hash,
  is_active,
  department_id
FROM department_admins 
WHERE username = 'admin_mc';
