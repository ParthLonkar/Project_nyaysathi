from typing import Optional

from app.services.legal_intelligence_service import analyze_legal_intelligence


def _merge_legal_hints(base: dict, category_hint: Optional[str], priority_hint: Optional[str]) -> dict:
    merged = dict(base or {})
    if category_hint and merged.get("category") in (None, "", "general"):
        merged["category"] = category_hint
    if priority_hint and priority_hint in {"low", "medium", "high", "critical"}:
        merged["priority"] = "high" if priority_hint == "critical" else priority_hint
    return merged


def build_ai_enrichment(
    text: str,
    location: str,
    category_hint: Optional[str] = None,
    priority_hint: Optional[str] = None,
) -> dict:
    legal = analyze_legal_intelligence(text=text or "", location=location or "")
    legal = _merge_legal_hints(legal, category_hint=category_hint, priority_hint=priority_hint)
    category = legal.get("category", "general")
    department = legal.get("department", "Municipal Grievance Cell")
    priority = legal.get("priority", "medium")
    legal_path = legal.get("legal_path", "manual_review")

    recommended_actions = [
        f"Register complaint with {department} and assign an accountable officer.",
        "Record supporting evidence and acknowledgement number.",
        "Share progress updates with the citizen against SLA checkpoints.",
    ]
    if legal_path in {"rti_only", "complaint_and_rti"}:
        recommended_actions.append("Prepare RTI seeking action-taken report and officer details.")

    legal_strategy = legal.get("legal_strategy") or "Document facts and pursue time-bound administrative remedy."
    summary = f"Complaint tagged as {category} for {location}. Priority set to {priority}."
    admin_brief = f"{category.title()} issue at {location}; prioritize departmental ownership and SLA tracking."
    staff_action_note = "Verify facts on ground, log evidence, and update status after first action."
    citizen_update = "Your complaint has been registered and routed to the concerned department for action."
    escalation_risk = legal.get("escalation_risk", "medium")

    return {
        "category": category,
        "department": department,
        "priority": priority,
        "legal_path": legal_path,
        "legal_strategy": legal_strategy,
        "summary": summary,
        "recommended_actions": recommended_actions,
        "admin_brief": admin_brief,
        "staff_action_note": staff_action_note,
        "citizen_update": citizen_update,
        "escalation_risk": escalation_risk,
        "manual_review": bool(legal.get("manual_review")),
        "confidence_score": float(legal.get("confidence_score", 0.5)),
        "decision_rationale": legal.get("decision_rationale", "Hybrid legal routing applied."),
    }


def build_fallback_ai_enrichment(text: str, location: str, reason: Optional[str] = None) -> dict:
    result = build_ai_enrichment(
        text=text,
        location=location,
        category_hint="general",
        priority_hint="medium",
    )
    result["summary"] = f"AI enrichment fallback used for complaint at {location}."
    result["citizen_update"] = "Your complaint is submitted. A team member will manually review and route it."
    result["manual_review"] = True
    result["legal_path"] = "manual_review"
    result["confidence_score"] = 0.3
    result["decision_rationale"] = "Fallback mode enabled because AI enrichment service failed."
    if reason:
        result["fallback_reason"] = reason
    return result
