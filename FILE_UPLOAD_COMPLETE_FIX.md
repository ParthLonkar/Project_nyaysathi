# FILE UPLOAD FIX - Complete Solution

## Problem Summary
File uploads are failing with: **"new row violates row-level security policy"** when staff members try to upload evidence/documents in case details.

## Root Causes
1. **Missing `staff_id` column** in `complaint_documents` table
2. **Restrictive RLS policies** preventing staff from inserting documents
3. **No proper role-based access control** for document operations

## Solution - 3 Steps

### ✅ Step 1: Apply the Database Migration & RLS Fix

**Recommended Method: Supabase Dashboard**

1. Go to: https://app.supabase.com → Select your project
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"** button (top right)
4. Copy the entire contents of this file:
   ```
   supabase/fix_complaint_documents_rls_complete.sql
   ```
5. Paste into the SQL editor
6. Click **"Run"** button (top right corner)
   - ⏱️ Takes ~5-10 seconds
   - You should see: `Query succeeded`

**What this SQL does:**
- ✅ Adds missing `staff_id` column to track uploads
- ✅ Adds `updated_at` timestamp column
- ✅ Creates performance indexes
- ✅ Enables Row Level Security (RLS)
- ✅ Drops old/conflicting RLS policies
- ✅ Creates 4 new RLS policies:
  - **INSERT**: Staff & admins can upload documents
  - **SELECT**: Authorized users can view documents  
  - **UPDATE**: Document owners & admins can edit
  - **DELETE**: Document owners & admins can delete

### ✅ Step 2: Restart the Backend Server

**Terminal Command:**
```bash
cd /Users/kshitijdeshmukh/nyaysathi-ai/backend

# Kill existing server (Ctrl+C if running)
npm run dev
```

### ✅ Step 3: Test the Fix

1. Open the application: http://localhost:5173
2. Log in as a staff member
3. Go to a case details page (any complaint assigned to you)
4. Scroll down to **"Upload Evidence/Document"** section
5. Select a file (PDF, IMAGE, DOC up to 15MB)
6. Click **"Upload Evidence"** button
7. ✅ File should upload successfully!

## Verification Checklist

After applying the fix, verify:
- [ ] SQL migration executed successfully in Supabase dashboard
- [ ] Backend server restarted (`npm run dev`)
- [ ] Logged in as staff member
- [ ] Navigated to case details page
- [ ] Selected and uploaded a test file
- [ ] No error appears; file upload completes
- [ ] File appears in "Evidence Documents" section below

## Troubleshooting

### Still Getting RLS Error?
**Solution**: Make sure you're using the correct user role
- Log in as a **staff member** (not citizen)
- Verify you're assigned to that complaint
- Or log in as **admin** user

### "File upload failed" but not RLS?
**Possible causes:**
- Service role key not configured (but it should be - check `backend/.env`)
- Backend server not restarted after migration
- Try uploading again after 5-second wait

### File uploads to storage but not database?
**Check backend logs** for: `Create document record error:`
- This means migration wasn't fully applied
- Re-run the SQL from Step 1

## Files Modified
- ✨ **New**: `supabase/fix_complaint_documents_rls_complete.sql`
- 📝 **For Reference**: `backend/.env` (service role key already configured ✅)

## Related Documentation
- [RLS Policy Fix Guide](RLS_POLICY_FIX.md) - Previous staff assignment fixes
- [Database Architecture](docs/DATABASE_ARCHITECTURE.md)
- [Supabase Docs](https://supabase.com/docs/guides/auth/row-level-security)

## Questions?
Check these files for more context:
- `backend/src/services/staff.service.js` - uploadEvidenceFile() function
- `supabase/schema.sql` - Database schema
