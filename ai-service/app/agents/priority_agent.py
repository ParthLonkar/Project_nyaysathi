from app.services.openai_service import llm
from app.services.prompt_templates import PRIORITY_PROMPT
from app.agents.agent_utils import (
    build_agent_flow,
    compute_priority_score,
    merge_dict,
    normalize_text,
    priority_label,
)


async def assess_priority(state):
    """Priority agent: calculate urgency score and priority band."""
    title = normalize_text(getattr(state, "title", ""))
    description = normalize_text(getattr(state, "description", ""))
    category = (getattr(state, "category", None) or "general").lower()

    llm_reasoning = ""
    try:
        response = llm.invoke(
            PRIORITY_PROMPT.format(
                title=title or "Complaint",
                description=description,
                legal_analysis=str(getattr(state, "legal_analysis", {}) or {}),
            )
        )
        llm_reasoning = normalize_text(getattr(response, "content", ""))
    except Exception:
        llm_reasoning = ""

    score = compute_priority_score(f"{title} {description}", category)
    state.priority_score = score

    updated_legal = merge_dict(getattr(state, "legal_analysis", None) or {}, {
        "priority": priority_label(score),
        "priority_reasoning": llm_reasoning or "Priority derived from urgency, harm context, and category risk.",
    })
    current_flow = (updated_legal.get("agent_flow") or {})
    updated_legal["agent_flow"] = build_agent_flow({**current_flow, "priority": "completed"})
    state.legal_analysis = updated_legal

    state.current_stage = "action"
    return state
