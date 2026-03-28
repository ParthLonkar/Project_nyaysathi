from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import platform
from app.config.settings import settings
from app.utils.logger import log_info
from app.api.routes import process, health, process_complaint, documents
from app.services.openai_service import get_model_runtime_info

app = FastAPI(title="NyaySathi AI Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root_status():
    return {"status": "ok"}


# Include routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(process.router, prefix="/api", tags=["processing"])
app.include_router(process_complaint.router, tags=["processing"])
app.include_router(documents.router, prefix="/api", tags=["documents"])

log_info("FastAPI app initialized")


@app.on_event("startup")
async def app_startup():
    model_info = get_model_runtime_info()
    python_arch = platform.architecture()[0]
    log_info(
        "AI service startup configuration",
        extra={
            "gemini_configured_model": model_info.get("configured_model"),
            "gemini_active_model": model_info.get("active_model"),
            "python_version": platform.python_version(),
            "python_architecture": python_arch,
        },
    )
    if python_arch.startswith("32"):
        log_info(
            "Warning: 32-bit Python detected. Use 64-bit Python 3.13 for reliable dependency wheels (numpy/reportlab/langchain stack)."
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG,
    )
