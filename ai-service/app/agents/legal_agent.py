from app.services.openai_service import llm
from app.services.prompt_templates import LEGAL_ANALYSIS_PROMPT
from app.agents.agent_utils import build_agent_flow, infer_department, merge_dict, normalize_text


def _laws_by_category(category: str):
    mapping = {
        "water": ["Municipal Water Supply Rules", "Public Health and Sanitation norms"],
        "sanitation": ["Solid Waste Management Rules", "Municipal Public Health norms"],
        "roads": ["Municipal Roads Maintenance obligations", "Public Safety guidelines"],
        "electricity": ["Electricity Act", "State Electricity Supply Code"],
        "harassment": ["Indian Penal Code", "Criminal Procedure Code"],
        "corruption": ["Prevention of Corruption Act", "Indian Penal Code"],
        "general": ["Municipal Grievance Redressal norms"],
    }
    return mapping.get(category, mapping["general"])


async def perform_legal_analysis(state):
    """Legal analysis agent: map issue to legal basis and practical strategy."""
    category = (getattr(state, "category", None) or "general").lower()
    title = normalize_text(getattr(state, "title", ""))
    description = normalize_text(getattr(state, "description", ""))

    llm_analysis = ""
    try:
        response = llm.invoke(
            LEGAL_ANALYSIS_PROMPT.format(
                title=title or "Citizen complaint",
                description=description,
                category=category,
            )
        )
        llm_analysis = normalize_text(getattr(response, "content", ""))
    except Exception:
        llm_analysis = ""

    legal_payload = {
        "department": infer_department(category),
        "legal_merit": "medium" if category == "general" else "high",
        "applicable_laws": _laws_by_category(category),
        "key_issues": [category.replace("_", " ").title(), "Administrative non-response"],
        "analysis": llm_analysis or "Legal basis identified through category mapping and grievance norms.",
        "filing_strategy": "File grievance first; escalate with RTI and higher authority if no response within SLA.",
    }

    current_legal = merge_dict(getattr(state, "legal_analysis", None) or {}, legal_payload)
    current_flow = (current_legal.get("agent_flow") or {})
    current_legal["agent_flow"] = build_agent_flow({**current_flow, "legal_analysis": "completed"})

    state.legal_analysis = current_legal
    state.current_stage = "drafting"
    return state
