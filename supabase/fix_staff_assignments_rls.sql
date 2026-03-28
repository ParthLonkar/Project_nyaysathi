-- Fix RLS for staff_assignments so department admins can assign complaints
-- Run this in Supabase SQL editor for the current project.

ALTER TABLE IF EXISTS public.staff_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Department admins can insert staff assignments" ON public.staff_assignments;
CREATE POLICY "Department admins can insert staff assignments"
ON public.staff_assignments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.department_admins da
    WHERE da.user_id = auth.uid()
      AND da.id = staff_assignments.admin_id
      AND da.department_id = staff_assignments.department_id
      AND da.is_active = true
  )
);

DROP POLICY IF EXISTS "Department admins can read staff assignments" ON public.staff_assignments;
CREATE POLICY "Department admins can read staff assignments"
ON public.staff_assignments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.department_admins da
    WHERE da.user_id = auth.uid()
      AND da.department_id = staff_assignments.department_id
      AND da.is_active = true
  )
);

DROP POLICY IF EXISTS "Department admins can update staff assignments" ON public.staff_assignments;
CREATE POLICY "Department admins can update staff assignments"
ON public.staff_assignments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.department_admins da
    WHERE da.user_id = auth.uid()
      AND da.department_id = staff_assignments.department_id
      AND da.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.department_admins da
    WHERE da.user_id = auth.uid()
      AND da.department_id = staff_assignments.department_id
      AND da.is_active = true
  )
);

-- Optional (service-role approach):
-- If you prefer backend bypass instead of policies, set SUPABASE_SERVICE_ROLE_KEY in backend/.env.
