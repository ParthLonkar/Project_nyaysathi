import json
import re
from typing import Any, Optional

from app.services.openai_service import llm


DEPARTMENT_RULES = [
    {"category": "water", "department": "Water Department", "keywords": ["water", "pipeline", "no supply", "tap", "sewage", "leakage", "drinking water"]},
    {"category": "electricity", "department": "Electricity Board", "keywords": ["electricity", "power", "outage", "transformer", "voltage", "meter"]},
    {"category": "sanitation", "department": "Municipal Sanitation", "keywords": ["garbage", "waste", "sewer", "drain", "sanitation", "trash"]},
    {"category": "roads", "department": "Public Works / Roads", "keywords": ["road", "pothole", "street", "footpath", "bridge"]},
    {"category": "police", "department": "Police", "keywords": ["threat", "assault", "violence", "harassment", "stalking", "unsafe", "crime"]},
    {"category": "education", "department": "Education Department", "keywords": ["school", "teacher", "student", "scholarship", "education", "college"]},
    {"category": "revenue", "department": "Revenue Department", "keywords": ["land", "property tax", "mutation", "revenue", "patta", "registry"]},
    {"category": "consumer", "department": "Consumer Grievance Cell", "keywords": ["bill", "overcharge", "refund", "defective", "consumer", "service provider"]},
    {"category": "social_welfare", "department": "Social Welfare Department", "keywords": ["pension", "ration", "benefit", "widow", "disability", "welfare"]},
]

FALLBACK_CATEGORY = "general"
FALLBACK_DEPARTMENT = "Municipal Grievance Cell"

RTI_HINTS = [
    "rti",
    "information",
    "status report",
    "action taken",
    "copy of",
    "provide details",
    "under rti",
]

REPEATED_NO_ACTION_HINTS = [
    "already complained",
    "no action",
    "still pending",
    "repeated",
    "many times",
    "again and again",
]

HIGH_PRIORITY_HINTS = [
    "urgent",
    "emergency",
    "immediately",
    "critical",
    "danger",
    "unsafe",
    "public health",
    "children affected",
    "hospital",
]


def _normalize(text: str) -> str:
    return " ".join((text or "").split()).strip()


def _contains_any(text_lower: str, phrases: list[str]) -> bool:
    return any(phrase in text_lower for phrase in phrases)


def _token_count(text: str) -> int:
    return len(re.findall(r"[a-zA-Z0-9']+", text or ""))


def _score_rule(text_lower: str, rule: dict[str, Any]) -> int:
    return sum(1 for kw in rule["keywords"] if kw in text_lower)


def _build_legal_strategy(legal_path: str, department: str) -> str:
    if legal_path == "rti_only":
        return f"Prepare RTI to the Public Information Officer of {department} seeking action taken details and records."
    if legal_path == "complaint_and_rti":
        return f"File a formal grievance with {department} and parallel RTI for action-taken records if delays continue."
    if legal_path == "manual_review":
        return "Route for manual legal triage to clarify facts, identify department, and decide complaint/RTI sequence."
    return f"File grievance with {department}, collect evidence, and escalate administratively if SLA is breached."


def _deterministic_analysis(text: str, location: str = "") -> dict[str, Any]:
    source = _normalize(f"{text} {location}")
    text_lower = source.lower()

    scored = []
    for rule in DEPARTMENT_RULES:
        score = _score_rule(text_lower, rule)
        scored.append((score, rule))

    scored.sort(key=lambda item: item[0], reverse=True)
    top_score, top_rule = scored[0]
    second_score = scored[1][0] if len(scored) > 1 else 0

    category = top_rule["category"] if top_score > 0 else FALLBACK_CATEGORY
    department = top_rule["department"] if top_score > 0 else FALLBACK_DEPARTMENT

    is_repeated_no_action = _contains_any(text_lower, REPEATED_NO_ACTION_HINTS)
    is_rti_signal = _contains_any(text_lower, RTI_HINTS)
    is_high_impact = _contains_any(text_lower, HIGH_PRIORITY_HINTS)
    is_vague = _token_count(source) < 8 or source.lower() in {"help", "problem", "issue", "complaint"}

    if is_vague:
        legal_path = "manual_review"
    elif is_rti_signal and top_score > 0:
        legal_path = "complaint_and_rti"
    elif is_rti_signal and top_score == 0:
        legal_path = "rti_only"
    else:
        legal_path = "complaint_only"

    if is_high_impact or category in {"police"}:
        priority = "high"
    elif is_repeated_no_action:
        priority = "high"
    elif top_score == 0:
        priority = "medium"
    else:
        priority = "medium"

    if legal_path == "manual_review":
        manual_review = True
    else:
        manual_review = bool(is_vague and top_score == 0)

    if is_high_impact and is_repeated_no_action:
        escalation_risk = "high"
    elif is_repeated_no_action or legal_path == "complaint_and_rti":
        escalation_risk = "medium"
    else:
        escalation_risk = "low"

    confidence = 0.45
    if top_score > 0:
        confidence += min(0.35, top_score * 0.1)
    if top_score > second_score:
        confidence += 0.1
    if legal_path == "manual_review":
        confidence -= 0.15
    if is_vague:
        confidence -= 0.1
    confidence = max(0.2, min(0.95, round(confidence, 2)))

    rationale_parts = []
    if top_score > 0:
        rationale_parts.append(f"Matched civic keywords to {department}.")
    else:
        rationale_parts.append("No strong department keywords found; using fallback department.")
    if is_rti_signal:
        rationale_parts.append("Information-seeking language indicates RTI relevance.")
    if is_repeated_no_action:
        rationale_parts.append("Repeated no-action signal suggests stronger escalation handling.")
    if is_high_impact:
        rationale_parts.append("Urgency/public-safety signal increases priority.")
    if is_vague:
        rationale_parts.append("Complaint is vague; manual review recommended.")

    return {
        "category": category,
        "department": department,
        "priority": priority,
        "legal_path": legal_path,
        "legal_strategy": _build_legal_strategy(legal_path, department),
        "escalation_risk": escalation_risk,
        "manual_review": manual_review,
        "confidence_score": confidence,
        "decision_rationale": " ".join(rationale_parts),
    }


