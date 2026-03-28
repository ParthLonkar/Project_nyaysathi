-- Insert admin account directly
INSERT INTO department_admins (
  department_id, 
  admin_name, 
  email, 
  phone, 
  username, 
  password_hash, 
  is_active
)
VALUES (
  (SELECT id FROM departments WHERE code = 'MC'),
  'admin01',
  'admin01@test.local',
  '9999999998',
  'admin',
  '$2b$10$ML4G4AMDHrk/qU21/iojKee.60p1QA0ciWnee2NhG2GwSz.AwwPM6',
  true
);

-- Verify admin was created
SELECT username, admin_name, is_active FROM department_admins WHERE username = 'admin';
