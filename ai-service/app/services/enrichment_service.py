from typing import Optional


def _infer_category_and_department(text_lower: str, category_hint: Optional[str] = None) -> tuple[str, str]:
    if "water" in text_lower:
        return "water", "Water Department"
    if "garbage" in text_lower or "waste" in text_lower:
        return "sanitation", "Sanitation Department"
    if "road" in text_lower or "pothole" in text_lower:
        return "roads", "Public Works Department"
    if category_hint:
        return category_hint, "Municipal Grievance Cell"
    return "general", "Municipal Grievance Cell"


def _infer_priority(text_lower: str, priority_hint: Optional[str] = None) -> str:
    if priority_hint in {"low", "medium", "high", "critical"}:
        return priority_hint
    if "urgent" in text_lower or "emergency" in text_lower or "immediately" in text_lower:
        return "high"
    return "medium"


def generate_escalation_risk(category: str, priority: str, text: str) -> str:
    text_lower = (text or "").lower()

    if priority == "high":
        return "High urgency detected. Escalate if no action is taken within 24 hours."
    if "corruption" in text_lower or "bribe" in text_lower:
        return "Potential corruption signal. Escalate to senior authority for independent review."
    if category in {"water", "sanitation"}:
        return "Essential civic service issue. Escalate if unresolved beyond SLA timeline."
    return "Monitor at department level; escalate if repeated non-resolution is observed."


def build_ai_enrichment(
    text: str,
    location: str,
    category_hint: Optional[str] = None,
    priority_hint: Optional[str] = None,
) -> dict:
    text_lower = (text or "").lower()
    category, department = _infer_category_and_department(text_lower, category_hint=category_hint)
    priority = _infer_priority(text_lower, priority_hint=priority_hint)

    recommended_actions = [
        "Register the grievance with supporting evidence.",
        "Set an internal resolution SLA and assign owner.",
        "Share progress updates with the citizen at regular intervals.",
    ]

    legal_strategy = "Document facts, map to local civic obligations, and pursue time-bound administrative remedy."
    summary = f"Complaint tagged as {category} for {location}. Priority set to {priority}."
    admin_brief = f"{category.title()} issue at {location}; prioritize departmental ownership and SLA tracking."
    staff_action_note = "Verify facts on ground, log evidence, and update status after first action."
    citizen_update = "Your complaint has been registered and routed to the concerned department for action."
    escalation_risk = generate_escalation_risk(category, priority, text)

    return {
        "category": category,
        "department": department,
        "priority": priority,
        "legal_strategy": legal_strategy,
        "summary": summary,
        "recommended_actions": recommended_actions,
        "admin_brief": admin_brief,
        "staff_action_note": staff_action_note,
        "citizen_update": citizen_update,
        "escalation_risk": escalation_risk,
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
    if reason:
        result["fallback_reason"] = reason
    return result
