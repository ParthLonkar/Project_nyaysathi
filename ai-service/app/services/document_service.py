import json
import re
from typing import Optional

from app.services.openai_service import llm


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

    prompt = f"""
You are a civic grievance writing assistant.
Rewrite the complaint in formal, clear, respectful English.
Preserve factual meaning. Do not invent details.
Return only the improved complaint text.

Complaint:
{sanitized}
"""
    try:
        response = llm.invoke(prompt)
        content = (response.content or "").strip()
        return content or sanitized
    except Exception:
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

    prompt = f"""
Draft a formal civic complaint letter with the exact sections:
1) Subject
2) To
3) Complaint Details
4) Requested Action

Use this information:
- Department: {dept}
- Location: {loc}
- Complaint text: {improved}

Return only the final draft text, no markdown.
"""
    try:
        response = llm.invoke(prompt)
        content = (response.content or "").strip()
        if content:
            return content
    except Exception:
        pass

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

    prompt = f"""
Draft an RTI application with the exact sections:
1) To: Public Information Officer
2) Subject
3) Information requested
4) Applicant details (if available; otherwise write 'Not provided')

Context department: {dept}
Complaint context: {improved}

Return only the final RTI draft text, no markdown.
"""
    try:
        response = llm.invoke(prompt)
        content = (response.content or "").strip()
        if content:
            return content
    except Exception:
        pass

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
    improved = improve_text(text)
    complaint_draft = generate_complaint_draft(text, department, location, pre_improved_text=improved)
    rti_draft = generate_rti_draft(text, department, pre_improved_text=improved) if include_rti else ""
    validation = validate_document(complaint_draft)

    return {
        "improved_text": improved,
        "complaint_draft": complaint_draft,
        "rti_draft": rti_draft,
        "document_valid": validation["document_valid"],
        "document_notes": validation["document_notes"],
    }
