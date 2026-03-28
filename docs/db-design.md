# NyaySathi Database Design

## Database Schema

### Tables

#### `complaints`
Main table for storing legal complaints.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to auth.users |
| `title` | TEXT | Complaint title |
| `description` | TEXT | Detailed complaint |
| `category` | VARCHAR(50) | Complaint category |
| `status` | VARCHAR(50) | new, processing, escalated, resolved |
| `priority` | VARCHAR(50) | low, medium, high, critical |
| `ai_analysis` | JSONB | AI analysis results |
| `draft_document` | TEXT | Generated legal document |
| `attachment_url` | TEXT | URL to uploaded attachment |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |
| `escalated_at` | TIMESTAMP | Escalation timestamp (nullable) |
| `resolved_at` | TIMESTAMP | Resolution timestamp (nullable) |

**Indexes**:
- `idx_complaints_user_id` - For user queries
- `idx_complaints_status` - For filtering by status
- `idx_complaints_created_at` - For sorting by date

#### `user_roles`
User role management for authorization.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to auth.users (unique) |
| `role` | VARCHAR(50) | Role: user, admin, moderator |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

#### `audit_log`
Audit trail for compliance and security.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to auth.users |
| `action` | VARCHAR(100) | Action performed |
| `table_name` | VARCHAR(100) | Table affected |
| `record_id` | UUID | Record ID affected |
| `changes` | JSONB | Changes made |
| `created_at` | TIMESTAMP | Timestamp |

**Indexes**:
- `idx_audit_log_user_id` - For user audit queries
- `idx_audit_log_created_at` - For sorting by date

## Row-Level Security (RLS)

### Policies

#### `complaints` table
- Users can **read** only their own complaints or admin can read all
- Users can **insert** only their own complaints
- Users can **update** their own complaints or admins can update any
- Admins can **delete** any complaint

#### `user_roles` table
- Users can read their own role or admins can read all
- Admins manage role assignments

#### `audit_log` table
- Users can read their own audit entries or admins can read all

## Data Relationships

```
auth.users (Supabase)
    ↓ (1:1)
user_roles
    ↓
complaints
    ↓ (1:*)
audit_log
```

## Example Queries

### Get user's complaints
```sql
SELECT * FROM complaints 
WHERE user_id = $1 
ORDER BY created_at DESC;
```

### Get high priority complaints
```sql
SELECT * FROM complaints 
WHERE priority = 'high' 
AND status != 'resolved'
ORDER BY created_at DESC;
```

### Get user statistics
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
  SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing
FROM complaints
WHERE user_id = $1;
```

## Security Considerations

1. **RLS Enabled**: All tables have RLS policies
2. **Row Filtering**: Data filtered by user at database level
3. **Audit Logging**: All modifications logged
4. **Foreign Keys**: Referential integrity maintained
5. **Timestamps**: Track data lifecycle
