from fastapi import APIRouter, HTTPException
from app.services.supabase_service import get_complaint, save_complaint_analysis
from app.graph.complaint_graph import create_complaint_graph, format_result
from app.graph.state import ComplaintState
from app.utils.logger import log_info, log_error

router = APIRouter()

# Initialize the complaint processing graph
complaint_graph = create_complaint_graph()


@router.post("/process")
async def process_complaint(complaint_data: dict):
    """Process a legal complaint through the AI workflow"""
    try:
        complaint_id = complaint_data.get('complaint_id')

        log_info(f"Starting complaint processing: {complaint_id}")

        # Create initial state
        initial_state = ComplaintState(
            complaint_id=complaint_id,
            title=complaint_data.get('title'),
            description=complaint_data.get('description'),
            category=complaint_data.get('category'),
        )

        # Run the graph
        final_state = complaint_graph.invoke(initial_state)

        # Format and save results
        result = format_result(final_state)
        await save_complaint_analysis(complaint_id, result)

        log_info(f"Complaint processing completed: {complaint_id}")
        return result

    except Exception as e:
        log_error(f"Error processing complaint: {str(e)}", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{complaint_id}")
async def get_status(complaint_id: str):
    """Get processing status of a complaint"""
    try:
        complaint = await get_complaint(complaint_id)
        return {
            "complaint_id": complaint_id,
            "status": complaint.get('status'),
        }
    except Exception as e:
        log_error(f"Error getting status: {str(e)}", e)
        raise HTTPException(status_code=404, detail="Complaint not found")
