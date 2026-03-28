# NyaySathi API Specification

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints (except `/health`) require JWT token in `Authorization: Bearer <token>` header.

## Complaint Endpoints

### Create Complaint
```http
POST /complaints
Content-Type: multipart/form-data

{
  "title": "string",
  "description": "string",
  "category": "general|employment|consumer|family|property",
  "attachment": "file (optional)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "string",
  "description": "string",
  "category": "string",
  "status": "new",
  "priority": "medium",
  "created_at": "ISO8601"
}
```

### Get My Complaints
```http
GET /complaints/my
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "status": "string",
    "priority": "string",
    "created_at": "ISO8601"
  }
]
```

### Get All Complaints (Admin)
```http
GET /complaints?filter=all|new|processing|escalated|resolved
```

### Get Complaint Details
```http
GET /complaints/:id
```

### Update Complaint Status (Admin)
```http
PATCH /complaints/:id/status
Content-Type: application/json

{
  "status": "new|processing|escalated|resolved"
}
```

## AI Processing Endpoints

### Process Complaint
```http
POST /ai/process
Content-Type: application/json

{
  "complaintId": "uuid"
}
```

### Get Processing Status
```http
GET /ai/status/:complaintId
```

**Response:**
```json
{
  "complaint_id": "uuid",
  "status": "processing|completed",
  "legal_analysis": {...},
  "draft_document": "string",
  "priority": 0.75,
  "recommended_actions": ["string"]
}
```

## Admin Endpoints

### Get Statistics
```http
GET /admin/complaints/stats
```

**Response:**
```json
{
  "total": 100,
  "byStatus": {
    "new": 25,
    "processing": 50,
    "resolved": 25
  },
  "byPriority": {
    "high": 30,
    "medium": 50,
    "low": 20
  }
}
```

## Error Responses

```json
{
  "error": {
    "status": 400,
    "message": "Error description"
  }
}
```

### Status Codes
- `200` OK
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `500` Internal Server Error
