# RLS Policy Fix - Staff Assignments

## Problem
Your backend was failing to assign complaints with this error:
```
[ERROR] Assign complaint error: new row violates row-level security policy for table "staff_assignments"
```

## Root Causes
1. **Missing `SUPABASE_SERVICE_ROLE_KEY`** in `backend/.env` - The backend falls back to using the anon key, which is subject to RLS policies
2. **Overly restrictive RLS policy** - The policy only allowed department admins, not system admins

## Solution

### Step 1: Update RLS Policies (REQUIRED)
Run this SQL in your Supabase dashboard (SQL Editor):

```sql
-- Copy contents from: supabase/fix_staff_assignment_rls_admin_bypass.sql
-- Paste and execute in Supabase SQL Editor
```

Or paste the contents of [fix_staff_assignment_rls_admin_bypass.sql](./fix_staff_assignment_rls_admin_bypass.sql)

### Step 2: Add Service Role Key (OPTIONAL but RECOMMENDED)
For production and better security, add the service role key:

1. Go to Supabase dashboard → **Settings** → **API**
2. Copy the **Service Role Secret** (the large token starting with `eyJhbGc...`)
3. Paste it into `backend/.env` as:
   ```
   SUPABASE_SERVICE_ROLE_KEY=<paste-secret-here>
   ```
4. Restart the backend server

### Step 3: Verify the Fix
The assignment error should now be resolved. Both:
- System admins (from `user_roles` table with `role='admin'`)
- Department admins (from `department_admins` table)

...can now assign complaints to staff.

## What Changed
- Updated RLS policy to allow **system admins** (not just department admins) to create/read/update/delete staff assignments
- Added optional service role key for even better performance (bypasses RLS at application level)

## Database Details
- **Table**: `staff_assignments`
- **Policies Updated**: INSERT, SELECT, UPDATE, DELETE
- **Affected Checks**: Allows `user_roles.role = 'admin'` in addition to `department_admins` check
