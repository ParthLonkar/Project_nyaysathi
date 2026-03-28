from app.services.openai_service import llm
from app.services.prompt_templates import DRAFTING_PROMPT
from app.services.document_service import build_document_intelligence
from app.agents.agent_utils import build_agent_flow, merge_dict, normalize_text


async def draft_document(state):
    """Drafting agent: generate complaint + RTI drafts and formal legal draft text."""
    description = normalize_text(getattr(state, "description", ""))
    legal_analysis = getattr(state, "legal_analysis", {}) or {}
    department = legal_analysis.get("department")
    location = legal_analysis.get("location")

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

    state.improved_text = bundle.get("improved_text")
    state.complaint_draft = bundle.get("complaint_draft")
    state.rti_draft = bundle.get("rti_draft")
    state.document_valid = bundle.get("document_valid")
    state.document_notes = bundle.get("document_notes")
    state.draft_document = llm_draft or state.complaint_draft

    updated_legal = merge_dict(legal_analysis, {
        "drafting_available": bool(state.complaint_draft),
        "has_rti_draft": bool(state.rti_draft),
    })
    current_flow = (updated_legal.get("agent_flow") or {})
    updated_legal["agent_flow"] = build_agent_flow({**current_flow, "drafting": "completed"})
    state.legal_analysis = updated_legal

    state.current_stage = "compliance"
    return state
