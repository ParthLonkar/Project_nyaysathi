# RLS Policy Fix - Staff Assignments Complete Guide

## Problem
Your backend is failing to assign complaints with these errors:
```
[ERROR] Assign complaint error: new row violates row-level security policy for table "staff_assignments"
```

Or when running migrations:
```
ERROR: 42P01: relation "user_roles" does not exist
```

## Root Causes
1. **Incomplete database setup** - Some required tables or migrations may not have been applied
2. **Overly restrictive RLS policies** - Policies blocking legitimate admin operations
3. **Missing service role key** - Backend uses anon key and hits RLS restrictions

## Solution - Choose Your Path

### Step 0: Diagnostic Check (REQUIRED FIRST)
Run this in your Supabase SQL Editor to see what tables exist:

```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**Check for these tables:**
- ✅ `complaints` - Core complaints
- ✅ `department_admins` - Admin accounts
- ✅ `department_staff` - Staff members  
- ✅ `staff_assignments` - Complaint-to-staff assignments
- ❓ `user_roles` - May or may not exist

---

### Step 1: Choose and Run the Right Migration

#### 🟢 Scenario A: You have BOTH department admins AND system admins in `user_roles`
**Use this if:** You use the global `user_roles` table for admins

File to run: **supabase/fix_staff_assignment_rls_admin_bypass.sql**

This creates user_roles table if missing and allows both types of admins.

#### 🟡 Scenario B: You ONLY have department admins  
**Use this if:** You don't use `user_roles` table

File to run: **supabase/fix_staff_assignment_rls_simple.sql**

This is simpler, faster, and doesn't reference user_roles.

#### 🔵 Scenario C: First time setup - Run all migrations in order
```
1. supabase/schema.sql
2. supabase/migrations_department_system.sql
3. supabase/fix_staff_assignment_rls_simple.sql  (or admin_bypass if you need system admins)
4. supabase/seed.sql (if you want sample data)
```

**To run a migration:**
1. Open Supabase → SQL Editor
2. Copy entire contents of the .sql file
3. Paste into editor
4. Click **RUN**
5. You should see: `Success. No rows returned.`

---

### Step 2: Restart Backend
```bash
cd backend
npm start
# or: node src/server.js
```

---

### Step 3: Test the Fix
Try assigning a complaint to staff. The RLS error should be gone.

---

### Step 4 (Optional): Add Service Role Key for Better Performance

**Why:** Backend bypasses RLS entirely, much faster and more reliable.

**How:**
1. Go to Supabase dashboard → **Settings** → **API**
2. Copy **Service Role Secret** (the token under "Service role secret", NOT an anon key)
3. Update `backend/.env`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```
4. Restart: `npm start`

---

## Migration File Comparison

| Aspect | admin_bypass | simple |
|--------|-------------|--------|
| Use case | Multiple admin types | Department admins only |
| Requires user_roles | ✅ Yes (creates if missing) | ❌ No |
| Simpler to understand | ❌ No | ✅ Yes |
| Production ready | ✅ Yes | ✅ Yes |
| File: | fix_staff_assignment_rls_admin_bypass.sql | fix_staff_assignment_rls_simple.sql |

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| `relation "user_roles" does not exist` | Use simple.sql instead, OR run admin_bypass.sql (creates table) |
| Still getting RLS errors | Restart backend, check admin is in correct table (department_admins or user_roles) |
| Can't see which migration to use | Run the diagnostic in Step 0 to see which tables you have |
| Service role key questions | See Step 4 - it's in Supabase Settings > API |

---

## File Locations
- Simple fix: [`fix_staff_assignment_rls_simple.sql`](./fix_staff_assignment_rls_simple.sql)
- Full fix: [`fix_staff_assignment_rls_admin_bypass.sql`](./fix_staff_assignment_rls_admin_bypass.sql)
- Diagnostic: [`CHECK_TABLES.sql`](./CHECK_TABLES.sql)
