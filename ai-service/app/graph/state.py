from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ComplaintState(BaseModel):
    """State for complaint processing workflow"""
    complaint_id: str
    title: str
    description: str
    category: str
    legal_analysis: Optional[dict] = None
    draft_document: Optional[str] = None
    complaint_draft: Optional[str] = None
    rti_draft: Optional[str] = None
    complaint_pdf: Optional[bytes] = None
    rti_pdf: Optional[bytes] = None
    document_valid: Optional[bool] = None
    document_notes: Optional[str] = None
    improved_text: Optional[str] = None
    priority_score: Optional[float] = None
    compliance_check: Optional[dict] = None
    recommended_actions: Optional[list] = None
    escalation_needed: Optional[bool] = False
    current_stage: str = "intake"
    status: str = "processing"
    errors: list = Field(default_factory=list)


class ComplaintInput(BaseModel):
    """Input for complaint processing"""
    complaint_id: str
    title: str
    description: str
    category: str
