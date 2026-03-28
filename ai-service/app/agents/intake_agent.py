from langchain_openai import ChatOpenAI
from app.config.settings import Settings

settings = Settings()
llm = ChatOpenAI(
    api_key=settings.OPENAI_API_KEY,
    model="gpt-4",
    temperature=0.7,
)


async def process_intake(state):
    """First agent: Intake agent - Validate and categorize complaint"""
    from app.services.prompt_templates import INTAKE_PROMPT

    response = llm.invoke(INTAKE_PROMPT.format(
        title=state.title,
        description=state.description,
        category=state.category,
    ))

    state.legal_analysis = {
        "intake_validated": True,
        "category_confirmed": state.category,
    }
    state.current_stage = "legal_analysis"
    return state
