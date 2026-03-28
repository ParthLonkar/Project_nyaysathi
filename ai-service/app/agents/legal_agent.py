from app.services.openai_service import llm
from app.services.prompt_templates import LEGAL_ANALYSIS_PROMPT
from app.agents.agent_utils import build_agent_flow, merge_dict, normalize_text
from app.services.legal_intelligence_service import analyze_legal_intelligence


def _laws_by_category(category: str):
    mapping = {
        "water": ["Municipal Water Supply Rules", "Public Health and Sanitation norms"],
        "sanitation": ["Solid Waste Management Rules", "Municipal Public Health norms"],
        "roads": ["Municipal Roads Maintenance obligations", "Public Safety guidelines"],
        "electricity": ["Electricity Act", "State Electricity Supply Code"],
        "education": ["Right to Education norms", "State Education Department regulations"],
        "revenue": ["State Land Revenue Code", "Municipal Revenue Rules"],
        "consumer": ["Consumer Protection Act", "Consumer Protection (E-commerce) Rules"],
        "social_welfare": ["State Social Welfare Scheme Guidelines", "Public Distribution System norms"],
        "harassment": ["Indian Penal Code", "Criminal Procedure Code"],
        "corruption": ["Prevention of Corruption Act", "Indian Penal Code"],
        "police": ["Indian Penal Code", "Code of Criminal Procedure"],
        "general": ["Municipal Grievance Redressal norms"],
    }
    return mapping.get(category, mapping["general"])


async def perform_legal_analysis(state):
    """Legal analysis agent: map issue to legal basis and practical strategy."""
    category = (getattr(state, "category", None) or "general").lower()
    title = normalize_text(getattr(state, "title", ""))
    description = normalize_text(getattr(state, "description", ""))
    previous_legal = getattr(state, "legal_analysis", None) or {}
    detected_location = previous_legal.get("location") or ""

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

    legal_intel = analyze_legal_intelligence(text=description, location=detected_location)

    legal_payload = {
        "department": legal_intel.get("department"),
        "category": legal_intel.get("category", category),
        "priority": legal_intel.get("priority", "medium"),
        "legal_path": legal_intel.get("legal_path", "manual_review"),
        "confidence_score": legal_intel.get("confidence_score", 0.5),
        "decision_rationale": legal_intel.get("decision_rationale", ""),
        "manual_review": bool(legal_intel.get("manual_review")),
        "escalation_risk": legal_intel.get("escalation_risk", "medium"),
        "legal_merit": "medium" if category == "general" else "high",
        "applicable_laws": _laws_by_category(category),
        "key_issues": [category.replace("_", " ").title(), "Administrative non-response"],
        "analysis": llm_analysis or "Legal basis identified through category mapping and grievance norms.",
        "filing_strategy": legal_intel.get("legal_strategy") or "File grievance first; escalate with RTI and higher authority if no response within SLA.",
    }

    current_legal = merge_dict(previous_legal, legal_payload)
    current_flow = (current_legal.get("agent_flow") or {})
    current_legal["agent_flow"] = build_agent_flow({**current_flow, "legal_analysis": "completed"})

    state.category = legal_intel.get("category", category)
    state.legal_analysis = current_legal
    state.current_stage = "drafting"
    return state
