-- Add new admin account
INSERT INTO department_admins (department_id, admin_name, email, phone, username, password_hash, is_active)
SELECT 
  id, 
  'admin01', 
  'admin01@test.local', 
  '9999999998', 
  'admin',
  '$2b$10$ML4G4AMDHrk/qU21/iojKee.60p1QA0ciWnee2NhG2GwSz.AwwPM6',
  true
FROM departments 
WHERE code = 'MC'
ON CONFLICT (username) DO NOTHING;

-- Add new staff account (linked to the admin we just created)
INSERT INTO department_staff (department_id, admin_id, staff_name, email, phone, username, password_hash, is_active)
SELECT 
  d.id,
  da.id,
  'staff01',
  'staff01@test.local',
  '8888888898',
  'staff',
  '$2b$10$G4VwB8AEwtjdxviJFlGP1OkID.Yy/nP9f4Cohx.6R7dc5ZU/Qjo0q',
  true
FROM departments d
JOIN department_admins da ON d.id = da.department_id
WHERE d.code = 'MC' AND da.username = 'admin'
ON CONFLICT (username) DO NOTHING;

-- Verify the new accounts
SELECT username, admin_name, is_active FROM department_admins WHERE username IN ('admin', 'admin_mc');
SELECT username, staff_name, is_active FROM department_staff WHERE username IN ('staff', 'staff_mc_001');
