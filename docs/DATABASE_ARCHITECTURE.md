# 📊 Complete Database Architecture

## Current vs. New Structure

### BEFORE (Current - 50% Complete)
```
Citizen Side Only:
├── auth.users (Supabase)
├── complaints
├── user_roles
└── audit_log

❌ Missing: Department system, Staff management, Admin workflows
```

### AFTER (With Department System - 100% Complete)
```
Citizen & Government Complete System:

auth.users (Supabase)
├── Citizen users
├── Department Admin users
└── Department Staff users
   ├─ user_roles (roles: citizen, dept_admin, dept_staff)

GOVERNMENT SIDE:
├── departments (6 depts: MC, WSD, EB, PWD, PD, CA)
│  ├─ department_admins (admin for each dept)
│  │  ├─ department_staff (officers/workers)
│  │  │  ├─ staff_assignments (complaint → staff mapping)
│  │  │  ├─ complaint_notes (staff notes)
│  │  │  ├─ field_visits (field inspections)
│  │  │  └─ staff_performance (metrics)
│  │  └─ department_analytics (dept metrics)
│  
CITIZEN SIDE:
├── complaints (now with dept_id, staff_id)
└── audit_log
```

---

## Data Flow Visualization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CITIZEN SUBMITS COMPLAINT                                │
└─────────────────┬───────────────────────────────────────────────────────────┘
                  │
                  ▼
    ┌──────────────────────────────┐
    │  1. AI Brief Analysis         │
    │  2. Auto-routing              │
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────────────────────────────────┐
    │  3. Route to Department Admin                             │
    │     (e.g., Complaint about water → Water Supply Dept)    │
    └──────────┬───────────────────────────────────────────────┘
               │
               ▼
    ┌──────────────────────────────────────────────────────────┐
    │  4. Admin Dashboard                                        │
    │  - Views all complaints for their department              │
    │  - Selects from dropdown: staff_assignments.staff_id      │
    │  - Manually assigns to Officer/Inspector                 │
    └──────────┬───────────────────────────────────────────────┘
               │
               ▼
    ┌──────────────────────────────────────────────────────────┐
    │  5. Staff Workspace                                       │
    │     Officer "Ajay Singh" gets assigned complaint          │
    │     - View: complaint_notes (all staff notes)             │
    │     - Add: Internal notes (is_internal = true)            │
    │     - Upload: Evidence (photos, documents)                │
    │     - Schedule: field_visits (site inspection)            │
    │     - Update: complaint status                            │
    │     - Generate: Official response letters                 │
    └──────────┬───────────────────────────────────────────────┘
               │
               ▼
    ┌──────────────────────────────────────────────────────────┐
    │  6. Resolution & Closure                                   │
    │  - Mark status as RESOLVED                                │
    │  - Admin generates staff_performance metrics              │
    │  - Department analytics updated                           │
    │  - Citizen notified with resolution letter                │
    └──────────────────────────────────────────────────────────┘
