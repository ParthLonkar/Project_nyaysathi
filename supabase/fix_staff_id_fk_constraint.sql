-- ============================================================================
-- FIX: Make staff_id optional (nullable) for complaint_documents
-- ============================================================================
-- The foreign key constraint is too strict. staff_id should be optional
-- since documents can be uploaded by temporary/external staff who may not
-- be in the exact same auth.users table structure.

-- Step 1: Drop the strict foreign key constraint
ALTER TABLE complaint_documents
DROP CONSTRAINT IF EXISTS complaint_documents_staff_id_fkey;

-- Step 2: Make staff_id nullable (optional)
ALTER TABLE complaint_documents
ALTER COLUMN staff_id DROP NOT NULL;
ALTER TABLE complaint_documents
ALTER COLUMN staff_id SET DEFAULT NULL;

-- Step 3: Optional - add back a looser foreign key (if you want referential integrity)
-- ALTER TABLE complaint_documents
-- ADD CONSTRAINT complaint_documents_staff_id_fkey 
-- FOREIGN KEY (staff_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- For now, staff_id is just a UUID text field with no strict constraint
-- This allows flexibility in tracking who uploaded what
