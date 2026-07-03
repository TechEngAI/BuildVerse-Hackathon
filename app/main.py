import logging
import os
import sys
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app import auth
from app.clients import get_redis_client, get_supabase_client, validate_env
from app.logging_config import configure_logging
from app.routers import budget, foi, ghost, reality

configure_logging()
logger = logging.getLogger(__name__)

sys.path.append(os.path.dirname(os.path.abspath(__file__)))


class HealthResponse(BaseModel):
    status: str
    supabase: str
    redis: str


app = FastAPI(
    title="CivicPulse API",
    description="Backend API for civic budget transparency workflows.",
    version="0.1.0",
)

# Update this default frontend origin to the final deployed frontend URL once it is known.
allowed_origins_env = os.environ.get("ALLOWED_ORIGINS", "https://civicpulse-app.vercel.app")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
if not allowed_origins:
    raise RuntimeError(
        "ALLOWED_ORIGINS must be set to the deployed frontend origin(s); do not use '*'."
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(budget.router)
app.include_router(ghost.router)
app.include_router(foi.router)
app.include_router(reality.router)


@app.on_event("startup")
async def startup() -> None:
    validate_env()


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception for %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"error": "Something went wrong, please try again"},
    )


@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Report whether the API process is running and whether key dependencies are reachable."""
    supabase_status = "connected"
    redis_status = "connected"

    try:
        supabase = await get_supabase_client(service_role=True)
        await supabase.table("profiles").select("id").limit(1).execute()
    except Exception as exc:
        logger.warning("Supabase health check failed: %s", exc)
        supabase_status = "error"

    try:
        redis_client = get_redis_client()
        if redis_client is None:
            redis_status = "not_configured"
        else:
            await redis_client.ping()
    except Exception as exc:
        logger.warning("Redis health check failed: %s", exc)
        redis_status = "error"

    overall_status = "ok"
    if supabase_status != "connected" or redis_status not in {"connected", "not_configured"}:
        overall_status = "degraded"

    return HealthResponse(status=overall_status, supabase=supabase_status, redis=redis_status)
if __name__ == "__main__":
    import uvicorn
    import os
    # Railway provides the port via an environment variable
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
