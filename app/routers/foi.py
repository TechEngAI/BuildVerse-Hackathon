import asyncio
import logging
from datetime import date, timedelta
from typing import Any, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from pydantic import BaseModel, EmailStr, Field, field_validator

from app.auth import CurrentUser, get_current_user
from app.clients import GROK_TEXT_MODEL, GROK_VISION_MAX_TOKENS, get_grok_client, get_supabase_client
from app.utils import bearer_token_from_header

router = APIRouter(prefix="/foi", tags=["foi"])
logger = logging.getLogger(__name__)

FoiCategory = Literal["road", "health", "education", "budget", "default"]

AGENCY_DIRECTORY: dict[FoiCategory, tuple[str, str]] = {
    "road": ("Federal Ministry of Works", "info@fmw.gov.ng"),
    "health": ("Federal Ministry of Health and Social Welfare", "info@health.gov.ng"),
    "education": ("Federal Ministry of Education", "info@education.gov.ng"),
    "budget": ("Budget Office of the Federation", "info@budgetoffice.gov.ng"),
    "default": ("Federal Ministry of Information and National Orientation", "info@fmino.gov.ng"),
}


class FoiGenerateRequest(BaseModel):
    question: str = Field(..., min_length=10, max_length=1000)
    category: FoiCategory = "default"

    @field_validator("question")
    @classmethod
    def validate_question(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 10:
            raise ValueError("question must be at least 10 characters long")
        return cleaned


class FoiGenerateResponse(BaseModel):
    letter: str
    agency_name: str
    agency_email: EmailStr
    due_date: date
    request_id: UUID


class FoiRequestDetail(BaseModel):
    id: UUID
    user_id: UUID
    question_plain: str
    category: str
    agency_name: str
    agency_email: EmailStr
    generated_letter: str
    due_date: date
    created_at: str | None = None


class FoiRequestsListResponse(BaseModel):
    requests: list[FoiRequestDetail]
    limit: int
    offset: int


def _agency_for_category(category: FoiCategory) -> tuple[str, str]:
    return AGENCY_DIRECTORY.get(category, AGENCY_DIRECTORY["default"])


def generate_foi_letter(question: str, agency_name: str) -> str:
    prompt = (
        "Write a formal Freedom of Information request letter under Nigeria's FOI Act 2011. "
        "Reference the April 2025 Supreme Court ruling that all 36 states are bound by the Act. "
        f"Address it to {agency_name}. "
        "Keep it under 200 words, plain text only, no markdown, and make it specific to this request:\n\n"
        f"{question}"
    )

    try:
        response = get_grok_client().chat.completions.create(
            model=GROK_TEXT_MODEL,
            max_tokens=GROK_VISION_MAX_TOKENS,
            temperature=0.2,
            messages=[{"role": "user", "content": prompt}],
        )
        letter = (response.choices[0].message.content or "").strip()
    except Exception as exc:
        logger.exception("Unable to generate FOI letter with Grok")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to generate FOI request letter.",
        ) from exc

    if not letter:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to generate FOI request letter.",
        )
    return letter


def _foi_request_from_row(row: dict[str, Any]) -> FoiRequestDetail:
    return FoiRequestDetail.model_validate(row)


@router.post("/generate", response_model=FoiGenerateResponse)
async def generate_foi_request(
    request: FoiGenerateRequest,
    authorization: str = Header(...),
    current_user: CurrentUser = Depends(get_current_user),
) -> FoiGenerateResponse:
    """Generate and store a formal FOI request letter for the authenticated user."""
    agency_name, agency_email = _agency_for_category(request.category)
    letter = await asyncio.to_thread(generate_foi_letter, request.question, agency_name)
    due_date = date.today() + timedelta(days=7)
    record = {
        "user_id": current_user.id,
        "question_plain": request.question,
        "category": request.category,
        "agency_name": agency_name,
        "agency_email": agency_email,
        "generated_letter": letter,
        "due_date": due_date.isoformat(),
    }

    access_token = bearer_token_from_header(authorization)
    try:
        supabase = await get_supabase_client(access_token=access_token)
        response = await supabase.table("foi_requests").insert(record).execute()
    except Exception as exc:
        logger.exception("Unable to store FOI request")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to store FOI request.",
        ) from exc

    data = getattr(response, "data", None)
    if not data or not isinstance(data, list) or not data[0].get("id"):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Supabase insert succeeded but did not return a request id.",
        )

    return FoiGenerateResponse(
        letter=letter,
        agency_name=agency_name,
        agency_email=agency_email,
        due_date=due_date,
        request_id=UUID(str(data[0]["id"])),
    )


@router.get("/requests", response_model=FoiRequestsListResponse)
async def list_foi_requests(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    authorization: str = Header(...),
    current_user: CurrentUser = Depends(get_current_user),
) -> FoiRequestsListResponse:
    """Return the authenticated user's FOI requests, newest first."""
    access_token = bearer_token_from_header(authorization)
    try:
        supabase = await get_supabase_client(access_token=access_token)
        response = (
            await supabase.table("foi_requests")
            .select("*")
            .eq("user_id", current_user.id)
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
    except Exception as exc:
        logger.exception("Unable to list FOI requests for user %s", current_user.id)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to load FOI requests.",
        ) from exc

    requests = [_foi_request_from_row(row) for row in (getattr(response, "data", None) or [])]
    return FoiRequestsListResponse(requests=requests, limit=limit, offset=offset)


@router.get("/requests/{request_id}", response_model=FoiRequestDetail)
async def get_foi_request(
    request_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
) -> FoiRequestDetail:
    """Return one FOI request, or forbid access if it belongs to another user."""
    try:
        supabase = await get_supabase_client(service_role=True)
        response = (
            await supabase.table("foi_requests")
            .select("*")
            .eq("id", str(request_id))
            .limit(1)
            .execute()
        )
    except Exception as exc:
        logger.exception("Unable to load FOI request %s", request_id)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to load FOI request.",
        ) from exc

    data = getattr(response, "data", None) or []
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FOI request not found.",
        )

    request = _foi_request_from_row(data[0])
    if str(request.user_id) != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this FOI request.",
        )
    return request
