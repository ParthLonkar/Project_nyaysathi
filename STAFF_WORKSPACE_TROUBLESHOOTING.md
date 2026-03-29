# Staff Workspace - Troubleshooting Guide

## Quick Diagnosis Checklist

### 1. **Can you see the Staff Workspace?**
- [ ] URL shows: http://localhost:5173/staff/workspace
- [ ] You see the staff dashboard with "Welcome back" message
- If not, you might not be logged in. Go to: http://localhost:5173/staff/login

### 2. **Are you logged in as staff?**
```javascript
// Open browser console (F12) and type:
localStorage.getItem('staffToken')
// If this shows NULL or undefined → You're not logged in
```

### 3. **Does the login work?**
- [ ] Go to: http://localhost:5173/staff/login
- [ ] Use credentials: `staff` / `test123`
- [ ] Click Login
- [ ] Should redirect to: http://localhost:5173/staff/workspace

If login fails:
- [ ] Check browser console for errors (F12 → Console)
- [ ] Look for red error messages
- [ ] Check Network tab (F12 → Network) for failed requests

### 4. **Can complaints load?**
- [ ] After logging in, you should see numbers in the dashboard cards
- [ ] "Active Cases" should show a count
- [ ] If showing error message: read it carefully
- [ ] See "Staff Data Loading Issues" section below

## Step-by-Step Login Process

### Backend Setup
```bash
cd /Users/kshitijdeshmukh/nyaysathi-ai/backend
npm run dev
# Wait for: "Server running on port 3000"
```

### Frontend Setup
```bash
cd /Users/kshitijdeshmukh/nyaysathi-ai/frontend
npm run dev
# Should show: "Local: http://localhost:5173"
```

### Staff Login Flow
1. Go to: http://localhost:5173/staff/login
2. Enter: 
   - Username: `staff`
   - Password: `test123`
3. Click "Login"
4. Should see: Staff Workspace with dashboard
5. Should see numbers in cards (Active Cases, In Motion, Resolved)

## Common Issues & Solutions

### ❌ Issue: Login button doesn't work
**What to check:**
- [ ] Is backend running? (See "Backend Setup" above)
- [ ] Is frontend running? (See "Frontend Setup" above)
- [ ] Are port 3000 and 5173 accessible?

**Solution:**
```bash
# Kill existing processes
# Backend:
lsof -i :3000 | grep node | awk '{print $2}' | xargs kill -9

# Frontend:
lsof -i :5173 | grep node | awk '{print $2}' | xargs kill -9

# Restart both
cd backend && npm run dev
cd frontend && npm run dev
```

### ❌ Issue: "Failed to load resource: 401 Unauthorized" on login

**Cause:** Staff account doesn't exist or credentials are wrong

**Solution:**
1. Verify staff account exists:
```bash
cd backend
node scripts/test-staff-auth.js
```

2. If test script fails with "Invalid username or password":
   - Staff account might not be in database
   - Run this SQL in Supabase to create it:
   ```sql
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
     (SELECT id FROM department_admins LIMIT 1),
     'Test Staff',
     'staff@test.local',
     '8888888890',
     'staff',
     '$2b$10$G4VwB8AEwtjdxviJFlGP1OkID.Yy/nP9f4Cohx.6R7dc5ZU/Qjo0q',  -- password: test123
     true
   );
   ```

### ❌ Issue: Login works but data doesn't load (error message shown)

**Error:** "Failed to load complaints"

**Check 1: Token is saved**
```javascript
// In browser console (F12):
localStorage.getItem('staffToken')
// Should show a long string, not null
```

**Check 2: API is responding**
```bash
# In a terminal, test the API directly:
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3000/api/staff/complaints

# If getting 401 Unauthorized: JWT secret mismatch
# If getting 400 Bad Request: Missing complaints
```

**Check 3: Backend logs**
- Look at the backend terminal where `npm run dev` is running
- Should see incoming requests and responses
- Look for error messages

### ❌ Issue: Routing error "No routes matched location '/staff/profile'"

