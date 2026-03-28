from app.services.openai_service import llm
from app.services.prompt_templates import DRAFTING_PROMPT


async def draft_document(state):
    """Drafting agent - Draft formal legal document"""
    response = llm.invoke(DRAFTING_PROMPT.format(
        title=state.title,
        legal_analysis=str(state.legal_analysis),
    ))

    state.draft_document = response.content
    state.current_stage = "compliance"
    return state
