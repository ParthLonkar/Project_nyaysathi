from app.services.openai_service import llm
from app.services.prompt_templates import LEGAL_ANALYSIS_PROMPT


async def perform_legal_analysis(state):
    """Legal agent - Analyze complaint for legal merit"""
    response = llm.invoke(LEGAL_ANALYSIS_PROMPT.format(
        title=state.title,
        description=state.description,
        category=state.category,
    ))

    state.legal_analysis = {
        "legal_merit": "high",
        "applicable_laws": ["Consumer Protection Act", "Civil Procedure Code"],
        "key_issues": ["Breach of Contract", "Negligence"],
        "analysis": response.content,
    }
    state.current_stage = "drafting"
    return state
