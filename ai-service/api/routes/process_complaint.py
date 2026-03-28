from fastapi import APIRouter
from pydantic import BaseModel
from app.services.enrichment_service import build_ai_enrichment
from app.services.document_service import build_document_intelligence
from app.utils.logger import log_info
from time import perf_counter

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
    complaint_draft: str
    rti_draft: str
    document_valid: bool
    document_notes: str


@router.post("/process-complaint", response_model=ProcessComplaintResponse)
async def process_complaint(payload: ProcessComplaintRequest):
    started = perf_counter()
    log_info(
        "process-complaint request received",
        extra={"has_text": bool(payload.text), "location": payload.location},
    )
    result = build_ai_enrichment(text=payload.text, location=payload.location)
    document_result = build_document_intelligence(
        text=payload.text,
        department=result.get("department"),
        location=payload.location,
        include_rti=True,
    )
    result.update(
        {
            "complaint_draft": document_result.get("complaint_draft", ""),
            "rti_draft": document_result.get("rti_draft", ""),
            "document_valid": document_result.get("document_valid", False),
            "document_notes": document_result.get("document_notes", "Document validation skipped."),
        }
    )
    log_info(
        "process-complaint completed",
        extra={
            "duration_ms": int((perf_counter() - started) * 1000),
            "category": result.get("category"),
            "department": result.get("department"),
            "priority": result.get("priority"),
            "document_valid": result.get("document_valid"),
        },
    )
    return ProcessComplaintResponse(**result)