```

---

## Table Relationships (Entity-Relationship Diagram)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ auth.users (Supabase)                                                     │
│ ├─ id (PK)                                                                │
│ ├─ email                                                                  │
│ └─ role (citizen | dept_admin | dept_staff)                              │
└───────┬────────────────────────────────────────────────────────────────┬──┘
        │                                                                 │
        │ (1:1)                                                           │ (1:1)
        │                                                                 │
        ▼                                                                 ▼
┌──────────────────────────┐                         ┌──────────────────────────┐
│ user_roles               │                         │ citizens (via complaints) │
├─ id (PK)                 │                         └──────────────────────────┘
├─ user_id (FK,UNIQUE)     │
└─ role                    │
                           │
        ┌───────────────────┴────────────────────────────────────────┐
        │                                                             │
        ▼                                                             ▼
┌──────────────────────────────┐                    ┌──────────────────────────┐
│ department_admins            │                    │ complaints               │
├─ id (PK)                      │                    ├─ id (PK)                │
├─ user_id (FK)                 │                    ├─ user_id (FK)           │
├─ department_id (FK) ──┐       │                    ├─ department_id (FK) ────┼──┐
├─ admin_name           │       │                    ├─ assigned_admin_id (FK)─┼──├──┐
├─ username (UNIQUE)    │       │                    ├─ assigned_staff_id (FK) │  │  │
└─ password_hash        │       │                    ├─ title, description     │  │  │
                        │       │                    ├─ status, priority       │  │  │
    ┌───────────────────┘       │                    ├─ routing_info (JSONB)   │  │  │
    │                           │                    ├─ sla_days, submitted_at │  │  │
    ▼                           │                    └───────┬──────────────────┘  │  │
┌──────────────────┐            │                           │                     │  │
│ departments      │            │                           │                     │  │
├─ id (PK)         │            │                           │                     │  │
├─ name (UNIQUE)   │            │                           │                     │  │
├─ code (UNIQUE)   │            │         ┌────────────────┘                     │  │
├─ sla_days        │ ───────────┘         │                                      │  │
│ (6 departments) │                       │                                      │  │
└──────┬───────────┘                       │                                      │  │
       │                                   │                                      │  │
       │ (1:M)                             ▼                                      │  │
       │                      ┌────────────────────────────┐                      │  │
       │                      │ staff_assignments          │                      │  │
       │                      ├─ id (PK)                  │                      │  │
       │                      ├─ complaint_id (FK)────────┼──────────────────────┘  │
       │                      ├─ staff_id (FK)────────────┼──────────┐              │
       │                      ├─ admin_id (FK)────────────┼──────────┼──────────────┤
       │                      ├─ department_id (FK)──────┬┘          │              │
       │                      ├─ status, assigned_at      │          │              │
       │                      └──────────────────────────┘           │              │
       │                                                             │              │
       ▼ (1:M)                                                       ▼              │
┌──────────────────────────────┐                         ┌──────────────────────┐  │
│ department_staff             │                         │ (FK connections)     │  │
├─ id (PK)                      │                         │                      │  │
├─ user_id (FK)                 │                         │ assigned_staff_id ───┼──┘
├─ department_id (FK)           │                         │ assigned_admin_id ───┼────┘
├─ admin_id (FK) ───────────────┼─────────────────────┬──┤                      │
├─ staff_name                   │                     │  └──────────────────────┘
├─ position, expertise_area     │                     │
├─ complaints_assigned (INT)    │                     │
├─ average_resolution_days      │                     │
└───────────┬──────────────────┘                      │
            │ (1:M)                                   │
            │                                         │
            ├─────────┬─────────────────┬─────────────┘
            │         │                 │
            ▼         ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐
    │complaint     │  │field_visits  │  │staff_performance│
    │_notes        │  │              │  │                 │
    ├──────────────┤  ├──────────────┤  ├─────────────────┤
    │id (PK)       │  │id (PK)       │  │id (PK)          │
    │complaint_id  │  │complaint_id  │  │staff_id (FK,UK) │
    │staff_id (FK) │  │staff_id (FK) │  │total_complaints │
    │note_text     │  │scheduled_date│  │avg_time, score  │
    │attachment_url│  │visit_report  │  │sla_rate (%)     │
    └──────────────┘  └──────────────┘  └─────────────────┘

    ┌────────────────────────────────────────┐
    │ department_analytics (1 per dept)      │
    ├────────────────────────────────────────┤
    │ id (PK)                                │
    │ department_id (FK, UNIQUE)             │
    │ total_complaints, pending, in_progress │
    │ avg_resolution_days, sla_compliance    │
    │ total_staff, active_staff              │
    └────────────────────────────────────────┘
```

---

## Complete Data Model

### 6 DEPARTMENTS (Sample Data Inserted)
```
Municipal Corporation (MC)
  - 1 admin
    - 5-10 staff members
      - Each staff gets assigned complaints
      - Each tracks 2-5 assigned complaints

Water Supply Department (WSD)
  - 1 admin
    - 3-8 staff
      
Electricity Board (EB)
  - 1 admin
    - 3-8 staff

Public Works Department (PWD)
  - 1 admin
    - 5-10 staff

Police Department (PD)
  - 1 admin
    - 5-15 staff

Consumer Affairs (CA)
  - 1 admin
    - 3-8 staff
```

### Data Relationships Summary
```
1 Department
  ├─ has 1 Admin (department_admins)
  │  └─ has N Staff (department_staff)
  │     └─ each Staff is assigned M Complaints via staff_assignments
  │        └─ each Assignment tracks:
  │           ├─ complaint_notes (N notes per assignment)
  │           ├─ field_visits (M visits per assignment)
  │           └─ staff_performance (1 record per staff)
  └─ has 1 Analytics Record (department_analytics)

1 Complaint
  ├─ belongs to 1 Department
  ├─ can be assigned to 1 Admin
  └─ can be assigned to 1 Staff via staff_assignments
```

---

## Authentication Roles & Permissions

### CITIZEN (citizen)
```
✅ Can: Create complaint, View own complaint, Track status
❌ Cannot: See other complaints, Assign staff, See internal notes
```

### DEPARTMENT ADMIN (dept_admin)
```
✅ Can:
  - View all complaints for their department
  - Assign complaints to staff (staff_assignments)
  - Manage staff (hire, deactivate, performance tracking)
  - View department analytics
  - See all notes (internal + external)
  - Reassign staff if needed
  
❌ Cannot:
  - View other departments' complaints
  - Override system decisions
  - Delete complaints (archive only)
```