def _parse_json_response(raw: str) -> Optional[dict[str, Any]]:
    if not raw:
        return None
    raw = raw.strip()
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, dict):
            return parsed
    except Exception:
        pass

    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    try:
        parsed = json.loads(raw[start : end + 1])
        return parsed if isinstance(parsed, dict) else None
    except Exception:
        return None


def _llm_refine_if_needed(base: dict[str, Any], text: str, location: str = "") -> dict[str, Any]:
    ambiguous = base.get("confidence_score", 0) < 0.62 or base.get("manual_review") is True
    if not ambiguous:
        return base

    prompt = f"""
You are the Legal Intelligence Agent for civic complaints.
Refine this routing decision. Return strict JSON only with keys:
category, department, priority, legal_path, legal_strategy, escalation_risk, manual_review, confidence_score, decision_rationale

Allowed legal_path values: complaint_only, rti_only, complaint_and_rti, manual_review
Allowed escalation_risk values: low, medium, high
Confidence score must be 0.0 to 1.0.

Complaint text: {text}
Location: {location}
Current decision: {json.dumps(base, ensure_ascii=True)}
"""

    try:
        response = llm.invoke(prompt)
        parsed = _parse_json_response(getattr(response, "content", "") or "")
        if not parsed:
            return base

        merged = dict(base)
        for field in [
            "category",
            "department",
            "priority",
            "legal_path",
            "legal_strategy",
            "escalation_risk",
            "manual_review",
            "confidence_score",
            "decision_rationale",
        ]:
            if field in parsed and parsed[field] not in (None, ""):
                merged[field] = parsed[field]

        try:
            merged["confidence_score"] = float(merged.get("confidence_score", base["confidence_score"]))
        except Exception:
            merged["confidence_score"] = base["confidence_score"]
        merged["confidence_score"] = max(0.0, min(1.0, round(merged["confidence_score"], 2)))

        merged["manual_review"] = bool(merged.get("manual_review"))
        if merged.get("legal_path") not in {"complaint_only", "rti_only", "complaint_and_rti", "manual_review"}:
            merged["legal_path"] = base["legal_path"]

        if not merged.get("legal_strategy"):
            merged["legal_strategy"] = _build_legal_strategy(merged["legal_path"], merged.get("department", FALLBACK_DEPARTMENT))
        return merged
    except Exception:
        return base


def analyze_legal_intelligence(text: str, location: str = "") -> dict[str, Any]:
    base = _deterministic_analysis(text=text, location=location)
    refined = _llm_refine_if_needed(base, text=text, location=location)

    # Final safety normalization
    refined["category"] = refined.get("category") or FALLBACK_CATEGORY
    refined["department"] = refined.get("department") or FALLBACK_DEPARTMENT
    refined["priority"] = refined.get("priority") or "medium"
    refined["legal_path"] = refined.get("legal_path") or "manual_review"
    refined["manual_review"] = bool(refined.get("manual_review"))
    refined["escalation_risk"] = refined.get("escalation_risk") or "medium"
    refined["decision_rationale"] = refined.get("decision_rationale") or "Rule-based legal routing applied."
    refined["legal_strategy"] = refined.get("legal_strategy") or _build_legal_strategy(
        refined["legal_path"], refined["department"]
    )
    refined["confidence_score"] = max(0.0, min(1.0, float(refined.get("confidence_score", 0.5))))

    return refined
