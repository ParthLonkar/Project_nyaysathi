# NyaySathi - AI-Powered Legal Justice Platform

An intelligent platform that uses multi-agent AI to help users file and process legal complaints. The system analyzes complaints, provides legal insights, drafts documents, and recommends actions.

## 🌟 Features

- **AI-Powered Analysis**: LangGraph multi-agent system analyzes complaints
- **Legal Drafting**: Automatically generates formal legal documents
- **Priority Assessment**: Intelligent prioritization of complaints
- **Compliance Checking**: Ensures regulatory compliance
- **Real-time Tracking**: Users can monitor complaint status
- **Admin Dashboard**: Complete management interface
- **Secure Authentication**: JWT-based auth with role management

## 🏗️ Project Structure

```
nyaysathi-ai/
├── frontend/          # React + Vite frontend app
├── backend/           # Node.js Express API
├── ai-service/        # Python FastAPI + LangGraph
├── supabase/          # Database schema & policies
└── docs/              # Architecture & API documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker (optional)
- Supabase account
- OpenAI API key

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### AI Service Setup
```bash
cd ai-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn api.main:app --reload
```

## 🔧 Configuration

Create `.env` files in each directory:

**frontend/.env**
```
VITE_API_URL=http://localhost:3000/api
```

**backend/.env**
```
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_key
JWT_SECRET=your_secret
PYTHON_SERVICE_URL=http://localhost:8000
```

**ai-service/.env**
```
OPENAI_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
```

## 📚 Documentation

- [Architecture](docs/architecture.md) - System design and components
- [API Specification](docs/api-spec.md) - REST API endpoints
- [Agent Flow](docs/agent-flow.md) - Multi-agent workflow
- [Database Design](docs/db-design.md) - Schema and security

## 🤖 AI Agents

1. **Intake Agent** - Validates and categorizes complaints
2. **Legal Agent** - Performs legal analysis
3. **Drafting Agent** - Creates formal documents
4. **Compliance Agent** - Checks regulatory compliance
5. **Priority Agent** - Assesses urgency
6. **Action Agent** - Recommends next steps

## 🔐 Security

- Row-Level Security (RLS) on database
- JWT authentication
- Role-based access control
- Audit logging
- CORS protection

## 📦 Tech Stack

- **Frontend**: React 18, Vite, Axios
- **Backend**: Node.js, Express, Supabase
- **AI**: Python, FastAPI, LangGraph, OpenAI
- **Database**: PostgreSQL (Supabase)

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please follow the existing code structure and add tests.

## 📧 Support

For issues and questions, please open a GitHub issue.
