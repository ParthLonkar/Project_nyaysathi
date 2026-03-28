import json
import re
from typing import Optional

from app.services.openai_service import llm, GeminiQuotaExceeded
from app.utils.logger import log_info


OFFENSIVE_WORDS_MAP = {
    "idiot": "person",
    "stupid": "improper",
    "bloody": "very",
    "bastard": "individual",
    "harami": "individual",
    "kamina": "individual",
}


def _sanitize_abusive_language(text: str) -> str:
    sanitized = text or ""
    for bad_word, replacement in OFFENSIVE_WORDS_MAP.items():
        pattern = re.compile(rf"\b{re.escape(bad_word)}\b", re.IGNORECASE)
        sanitized = pattern.sub(replacement, sanitized)
    return sanitized


def _extract_json(raw: str) -> Optional[dict]:
    if not raw:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        start = raw.find("{")
        end = raw.rfind("}")
        if start == -1 or end == -1 or end <= start:
            return None
        try:
            return json.loads(raw[start : end + 1])
        except json.JSONDecodeError:
            return None


def improve_text(text: str) -> str:
    sanitized = _sanitize_abusive_language(text)
    if not sanitized.strip():
        return "Citizen submitted an empty complaint. Manual clarification required."
    return sanitized


def _department_line(department: Optional[str]) -> str:
    return department or "Municipal Grievance Cell"


def generate_complaint_draft(
    text: str,
    department: Optional[str],
    location: Optional[str],
    pre_improved_text: Optional[str] = None,
) -> str:
    improved = pre_improved_text or improve_text(text)
    dept = _department_line(department)
    loc = location or "the reported area"

    return (
        f"Subject: Complaint regarding civic issue in {loc}\n\n"
        f"To: {dept}\n\n"
        f"Complaint Details:\n{improved}\n\n"
        "Requested Action:\n"
        "Please investigate this issue, take corrective action at the earliest, and provide a written status update."
    )


def generate_rti_draft(
    text: str,
    department: Optional[str],
    pre_improved_text: Optional[str] = None,
) -> str:
    improved = pre_improved_text or improve_text(text)
    dept = _department_line(department)

    return (
        f"To: Public Information Officer, {dept}\n\n"
        "Subject: Request for information under the Right to Information Act\n\n"
        "Information requested:\n"
        "1. Action taken report on the grievance described below.\n"
        "2. Name and designation of the responsible officer.\n"
        "3. Expected timeline for resolution.\n"
        f"Context: {improved}\n\n"
        "Applicant details:\nNot provided"
    )


def validate_document(draft: str) -> dict:
    required_sections = ["subject", "to", "complaint details", "requested action"]
    draft_lower = (draft or "").lower()
    missing = [section for section in required_sections if section not in draft_lower]

    if not draft or len(draft.strip()) < 80:
        missing.append("minimum_content_length")

    if missing:
        return {
            "document_valid": False,
            "document_notes": f"Missing or weak sections: {', '.join(sorted(set(missing)))}",
        }

    return {
        "document_valid": True,
        "document_notes": "Document structure looks valid for MVP flow.",
    }


def build_document_intelligence(
    text: str,
    department: Optional[str] = None,
    location: Optional[str] = None,
    include_rti: bool = True,
) -> dict:
    sanitized = improve_text(text)
    dept = _department_line(department)
    loc = location or "the reported area"

    # Single LLM call for improved text + complaint draft + RTI draft + notes.
    prompt = f"""
You are NyaySathi Document Intelligence Agent.
Return STRICT JSON only with keys:
improved_text, complaint_draft, rti_draft, document_notes

Rules:
1) improved_text must keep original meaning, respectful tone.
2) complaint_draft must include exact sections:
   Subject
   To
   Complaint Details
   Requested Action
3) rti_draft must include exact sections:
   To: Public Information Officer
   Subject
   Information requested
   Applicant details
4) If RTI is not needed, still return a useful short draft.
5) No markdown fencing.

Department: {dept}
Location: {loc}
Include RTI: {str(include_rti).lower()}
Complaint text:
{sanitized}
"""

    payload = None
    try:
        response = llm.invoke(prompt)
        payload = _extract_json((getattr(response, "content", "") or "").strip())
    except GeminiQuotaExceeded:
        log_info("Fallback drafting used due to Gemini quota exhaustion")
    except Exception:
        log_info("Fallback drafting used due to Gemini invocation failure")

    improved = (payload or {}).get("improved_text") if isinstance(payload, dict) else None
    complaint_draft = (payload or {}).get("complaint_draft") if isinstance(payload, dict) else None
    rti_draft = (payload or {}).get("rti_draft") if isinstance(payload, dict) else None
    llm_document_notes = (payload or {}).get("document_notes") if isinstance(payload, dict) else None

    improved = (improved or sanitized).strip()
    complaint_draft = (complaint_draft or generate_complaint_draft(text, department, location, pre_improved_text=improved)).strip()
    rti_draft = (
        (rti_draft or generate_rti_draft(text, department, pre_improved_text=improved)).strip()
        if include_rti
        else ""
    )

    validation = validate_document(complaint_draft)
    final_notes = llm_document_notes or validation["document_notes"]

    return {
        "improved_text": improved,
        "complaint_draft": complaint_draft,
        "rti_draft": rti_draft,
        "document_valid": validation["document_valid"],
        "document_notes": final_notes,
    }
