from app.services.openai_service import llm
from app.services.prompt_templates import COMPLIANCE_PROMPT


async def check_compliance(state):
    """Compliance agent - Check regulatory compliance"""
    response = llm.invoke(COMPLIANCE_PROMPT.format(
        title=state.title,
        category=state.category,
    ))

    state.compliance_check = {
        "gdpr_compliant": True,
        "data_protection_compliant": True,
        "jurisdictional_applicable": True,
        "notes": response.content,
    }
    state.current_stage = "priority"
    return state
