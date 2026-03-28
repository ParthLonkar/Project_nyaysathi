# 🚀 Database Setup Instructions

The migrations have NOT been applied to your Supabase database yet. Follow these steps:

## Option 1: Via Supabase Dashboard (Easiest)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (in the left sidebar)
4. Click **New Query**
5. Copy the contents of `supabase/migrations_department_system.sql` from this project
6. Paste it into the SQL Editor
7. Click **Run** button

This will create all 8 tables and seed the departments data.

## Option 2: Via Supabase CLI

```bash
cd /Users/kshitijdeshmukh/nyaysathi-ai
supabase db push
```

(Requires Supabase CLI installed and authenticated)

## After Migrations Are Applied

Once the migrations are complete, run this to create test accounts:

```bash
cd /Users/kshitijdeshmukh/nyaysathi-ai/backend
node scripts/setup-test-data.js
```

This will create:
- Admin account: `admin_mc` / `test123`
- Staff account: `staff_mc_001` / `test123`

## Verify Setup

1. Your backend server should be running on http://localhost:3000
2. Frontend should be running on http://localhost:5173
3. Try logging in at http://localhost:5173/login

---

**Need help?** Check the migration file at: `supabase/migrations_department_system.sql`
