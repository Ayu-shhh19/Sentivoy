from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import asyncio

from app.core.config import get_settings
from app.core.keep_alive import keep_alive_loop
from app.core.rate_limiter import setup_rate_limiter
from app.api import logs, anomalies, keys, dashboard, reports, notifications, live_logs
from app.ml.models import load_models

load_dotenv()
settings = get_settings()

app = FastAPI(title=settings.app_name, version="1.0.0", debug=settings.debug)

# Setup Rate Limiter
setup_rate_limiter(app)

# Configure CORS
origins = [
    settings.frontend_url,
    "http://localhost:5173",
    "http://localhost:8080"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(logs.router)
app.include_router(anomalies.router)
app.include_router(keys.router)
app.include_router(dashboard.router)
app.include_router(reports.router)
app.include_router(notifications.router)
app.include_router(live_logs.router)

@app.on_event("startup")
async def startup_event():
    """Ensure ML model is loaded into memory on boot."""
    print("Loading ML models...")
    _ = load_models()
    app.state.keep_alive_task = asyncio.create_task(keep_alive_loop())

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.app_name} API"}

@app.get("/api/health")
def health():
    """Cheap public check. Render keep-alive and uptime monitors should call this."""
    return {"status": "ok"}
