-- ============================================================================
-- NyaySathi - Insert Remaining Department Admins and Staff
-- Date: 28-March-2026
-- This script inserts admins and staff for all remaining departments
-- ============================================================================

-- ============================================================================
-- PASSWORD HASH REFERENCE (bcrypt)
-- Admin password: "admin123" -> $2b$10$ML4G4AMDHrk/qU21/iojKee.60p1QA0ciWnee2NhG2GwSz.AwwPM6
-- Staff password: "staff123" -> $2b$10$G4VwB8AEwtjdxviJFlGP1OkID.Yy/nP9f4Cohx.6R7dc5ZU/Qjo0q
-- ============================================================================

-- ============================================================================
-- 1. INSERT ADMINS FOR REMAINING DEPARTMENTS
-- ============================================================================

INSERT INTO department_admins (
  department_id, 
  admin_name, 
  email, 
  phone, 
  username, 
  password_hash, 
  is_active
)
VALUES 
-- Water Supply Department Admin
(
  (SELECT id FROM departments WHERE code = 'WSD'),
  'Raj Kumar Singh',
  'admin_wsd@govt.in',
  '9876543210',
  'admin_wsd',
  '$2b$10$ML4G4AMDHrk/qU21/iojKee.60p1QA0ciWnee2NhG2GwSz.AwwPM6',
  true
),
-- Electricity Board Admin
(
  (SELECT id FROM departments WHERE code = 'EB'),
  'Priya Sharma',
  'admin_eb@govt.in',
  '9876543211',
  'admin_eb',
  '$2b$10$ML4G4AMDHrk/qU21/iojKee.60p1QA0ciWnee2NhG2GwSz.AwwPM6',
  true
),
-- Public Works Department Admin
(
  (SELECT id FROM departments WHERE code = 'PWD'),
  'Arun Kumar Verma',
  'admin_pwd@govt.in',
  '9876543212',
  'admin_pwd',
  '$2b$10$ML4G4AMDHrk/qU21/iojKee.60p1QA0ciWnee2NhG2GwSz.AwwPM6',
  true
),
-- Police Department Admin
(
  (SELECT id FROM departments WHERE code = 'PD'),
  'Suresh Patel',
  'admin_pd@govt.in',
  '9876543213',
  'admin_pd',
  '$2b$10$ML4G4AMDHrk/qU21/iojKee.60p1QA0ciWnee2NhG2GwSz.AwwPM6',
  true
),
-- Consumer Affairs Admin
(
  (SELECT id FROM departments WHERE code = 'CA'),
  'Neha Gupta',
  'admin_ca@govt.in',
  '9876543214',
  'admin_ca',
  '$2b$10$ML4G4AMDHrk/qU21/iojKee.60p1QA0ciWnee2NhG2GwSz.AwwPM6',
  true
)
ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- 2. INSERT STAFF FOR WATER SUPPLY DEPARTMENT
-- ============================================================================

INSERT INTO department_staff (
  department_id,
  admin_id,
  staff_name,
  email,
  phone,
  username,
  password_hash,
  position,
  expertise_area,
  is_active
)
SELECT
  d.id,
  da.id,
  'Vikram Desai',
  'staff_wsd_01@govt.in',
  '8765432101',
  'staff_wsd_01',
  '$2b$10$G4VwB8AEwtjdxviJFlGP1OkID.Yy/nP9f4Cohx.6R7dc5ZU/Qjo0q',
  'Senior Officer',
  'Water Quality & Testing',
  true
FROM departments d 
JOIN department_admins da ON d.id = da.department_id 
WHERE d.code = 'WSD' AND da.username = 'admin_wsd'
ON CONFLICT (username) DO NOTHING;

