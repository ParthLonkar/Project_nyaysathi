from app.services.openai_service import llm
from app.services.prompt_templates import INTAKE_PROMPT
from app.agents.agent_utils import (
    build_agent_flow,
    detect_category,
    infer_department,
    infer_duration,
    infer_evidence,
    infer_location,
    merge_dict,
    normalize_text,
    safe_excerpt,
)


async def process_intake(state):
    """Intake agent: extract structured baseline facts and routing hints."""
    description = normalize_text(getattr(state, "description", ""))
    title = normalize_text(getattr(state, "title", ""))
    source_text = f"{title}. {description}".strip(" .")

    category = detect_category(source_text, getattr(state, "category", None))
    department = infer_department(category)
    location = infer_location(source_text)
    duration = infer_duration(source_text)
    evidence = infer_evidence(source_text)

    llm_summary = ""
    try:
        response = llm.invoke(
            INTAKE_PROMPT.format(
                title=title or "Citizen complaint",
                description=description,
                category=category,
            )
        )
        llm_summary = normalize_text(getattr(response, "content", ""))
    except Exception:
        llm_summary = ""

    intake_payload = {
        "intake_validated": bool(description),
        "category_confirmed": category,
        "department": department,
        "location": location,
        "duration": duration,
        "evidence": evidence,
        "issue_summary": safe_excerpt(description or title, 260),
        "intake_notes": llm_summary or "Structured intake completed with deterministic extraction.",
    }

    merged_legal = merge_dict(getattr(state, "legal_analysis", None) or {}, intake_payload)
    merged_legal["agent_flow"] = build_agent_flow({"intake": "completed"})

    state.category = category
    state.legal_analysis = merged_legal
    state.current_stage = "legal_analysis"
    return state
