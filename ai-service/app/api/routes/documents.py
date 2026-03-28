from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import io
from app.services.pdf_generator import generate_rti_pdf, generate_complaint_draft_pdf

router = APIRouter()


@router.post("/generate-rti-pdf")
async def generate_rti_pdf_endpoint(complaint_data: dict):
    """Generate and return RTI PDF"""
    try:
        pdf_bytes = generate_rti_pdf(complaint_data)
        
        return FileResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            filename=f"RTI_Application_{complaint_data.get('complaint_id', 'unknown')}.pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-complaint-pdf")
async def generate_complaint_pdf_endpoint(complaint_data: dict, complaint_draft: str):
    """Generate and return Complaint Draft PDF"""
    try:
        pdf_bytes = generate_complaint_draft_pdf(complaint_data, complaint_draft)
        
        return FileResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            filename=f"Complaint_Draft_{complaint_data.get('complaint_id', 'unknown')}.pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
