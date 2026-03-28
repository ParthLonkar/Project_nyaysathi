-- Insert staff account directly
INSERT INTO department_staff (
  department_id,
  admin_id,
  staff_name,
  email,
  phone,
  username,
  password_hash,
  is_active
)
VALUES (
  (SELECT id FROM departments WHERE code = 'MC'),
  (SELECT id FROM department_admins WHERE username = 'admin'),
  'staff01',
  'staff01@test.local',
  '8888888898',
  'staff',
  '$2b$10$G4VwB8AEwtjdxviJFlGP1OkID.Yy/nP9f4Cohx.6R7dc5ZU/Qjo0q',
  true
);

-- Verify staff was created
SELECT username, staff_name, is_active FROM department_staff WHERE username = 'staff';