INSERT INTO department_staff (
  department_id,
  admin_id,
  staff_name,
  email,
  phone,
  username,
  password_hash,
  position,
  expertise_area,
  is_active
)
SELECT
  d.id,
  da.id,
  'Amita Nair',
  'staff_wsd_02@govt.in',
  '8765432102',
  'staff_wsd_02',
  '$2b$10$G4VwB8AEwtjdxviJFlGP1OkID.Yy/nP9f4Cohx.6R7dc5ZU/Qjo0q',
  'Inspector',
  'Leakage Detection',
  true
FROM departments d 
JOIN department_admins da ON d.id = da.department_id 
WHERE d.code = 'WSD' AND da.username = 'admin_wsd'
ON CONFLICT (username) DO NOTHING;

INSERT INTO department_staff (
  department_id,
  admin_id,
  staff_name,
  email,
  phone,
  username,
  password_hash,
  position,
  expertise_area,
  is_active
)
SELECT
  d.id,
  da.id,
  'Rajesh Kumar',
  'staff_wsd_03@govt.in',
  '8765432103',
  'staff_wsd_03',
  '$2b$10$G4VwB8AEwtjdxviJFlGP1OkID.Yy/nP9f4Cohx.6R7dc5ZU/Qjo0q',
  'Technician',
  'Pipe Maintenance',
  true
FROM departments d 
JOIN department_admins da ON d.id = da.department_id 
WHERE d.code = 'WSD' AND da.username = 'admin_wsd'
ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- 3. INSERT STAFF FOR ELECTRICITY BOARD
-- ============================================================================

INSERT INTO department_staff (
  department_id,
  admin_id,
  staff_name,
  email,
  phone,
  username,
  password_hash,
  position,
  expertise_area,
  is_active
)
SELECT
  d.id,
  da.id,
  'Arjun Deshmukh',
  'staff_eb_01@govt.in',
  '8765432201',
  'staff_eb_01',
  '$2b$10$G4VwB8AEwtjdxviJFlGP1OkID.Yy/nP9f4Cohx.6R7dc5ZU/Qjo0q',
  'Senior Technician',
  'Power Cut Investigation',
  true
FROM departments d 
JOIN department_admins da ON d.id = da.department_id 
WHERE d.code = 'EB' AND da.username = 'admin_eb'
ON CONFLICT (username) DO NOTHING;

INSERT INTO department_staff (
  department_id,
  admin_id,
  staff_name,
  email,
  phone,
  username,
  password_hash,
  position,
  expertise_area,
  is_active
)
SELECT
  d.id,
  da.id,
  'Meera Dutta',
  'staff_eb_02@govt.in',
  '8765432202',
  'staff_eb_02',
  '$2b$10$G4VwB8AEwtjdxviJFlGP1OkID.Yy/nP9f4Cohx.6R7dc5ZU/Qjo0q',
  'Inspector',
  'Meter Reading & Billing',
  true
FROM departments d 
JOIN department_admins da ON d.id = da.department_id 
WHERE d.code = 'EB' AND da.username = 'admin_eb'
ON CONFLICT (username) DO NOTHING;

INSERT INTO department_staff (
  department_id,
  admin_id,
  staff_name,
  email,
  phone,
  username,
  password_hash,
  position,
  expertise_area,
  is_active
)
SELECT
  d.id,
  da.id,
  'Sunil Reddy',
  'staff_eb_03@govt.in',
  '8765432203',
  'staff_eb_03',
  '$2b$10$G4VwB8AEwtjdxviJFlGP1OkID.Yy/nP9f4Cohx.6R7dc5ZU/Qjo0q',
  'Technician',
  'Transformer Maintenance',
  true
FROM departments d 
JOIN department_admins da ON d.id = da.department_id 
WHERE d.code = 'EB' AND da.username = 'admin_eb'
ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- 4. INSERT STAFF FOR PUBLIC WORKS DEPARTMENT
-- ============================================================================

