from app.services.openai_service import llm
from app.services.prompt_templates import ACTION_PROMPT


async def recommend_actions(state):
    """Action agent - Recommend next steps and escalation"""
    response = llm.invoke(ACTION_PROMPT.format(
        title=state.title,
        legal_analysis=str(state.legal_analysis),
        priority=state.priority_score,
    ))

    state.recommended_actions = [
        "File formal complaint with regulatory authority",
        "Send demand letter to respondent",
        "Gather supporting evidence",
    ]
    
    state.escalation_needed = state.priority_score > 0.8
    state.status = "completed"
    return state
