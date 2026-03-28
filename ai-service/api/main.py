from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.utils.logger import log_info
from api.routes import process, health, process_complaint, pdf_generation

app = FastAPI(title="NyaySathi AI Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(process.router, prefix="/api", tags=["processing"])
app.include_router(process_complaint.router, tags=["processing"])
app.include_router(pdf_generation.router, tags=["pdf_generation"])

log_info("FastAPI app initialized")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG,
    )