INSERT INTO department_staff (
  department_id,
  admin_id,
  staff_name,
  email,
  phone,
  username,
  password_hash,
  position,
  expertise_area,
  is_active
)
SELECT
  d.id,
  da.id,
  'Harish Kumar',
  'staff_pwd_01@govt.in',
  '8765432301',
  'staff_pwd_01',
  '$2b$10$G4VwB8AEwtjdxviJFlGP1OkID.Yy/nP9f4Cohx.6R7dc5ZU/Qjo0q',
  'Senior Inspector',
  'Road & Bridge Inspection',
  true
FROM departments d 
JOIN department_admins da ON d.id = da.department_id 
WHERE d.code = 'PWD' AND da.username = 'admin_pwd'
ON CONFLICT (username) DO NOTHING;

INSERT INTO department_staff (
  department_id,
  admin_id,
  staff_name,
  email,
  phone,
  username,
  password_hash,
  position,
  expertise_area,
  is_active
)
SELECT
  d.id,
  da.id,
  'Deepak Singh',
  'staff_pwd_02@govt.in',
  '8765432302',
  'staff_pwd_02',
  '$2b$10$G4VwB8AEwtjdxviJFlGP1OkID.Yy/nP9f4Cohx.6R7dc5ZU/Qjo0q',
  'Surveyor',
  'Pothole & Damage Assessment',
  true
FROM departments d 
JOIN department_admins da ON d.id = da.department_id 
WHERE d.code = 'PWD' AND da.username = 'admin_pwd'
ON CONFLICT (username) DO NOTHING;

INSERT INTO department_staff (
  department_id,
  admin_id,
  staff_name,
  email,
  phone,
  username,
  password_hash,
  position,
  expertise_area,
  is_active
)
SELECT
  d.id,
  da.id,
  'Kavya Desai',
  'staff_pwd_03@govt.in',
  '8765432303',
  'staff_pwd_03',
  '$2b$10$G4VwB8AEwtjdxviJFlGP1OkID.Yy/nP9f4Cohx.6R7dc5ZU/Qjo0q',
  'Coordinator',
  'Maintenance Scheduling',
  true
FROM departments d 
JOIN department_admins da ON d.id = da.department_id 
WHERE d.code = 'PWD' AND da.username = 'admin_pwd'
ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- 5. INSERT STAFF FOR POLICE DEPARTMENT
-- ============================================================================

INSERT INTO department_staff (
  department_id,
  admin_id,
  staff_name,
  email,
  phone,
  username,
  password_hash,
  position,
  expertise_area,
  is_active
)
SELECT
  d.id,
  da.id,
  'Inspector Mohan',
  'staff_pd_01@govt.in',
  '8765432401',
  'staff_pd_01',
  '$2b$10$G4VwB8AEwtjdxviJFlGP1OkID.Yy/nP9f4Cohx.6R7dc5ZU/Qjo0q',
  'Senior Inspector',
  'Theft & Burglary',
  true
FROM departments d 
JOIN department_admins da ON d.id = da.department_id 
WHERE d.code = 'PD' AND da.username = 'admin_pd'
ON CONFLICT (username) DO NOTHING;

INSERT INTO department_staff (
  department_id,
  admin_id,
  staff_name,
  email,
  phone,
  username,
  password_hash,
  position,
  expertise_area,
  is_active
)
SELECT
  d.id,
  da.id,
  'Constable Sharma',
  'staff_pd_02@govt.in',
  '8765432402',
  'staff_pd_02',
  '$2b$10$G4VwB8AEwtjdxviJFlGP1OkID.Yy/nP9f4Cohx.6R7dc5ZU/Qjo0q',
  'Investigation Officer',
  'Complaint Documentation',
  true
FROM departments d 
JOIN department_admins da ON d.id = da.department_id 
WHERE d.code = 'PD' AND da.username = 'admin_pd'
ON CONFLICT (username) DO NOTHING;

