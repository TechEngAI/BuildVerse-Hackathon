import asyncio
import logging
from decimal import Decimal
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from pydantic import BaseModel, Field, field_validator

from app.auth import CurrentUser, get_current_user
from app.clients import GROK_TEXT_MODEL, GROK_VISION_MAX_TOKENS, get_grok_client, get_supabase_client

router = APIRouter(prefix="/reality", tags=["reality"])
logger = logging.getLogger(__name__)


class ProgramReportRequest(BaseModel):
    program_name: str = Field(..., min_length=2, max_length=120)
    lga: str = Field(..., min_length=2, max_length=120)
    state: str = Field(..., min_length=2, max_length=120)
    received: bool
    amount_ngn: Decimal | None = Field(default=None, ge=0)

    @field_validator("program_name", "lga", "state")
    @classmethod
    def validate_location_text(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 2:
            raise ValueError("value must be at least 2 characters long")
        return cleaned


class ProgramReportResponse(BaseModel):
    message: str
    record_id: UUID


class RealityScoreResponse(BaseModel):
    program_name: str
    total_reports: int
    received_count: int
    reality_score_pct: float
    summary: str


class ProgramsListResponse(BaseModel):
    programs: list[str]


def generate_reality_summary(program_name: str, total_reports: int, received_count: int, score: float) -> str:
    prompt = (
        "Write one short, punchy public-facing sentence summarizing this social program reality check. "
        "Use plain language and avoid markdown.\n\n"
        f"Program: {program_name}\n"
        f"Total citizen reports: {total_reports}\n"
        f"Reports saying benefits were received: {received_count}\n"
        f"Reality score: {score:.1f}%"
    )

    try:
        response = get_grok_client().chat.completions.create(
            model=GROK_TEXT_MODEL,
            max_tokens=GROK_VISION_MAX_TOKENS,
            temperature=0.2,
            messages=[{"role": "user", "content": prompt}],
        )
        summary = (response.choices[0].message.content or "").strip()
    except Exception as exc:
        logger.exception("Unable to generate reality score summary with Grok")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to generate program summary.",
        ) from exc

    if not summary:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to generate program summary.",
        )
    return summary


def _program_names_from_rows(rows: list[dict[str, Any]]) -> list[str]:
    names = {str(row["program_name"]).strip() for row in rows if row.get("program_name")}
    return sorted(names)


@router.post("/report", response_model=ProgramReportResponse)
async def report_program_reality(
    request: ProgramReportRequest,
    current_user: CurrentUser = Depends(get_current_user),
) -> ProgramReportResponse:
    """Store a citizen verification report for a social program."""
    record = {
        "user_id": current_user.id,
        "program_name": request.program_name,
        "lga": request.lga,
        "state": request.state,
        "received": request.received,
        "amount_ngn": str(request.amount_ngn) if request.amount_ngn is not None else None,
    }

    try:
        supabase = await get_supabase_client(service_role=True)
        response = await supabase.table("program_verifications").insert(record).execute()
    except Exception as exc:
        logger.exception("Unable to store social program verification")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to store program report.",
        ) from exc

    data = getattr(response, "data", None)
    if not data or not isinstance(data, list) or not data[0].get("id"):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Supabase insert succeeded but did not return a record id.",
        )

    return ProgramReportResponse(
        message="Program report received.",
        record_id=UUID(str(data[0]["id"])),
    )


@router.get("/score/{program_name}", response_model=RealityScoreResponse)
async def get_reality_score(
    program_name: str = Path(..., min_length=2, max_length=120),
) -> RealityScoreResponse:
    """Return the public reality score for one social program."""
    try:
        supabase = await get_supabase_client()
        response = (
            await supabase.table("program_verifications")
            .select("received")
            .eq("program_name", program_name)
            .execute()
        )
    except Exception as exc:
        logger.exception("Unable to load reality score for program %s", program_name)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to load program score.",
        ) from exc

    rows = getattr(response, "data", None) or []
    total_reports = len(rows)
    if total_reports == 0:
        return RealityScoreResponse(
            program_name=program_name,
            total_reports=0,
            received_count=0,
            reality_score_pct=0,
            summary="No reports yet for this program.",
        )

    received_count = sum(1 for row in rows if row.get("received") is True)
    score = (received_count / total_reports) * 100
    summary = await asyncio.to_thread(
        generate_reality_summary,
        program_name,
        total_reports,
        received_count,
        score,
    )

    return RealityScoreResponse(
        program_name=program_name,
        total_reports=total_reports,
        received_count=received_count,
        reality_score_pct=score,
        summary=summary,
    )


@router.get("/programs", response_model=ProgramsListResponse)
async def list_programs(
    limit: int = Query(default=500, ge=1, le=1000),
) -> ProgramsListResponse:
    """Return distinct social program names with at least one citizen report."""
    try:
        supabase = await get_supabase_client()
        response = (
            await supabase.table("program_verifications")
            .select("program_name")
            .limit(limit)
            .execute()
        )
    except Exception as exc:
        logger.exception("Unable to list social programs")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to load programs.",
        ) from exc

    return ProgramsListResponse(programs=_program_names_from_rows(getattr(response, "data", None) or []))
