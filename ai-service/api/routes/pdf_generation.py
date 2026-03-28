"""
PDF Generation Routes for Daily Reports
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, JSONResponse
import io
import logging
from app.services.daily_report_generator import generate_daily_report_pdf
from app.utils.logger import log_info, log_error

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/generate-daily-report-pdf")
async def generate_daily_report(report_data: dict):
    """
    Generate a daily complaint report PDF
    
    Args:
        report_data: Dictionary containing report information
        
    Returns:
        PDF file or error response
    """
    try:
        log_info(f"Generating daily report PDF for date: {report_data.get('reportDateISO', 'unknown')}")
        
        # Generate PDF
        pdf_content = generate_daily_report_pdf(report_data)
        
        if not pdf_content:
            log_error("PDF generation returned empty content")
            raise HTTPException(status_code=500, detail="Failed to generate PDF")
        
        # Return PDF as file
        output = io.BytesIO(pdf_content)
        output.seek(0)
        
        report_date = report_data.get('reportDateISO', 'report')
        filename = f"Daily_Report_{report_date}.pdf"
        
        log_info(f"Daily report PDF generated successfully: {filename}")
        
        return FileResponse(
            path=output,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        log_error(f"Error generating daily report PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")


@router.get("/health/pdf")
async def pdf_service_health():
    """
    Health check for PDF service
    """
    return {
        "status": "healthy",
        "service": "pdf_generation",
        "message": "PDF generation service is running"
    }
