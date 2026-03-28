-- Update with CORRECT bcrypt hash for "test123"
UPDATE department_admins 
SET password_hash = '$2b$10$0.iPQGZ5PcekKIsyVQSCdOf7UW4I4P.HTxpFMB1gAfYYgTtlMZkJ.'
WHERE username = 'admin_mc';

UPDATE department_staff 
SET password_hash = '$2b$10$0.iPQGZ5PcekKIsyVQSCdOf7UW4I4P.HTxpFMB1gAfYYgTtlMZkJ.'
WHERE username = 'staff_mc_001';

-- Verify
SELECT username, password_hash FROM department_admins WHERE username = 'admin_mc';
SELECT username, password_hash FROM department_staff WHERE username = 'staff_mc_001';