INSERT INTO department_staff (
  department_id,
  admin_id,
  staff_name,
  email,
  phone,
  username,
  password_hash,
  position,
  expertise_area,
  is_active
)
SELECT
  d.id,
  da.id,
  'Officer Rajpoot',
  'staff_pd_03@govt.in',
  '8765432403',
  'staff_pd_03',
  '$2b$10$G4VwB8AEwtjdxviJFlGP1OkID.Yy/nP9f4Cohx.6R7dc5ZU/Qjo0q',
  'Patrol Officer',
  'On-ground Safety Verification',
  true
FROM departments d 
JOIN department_admins da ON d.id = da.department_id 
WHERE d.code = 'PD' AND da.username = 'admin_pd'
ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- 6. INSERT STAFF FOR CONSUMER AFFAIRS DEPARTMENT
-- ============================================================================

INSERT INTO department_staff (
  department_id,
  admin_id,
  staff_name,
  email,
  phone,
  username,
  password_hash,
  position,
  expertise_area,
  is_active
)
SELECT
  d.id,
  da.id,
  'Pooja Sharma',
  'staff_ca_01@govt.in',
  '8765432501',
  'staff_ca_01',
  '$2b$10$G4VwB8AEwtjdxviJFlGP1OkID.Yy/nP9f4Cohx.6R7dc5ZU/Qjo0q',
  'Senior Officer',
  'Refund & Compensation',
  true
FROM departments d 
JOIN department_admins da ON d.id = da.department_id 
WHERE d.code = 'CA' AND da.username = 'admin_ca'
ON CONFLICT (username) DO NOTHING;

INSERT INTO department_staff (
  department_id,
  admin_id,
  staff_name,
  email,
  phone,
  username,
  password_hash,
  position,
  expertise_area,
  is_active
)
SELECT
  d.id,
  da.id,
  'Rajesh Pandey',
  'staff_ca_02@govt.in',
  '8765432502',
  'staff_ca_02',
  '$2b$10$G4VwB8AEwtjdxviJFlGP1OkID.Yy/nP9f4Cohx.6R7dc5ZU/Qjo0q',
  'Investigator',
  'Fraud Detection',
  true
FROM departments d 
JOIN department_admins da ON d.id = da.department_id 
WHERE d.code = 'CA' AND da.username = 'admin_ca'
ON CONFLICT (username) DO NOTHING;

INSERT INTO department_staff (
  department_id,
  admin_id,
  staff_name,
  email,
  phone,
  username,
  password_hash,
  position,
  expertise_area,
  is_active
)
SELECT
  d.id,
  da.id,
  'Anjali Trivedi',
  'staff_ca_03@govt.in',
  '8765432503',
  'staff_ca_03',
  '$2b$10$G4VwB8AEwtjdxviJFlGP1OkID.Yy/nP9f4Cohx.6R7dc5ZU/Qjo0q',
  'Officer',
  'Consumer Protection',
  true
FROM departments d 
JOIN department_admins da ON d.id = da.department_id 
WHERE d.code = 'CA' AND da.username = 'admin_ca'
ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- 7. VERIFICATION QUERIES
-- ============================================================================

-- Verify all admins were created
SELECT 
  da.username, 
  da.admin_name, 
  d.name as department,
  da.is_active 
FROM department_admins da 
JOIN departments d ON da.department_id = d.id 
ORDER BY d.code;

-- Verify all staff were created
SELECT 
  ds.username, 
  ds.staff_name, 
  d.name as department,
  ds.position,
  ds.expertise_area,
  ds.is_active 
FROM department_staff ds 
JOIN departments d ON ds.department_id = d.id 
ORDER BY d.code, ds.username;

-- Count summary
SELECT 
  d.code,
  d.name,
  COUNT(DISTINCT da.id) as "Admin Count",
  COUNT(DISTINCT ds.id) as "Staff Count"
FROM departments d
LEFT JOIN department_admins da ON d.id = da.department_id
LEFT JOIN department_staff ds ON d.id = ds.department_id
GROUP BY d.id, d.code, d.name
ORDER BY d.code;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
