-- ============================================================================
-- COMPLETE FIX: complaint_documents table RLS and Schema Issues
-- ============================================================================
-- This script fixes file upload failures for staff members by:
-- 1. Adding missing staff_id column
-- 2. Ensuring proper RLS policies allow staff uploads
-- 3. Creating indexes for performance
-- ============================================================================

-- Step 1: Add missing schema columns
-- ============================================================================
ALTER TABLE complaint_documents 
ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES auth.users(id);

ALTER TABLE complaint_documents
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_complaint_documents_staff_id 
ON complaint_documents(staff_id);

CREATE INDEX IF NOT EXISTS idx_complaint_documents_complaint_id 
ON complaint_documents(complaint_id);

-- Step 2: Enable RLS (if not already enabled)
-- ============================================================================
ALTER TABLE complaint_documents ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies to ensure clean slate
-- ============================================================================
DROP POLICY IF EXISTS "complaint_documents_insert_policy" ON complaint_documents;
DROP POLICY IF EXISTS "complaint_documents_select_policy" ON complaint_documents;
DROP POLICY IF EXISTS "complaint_documents_update_policy" ON complaint_documents;
DROP POLICY IF EXISTS "complaint_documents_delete_policy" ON complaint_documents;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON complaint_documents;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON complaint_documents;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON complaint_documents;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON complaint_documents;

-- Step 4: Create new RLS policies for document operations
-- ============================================================================

-- Policy 1: Allow authenticated users (staff members) to INSERT documents for complaints they're assigned to
CREATE POLICY "complaint_documents_insert_policy" ON complaint_documents
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    (
      -- User is the staff member uploading
      auth.uid() = coalesce(staff_id, auth.uid())
      OR
      -- User is a staff member assigned to this complaint
      EXISTS (
        SELECT 1 FROM staff_assignments
        WHERE staff_assignments.complaint_id = complaint_documents.complaint_id
        AND staff_assignments.staff_id = auth.uid()
        AND staff_assignments.deleted_at IS NULL
      )
      OR
      -- User is an admin
      EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
      )
    )
  );

-- Policy 2: Allow authenticated users to SELECT documents
CREATE POLICY "complaint_documents_select_policy" ON complaint_documents
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    (
      -- User is the one who uploaded it
      auth.uid() = staff_id
      OR
      -- User is staff assigned to this complaint
      EXISTS (
        SELECT 1 FROM staff_assignments
        WHERE staff_assignments.complaint_id = complaint_documents.complaint_id
        AND staff_assignments.staff_id = auth.uid()
        AND staff_assignments.deleted_at IS NULL
      )
      OR
      -- User is assigned as department admin
      EXISTS (
        SELECT 1 FROM department_admins
        WHERE department_admins.user_id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM complaints
          WHERE complaints.id = complaint_documents.complaint_id
          AND complaints.department_id = department_admins.department_id
        )
      )
      OR
      -- User is a system admin
      EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
      )
    )
  );

-- Policy 3: Allow users to UPDATE their own documents
CREATE POLICY "complaint_documents_update_policy" ON complaint_documents
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    (
      auth.uid() = staff_id OR
      EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
      )
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    (
      auth.uid() = staff_id OR
      EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
      )
    )
  );

-- Policy 4: Allow users to DELETE their own documents or admins to delete any
CREATE POLICY "complaint_documents_delete_policy" ON complaint_documents
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    (
      auth.uid() = staff_id OR
      EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
      )
    )
  );

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run these SELECT statements to verify the setup:
-- 
-- SELECT tablename FROM pg_tables WHERE tablename = 'complaint_documents';
-- SELECT * FROM pg_policies WHERE tablename = 'complaint_documents';
-- \d complaint_documents
-- 
-- ============================================================================
