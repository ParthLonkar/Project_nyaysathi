-- ============================================================================
-- NyaySathi Department Management System - Database Extensions
-- Date: 28-March-2026
-- ============================================================================

-- 1. DEPARTMENTS TABLE
-- Stores government departments and their configuration
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
-- Admin accounts for department heads
CREATE TABLE IF NOT EXISTS department_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
-- Staff/officers working under department admins
CREATE TABLE IF NOT EXISTS department_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES department_admins(id) ON DELETE CASCADE,
  staff_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  position VARCHAR(100), -- e.g., "Officer", "Inspector", "Supervisor"
  expertise_area TEXT, -- areas of specialization
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  complaints_assigned INT DEFAULT 0,
  complaints_resolved INT DEFAULT 0,
  average_resolution_days DECIMAL(8,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 4. STAFF ASSIGNMENTS TABLE
-- Links complaints to specific staff members
CREATE TABLE IF NOT EXISTS staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES department_staff(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES department_admins(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT now(),
  assignment_notes TEXT,
  status VARCHAR(50) DEFAULT 'active', -- active, completed, reassigned
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 5. COMPLAINT NOTES TABLE
-- Notes added by staff during complaint processing
CREATE TABLE IF NOT EXISTS complaint_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES department_staff(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT true, -- true = only admins/staff, false = visible to citizen
  attachment_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 6. FIELD VISITS TABLE
-- Scheduled field visits and inspections
CREATE TABLE IF NOT EXISTS field_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES department_staff(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMP NOT NULL,
  location TEXT NOT NULL,
  visit_type VARCHAR(50), -- inspection, verification, evidence_collection
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled
  visit_report TEXT,
  photos_url TEXT[],
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 7. DEPARTMENT ANALYTICS TABLE
-- Analytics and metrics for each department
CREATE TABLE IF NOT EXISTS department_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL UNIQUE REFERENCES departments(id) ON DELETE CASCADE,
  total_complaints INT DEFAULT 0,
  complaints_received_this_month INT DEFAULT 0,
  complaints_pending INT DEFAULT 0,
  complaints_in_progress INT DEFAULT 0,
  complaints_resolved INT DEFAULT 0,
  complaints_rejected INT DEFAULT 0,
  average_resolution_days DECIMAL(8,2) DEFAULT 0,
  sla_compliance_rate DECIMAL(5,2) DEFAULT 0, -- percentage
  total_staff INT DEFAULT 0,
  active_staff INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 8. STAFF PERFORMANCE TABLE
-- Performance metrics for each staff member
CREATE TABLE IF NOT EXISTS staff_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL UNIQUE REFERENCES department_staff(id) ON DELETE CASCADE,
  total_complaints_handling INT DEFAULT 0,
  total_complaints_resolved INT DEFAULT 0,
  average_resolution_time_days DECIMAL(8,2) DEFAULT 0,
  customer_satisfaction_score DECIMAL(3,2) DEFAULT 0, -- 0-5
  sla_achievement_rate DECIMAL(5,2) DEFAULT 0, -- percentage
  on_time_completion_rate DECIMAL(5,2) DEFAULT 0, -- percentage
  escalations_count INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 9. Update complaints table to include department and admin references
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS assigned_admin_id UUID REFERENCES department_admins(id) ON DELETE SET NULL;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS assigned_staff_id UUID REFERENCES department_staff(id) ON DELETE SET NULL;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS sla_days INT DEFAULT 30;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP DEFAULT now();
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS progress_percentage INT DEFAULT 0;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS sla_breached BOOLEAN DEFAULT false;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS respondent_name VARCHAR(100);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS incident_date DATE;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS routing_info JSONB;

-- 10. User roles - already exist in user_roles table from schema.sql
-- Possible roles: citizen, department_admin, department_staff, superadmin
-- NOTE: user_roles table creation is in supabase/schema.sql if needed

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_departments_code ON departments(code);
CREATE INDEX idx_department_admins_department_id ON department_admins(department_id);
CREATE INDEX idx_department_admins_user_id ON department_admins(user_id);
CREATE INDEX idx_department_staff_department_id ON department_staff(department_id);
CREATE INDEX idx_department_staff_admin_id ON department_staff(admin_id);
CREATE INDEX idx_department_staff_user_id ON department_staff(user_id);
CREATE INDEX idx_staff_assignments_complaint_id ON staff_assignments(complaint_id);
CREATE INDEX idx_staff_assignments_staff_id ON staff_assignments(staff_id);
CREATE INDEX idx_staff_assignments_status ON staff_assignments(status);
CREATE INDEX idx_complaint_notes_complaint_id ON complaint_notes(complaint_id);
CREATE INDEX idx_complaint_notes_staff_id ON complaint_notes(staff_id);
CREATE INDEX idx_field_visits_complaint_id ON field_visits(complaint_id);
CREATE INDEX idx_field_visits_staff_id ON field_visits(staff_id);
CREATE INDEX idx_field_visits_status ON field_visits(status);
CREATE INDEX idx_complaints_department_id ON complaints(department_id);
CREATE INDEX idx_complaints_assigned_staff_id ON complaints(assigned_staff_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_performance ENABLE ROW LEVEL SECURITY;

-- NOTE: RLS policies will be created after user_roles table is set up
-- For now, RLS is enabled but policies are not created to avoid dependencies

-- ============================================================================
-- SAMPLE DATA (6 DEPARTMENTS)
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
