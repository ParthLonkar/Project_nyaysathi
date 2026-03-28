from app.services.openai_service import llm
from app.services.prompt_templates import ACTION_PROMPT
from app.agents.agent_utils import build_agent_flow, merge_dict, normalize_text


def _default_actions(priority_score: float, compliance_check: dict | None) -> list[str]:
    actions = [
        "Assign complaint to responsible department officer.",
        "Set SLA checkpoints and notify citizen after first update.",
        "Attach evidence and draft documents to case record.",
    ]

    if (compliance_check or {}).get("missing_fields"):
        actions.insert(0, "Collect missing mandatory inputs from citizen before final submission.")

    if priority_score >= 0.8:
        actions.append("Flag for senior supervisory review within 24 hours.")

    return actions


async def recommend_actions(state):
    """Action agent: build final action plan and escalation recommendation."""
    legal = getattr(state, "legal_analysis", {}) or {}
    priority_score = float(getattr(state, "priority_score", 0.0) or 0.0)

    llm_recommendation = ""
    try:
        response = llm.invoke(
            ACTION_PROMPT.format(
                title=normalize_text(getattr(state, "title", "")) or "Complaint",
                legal_analysis=str(legal),
                priority=priority_score,
            )
        )
        llm_recommendation = normalize_text(getattr(response, "content", ""))
    except Exception:
        llm_recommendation = ""

    state.recommended_actions = _default_actions(priority_score, getattr(state, "compliance_check", None))
    state.escalation_needed = priority_score >= 0.8

    updated_legal = merge_dict(legal, {
        "action_summary": llm_recommendation or "Action strategy generated with SLA and escalation readiness.",
    })
    current_flow = (updated_legal.get("agent_flow") or {})
    updated_legal["agent_flow"] = build_agent_flow({**current_flow, "action": "completed"})
    state.legal_analysis = updated_legal

    state.status = "completed"
    return state