**Cause:** Buttons were trying to navigate to non-existent route

**Status:** ✅ FIXED - Updated buttons to navigate to existing routes

## Data Not Loading Issues

### Error: "Staff token not found"
- [ ] Staff token not saved after login
- [ ] Solution: Log out and log in again
- [ ] If still fails: Check if staff credentials are correct

### Error: "Failed to load complaints (401)"
- [ ] Token is invalid or expired
- [ ] JWT secret mismatch (sign vs verify)
- [ ] Solution: Restart backend, log in again

### Error: "Failed to load complaints (400)"  
- [ ] Staff might not be assigned to any complaints
- [ ] Complaints might not exist in database
- [ ] Solution: This is normal if no complaints are assigned
- [ ] Try creating/assigning complaints through admin panel

### Error: "Failed to load complaints (500)"
- [ ] Backend server error
- [ ] Check backend logs in terminal
- [ ] Solution: Look for error message in backend terminal

## Test Scripts

### Test Staff Authentication
```bash
cd backend
node scripts/test-staff-auth.js
```

Output should show:
- ✅ Staff login successful
- ✅ Token verified
- ✅ Complaints fetched (if any assigned)

### Test Backend Directly

```bash
# Get a valid token first
STAFF_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/staff/login \
  -H "Content-Type: application/json" \
  -d '{"username":"staff","password":"test123"}' | jq -r '.token')

echo "Token: $STAFF_TOKEN"

# Test complaints endpoint
curl -H "Authorization: Bearer $STAFF_TOKEN" \
  http://localhost:3000/api/staff/complaints | jq .

# Test dashboard endpoint
curl -H "Authorization: Bearer $STAFF_TOKEN" \
  http://localhost:3000/api/staff/dashboard | jq .
```

## Debugging in Browser

### View Token Information
```javascript
// In browser console (F12):
const token = localStorage.getItem('staffToken');
console.log('Token:', token);

// Decode JWT (note: this is clientside only for debugging!)
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('Token payload:', payload);
```

### Monitor Network Requests
1. Open DevTools: F12
2. Click: Network tab
3. Perform action (login, load data)
4. Look for failed requests (red)
5. Click on request to see:
   - Status code
   - Request headers
   - Response body/error

### Check Local Storage
1. Open DevTools: F12
2. Click: Application tab
3. Click: Local Storage
4. Click: http://localhost:5173
5. Look for:
   - `staffToken` - should have JWT
   - `staffUser` - should have staff info

## What Each Error Means

| Status | Meaning | Solution |
|--------|---------|----------|
| 401 | Unauthorized | Check token, re-login |
| 400 | Bad Request | Check parameters/URL |
| 403 | Forbidden | Check permissions/role |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Check backend logs |

## Performance Info

- Login should be instant
- Loading complaints should take < 1 second
- If taking longer: backend might be slow or database is slow

## Still Having Issues?

1. **Restart everything:**
   ```bash
   # Kill backend (Ctrl+C)
   # Kill frontend (Ctrl+C)
   # Start backend: npm run dev
   # Start frontend: npm run dev
   # Refresh browser: Cmd+Shift+R or Ctrl+Shift+F5
   ```

2. **Check environment:**
   ```bash
   # Backend .env should have:
   cat /Users/kshitijdeshmukh/nyaysathi-ai/backend/.env | grep JWT_SECRET
   # Should show: JWT_SECRET=your_jwt_secret_key
   ```

3. **Check database:**
   - Is Supabase running?
   - Can you access: https://app.supabase.com
   - Can you view tables?

4. **Share details for help:**
   - Console errors (F12 → Console)
   - Network failures (F12 → Network)
   - Backend logs (terminal output)
   - Screenshots of error messages

## Recent Fixes Applied

✅ Fixed navigation buttons that pointed to non-existent `/staff/profile` route  
✅ Improved error handling in complaint loading  
✅ Added error display in UI  
✅ Added Retry button for failed data loads  
✅ Improved JWT secret consistency  
✅ Added test script for staff authentication  
