-- Update test admin with correct password hash for "test123"
UPDATE department_admins 
SET password_hash = '$2b$10$wABNyg3NtE316t4lODIm9.meMLbz2mtJuyWP0ltokH963oCM44neG'
WHERE username = 'admin_mc';

-- Update test staff with correct password hash for "test123"
UPDATE department_staff 
SET password_hash = '$2b$10$wABNyg3NtE316t4lODIm9.meMLbz2mtJuyWP0ltokH963oCM44neG'
WHERE username = 'staff_mc_001';

-- Verify update
SELECT username, password_hash FROM department_admins WHERE username = 'admin_mc';
SELECT username, password_hash FROM department_staff WHERE username = 'staff_mc_001';
