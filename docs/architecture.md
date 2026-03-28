# NyaySathi - AI-Powered Legal Justice Platform

## Architecture Overview

NyaySathi is a comprehensive AI-powered platform designed to assist users with legal complaints and justice. The system uses advanced LangGraph agents to analyze complaints and provide intelligent recommendations.

### System Architecture

```
┌─────────────────────┐
│   React Frontend    │  - User Interface
│   (Vite)            │  - Form Submission
└──────────┬──────────┘
           │
┌──────────▼──────────────────────┐
│   Node.js Backend API           │  - REST Endpoints
│   (Express)                      │  - Authentication
│   ├─ Complaint Routes            │  - Notification Service
│   ├─ AI Routes                   │
│   └─ Admin Routes                │
└──────────┬──────────────────────┘
           │
┌──────────┴──────────────────────┐
│   Python AI Service             │  - LangGraph Workflows
│   (FastAPI)                      │  - Multi-Agent System
│   ├─ Intake Agent               │  - Intelligent Analysis
│   ├─ Legal Agent                │
│   ├─ Drafting Agent             │
│   ├─ Compliance Agent           │
│   ├─ Priority Agent             │
│   └─ Action Agent               │
└──────────┬──────────────────────┘
           │
┌──────────▼──────────────────────┐
│   Supabase (PostgreSQL)         │
│   ├─ Complaints Table           │
│   ├─ User Roles                 │
│   ├─ Audit Logs                 │
│   └─ RLS Policies               │
└─────────────────────────────────┘
```

### Key Components

#### Frontend (React + Vite)
- Landing page with feature overview
- Complaint submission form
- User dashboard with tracking
- Admin panel for management
- Real-time status updates

#### Backend (Node.js + Express)
- RESTful API endpoints
- JWT authentication
- Integration with Python AI service
- Notification system
- Admin operations

#### AI Service (Python + LangGraph)
- Multi-agent complaint processing
- Legal analysis and document drafting
- Compliance checking
- Priority assessment
- Action recommendations

#### Database (Supabase)
- PostgreSQL with Row-Level Security
- Complaint management
- User role management
- Audit logging

## Technology Stack

- **Frontend**: React 18, Vite, Axios
- **Backend**: Node.js 20, Express, Supabase
- **AI Service**: Python 3.11, FastAPI, LangGraph, OpenAI
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT (Node Backend) + Supabase Auth

## Workflows

### Complaint Processing Workflow

1. **Intake** - Validate and categorize complaint
2. **Legal Analysis** - Analyze for legal merit
3. **Drafting** - Create formal legal documents
4. **Compliance** - Check regulatory requirements
5. **Priority** - Assess urgency level
6. **Action** - Recommend next steps

## Services

- **Complaint Service**: CRUD operations for complaints
- **AI Service**: Calls Python service for analysis
- **Notification Service**: Sends email updates
- **Supabase Service**: Database operations
- **Python Service**: Sends requests to AI microservice

## Security

- Row-Level Security (RLS) on database tables
- JWT token-based authentication
- Role-based access control (Admin/User)
- Audit logging for compliance
- CORS configuration

## Deployment

Each service can be deployed independently:
- Frontend: Vercel, Netlify, or static hosting
- Backend: Docker container on Cloud Run, App Service, or similar
- AI Service: Docker container on Kubernetes or similar
- Database: Supabase managed service
