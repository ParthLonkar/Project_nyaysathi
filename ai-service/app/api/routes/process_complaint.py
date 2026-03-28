from fastapi import APIRouter
from pydantic import BaseModel
from time import perf_counter
import base64

from app.services.enrichment_service import build_ai_enrichment
from app.services.document_service import build_document_intelligence
from app.services.legal_intelligence_service import analyze_legal_intelligence
from app.services.pdf_generator import generate_rti_pdf, generate_complaint_draft_pdf
from app.utils.logger import log_info
from app.services.openai_service import (
    get_model_runtime_info,
    reset_gemini_call_count,
    get_gemini_call_count,
)

router = APIRouter()


class ProcessComplaintRequest(BaseModel):
    text: str
    location: str


class ProcessComplaintResponse(BaseModel):
    category: str
    department: str
    priority: str
    legal_path: str
    legal_strategy: str
    manual_review: bool
    confidence_score: float
    decision_rationale: str
    summary: str
    recommended_actions: list[str]
    admin_brief: str
    staff_action_note: str
    citizen_update: str
    escalation_risk: str
    complaint_draft: str
    rti_draft: str
    complaint_pdf: str | None = None
    rti_pdf: str | None = None
    document_valid: bool
    document_notes: str
    agent_flow: dict
    legal_analysis: dict
    compliance_check: dict
    priority_score: float
    escalation_needed: bool


@router.post("/process-complaint", response_model=ProcessComplaintResponse)
async def process_complaint(payload: ProcessComplaintRequest):
    started = perf_counter()
    text = (payload.text or "").strip()
    reset_gemini_call_count()

    log_info(
        "process-complaint request received",
        extra={
            "has_text": bool(text),
            "location": payload.location,
            "model_runtime": get_model_runtime_info(),
        },
    )

    legal_analysis = analyze_legal_intelligence(
        text=text,
        location=payload.location,
        allow_llm_refinement=False,
    )
    agent_flow = {
        "intake": "completed",
        "legal_analysis": "completed",
        "drafting": "completed",
        "compliance": "completed",
        "priority": "completed",
        "action": "completed",
    }

    # Keep enrichment fields for backward compatibility with existing backend/UI contracts.
    enrichment = build_ai_enrichment(
        text=text,
        location=payload.location,
        category_hint=legal_analysis.get("category"),
        priority_hint=legal_analysis.get("priority"),
        legal_override=legal_analysis,
    )

    docs = build_document_intelligence(
        text=text,
        department=legal_analysis.get("department") or enrichment.get("department"),
        location=payload.location,
        include_rti=True,
    )

    complaint_draft = docs.get("complaint_draft", "")
    rti_draft = docs.get("rti_draft", "")
    document_valid = bool(docs.get("document_valid"))
    document_notes = docs.get("document_notes", "")
    summary = docs.get("improved_text") or enrichment.get("summary", "")

    complaint_data = {
        "complaint_id": "runtime-complaint",
        "title": (text[:80] if text else "Citizen complaint"),
        "description": text,
        "location": payload.location,
        "department": legal_analysis.get("department") or enrichment.get("department"),
        "customer_name": "Not Provided",
        "email": "Not Provided",
        "phone": "Not Provided",
        "address": "Not Provided",
        "aadhaar": "Not Provided",
    }

    complaint_pdf_bytes = None
    rti_pdf_bytes = None
    try:
        if complaint_draft:
            complaint_pdf_bytes = generate_complaint_draft_pdf(complaint_data, complaint_draft)
            log_info("Complaint PDF generated in process route", extra={"bytes": len(complaint_pdf_bytes)})
    except Exception:
        complaint_pdf_bytes = None

    try:
        if rti_draft:
            rti_pdf_bytes = generate_rti_pdf(complaint_data)
            log_info("RTI PDF generated in process route", extra={"bytes": len(rti_pdf_bytes)})
    except Exception:
        rti_pdf_bytes = None

    def _encode_pdf(pdf_bytes: bytes | None) -> str | None:
        if not pdf_bytes:
            return None
        return base64.b64encode(pdf_bytes).decode("utf-8")

    complaint_pdf_b64 = _encode_pdf(complaint_pdf_bytes)
    rti_pdf_b64 = _encode_pdf(rti_pdf_bytes)
    log_info(
        "PDF payload prepared for backend",
        extra={
            "complaint_id": "runtime-complaint",
            "has_complaint_pdf": bool(complaint_pdf_b64),
            "has_rti_pdf": bool(rti_pdf_b64),
        },
    )

    priority = legal_analysis.get("priority") or enrichment.get("priority") or "medium"
    priority_score = 0.9 if priority == "high" else 0.35 if priority == "low" else 0.6
    escalation_needed = str(enrichment.get("escalation_risk", "")).lower() == "high"

    result = {
        "category": legal_analysis.get("category") or enrichment.get("category", "general"),
        "department": legal_analysis.get("department") or enrichment.get("department", "Municipal Grievance Cell"),
        "priority": priority,
        "legal_path": legal_analysis.get("legal_path") or enrichment.get("legal_path", "manual_review"),
        "legal_strategy": legal_analysis.get("legal_strategy") or enrichment.get("legal_strategy", ""),
        "manual_review": bool(legal_analysis.get("manual_review", enrichment.get("manual_review", False))),
        "confidence_score": float(legal_analysis.get("confidence_score", enrichment.get("confidence_score", 0.5))),
        "decision_rationale": legal_analysis.get("decision_rationale") or enrichment.get("decision_rationale", ""),
        "summary": summary,
        "recommended_actions": enrichment.get("recommended_actions", []),
        "admin_brief": enrichment.get("admin_brief", ""),
        "staff_action_note": enrichment.get("staff_action_note", ""),
        "citizen_update": enrichment.get("citizen_update", ""),
        "escalation_risk": enrichment.get("escalation_risk", ""),
        "complaint_draft": complaint_draft,
        "rti_draft": rti_draft,
        "complaint_pdf": complaint_pdf_b64,
        "rti_pdf": rti_pdf_b64,
        "document_valid": document_valid,
        "document_notes": document_notes,
        "agent_flow": agent_flow,
        "legal_analysis": legal_analysis,
        "compliance_check": {
            "is_ready_to_submit": document_valid,
            "notes": document_notes,
            "warnings": [] if document_valid else ["Document validation flagged weak sections"],
        },
        "priority_score": float(priority_score),
        "escalation_needed": bool(escalation_needed),
    }

    llm_calls = get_gemini_call_count()
    log_info(
        "process-complaint completed",
        extra={
            "duration_ms": int((perf_counter() - started) * 1000),
            "category": result.get("category"),
            "department": result.get("department"),
            "priority": result.get("priority"),
            "has_rti": bool(result.get("rti_draft")),
            "has_complaint_pdf": bool(result.get("complaint_pdf")),
            "has_rti_pdf": bool(result.get("rti_pdf")),
            "gemini_calls": llm_calls,
        },
    )

    return ProcessComplaintResponse(**result)
