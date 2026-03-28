-- Clear and re-hash with a specific bcrypt salt
-- First, let's update password_hash directly with a known hash

UPDATE department_admins 
SET password_hash = '$2a$10$Ej0u1Gt3BBPSxDJYRQjVsuHQKHR999nWnHPL3F4wZMqJuFnQw4nCi'
WHERE username = 'admin_mc';

UPDATE department_staff 
SET password_hash = '$2a$10$Ej0u1Gt3BBPSxDJYRQjVsuHQKHR999nWnHPL3F4wZMqJuFnQw4nCi'
WHERE username = 'staff_mc_001';

-- Verify
SELECT username, password_hash FROM department_admins WHERE username = 'admin_mc';
SELECT username, password_hash FROM department_staff WHERE username = 'staff_mc_001';
