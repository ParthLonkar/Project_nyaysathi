# 🚀 Database Migration Guide - Department Management System

## Overview

This guide walks you through applying the new database tables and configurations for the NyaySathi Department Management System.

**Tables being added:**
1. ✅ departments (6 government departments)
2. ✅ department_admins (admin accounts)
3. ✅ department_staff (officers/staff)
4. ✅ staff_assignments (complaint-to-staff mapping)
5. ✅ complaint_notes (staff notes on complaints)
6. ✅ field_visits (field visitation tracking)
7. ✅ department_analytics (dept-level metrics)
8. ✅ staff_performance (individual staff metrics)

---

## 🟢 QUICK SETUP (3 minutes)

### Step 1: Access Your Supabase Dashboard
Go to: **https://app.supabase.com**
1. Click on your project (ID: `grrpsdnwdrkemxlomvij`)
2. Left sidebar → **SQL Editor**
3. Click **+ New Query**

### Step 2: Copy & Paste Migration SQL
1. Open file: `supabase/migrations_department_system.sql`
2. Copy ALL the contents
3. Paste into Supabase SQL Editor
4. Click **Run** button (green button, top-right)

### Step 3: Verify Success
Wait for query to complete. You should see:
- ✅ No errors (some warnings about existing objects are OK)
- Left sidebar → **Table Editor** → Refresh
- Verify all 8 new tables appear in the list

---

## 📊 Database Structure After Migration

### Current Tables (Existing)
```
✅ auth.users (Supabase built-in)
✅ complaints
✅ user_roles  
✅ audit_log
```

### New Tables (Being Added)
```
✅ departments
   ├─ id (UUID, Primary Key)
   ├─ name (VARCHAR 100) - "Municipal Corporation", "Police Department", etc
   ├─ code (VARCHAR 20) - "MC", "PD", etc
   ├─ description, email, phone, address
   ├─ sla_days (INT) - Service level agreement days
   └─ is_active (BOOLEAN)

✅ department_admins
   ├─ id (UUID)
   ├─ user_id (UUID, ref to auth.users)
   ├─ department_id (UUID, ref to departments)
   ├─ admin_name, email, phone, username
   ├─ password_hash, is_active, last_login
   └─ created_at, updated_at

✅ department_staff
   ├─ id (UUID)
   ├─ user_id, department_id, admin_id
   ├─ staff_name, email, phone, username, password_hash
   ├─ position (VARCHAR 100) - "Officer", "Inspector", etc
   ├─ expertise_area, is_active, last_login
   ├─ complaints_assigned, complaints_resolved (INT)
   ├─ average_resolution_days (DECIMAL)
   └─ created_at, updated_at

✅ staff_assignments
   ├─ id (UUID)
   ├─ complaint_id (ref to complaints)
   ├─ staff_id (ref to department_staff)
   ├─ admin_id (ref to department_admins)
   ├─ department_id (ref to departments)
   ├─ assigned_at, status, completed_at
   ├─ assignment_notes
   └─ created_at, updated_at

✅ complaint_notes
   ├─ id (UUID)
   ├─ complaint_id (ref to complaints)
   ├─ staff_id (ref to department_staff)
   ├─ note_text (TEXT)
   ├─ is_internal (BOOLEAN) - visible only to staff/admin or also to citizen
   ├─ attachment_url
   └─ created_at, updated_at

✅ field_visits
   ├─ id (UUID)
   ├─ complaint_id (ref to complaints)
   ├─ staff_id (ref to department_staff)
   ├─ scheduled_date (TIMESTAMP)
   ├─ location, visit_type, status
   ├─ visit_report, photos_url (ARRAY), completed_at
   └─ created_at, updated_at

✅ department_analytics
   ├─ id (UUID)
   ├─ department_id (UUID UNIQUE)
   ├─ total_complaints, complaints_pending, complaints_in_progress
   ├─ complaints_resolved, complaints_rejected
   ├─ average_resolution_days, sla_compliance_rate (%)
   ├─ total_staff, active_staff
   └─ created_at, updated_at

✅ staff_performance
   ├─ id (UUID)
   ├─ staff_id (UUID UNIQUE)
   ├─ total_complaints_handling, total_complaints_resolved
   ├─ average_resolution_time_days, customer_satisfaction_score (0-5)
   ├─ sla_achievement_rate (%), on_time_completion_rate (%)
   ├─ escalations_count
   └─ created_at, updated_at
```

### Updated complaints Table (New Columns)
```
NEW COLUMNS ADDED:
✅ department_id (UUID ref)           - which dept handles this
✅ assigned_admin_id (UUID ref)       - which admin assigned it
✅ assigned_staff_id (UUID ref)       - which staff member works on it
✅ sla_days (INT)                     - days allowed for resolution
✅ submitted_at (TIMESTAMP)           - when citizen submitted
✅ progress_percentage (INT)          - 0-100% progress
✅ sla_breached (BOOLEAN)             - exceeded SLA?
✅ respondent_name (VARCHAR)          - person being complained about
✅ incident_date (DATE)               - when issue occurred
✅ location (VARCHAR)                 - where issue is
✅ routing_info (JSONB)               - routing decision data
```

