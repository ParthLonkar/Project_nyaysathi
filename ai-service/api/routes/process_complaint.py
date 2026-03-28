from fastapi import APIRouter
from pydantic import BaseModel
from app.services.enrichment_service import build_ai_enrichment

router = APIRouter()


class ProcessComplaintRequest(BaseModel):
    text: str
    location: str


class ProcessComplaintResponse(BaseModel):
    category: str
    department: str
    priority: str
    legal_strategy: str
    summary: str
    recommended_actions: list[str]
    admin_brief: str
    staff_action_note: str
    citizen_update: str
    escalation_risk: str


@router.post("/process-complaint", response_model=ProcessComplaintResponse)
async def process_complaint(payload: ProcessComplaintRequest):
    result = build_ai_enrichment(text=payload.text, location=payload.location)
    return ProcessComplaintResponse(**result)
