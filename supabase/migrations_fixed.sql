-- ============================================================================
-- NyaySathi Department Management System - Database Schema
-- Date: 28-March-2026
-- ============================================================================

-- 1. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  sla_days INT DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 2. DEPARTMENT ADMINS TABLE
CREATE TABLE IF NOT EXISTS department_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  admin_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 3. DEPARTMENT STAFF TABLE
CREATE TABLE IF NOT EXISTS department_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES department_admins(id) ON DELETE SET NULL,
  staff_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'field_officer',
  position VARCHAR(100),
  expertise_area TEXT,
  assigned_area VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 4. STAFF ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES department_staff(id) ON DELETE CASCADE,
  complaint_id UUID,
  assignment_date TIMESTAMP DEFAULT now(),
  completion_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'assigned',
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 5. COMPLAINT NOTES TABLE
CREATE TABLE IF NOT EXISTS complaint_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID,
  author_id UUID,
  note_text TEXT NOT NULL,
  note_type VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 6. FIELD VISITS TABLE
CREATE TABLE IF NOT EXISTS field_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID,
  staff_id UUID REFERENCES department_staff(id) ON DELETE SET NULL,
  visit_date TIMESTAMP NOT NULL,
  location TEXT,
  findings TEXT,
  photos_url TEXT,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 7. DEPARTMENT ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS department_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMP DEFAULT now()
);

-- 8. STAFF PERFORMANCE TABLE
CREATE TABLE IF NOT EXISTS staff_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES department_staff(id) ON DELETE CASCADE,
  complaints_handled INT DEFAULT 0,
  avg_resolution_time INT,
  customer_satisfaction_score NUMERIC,
  performance_rating VARCHAR(50),
  last_updated TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_dept_code ON departments(code);
CREATE INDEX IF NOT EXISTS idx_dept_admins_dept_id ON department_admins(department_id);
CREATE INDEX IF NOT EXISTS idx_dept_admins_username ON department_admins(username);
CREATE INDEX IF NOT EXISTS idx_dept_staff_dept_id ON department_staff(department_id);
CREATE INDEX IF NOT EXISTS idx_dept_staff_admin_id ON department_staff(admin_id);
CREATE INDEX IF NOT EXISTS idx_dept_staff_username ON department_staff(username);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_staff_id ON staff_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_complaint_notes_complaint_id ON complaint_notes(complaint_id);
CREATE INDEX IF NOT EXISTS idx_field_visits_staff_id ON field_visits(staff_id);
CREATE INDEX IF NOT EXISTS idx_field_visits_complaint_id ON field_visits(complaint_id);
CREATE INDEX IF NOT EXISTS idx_dept_analytics_dept_id ON department_analytics(department_id);
CREATE INDEX IF NOT EXISTS idx_staff_perf_staff_id ON staff_performance(staff_id);

-- ============================================================================
-- SAMPLE DATA - DEPARTMENTS
-- ============================================================================

INSERT INTO departments (name, code, description, email, phone, sla_days) VALUES
  ('Municipal Corporation', 'MC', 'Garbage collection, street lights, drainage, local civic issues', 'mc@govt.in', '+91-1800-MC-HELP', 30),
  ('Water Supply Department', 'WSD', 'Water supply, leakage, contamination issues', 'wsd@govt.in', '+91-1800-WS-HELP', 20),
  ('Electricity Board', 'EB', 'Power cuts, meter issues, transformer problems', 'eb@govt.in', '+91-1800-EB-HELP', 15),
  ('Public Works Department', 'PWD', 'Roads, potholes, infrastructure maintenance', 'pwd@govt.in', '+91-1800-PW-HELP', 25),
  ('Police Department', 'PD', 'Theft, safety issues, law enforcement', 'pd@govt.in', '+91-1800-PD-HELP', 7),
  ('Consumer Affairs', 'CA', 'Refund issues, fraud complaints, consumer protection', 'ca@govt.in', '+91-1800-CA-HELP', 30)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
