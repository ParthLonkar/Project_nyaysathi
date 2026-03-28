from app.services.openai_service import llm
from app.services.prompt_templates import COMPLIANCE_PROMPT
from app.agents.agent_utils import build_agent_flow, merge_dict, normalize_text


def _missing_fields(state):
    legal = getattr(state, "legal_analysis", {}) or {}
    missing = []
    if not legal.get("location"):
        missing.append("location")
    if not legal.get("department"):
        missing.append("department")
    if not legal.get("duration"):
        missing.append("duration")
    if not getattr(state, "complaint_draft", None):
        missing.append("complaint_draft")
    return missing


async def check_compliance(state):
    """Compliance agent: validate legal readiness and detect information gaps."""
    title = normalize_text(getattr(state, "title", ""))
    category = (getattr(state, "category", None) or "general").lower()

    llm_notes = ""
    try:
        response = llm.invoke(COMPLIANCE_PROMPT.format(title=title or "Complaint", category=category))
        llm_notes = normalize_text(getattr(response, "content", ""))
    except Exception:
        llm_notes = ""

    missing = _missing_fields(state)
    base_score = 80
    score = max(20, base_score - (len(missing) * 12) - (0 if getattr(state, "document_valid", False) else 10))

    compliance_payload = {
        "legal_strength_score": score,
        "is_ready_to_submit": len(missing) == 0 and bool(getattr(state, "document_valid", False)),
        "missing_fields": missing,
        "warnings": [f"Missing {field}" for field in missing],
        "notes": llm_notes or "Compliance checks completed with schema and field validation.",
    }

    state.compliance_check = compliance_payload

    updated_legal = merge_dict(getattr(state, "legal_analysis", None) or {}, {})
    current_flow = (updated_legal.get("agent_flow") or {})
    updated_legal["agent_flow"] = build_agent_flow({**current_flow, "compliance": "completed"})
    state.legal_analysis = updated_legal

    state.current_stage = "priority"
    return state
