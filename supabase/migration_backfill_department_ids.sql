-- Migration: Backfill existing complaints with department_id from routing_info
-- This migration maps complaints to their correct departments based on stored routing information

-- Step 1: Create a temporary table to hold the mapping
CREATE TEMP TABLE dept_mapping AS
SELECT c.id as complaint_id, d.id as department_id
FROM complaints c
LEFT JOIN departments d ON d.code = (c.routing_info->>'departmentCode')
WHERE c.department_id IS NULL 
AND c.routing_info IS NOT NULL
AND (c.routing_info->>'departmentCode') IS NOT NULL;

-- Step 2: Update complaints with the mapped department_id
UPDATE complaints
SET department_id = dept_mapping.department_id
FROM dept_mapping
WHERE complaints.id = dept_mapping.complaint_id
AND complaints.department_id IS NULL;

-- Step 3: Log the results
DO $$
DECLARE
  updated_count INT;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM complaints
  WHERE department_id IS NOT NULL;
  
  RAISE NOTICE 'Backfill complete. Total complaints with department_id: % ', updated_count;
END $$;

-- Step 4: Verify the backfill worked - complaints without department_id after migration
-- This query should return 0 if all complaints were successfully mapped
SELECT COUNT(*) as unmapped_complaints_count
FROM complaints
WHERE department_id IS NULL
AND routing_info IS NOT NULL;

-- Step 5: Show mapping statistics with assigned staff
SELECT 
  d.name as department,
  d.code as dept_code,
  c.reference_id as complaint_id,
  c.title,
  c.status,
  COALESCE(ds.staff_name, 'Unassigned') as assigned_to
FROM complaints c
RIGHT JOIN departments d ON c.department_id = d.id
LEFT JOIN staff_assignments sa ON c.id = sa.complaint_id
LEFT JOIN department_staff ds ON sa.staff_id = ds.id
ORDER BY d.code, c.created_at DESC;
