import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
from app.database import engine, Base
from app.routers import api
from app.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Surovi Agro Industries Dashboard API",
    description="API for Sales & Collection Dashboard",
    version="1.0.0"
)

# Serve frontend static files (production)
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")
if os.path.exists(FRONTEND_DIR):
    app.mount("/surovidash/assets", StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")), name="assets")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers under /surovidash/api
app.include_router(api.router, prefix="/surovidash/api", tags=["API"])


@app.get("/")
def root():
    return RedirectResponse(url="/surovidash")


@app.get("/surovidash")
@app.get("/surovidash/")
def surovidash_root():
    if os.path.exists(FRONTEND_DIR):
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
    return {"message": "Surovi Dashboard", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# Serve frontend for all /surovidash/* routes (SPA support)
@app.get("/surovidash/{full_path:path}")
def serve_frontend(full_path: str):
    if os.path.exists(FRONTEND_DIR):
        file_path = os.path.join(FRONTEND_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
    return {"error": "Frontend not built"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.API_HOST, port=settings.API_PORT)
