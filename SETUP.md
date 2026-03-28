# NyaySathi Project Setup Guide

## Prerequisites

1. **Node.js** (v20+) - [Download](https://nodejs.org/)
2. **Python** (3.11+) - [Download](https://python.org/)
3. **Git** - [Download](https://git-scm.com/)
4. **Supabase Account** - [Sign up](https://supabase.com/)
5. **OpenAI API Key** - [Get key](https://platform.openai.com/api-keys)
6. **Docker** (optional) - [Download](https://docker.com/)

## Step 1: Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/yourusername/nyaysathi-ai.git
cd nyaysathi-ai

# Install all dependencies
npm install
pip install -r ai-service/requirements.txt
```

## Step 2: Configure Environment Variables

### 2.1 Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com/)
2. In the dashboard, go to **Settings** > **API**
3. Copy your:
   - Project URL → `SUPABASE_URL`
   - Anon Key → `SUPABASE_ANON_KEY`
4. Run the SQL files to set up database:
   - Go to SQL Editor in Supabase
   - Run `supabase/schema.sql`
   - Run `supabase/rls_policies.sql`

### 2.2 OpenAI Setup

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy it as `OPENAI_API_KEY`

### 2.3 Generate JWT Secret

```bash
# Generate a random JWT secret
openssl rand -base64 32
# Use the output as JWT_SECRET in backend/.env
```

### 2.4 Create Environment Files

**frontend/.env**
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=NyaySathi
```

**backend/.env**
```env
PORT=3000
NODE_ENV=development

SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_key_here

JWT_SECRET=your_generated_secret_here

PYTHON_SERVICE_URL=http://localhost:8000

EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@nyaysathi.com

LOG_LEVEL=info
```

**ai-service/.env**
```env
OPENAI_API_KEY=your_openai_key_here

SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here

API_HOST=0.0.0.0
API_PORT=8000

DEBUG=False
LOG_LEVEL=INFO
```

## Step 3: Start Services

### Option A: Local Development

**Terminal 1 - Frontend**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

**Terminal 2 - Backend**
```bash
cd backend
npm run dev
# Backend API runs on http://localhost:3000/api
```

**Terminal 3 - AI Service**
```bash
cd ai-service
source venv/bin/activate  # On Windows: venv\Scripts\activate
python -m uvicorn api.main:app --reload
# AI service runs on http://localhost:8000
```

### Option B: Docker Compose

```bash
# Create .env file in root with all configuration
docker-compose up

# Frontend: http://localhost:5173
# Backend: http://localhost:3000
# AI Service: http://localhost:8000
```

## Step 4: Test the Application

1. Open http://localhost:5173 in your browser
2. Click "File Complaint Now"
3. Fill in the complaint form
4. Submit and wait for AI processing
5. Check dashboard for status

## Step 5: Admin Access

To access admin panel:

1. Create a user in Supabase Auth
2. Insert admin role in Supabase:
   ```sql
   INSERT INTO user_roles (user_id, role) 
   VALUES ('user-uuid-here', 'admin');
   ```
3. Login with that user
4. Go to `/admin` route

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
```

### Database Connection Error
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check that tables were created in Supabase SQL Editor
- Verify RLS policies are enabled

### AI Service Not Responding
- Ensure `OPENAI_API_KEY` is valid
- Check Python dependencies: `pip install -r requirements.txt`
- Verify FastAPI server is running on `http://localhost:8000/api/health`

### CORS Errors
- Verify backend CORS is configured for frontend origin
- Check `http://localhost:5173` is in allowed origins

## Project Structure

```
nyaysathi-ai/
├── frontend/          # React app (Vite)
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API calls
│   │   ├── context/        # Global state
│   │   └── App.jsx
│   └── package.json
│
├── backend/           # Node.js API (Express)
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic
│   │   └── config/         # Configuration
│   └── package.json
│
├── ai-service/        # Python API (FastAPI)
│   ├── app/
│   │   ├── agents/         # AI agents
│   │   ├── graph/          # LangGraph workflows
│   │   ├── services/       # AI services
│   │   └── config/         # Configuration
│   └── requirements.txt
│
├── supabase/          # Database schemas
│   ├── schema.sql     # Table definitions
│   ├── rls_policies.sql   # Security policies
│   └── seed.sql       # Sample data
│
└── docs/              # Documentation
    ├── architecture.md
    ├── api-spec.md
    ├── agent-flow.md
    └── db-design.md
```

## Next Steps

1. Customize complaint categories in `backend/src/config/constants.js`
2. Modify AI prompts in `ai-service/app/services/prompt_templates.py`
3. Add more agents in `ai-service/app/agents/`
4. Create deployment configurations (Heroku, AWS, GCP, etc.)
5. Set up CI/CD pipeline

## Support

For issues and questions:
1. Check the documentation in `/docs`
2. Review existing issues on GitHub
3. Create a new issue with detailed information

## License

MIT License - See LICENSE file for details
