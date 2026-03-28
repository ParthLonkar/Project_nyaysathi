from app.services.openai_service import llm
from app.services.prompt_templates import DRAFTING_PROMPT
from app.services.document_service import build_document_intelligence
from app.services.pdf_generator import generate_rti_pdf, generate_complaint_draft_pdf
from app.agents.agent_utils import build_agent_flow, merge_dict, normalize_text
from app.utils.logger import log_error, log_info


async def draft_document(state):
    """Drafting agent: generate complaint + RTI drafts and formal legal draft text."""
    description = normalize_text(getattr(state, "description", ""))
    legal_analysis = getattr(state, "legal_analysis", {}) or {}
    department = legal_analysis.get("department")
    location = legal_analysis.get("location")
    log_info(
        "Drafting started",
        extra={
            "complaint_id": getattr(state, "complaint_id", None),
            "has_description": bool(description),
            "department": department,
            "location": location,
        },
    )

    bundle = build_document_intelligence(
        text=description,
        department=department,
        location=location,
        include_rti=True,
    )

    llm_draft = ""
    try:
        response = llm.invoke(
            DRAFTING_PROMPT.format(
                title=normalize_text(getattr(state, "title", "")) or "Citizen complaint",
                legal_analysis=str(legal_analysis),
            )
        )
        llm_draft = normalize_text(getattr(response, "content", ""))
    except Exception:
        llm_draft = ""
        log_info(
            "Drafting LLM unavailable; using structured fallback drafts",
            extra={"complaint_id": getattr(state, "complaint_id", None)},
        )

    state.improved_text = bundle.get("improved_text")
    state.complaint_draft = bundle.get("complaint_draft")
    state.rti_draft = bundle.get("rti_draft")
    state.document_valid = bundle.get("document_valid")
    state.document_notes = bundle.get("document_notes")
    state.draft_document = llm_draft or state.complaint_draft

    # Generate PDF documents (best-effort; never block text drafting flow)
    complaint_data = {
        "complaint_id": getattr(state, "complaint_id", "Not Assigned"),
        "title": getattr(state, "title", "Citizen Complaint"),
        "description": description,
        "customer_name": getattr(state, "customer_name", "Not Provided"),
        "email": getattr(state, "email", "Not Provided"),
        "phone": getattr(state, "phone", "Not Provided"),
        "location": location or "Not Provided",
        "address": getattr(state, "address", "Not Provided"),
        "aadhaar": getattr(state, "aadhaar", "Not Provided"),
        "department": department or "Concerned Department"
    }

    state.rti_pdf = None
    state.complaint_pdf = None

    try:
        state.rti_pdf = generate_rti_pdf(complaint_data)
        log_info(
            "RTI PDF generated",
            extra={"complaint_id": getattr(state, "complaint_id", None), "bytes": len(state.rti_pdf or b"")},
        )
    except Exception:
        state.rti_pdf = None
        log_error("RTI PDF generation failed")

    if state.complaint_draft:
        try:
            state.complaint_pdf = generate_complaint_draft_pdf(complaint_data, state.complaint_draft)
            log_info(
                "Complaint PDF generated",
                extra={"complaint_id": getattr(state, "complaint_id", None), "bytes": len(state.complaint_pdf or b"")},
            )
        except Exception:
            state.complaint_pdf = None
            log_error("Complaint PDF generation failed")

    updated_legal = merge_dict(legal_analysis, {
        "drafting_available": bool(state.complaint_draft),
        "has_rti_draft": bool(state.rti_draft),
        "has_rti_pdf": bool(getattr(state, "rti_pdf", None)),
        "has_complaint_pdf": bool(getattr(state, "complaint_pdf", None)),
    })
    current_flow = (updated_legal.get("agent_flow") or {})
    updated_legal["agent_flow"] = build_agent_flow({**current_flow, "drafting": "completed"})
    state.legal_analysis = updated_legal

    state.current_stage = "compliance"
    log_info(
        "Drafting completed",
        extra={
            "complaint_id": getattr(state, "complaint_id", None),
            "has_complaint_draft": bool(state.complaint_draft),
            "has_rti_draft": bool(state.rti_draft),
            "has_complaint_pdf": bool(state.complaint_pdf),
            "has_rti_pdf": bool(state.rti_pdf),
        },
    )
    return state
