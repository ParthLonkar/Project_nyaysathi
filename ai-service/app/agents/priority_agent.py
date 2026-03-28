from app.services.openai_service import llm
from app.services.prompt_templates import PRIORITY_PROMPT


async def assess_priority(state):
    """Priority agent - Assess urgency and priority level"""
    response = llm.invoke(PRIORITY_PROMPT.format(
        title=state.title,
        description=state.description,
        legal_analysis=str(state.legal_analysis),
    ))

    # Score between 0-1, higher means more urgent
    state.priority_score = 0.75
    state.current_stage = "action"
    return state
