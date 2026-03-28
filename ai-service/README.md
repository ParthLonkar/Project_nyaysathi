# NyaySathi AI Service

Python FastAPI service for processing legal complaints using LangGraph and Google Gemini.

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Running

```bash
python -m uvicorn api.main:app --reload
```

## Documentation

- [Agent Flow](../docs/agent-flow.md)
- [API Spec](../docs/api-spec.md)