---

## 🔐 Row Level Security (RLS)

The following RLS policies are automatically created:

| Table | Policy | Access |
|-------|--------|--------|
| departments | Read all, superadmin write | Everyone reads, only superadmin modifies |
| department_admins | Read own or superadmin | Admins see their own, superadmin sees all |
| department_staff | Read own or admin dept | Staff see themselves, admins see dept staff |
| staff_assignments | Read related | Assigned staff, their admin, superadmin |
| complaint_notes | Read related | Assigned staff, complaint citizen, superadmin |
| field_visits | Read related | Assigned staff & supervisors only |

---

## 📝 Sample Data

**6 Departments (automatically inserted):**

```
1. Municipal Corporation (MC)
   - Garbage, street lights, drainage, civic issues
   - SLA: 30 days
   - Email: mc@govt.in

2. Water Supply Department (WSD)
   - Water supply, leakage, contamination
   - SLA: 20 days
   - Email: wsd@govt.in

3. Electricity Board (EB)
   - Power cuts, meter issues, transformer
   - SLA: 15 days
   - Email: eb@govt.in

4. Public Works Department (PWD)
   - Roads, potholes, infrastructure
   - SLA: 25 days
   - Email: pwd@govt.in

5. Police Department (PD)
   - Theft, safety, law enforcement
   - SLA: 7 days
   - Email: pd@govt.in

6. Consumer Affairs (CA)
   - Refunds, fraud, consumer protection
   - SLA: 30 days
   - Email: ca@govt.in
```

---

## ✅ Post-Migration Verification

After running the migration, verify:

### Check Tables Exist
In Supabase Dashboard → **Table Editor** → Verify these tables exist:
- [ ] departments
- [ ] department_admins
- [ ] department_staff
- [ ] staff_assignments
- [ ] complaint_notes
- [ ] field_visits
- [ ] department_analytics
- [ ] staff_performance

### Check Indexes Created
Supabase Dashboard → **Database** → **Indexes** → Look for:
- idx_departments_code
- idx_department_admins_department_id
- idx_department_staff_department_id
- etc.

### Check Sample Data
Run this query in SQL Editor:
```sql
SELECT id, name, code, email FROM departments;
```

Should return 6 rows with the 6 departments.

---

## 🔧 Troubleshooting

### Error: "Table already exists"
✅ This is OK! It means the table was already created. The `IF NOT EXISTS` clause prevents duplicates.

### Error: "Foreign key constraint failed"
❌ This means a referenced table doesn't exist. 
- Solution: Run migration again from the START (order matters)

### Error: "Column already exists"
✅ This is OK! The ALTER TABLE statements use `ADD COLUMN IF NOT EXISTS`

### Departments table is empty
❌ The sample data INSERT may have been skipped.
- Run this manually in SQL Editor:
```sql
INSERT INTO departments (name, code, description, email, phone, sla_days) VALUES
  ('Municipal Corporation', 'MC', 'Garbage, street lights, drainage, civic issues', 'mc@govt.in', '+91-1800-MC-HELP', 30),
  ('Water Supply Department', 'WSD', 'Water supply, leakage, contamination', 'wsd@govt.in', '+91-1800-WS-HELP', 20),
  ('Electricity Board', 'EB', 'Power cuts, meter issues, transformer', 'eb@govt.in', '+91-1800-EB-HELP', 15),
  ('Public Works Department', 'PWD', 'Roads, potholes, infrastructure', 'pwd@govt.in', '+91-1800-PW-HELP', 25),
  ('Police Department', 'PD', 'Theft, safety, enforcement', 'pd@govt.in', '+91-1800-PD-HELP', 7),
  ('Consumer Affairs', 'CA', 'Refunds, fraud, protection', 'ca@govt.in', '+91-1800-CA-HELP', 30)
ON CONFLICT (code) DO NOTHING;
```

---

## 📚 Next Steps

After migration is complete:

1. **Create Backend Services** 
   - department_admin.service.js - Admin dashboard logic
   - department_staff.service.js - Staff assignment logic
   - staff_assignment.controller.js - API endpoints

2. **Create Frontend Pages**
   - /admin-login - Admin/Staff login page
   - /admin-dashboard - Per-department admin dashboard
   - /staff-workspace - Staff complaint handling interface

3. **Update Routing Service**
   - Modify routing.service.js to route complaints to correct department_admin

4. **Create Auth Middleware**
   - Protect routes by role: department_admin, department_staff

---

## 🆘 Need Help?

If migration fails:
1. Check the error message carefully
2. Copy the exact error
3. Try running individual CREATE TABLE statements one at a time
4. Check Supabase docs: https://supabase.com/docs/guides/database

**Manual Table Creation:**
If you want to create tables one-by-one, open `supabase/migrations_department_system.sql` and run sections separately.

---

**Status: Ready for Migration** ✅

Your migration file is ready at: `supabase/migrations_department_system.sql`

Would you like me to guide you through running the migration?
