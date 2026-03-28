import re
from typing import Any, Dict, List, Optional


def normalize_text(value: Optional[str]) -> str:
    return (value or "").strip()


def tokenize_lower(text: str) -> List[str]:
    return re.findall(r"[a-zA-Z0-9']+", (text or "").lower())


def detect_category(text: str, category_hint: Optional[str] = None) -> str:
    lowered = (text or "").lower()

    category_keywords = {
        "water": ["water", "pipeline", "no supply", "sewage", "leakage"],
        "sanitation": ["garbage", "waste", "cleaning", "drain", "sewer"],
        "roads": ["road", "pothole", "street", "footpath"],
        "electricity": ["electricity", "power", "transformer", "voltage", "outage"],
        "harassment": ["harassment", "threat", "assault", "abuse", "violence"],
        "corruption": ["bribe", "corruption", "kickback", "extortion"],
    }

    for category, words in category_keywords.items():
      if any(word in lowered for word in words):
          return category

    return category_hint or "general"


def infer_department(category: str) -> str:
    mapping = {
        "water": "Water Department",
        "sanitation": "Sanitation Department",
        "roads": "Public Works Department",
        "electricity": "Electricity Board",
        "harassment": "Police Department",
        "corruption": "Vigilance Department",
        "general": "Municipal Grievance Cell",
    }
    return mapping.get(category, "Municipal Grievance Cell")


def infer_location(text: str) -> Optional[str]:
    patterns = [
        r"(?:in|at|near)\s+([A-Za-z0-9\-\s,]{3,60})",
        r"(?:ward|sector)\s+([A-Za-z0-9\-]{1,20})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text or "", re.IGNORECASE)
        if match:
            return match.group(1).strip(" ,.")
    return None


def infer_duration(text: str) -> Optional[str]:
    match = re.search(r"(\d+\s*(?:day|days|week|weeks|month|months|year|years))", text or "", re.IGNORECASE)
    return match.group(1) if match else None


def infer_evidence(text: str) -> List[str]:
    lowered = (text or "").lower()
    evidence = []
    if "photo" in lowered or "image" in lowered:
        evidence.append("photo")
    if "video" in lowered:
        evidence.append("video")
    if "recording" in lowered or "audio" in lowered:
        evidence.append("audio")
    if "document" in lowered or "receipt" in lowered:
        evidence.append("document")
    if "witness" in lowered:
        evidence.append("witness")
    return evidence


def compute_priority_score(text: str, category: str) -> float:
    lowered = (text or "").lower()
    score = 0.35

    if any(word in lowered for word in ["urgent", "emergency", "immediately", "critical"]):
        score += 0.3
    if any(word in lowered for word in ["child", "elderly", "hospital", "school"]):
        score += 0.15
    if category in {"harassment", "corruption"}:
        score += 0.2
    if any(word in lowered for word in ["days", "weeks", "months"]):
        score += 0.05

    return max(0.0, min(1.0, round(score, 2)))


def priority_label(score: float) -> str:
    if score >= 0.8:
        return "high"
    if score >= 0.5:
        return "medium"
    return "low"


def safe_excerpt(text: str, max_len: int = 220) -> str:
    compact = " ".join((text or "").split())
    if len(compact) <= max_len:
        return compact
    return compact[: max_len - 3].rstrip() + "..."


def build_agent_flow(stage_updates: Dict[str, str]) -> Dict[str, str]:
    base = {
        "intake": "pending",
        "legal_analysis": "pending",
        "drafting": "pending",
        "compliance": "pending",
        "priority": "pending",
        "action": "pending",
    }
    base.update(stage_updates or {})
    return base


def merge_dict(base: Dict[str, Any], patch: Dict[str, Any]) -> Dict[str, Any]:
    result = dict(base or {})
    result.update(patch or {})
    return result
