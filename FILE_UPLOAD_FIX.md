# File Upload Fix - Documentation

## Problem Identified
File uploads from the staff case details page (`/staff/case/{caseId}`) were failing due to a **database schema mismatch**.

## Root Cause
The `complaint_documents` table was created **without** the `staff_id` column, but the backend code attempts to insert records with this field:

### Database Schema Issue
```sql
-- CURRENT TABLE (missing staff_id)
CREATE TABLE complaint_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
  -- ⚠️ MISSING: staff_id column
);
```

### Backend Code Attempting Insert
```javascript
// In staff.service.js - uploadEvidenceFile()
const docPayload = {
  complaint_id: complaintId,
  document_type: fileType,
  file_name: fileName,
  storage_path: storagePath,
  public_url: publicUrlData.publicUrl,
  staff_id: staffId  // ⚠️ This field doesn't exist in table!
};

await writeClient.from('complaint_documents').insert(docPayload);
```

**Result**: Supabase database rejects the INSERT with an error because the `staff_id` column doesn't exist.

## Solution

### Step 1: Apply Database Migration

**Option A: Using Supabase Dashboard**
1. Go to https://app.supabase.com → Project → SQL Editor
2. Create a new query and paste the content from:
   ```
   supabase/migration_add_staff_id_to_documents.sql
   ```
3. Click "Run"

**Option B: Using Terminal (if migration tools are set up)**
```bash
cd d:\Hackathons\Project_nyaysathi
# Run your migration tool with:
# migration_add_staff_id_to_documents.sql
```

### Step 2: Migration Details
The migration adds:
```sql
ALTER TABLE complaint_documents 
ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_complaint_documents_staff_id 
ON complaint_documents(staff_id);

ALTER TABLE complaint_documents
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
```

**What this does:**
- ✅ Adds `staff_id` column to track which staff member uploaded evidence
- ✅ Creates index for efficient queries by staff member
- ✅ Adds `updated_at` timestamp for better tracking

### Step 3: Verify Fix
After applying the migration:

1. **Restart the backend server:**
   ```bash
   cd d:\Hackathons\Project_nyaysathi\backend
   npm run dev
   ```

2. **Test file upload:**
   - Go to: `http://localhost:5173/staff/case/a1455a9a-611c-4b52-b350-9b2a73032a15`
   - Select a file to upload
   - Click "Upload Evidence"
   - Should now work without errors!

## Files Modified
- ✨ **New:** `supabase/migration_add_staff_id_to_documents.sql` - Database schema migration

## Verification Checklist
- [ ] Migration applied to Supabase database
- [ ] Backend server restarted
- [ ] File upload tested successfully at staff case details page
- [ ] Evidence file appears in complaint documents list
- [ ] No error messages in browser console

## Related Files
- Frontend: `frontend/src/pages/StaffCaseDetails.jsx` (upload form)
- Backend routes: `backend/src/routes/staff.routes.js` (endpoint config)
- Backend controller: `backend/src/controllers/staff.controller.js` (upload handler)
- Backend service: `backend/src/services/staff.service.js` (upload logic)

## Notes
- The frontend form correctly sends the file via FormData
- Backend middleware and routing are properly configured  
- Supabase storage bucket `complaint-documents` is accessible
- The only issue was the missing database column
