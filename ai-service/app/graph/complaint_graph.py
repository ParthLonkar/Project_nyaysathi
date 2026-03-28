from langgraph.graph import StateGraph
from datetime import datetime
from app.graph.state import ComplaintState, ComplaintInput
from app.agents import (
    intake_agent,
    legal_agent,
    drafting_agent,
    compliance_agent,
    priority_agent,
    action_agent,
)


def create_complaint_graph():
    """Create the LangGraph workflow for complaint processing"""
    graph = StateGraph(ComplaintState)

    # Add nodes
    graph.add_node("intake", intake_agent.process_intake)
    graph.add_node("legal_analysis", legal_agent.perform_legal_analysis)
    graph.add_node("drafting", drafting_agent.draft_document)
    graph.add_node("compliance", compliance_agent.check_compliance)
    graph.add_node("priority", priority_agent.assess_priority)
    graph.add_node("action", action_agent.recommend_actions)

    # Add edges
    graph.add_edge("intake", "legal_analysis")
    graph.add_edge("legal_analysis", "drafting")
    graph.add_edge("drafting", "compliance")
    graph.add_edge("compliance", "priority")
    graph.add_edge("priority", "action")

    graph.set_entry_point("intake")
    graph.set_finish_point("action")

    return graph.compile()


def format_result(final_state: ComplaintState) -> dict:
    """Format the final state into a result"""
    return {
        "complaint_id": final_state.complaint_id,
        "status": "completed",
        "legal_analysis": final_state.legal_analysis,
        "draft_document": final_state.draft_document,
        "priority": final_state.priority_score,
        "compliance": final_state.compliance_check,
        "recommended_actions": final_state.recommended_actions,
        "escalation_needed": final_state.escalation_needed,
        "timestamp": datetime.now().isoformat(),
    }