### DEPARTMENT STAFF (dept_staff)
```
✅ Can:
  - View assigned complaints only
  - Add internal notes
  - Upload documents/evidence
  - Schedule field visits
  - Update status to next stage
  - Generate response letters
  
❌ Cannot:
  - Assign themselves to complaints (admin does)
  - Delete comments/notes
  - View other staff's assignments
  - Access admin functions
```

### SUPERADMIN (superadmin) - *Optional, for Supabase config*
```
✅ Can:
  - Do everything
  - Configure departments
  - Manage admins
  - View all analytics
  - System configuration
```

---

## Indexes for Performance

```
Indexes Created:
✅ idx_departments_code              → Fast dept lookup by code
✅ idx_department_admins_department_id 
✅ idx_department_staff_department_id
✅ idx_department_staff_admin_id
✅ idx_department_staff_user_id
✅ idx_staff_assignments_complaint_id → Fast lookup for a complaint
✅ idx_staff_assignments_staff_id     → Fast lookup for a staff member
✅ idx_staff_assignments_status       → Filter by assignment status
✅ idx_complaint_notes_complaint_id   → Fast notes retrieval
✅ idx_complaint_notes_staff_id
✅ idx_field_visits_complaint_id
✅ idx_field_visits_staff_id
✅ idx_field_visits_status
✅ idx_complaints_department_id
✅ idx_complaints_assigned_staff_id
```

---

## Row Level Security (RLS) - Access Control

```
departments table
├─ SELECT: Everyone (public data)
└─ INSERT/UPDATE: Only superadmin

department_admins table
├─ SELECT: Self or superadmin
├─ INSERT: Only superadmin
└─ UPDATE: Self or superadmin

department_staff table
├─ SELECT: Self, their admin, or superadmin
├─ INSERT: Admin their department or superadmin
└─ UPDATE: Self or their admin

staff_assignments table
├─ SELECT: Assigned staff, their admin, superadmin
├─ INSERT: Admin of department
└─ UPDATE: Admin or assigned staff

complaint_notes table
├─ SELECT: Complaint owner, assigned staff, dept admin, superadmin
├─ INSERT: Assigned staff only
└─ UPDATE: Only if internal note (by staff/admin)

complaints table (Updated)
├─ SELECT: 
│  ├─ Citizens see own complaints
│  ├─ Dept admin sees their dept complaints
│  └─ Dept staff sees assigned complaints
├─ INSERT: Citizens only
└─ UPDATE: Citizen (own), staff (assigned), admin (any)
```

---

## Query Examples

### Get Complaints for a Department
```sql
SELECT c.id, c.title, c.status, s.staff_name
FROM complaints c
LEFT JOIN staff_assignments sa ON c.id = sa.complaint_id
LEFT JOIN department_staff s ON sa.staff_id = s.id
WHERE c.department_id = $1
ORDER BY c.submitted_at DESC;
```

### Get Staff Performance
```sql
SELECT s.staff_name, p.total_complaints_resolved, 
       p.average_resolution_time_days, p.customer_satisfaction_score
FROM department_staff s
JOIN staff_performance p ON s.id = p.staff_id
WHERE s.department_id = $1
ORDER BY p.customer_satisfaction_score DESC;
```

### Get Unresolved Complaints
```sql
SELECT c.*, s.staff_name, d.name as dept_name
FROM complaints c
LEFT JOIN department_staff s ON c.assigned_staff_id = s.id
LEFT JOIN departments d ON c.department_id = d.id
WHERE c.status IN ('assigned', 'in_progress', 'in_review')
AND c.sla_breached = false
ORDER BY c.submitted_at ASC;
```

---

## Next Phase: Backend Services

```
After migration, we'll create:

1. auth.service.js
   - Admin login (username/password)
   - Staff login
   - Role-based token generation

2. department_admin.service.js
   - List department complaints
   - Assign to staff
   - View analytics
   - Manage staff

3. department_staff.service.js
   - Get assigned complaints
   - Update status
   - Add notes
   - Upload documents
   - Schedule field visits

4. staff_assignment.controller.js
   - API: POST /admin/assign (admin assigns complaint)
   - API: GET /staff/assigned (get assigned complaints)
   - API: PUT /staff/{id}/update (update status)
   - API: POST /complaint/{id}/notes (add notes)
```

---

## Status: Database Architecture READY ✅

**Location:** `/Users/kshitijdeshmukh/nyaysathi-ai/supabase/migrations_department_system.sql`

**Next:** Apply migration via Supabase Dashboard

**Estimated Migration Time:** 2-3 minutes ⏱️
