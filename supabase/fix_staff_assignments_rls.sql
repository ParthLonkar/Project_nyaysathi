-- Fix RLS policies for staff_assignments table
-- This enables admins to create and manage staff assignments

-- Admins can INSERT staff assignments (assign complaints to staff)
-- Allow: Department admins OR system admins from user_roles
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

-- Admins can SELECT staff assignments in their department
CREATE POLICY "Admins can read staff assignments in their department"
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

-- Staff can read their own assignments
CREATE POLICY "Staff can read own assignments"
  ON staff_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM department_staff
      WHERE department_staff.user_id = auth.uid()
      AND department_staff.id = staff_assignments.staff_id
    )
  );

-- Admins can UPDATE staff assignments in their department
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

-- Admins can DELETE staff assignments in their department
CREATE POLICY "Admins can delete staff assignments"
  ON staff_assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM department_admins
      WHERE department_admins.user_id = auth.uid()
      AND department_admins.department_id = staff_assignments.department_id
    )
  );
