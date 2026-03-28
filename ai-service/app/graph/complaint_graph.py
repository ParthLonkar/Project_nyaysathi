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
from app.services.enrichment_service import build_ai_enrichment
from app.services.document_service import build_document_intelligence


async def document_intelligence_node(state: ComplaintState):
    legal_analysis = state.legal_analysis or {}
    department = legal_analysis.get("department")
    location = legal_analysis.get("location") or "unknown"

    document_result = build_document_intelligence(
        text=state.description or "",
        department=department,
        location=location,
        include_rti=True,
    )

    state.improved_text = document_result.get("improved_text")
    state.complaint_draft = document_result.get("complaint_draft")
    state.rti_draft = document_result.get("rti_draft")
    state.document_valid = document_result.get("document_valid")
    state.document_notes = document_result.get("document_notes")
    return state


def create_complaint_graph():
    """Create the LangGraph workflow for complaint processing"""
    graph = StateGraph(ComplaintState)

    # Add nodes
    graph.add_node("intake", intake_agent.process_intake)
    graph.add_node("legal_analysis_node", legal_agent.perform_legal_analysis)
    graph.add_node("document_intelligence_node", document_intelligence_node)
    graph.add_node("drafting", drafting_agent.draft_document)
    graph.add_node("compliance", compliance_agent.check_compliance)
    graph.add_node("priority", priority_agent.assess_priority)
    graph.add_node("action", action_agent.recommend_actions)

    # Add edges
    graph.add_edge("intake", "legal_analysis_node")
    graph.add_edge("legal_analysis_node", "document_intelligence_node")
    graph.add_edge("document_intelligence_node", "drafting")
    graph.add_edge("drafting", "compliance")
    graph.add_edge("compliance", "priority")
    graph.add_edge("priority", "action")

    graph.set_entry_point("intake")
    graph.set_finish_point("action")

    return graph.compile()


def format_result(final_state: ComplaintState) -> dict:
    """Format the final state into a result"""
    priority_label = "high" if (final_state.priority_score or 0) >= 0.8 else "medium"
    enriched = build_ai_enrichment(
        text=final_state.description,
        location="unknown",
        category_hint=final_state.category,
        priority_hint=priority_label,
    )

    return {
        "complaint_id": final_state.complaint_id,
        "status": "completed",
        "legal_analysis": final_state.legal_analysis,
        "category": (final_state.legal_analysis or {}).get("category") or enriched.get("category"),
        "department": (final_state.legal_analysis or {}).get("department") or enriched.get("department"),
        "priority": (final_state.legal_analysis or {}).get("priority") or enriched.get("priority"),
        "legal_path": (final_state.legal_analysis or {}).get("legal_path") or enriched.get("legal_path"),
        "legal_strategy": (final_state.legal_analysis or {}).get("filing_strategy") or enriched.get("legal_strategy"),
        "manual_review": bool((final_state.legal_analysis or {}).get("manual_review", enriched.get("manual_review", False))),
        "confidence_score": float((final_state.legal_analysis or {}).get("confidence_score", enriched.get("confidence_score", 0.5))),
        "decision_rationale": (final_state.legal_analysis or {}).get("decision_rationale") or enriched.get("decision_rationale"),
        "escalation_risk": (final_state.legal_analysis or {}).get("escalation_risk") or enriched.get("escalation_risk"),
        "draft_document": final_state.draft_document,
        "complaint_draft": final_state.complaint_draft,
        "rti_draft": final_state.rti_draft,
        "document_valid": final_state.document_valid,
        "document_notes": final_state.document_notes,
        "improved_text": final_state.improved_text,
        "priority": final_state.priority_score,
        "compliance": final_state.compliance_check,
        "recommended_actions": final_state.recommended_actions,
        "escalation_needed": final_state.escalation_needed,
        "enrichment": enriched,
        "timestamp": datetime.now().isoformat(),
    }
