from supabase import create_client
from app.config.settings import Settings

settings = Settings()

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


async def save_complaint_analysis(complaint_id: str, analysis: dict):
    """Save analysis results to Supabase"""
    result = supabase.table("complaints").update({
        "ai_analysis": analysis,
        "status": "processed",
    }).eq("id", complaint_id).execute()
    
    return result.data[0] if result.data else None


async def get_complaint(complaint_id: str):
    """Get complaint from Supabase"""
    result = supabase.table("complaints").select("*").eq("id", complaint_id).single().execute()
    return result.data


async def update_complaint_status(complaint_id: str, status: str):
    """Update complaint status"""
    result = supabase.table("complaints").update({
        "status": status,
    }).eq("id", complaint_id).execute()
    
    return result.data[0] if result.data else None
