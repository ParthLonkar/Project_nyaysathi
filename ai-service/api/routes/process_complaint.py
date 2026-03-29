from fastapi import APIRouter
from pydantic import BaseModel
from time import perf_counter
from typing import Optional
import base64

from app.agents import intake_agent, legal_agent, drafting_agent, compliance_agent, priority_agent, action_agent
from app.graph.state import ComplaintState
from app.services.enrichment_service import build_ai_enrichment
from app.services.document_service import build_document_intelligence
from app.agents.agent_utils import priority_label
from app.utils.logger import log_info

router = APIRouter()


class ProcessComplaintRequest(BaseModel):
    text: str
    location: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    aadhaar: Optional[str] = None
    reference_id: Optional[str] = None


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
    complaint_pdf: Optional[str] = None
    rti_pdf: Optional[str] = None
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

    log_info(
        "process-complaint request received",
        extra={"has_text": bool(text), "location": payload.location},
    )

    initial_state = ComplaintState(
        complaint_id="runtime-complaint",
        title=(text[:80] if text else "Citizen complaint"),
        description=text,
        category="general",
        customer_name=payload.name,
        email=payload.email,
        phone=payload.phone,
        address=payload.address,
        aadhaar=payload.aadhaar,
        reference_id=payload.reference_id,
    )

    state = await intake_agent.process_intake(initial_state)
    state = await legal_agent.perform_legal_analysis(state)
    state = await drafting_agent.draft_document(state)
    state = await compliance_agent.check_compliance(state)
    state = await priority_agent.assess_priority(state)
    state = await action_agent.recommend_actions(state)

    legal_analysis = state.legal_analysis or {}
    agent_flow = legal_analysis.get("agent_flow") or {}

    # Keep enrichment fields for backward compatibility with existing backend/UI contracts.
    enrichment = build_ai_enrichment(
        text=text,
        location=payload.location,
        category_hint=state.category,
        priority_hint=priority_label(float(state.priority_score or 0.0)),
    )

    # Ensure complaint/RTI drafts are always present.
    if not state.complaint_draft or not state.rti_draft:
      docs = build_document_intelligence(
          text=text,
          department=legal_analysis.get("department") or enrichment.get("department"),
          location=legal_analysis.get("location") or payload.location,
          include_rti=True,
      )
      state.complaint_draft = state.complaint_draft or docs.get("complaint_draft", "")
      state.rti_draft = state.rti_draft or docs.get("rti_draft", "")
      state.document_valid = state.document_valid if state.document_valid is not None else docs.get("document_valid", False)
      state.document_notes = state.document_notes or docs.get("document_notes", "")

    # Encode PDFs as base64 for JSON serialization
    complaint_pdf_b64 = None
    if state.complaint_pdf and isinstance(state.complaint_pdf, bytes):
        complaint_pdf_b64 = base64.b64encode(state.complaint_pdf).decode('utf-8')
    
    rti_pdf_b64 = None
    if state.rti_pdf and isinstance(state.rti_pdf, bytes):
        rti_pdf_b64 = base64.b64encode(state.rti_pdf).decode('utf-8')

    result = {
        "category": legal_analysis.get("category") or state.category or enrichment.get("category", "general"),
        "department": legal_analysis.get("department") or enrichment.get("department", "Municipal Corporation"),
        "priority": legal_analysis.get("priority") or enrichment.get("priority") or priority_label(float(state.priority_score or 0.0)),
        "legal_path": legal_analysis.get("legal_path") or enrichment.get("legal_path", "manual_review"),
        "legal_strategy": legal_analysis.get("filing_strategy") or enrichment.get("legal_strategy", ""),
        "manual_review": bool(legal_analysis.get("manual_review", enrichment.get("manual_review", False))),
        "confidence_score": float(legal_analysis.get("confidence_score", enrichment.get("confidence_score", 0.5))),
        "decision_rationale": legal_analysis.get("decision_rationale") or enrichment.get("decision_rationale", ""),
        "summary": legal_analysis.get("issue_summary") or enrichment.get("summary", ""),
        "recommended_actions": state.recommended_actions or enrichment.get("recommended_actions", []),
        "admin_brief": enrichment.get("admin_brief", ""),
        "staff_action_note": enrichment.get("staff_action_note", ""),
        "citizen_update": enrichment.get("citizen_update", ""),
        "escalation_risk": enrichment.get("escalation_risk", ""),
        "complaint_draft": state.complaint_draft or "",
        "rti_draft": state.rti_draft or "",
        "complaint_pdf": complaint_pdf_b64,
        "rti_pdf": rti_pdf_b64,
        "document_valid": bool(state.document_valid),
        "document_notes": state.document_notes or "",
        "agent_flow": agent_flow,
        "legal_analysis": legal_analysis,
        "compliance_check": state.compliance_check or {},
        "priority_score": float(state.priority_score or 0.0),
        "escalation_needed": bool(state.escalation_needed),
    }

    log_info(
        "process-complaint completed",
        extra={
            "duration_ms": int((perf_counter() - started) * 1000),
            "category": result.get("category"),
            "department": result.get("department"),
            "priority": result.get("priority"),
            "has_rti_draft": bool(result.get("rti_draft")),
            "has_rti_pdf": bool(result.get("rti_pdf")),
            "has_complaint_pdf": bool(result.get("complaint_pdf")),
        },
    )

    return ProcessComplaintResponse(**result)
