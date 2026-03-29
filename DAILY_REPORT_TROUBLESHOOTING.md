# Daily Report Feature - Troubleshooting Guide

## Quick Checklist (Try These First)

### 1. **Backend Running?**
- [ ] Terminal shows: "Server running on port 3000"
- [ ] If not, run: `cd backend && npm run dev`

### 2. **Logged In as Admin?**
- [ ] Go to http://localhost:5173/admin/login
- [ ] Use credentials: `admin_mc` / `test123`
- [ ] After login, you should see the admin dashboard

### 3. **Check Token Storage**
- [ ] After login, open Browser DevTools (F12)
- [ ] Go to: Application → Local Storage
- [ ] Look for key: `adminToken`
- [ ] If it exists, it should have a long string value (JWT token)
- [ ] **If NOT there** = Login failed silently

### 4. **Check Diagnostic Info**
- [ ] Navigate to Admin Dashboard → Daily Report tab
- [ ] Look at the **Diagnostic Info** panel at the top
- [ ] Check these statuses:
  - "Token from Prop": should say ✓ YES
  - "Token from localStorage": should say ✓ YES
  - "Final Token": should show token preview, not NULL
  - If any show ✗ NO or NULL = token is missing

### 5. **Check Browser Console**
- [ ] Open DevTools (F12) → Console tab
- [ ] Type: `window.dailyReportDebug`
- [ ] Press Enter
- [ ] You should see an object with token info
- [ ] Check if `finalToken` is null or has value

### 6. **Click Generate Report Button**
- [ ] The button should be **BLUE and clickable**
- [ ] If button is **GRAY and disabled** = token is missing/invalid
- [ ] Look at console for debug messages starting with 🔵

### 7. **Check Network Request**
- [ ] Keep DevTools open (F12)
- [ ] Go to Network tab
- [ ] Click "Generate Report" button
- [ ] Look for request to: `api/admin/daily-report`
- [ ] Check its Response Status:
  - `200 OK` = ✓ Success
  - `401 Unauthorized` = ✗ Token invalid (JWT issue)
  - `403 Forbidden` = ✗ Not admin role
  - `500 Error` = ✗ Server error

## If Token is Missing

**Step 1: Check Login**
```
Press F12 → Console tab
Type: localStorage.getItem('adminToken')
If it shows null or undefined → Login failed
```

**Step 2: Retry Login**
- Go back to: http://localhost:5173/admin/login
- Try again with: `admin_mc` / `test123`
- Watch the console for errors

**Step 3: Check Backend Login Endpoint**
```
Open a new terminal in backend directory
Run: node scripts/test-login.js
This tests the backend login directly
```

## If Token Exists but Button Disabled

**This means JWT Secret mismatch issue**

**Solution:**
1. Stop backend: `Ctrl+C` in backend terminal
2. Run: `npm run dev` again (restart picks up env changes)
3. Refresh browser page
4. Try login again

## If Button Works but No Report Data

**Check Response in Network Tab:**
- Click Generate Report
- Go to F12 → Network tab
- Find `daily-report` request
- Click it and check Response tab
- Look for error message

## Report Generation Flow

```
Frontend (You)
    ↓
    [Generate Report Button Click]
    ↓
    [Frontend fetches /api/admin/daily-report with token]
    ↓
Backend verifyToken Middleware (checks JWT signature)
    ↓
Backend verifyAdminRole Middleware (checks user type = 'department_admin')
    ↓
Backend getDailyReport Controller (fetches data from database)
    ↓
Backend adminService (generates report structure)
    ↓
Database (Supabase) [SELECT complaints...]
    ↓
Response with report data
    ↓
Frontend displays report
```

## Common Issues and Fixes

### ❌ "Not authenticated" message stays
**Cause:** Token not in localStorage  
**Fix:** Logout and login again, refresh page

### ❌ Button is gray/disabled
**Cause:** Token variable is null  
**Fix:** Check diagnostic panel, refresh if fresh login

### ❌ Network request shows 401 Unauthorized
**Cause:** JWT secret mismatch (token signature invalid)  
**Fix:** Restart backend with `npm run dev`

### ❌ Network request shows 403 Forbidden
**Cause:** Logged in but not as admin  
**Fix:** Verify you're using admin_mc login, not citizen or staff

### ❌ Network request shows 500 Server Error
**Cause:** Backend error  
**Fix:** Check backend console for error message

## Debug Terminal Commands

**Test admin login:**
```bash
cd backend
node scripts/test-login.js
```

**Test entire daily report flow:**
```bash
cd backend
node scripts/test-daily-report-flow.js
```

## Still Not Working?

1. **Restart everything fresh:**
   - Stop backend: `Ctrl+C`
   - Stop frontend: `Ctrl+C` 
   - Close browser
   - Run backend: `npm run dev`
   - Run frontend: `npm run dev`
   - Open browser: http://localhost:5173

2. **Check .env files:**
   - Backend: `backend/.env` should have `JWT_SECRET=your_jwt_secret_key`
   - Frontend: `frontend/.env` should be not needed (uses default API_BASE_URL)

3. **Share browser console errors:**
   - Open F12 → Console
   - Copy any red error messages
   - Share the error details

## What Was Fixed

**JWT Secret Mismatch Issue:**
- Before: Token signed with one secret, verified with different secret = 401 error
- After: All JWT operations use same centralized secret from config

**Token not accessible in component:**
- Before: Token not reliably passed between components
- After: Better fallback mechanism and diagnostics

**Diagnostic Improvements:**
- Added detailed status panel
- Added window.dailyReportDebug for manual testing
- Better error messages in UI
