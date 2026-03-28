-- Migration: Fix staff_assignments RLS to allow system admins
-- Date: 2026-03-29
-- Issue: staff_assignments INSERT policy was blocking system admins who aren't in department_admins table

-- FIRST: Ensure user_roles table exists (may not be created if schema.sql wasn't run)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Ensure user_roles has RLS enabled
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- DROP the old restrictive policy
DROP POLICY IF EXISTS "Admins can insert staff assignments" ON staff_assignments;

-- CREATE improved policy that allows BOTH department admins AND system admins
CREATE POLICY "Admins can insert staff assignments"
  ON staff_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM department_admins
      WHERE department_admins.user_id = auth.uid()
      AND department_admins.department_id = staff_assignments.department_id
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Also update SELECT policy to include system admins
DROP POLICY IF EXISTS "Admins can read staff assignments in their department" ON staff_assignments;

CREATE POLICY "Admins can read staff assignments"
  ON staff_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM department_admins
      WHERE department_admins.user_id = auth.uid()
      AND department_admins.department_id = staff_assignments.department_id
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM department_staff
      WHERE department_staff.user_id = auth.uid()
      AND department_staff.id = staff_assignments.staff_id
    )
  );

-- Update UPDATE policy to include system admins
DROP POLICY IF EXISTS "Admins can update staff assignments" ON staff_assignments;

CREATE POLICY "Admins can update staff assignments"
  ON staff_assignments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM department_admins
      WHERE department_admins.user_id = auth.uid()
      AND department_admins.department_id = staff_assignments.department_id
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM department_admins
      WHERE department_admins.user_id = auth.uid()
      AND department_admins.department_id = staff_assignments.department_id
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Update DELETE policy to include system admins
DROP POLICY IF EXISTS "Admins can delete staff assignments" ON staff_assignments;

CREATE POLICY "Admins can delete staff assignments"
  ON staff_assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM department_admins
      WHERE department_admins.user_id = auth.uid()
      AND department_admins.department_id = staff_assignments.department_id
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
