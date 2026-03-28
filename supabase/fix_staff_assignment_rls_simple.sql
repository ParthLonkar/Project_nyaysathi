-- Alternative Migration: Fix staff_assignments RLS (simpler approach)
-- Date: 2026-03-29
-- Use THIS if the user_roles table doesn't exist or you prefer department-only admins

-- Simply allow department admins to manage staff assignments
-- This is the immediate fix if user_roles doesn't exist in your database

DROP POLICY IF EXISTS "Admins can insert staff assignments" ON staff_assignments;
DROP POLICY IF EXISTS "Admins can read staff assignments in their department" ON staff_assignments;
DROP POLICY IF EXISTS "Admins can read staff assignments" ON staff_assignments;
DROP POLICY IF EXISTS "Read staff assignments" ON staff_assignments;
DROP POLICY IF EXISTS "Staff can read own assignments" ON staff_assignments;
DROP POLICY IF EXISTS "Admins can update staff assignments" ON staff_assignments;
DROP POLICY IF EXISTS "Admins can delete staff assignments" ON staff_assignments;

-- Department admins can INSERT staff assignments
CREATE POLICY "Admins can insert staff assignments"
  ON staff_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM department_admins
      WHERE department_admins.user_id = auth.uid()
      AND department_admins.department_id = staff_assignments.department_id
    )
  );

-- Department admins and assigned staff can SELECT
CREATE POLICY "Read staff assignments"
  ON staff_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM department_admins
      WHERE department_admins.user_id = auth.uid()
      AND department_admins.department_id = staff_assignments.department_id
    )
    OR
    EXISTS (
      SELECT 1 FROM department_staff
      WHERE department_staff.user_id = auth.uid()
      AND department_staff.id = staff_assignments.staff_id
    )
  );

-- Department admins can UPDATE
CREATE POLICY "Admins can update staff assignments"
  ON staff_assignments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM department_admins
      WHERE department_admins.user_id = auth.uid()
      AND department_admins.department_id = staff_assignments.department_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM department_admins
      WHERE department_admins.user_id = auth.uid()
      AND department_admins.department_id = staff_assignments.department_id
    )
  );

-- Department admins can DELETE
CREATE POLICY "Admins can delete staff assignments"
  ON staff_assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM department_admins
      WHERE department_admins.user_id = auth.uid()
      AND department_admins.department_id = staff_assignments.department_id
    )
  );
