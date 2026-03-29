# Staff Complaint Details - Complete Setup Guide

## 🔴 Root Cause of "Failed to load complaint details"

The API returns **400 Bad Request** because:
1. ✅ Staff is authenticated (token is valid)
2. ❌ **Staff has NO complaints assigned**
3. When staff tries to view a complaint they're not assigned to, database returns no matching `staff_assignments` record
4. API returns 400: "Complaint not found or you are not assigned to it"

## ✅ Solution: Complete Setup Steps

### Step 1: Ensure Backend is Running
```bash
cd /Users/kshitijdeshmukh/nyaysathi-ai/backend
npm run dev
# Wait for: "Server running on port 3000"
```

### Step 2: Create Admin Account (if needed)
```bash
# Admin login: admin_mc / test123
# OR create new admin through: http://localhost:5173/admin/login
```

### Step 3: Create Complaints in Admin Panel
```
1. Go to: http://localhost:5173/admin/login
2. Login with: admin_mc / test123
3. Go to: Complaints section
4. Create at least 3-5 test complaints
5. Fill in title, description, category, priority
6. Save/Submit complaints
```

### Step 4: Create Staff Account (one-time)
Already done with seed script, but verify staff exists:
```bash
cd backend
node scripts/test-staff-auth.js
# Should output: ✅ Staff login successful
```

If not, create manually:
```sql
-- Run in Supabase SQL editor:
INSERT INTO department_staff (
  department_id,
  admin_id,
  staff_name,
  email,
  phone,
  username,
  password_hash,
  is_active
)
VALUES (
  (SELECT id FROM departments LIMIT 1),
  (SELECT id FROM department_admins WHERE username = 'admin_mc' LIMIT 1),
  'Test Staff',
  'staff@test.local',
  '9876543210',
  'staff',
  '$2b$10$G4VwB8AEwtjdxviJFlGP1OkID.Yy/nP9f4Cohx.6R7dc5ZU/Qjo0q',  -- password: test123
  true
) ON CONFLICT DO NOTHING;
```

### Step 5: Assign Complaints to Staff (CRITICAL!)
```bash
cd backend
node scripts/seed-staff-assignments.js
```

This script will:
- ✅ Find the staff account
- ✅ Find all available complaints
- ✅ Create `staff_assignments` linking staff to complaints
- ✅ Show confirmation that assignments were created

**Output should show:**
```
✅ Found staff: staff ID: [uuid]
✅ Found 5 complaints
📝 Creating staff assignments...
✅ Created 5 assignments:
  1. Assignment ID: [uuid]
     Staff: staff
     Complaint: [Reference ID] - [Title]
     Status: active
```

### Step 6: Test Staff Login
```
1. Go to: http://localhost:5173/staff/login
2. Username: staff
3. Password: test123
4. Click Login
```

**Should see:**
- ✅ Staff Workspace dashboard loads
- ✅ Numbers appear in "Active Cases", "In Motion", "Resolved"
- ✅ No error messages

### Step 7: View Complaint Details
```
1. In Staff Workspace, look for: "Recent Assignments" section
2. Click on any complaint
3. Should load complaint details page
4. Should show: title, description, status, priority
5. Should have options to: update status, add notes, upload files
```

## Workflow Summary

```
Admin Creates Complaints
         ↓
Staff Assigned to Complaints (via seed script)
         ↓
Staff Logs In
         ↓
Sees List of Assigned Complaints
         ↓
Clicks to View Details
         ↓
Can Update Status, Add Notes, Upload Evidence
```

## Database Schema Check (Optional Verification)

To verify assignments are created:
```sql
-- Run in Supabase SQL editor:
SELECT 
  sa.id,
  sa.staff_id,
  sa.complaint_id,
  sa.status,
  ds.username,
  c.reference_id,
  c.title
FROM staff_assignments sa
JOIN department_staff ds ON sa.staff_id = ds.id
JOIN complaints c ON sa.complaint_id = c.id
LIMIT 10;
```

Should show multiple rows with:
- staff_id matching staff account
- complaint_id for each complaint
- status: 'active'

## If Still Getting Errors

### Error: "Complaint not found or you are not assigned to it"
- [ ] Run: `node scripts/seed-staff-assignments.js` again
- [ ] Check Supabase query above to verify assignments exist
- [ ] Make sure you logged in as the correct staff (staff / test123)

### Error: "Authentication required"
- [ ] Token not saved after login
- [ ] Check: F12 → Application → Local Storage → staffToken
- [ ] If missing: try login again

### Error: "Invalid complaint ID"
- [ ] Complaint ID might be malformed
- [ ] Check URL: Should be like `/staff/case/[valid-uuid]`
- [ ] Create a new complaint and try with fresh assignment

### Error: Staff has "0" in Active Cases card
- [ ] Assignments weren't created
- [ ] Run: `node scripts/seed-staff-assignments.js`
- [ ] Refresh browser after

## Improvements Made

✅ Enhanced error messages in StaffCaseDetails  
✅ Better console logging for debugging  
✅ Created seed script for assignments  
✅ Clear status codes (401, 400, 404) with messages  
✅ Improved error handling in fetch

## Testing Manually (Advanced)

```bash
# Get staff token
STAFF_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/staff/login \
  -H "Content-Type: application/json" \
  -d '{"username":"staff","password":"test123"}' | jq -r '.token')

# Get complaint ID from database
COMPLAINT_ID=$(curl -s -H "Authorization: Bearer $STAFF_TOKEN" \
  http://localhost:3000/api/staff/complaints | jq -r '.complaints[0].complaint_id')

echo "Token: $STAFF_TOKEN"
echo "Complaint ID: $COMPLAINT_ID"

# Try to fetch complaint details
curl -H "Authorization: Bearer $STAFF_TOKEN" \
  http://localhost:3000/api/staff/complaints/$COMPLAINT_ID | jq .
```

Should return complaint details, not 400 error.

## Next Actions

**Run these commands in order:**

```bash
# 1. Ensure backend is running
cd backend && npm run dev

# 2. Test staff authentication
node scripts/test-staff-auth.js

# 3. Create staff assignments
node scripts/seed-staff-assignments.js

# 4. Open browser and test
# Go to: http://localhost:5173/staff/login
# Login: staff / test123
# View complaints
```

**That's it!** The staff should now be able to load complaint details. ✅
