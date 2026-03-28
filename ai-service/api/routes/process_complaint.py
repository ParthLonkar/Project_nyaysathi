from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ProcessComplaintRequest(BaseModel):
    text: str
    location: str


class ProcessComplaintResponse(BaseModel):
    category: str
    department: str
    priority: str
    legal_strategy: str
    summary: str
    recommended_actions: list[str]


@router.post("/process-complaint", response_model=ProcessComplaintResponse)
async def process_complaint(payload: ProcessComplaintRequest):
    text_lower = payload.text.lower()

    if "water" in text_lower:
        category = "water"
        department = "Water Department"
        legal_strategy = "File a civic grievance and request immediate restoration with written acknowledgement."
        recommended_actions = [
            "Collect photos/videos showing the water issue.",
            "Submit complaint to local water authority.",
            "Request written timeline for resolution.",
        ]
    elif "garbage" in text_lower:
        category = "sanitation"
        department = "Sanitation Department"
        legal_strategy = "Escalate municipal sanitation complaint and seek regular waste collection compliance."
        recommended_actions = [
            "Document garbage accumulation with dates.",
            "Raise complaint with municipal sanitation office.",
            "Follow up through ward office escalation channel.",
        ]
    else:
        category = "general"
        department = "Municipal Grievance Cell"
        legal_strategy = "File a general municipal grievance and seek time-bound response."
        recommended_actions = [
            "Prepare a concise written complaint.",
            "Attach relevant evidence and location details.",
            "Track complaint number and follow up weekly.",
        ]

    priority = "high" if "urgent" in text_lower else "medium"

    return ProcessComplaintResponse(
        category=category,
        department=department,
        priority=priority,
        legal_strategy=legal_strategy,
        summary=f"Complaint categorized as {category} for {payload.location}.",
        recommended_actions=recommended_actions,
    )
