import asyncio
import json
import logging
import os
import tempfile
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any
from uuid import UUID

import pdfplumber
from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile, status
from pydantic import BaseModel, Field

from app.auth import CurrentUser, get_current_user
from app.clients import GROK_TEXT_MODEL, get_grok_client, get_supabase_client, get_or_set_cache
from app.utils import bearer_token_from_header

router = APIRouter(prefix="/budget", tags=["budget"])
logger = logging.getLogger(__name__)


class BudgetPdfUploadResponse(BaseModel):
    ministry: str
    year: int
    extracted_text: str


class BudgetDeviationRequest(BaseModel):
    ministry: str = Field(..., min_length=1)
    state: str | None = Field(default=None, min_length=1)
    year: int = Field(..., ge=1900, le=2200)
    allocated_ngn: Decimal = Field(..., gt=0)
    actual_ngn: Decimal = Field(..., ge=0)


class BudgetDeviationResponse(BaseModel):
    record_id: UUID
    deviation_pct: Decimal
    alert_fired: bool
    ai_summary_en: str
    ai_summary_pidgin: str


class BudgetSummary(BaseModel):
    english: str
    pidgin: str


def _debug_enabled() -> bool:
    return os.environ.get("DEBUG", "").lower() in {"1", "true", "yes"}


def _parse_grok_summary(raw_text: str) -> BudgetSummary:
    try:
        parsed = json.loads(raw_text)
        return BudgetSummary.model_validate(parsed)
    except (json.JSONDecodeError, ValueError, TypeError) as exc:
        if _debug_enabled():
            logger.debug(
                "Grok returned invalid budget summary JSON. Response length=%s",
                len(raw_text),
            )
        logger.error("Grok returned invalid budget summary JSON.")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Grok returned an invalid JSON summary response.",
        ) from exc


def generate_budget_summary(
    ministry: str,
    year: int,
    allocated_ngn: Decimal,
    actual_ngn: Decimal,
    deviation_pct: Decimal,
) -> BudgetSummary:
    """Ask Grok for reusable budget deviation summaries."""
    prompt = (
        "You are helping explain Nigerian public budget transparency data. "
        "Write a short plain-English explanation and a short Nigerian Pidgin "
        "explanation of this budget deviation. "
        "Return ONLY valid JSON in this exact shape with no markdown fences, "
        'preamble, or extra keys: {"english": "...", "pidgin": "..."}\n\n'
        f"Ministry: {ministry}\n"
        f"Year: {year}\n"
        f"Allocated budget: NGN {allocated_ngn}\n"
        f"Actual spending: NGN {actual_ngn}\n"
        f"Deviation percentage: {deviation_pct:.2f}%"
    )

    try:
        response = get_grok_client().chat.completions.create(
            model=GROK_TEXT_MODEL,
            max_tokens=300,
            temperature=0.2,
            messages=[{"role": "user", "content": prompt}],
        )
        raw_text = response.choices[0].message.content or ""
    except Exception as exc:
        logger.exception("Unable to generate budget summary with Grok")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to generate budget summary.",
        ) from exc

    return _parse_grok_summary(raw_text)


def calculate_deviation_pct(allocated_ngn: Decimal, actual_ngn: Decimal) -> Decimal:
    """Calculate how far actual spending moved from the allocated budget."""
    try:
        return ((actual_ngn - allocated_ngn) / allocated_ngn) * Decimal("100")
    except (InvalidOperation, ZeroDivisionError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="allocated_ngn must be a valid number greater than zero.",
        ) from exc


def _record_id_from_supabase_response(response: Any) -> UUID:
    data = getattr(response, "data", None)
    if not data or not isinstance(data, list) or not data[0].get("id"):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Supabase insert succeeded but did not return a record id.",
        )
    return UUID(str(data[0]["id"]))


async def insert_budget_record(
    request: BudgetDeviationRequest,
    deviation_pct: Decimal,
    alert_fired: bool,
    summary: BudgetSummary,
    current_user: CurrentUser,
    access_token: str,
) -> UUID:
    """Persist one budget deviation record in Supabase under the authenticated user."""
    record = {
        "user_id": current_user.id,
        "ministry": request.ministry,
        "state": request.state,
        "year": request.year,
        "allocated_ngn": str(request.allocated_ngn),
        "actual_ngn": str(request.actual_ngn),
        "deviation_pct": str(deviation_pct),
        "alert_fired": alert_fired,
        "ai_summary_en": summary.english,
        "ai_summary_pidgin": summary.pidgin,
    }

    try:
        supabase = await get_supabase_client(access_token=access_token)
        response = await supabase.table("budget_records").insert(record).execute()
        return _record_id_from_supabase_response(response)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Unable to insert budget record into Supabase: {exc}",
        ) from exc


def _read_pdf_text(file_path: Path) -> str:
    try:
        with pdfplumber.open(file_path) as pdf:
            page_text = [page.extract_text() or "" for page in pdf.pages]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to read PDF. Please upload a valid, readable PDF file: {exc}",
        ) from exc

    extracted_text = "\n\n".join(text for text in page_text if text.strip()).strip()
    if not extracted_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="PDF was readable, but no extractable text was found.",
        )
    return extracted_text


@router.post("/upload-pdf", response_model=BudgetPdfUploadResponse)
async def upload_budget_pdf(
    ministry: str = Form(...),
    year: int = Form(...),
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
) -> BudgetPdfUploadResponse:
    """Extract PDF text so teams can identify allocated and actual budget figures."""
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF uploads are supported.",
        )

    try:
        contents = await file.read()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to read uploaded file: {exc}",
        ) from exc

    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded PDF file is empty.",
        )

    temp_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_pdf:
            temp_pdf.write(contents)
            temp_path = Path(temp_pdf.name)
        extracted_text = _read_pdf_text(temp_path)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to process uploaded PDF: {exc}",
        ) from exc
    finally:
        if temp_path is not None:
            try:
                os.remove(temp_path)
            except OSError:
                logger.warning("Unable to remove temporary PDF file: %s", temp_path)

    return BudgetPdfUploadResponse(
        ministry=ministry,
        year=year,
        extracted_text=extracted_text,
    )


@router.post("/calculate-deviation", response_model=BudgetDeviationResponse)
async def calculate_budget_deviation(
    request: BudgetDeviationRequest,
    authorization: str = Header(...),
    current_user: CurrentUser = Depends(get_current_user),
) -> BudgetDeviationResponse:
    """Calculate deviation, explain it with AI, alert on major variance, and store it."""
    deviation_pct = calculate_deviation_pct(request.allocated_ngn, request.actual_ngn)
    alert_fired = abs(deviation_pct) > Decimal("25")
    cache_key = (
        f"budget-summary:{request.ministry.strip()}:{request.year}:"
        f"{request.allocated_ngn}:{request.actual_ngn}:{deviation_pct}"
    )
    summary = await get_or_set_cache(
        cache_key,
        lambda: generate_budget_summary(
            request.ministry,
            request.year,
            request.allocated_ngn,
            request.actual_ngn,
            deviation_pct,
        ),
        ttl_seconds=3600,
        model_class=BudgetSummary,
    )
    access_token = bearer_token_from_header(authorization)
    record_id = await insert_budget_record(
        request,
        deviation_pct,
        alert_fired,
        summary,
        current_user,
        access_token,
    )

    return BudgetDeviationResponse(
        record_id=record_id,
        deviation_pct=deviation_pct,
        alert_fired=alert_fired,
        ai_summary_en=summary.english,
        ai_summary_pidgin=summary.pidgin,
    )
