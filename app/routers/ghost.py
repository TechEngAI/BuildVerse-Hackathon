import asyncio
import base64
import hashlib
import json
import logging
from decimal import Decimal
from io import BytesIO
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, Query, UploadFile, status
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, Field

from app.auth import CurrentUser, get_current_user
from app.clients import (
    GROK_TEXT_MODEL,
    GROK_VISION_MAX_TOKENS,
    get_grok_client,
    get_or_set_cache,
    get_supabase_client,
)
from app.utils import bearer_token_from_header

router = APIRouter(prefix="/ghost", tags=["ghost"])
logger = logging.getLogger(__name__)
MAX_IMAGE_BYTES = 5 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png"}


class VisionAnalysis(BaseModel):
    scene_description: str
    infrastructure_type: str
    completion_pct: int = Field(..., ge=0, le=100)
    visible_issues: list[str] = Field(default_factory=list)


class ContractBase(BaseModel):
    project_name: str = Field(..., min_length=1)
    contractor_name: str = Field(..., min_length=1)
    awarded_amount_ngn: Decimal = Field(..., ge=0)
    location_lat: float = Field(..., ge=-90, le=90)
    location_lng: float = Field(..., ge=-180, le=180)
    lga: str = Field(..., min_length=1)
    state: str = Field(..., min_length=1)
    official_status: str = Field(..., min_length=1)
    photo_evidence_url: str | None = None


class ContractSeed(ContractBase):
    """Contract payload accepted by the temporary demo seeding endpoint."""


class ContractResponse(ContractBase):
    id: UUID
    created_at: str | None = None


class CitizenReportResponse(BaseModel):
    id: UUID
    category: str
    description: str | None = None
    lat: float
    lng: float
    photo_url: str | None = None
    vision_analysis: VisionAnalysis
    contract_match_id: UUID | None = None
    reported_by: str | None = None
    created_at: str | None = None
    matched_contract: ContractResponse | None = None


class AnalyzePhotoResponse(BaseModel):
    vision_analysis: VisionAnalysis
    matched_contract: ContractResponse | None = None
    contradiction: str | None = None
    report_id: UUID


class ReportsListResponse(BaseModel):
    reports: list[CitizenReportResponse]
    limit: int
    offset: int


class SeedContractsResponse(BaseModel):
    inserted_count: int
    contracts: list[ContractResponse]


def _validate_image(contents: bytes, content_type: str | None) -> str:
    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded image file is empty.",
        )
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image too large, max 5MB.",
        )
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG and PNG image uploads are supported.",
        )

    try:
        with Image.open(BytesIO(contents)) as image:
            image.verify()
            image_format = image.format
    except UnidentifiedImageError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to read image. Please upload a valid image file.",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to read image. Please upload a valid image file.",
        ) from exc

    if not image_format:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to determine uploaded image format.",
        )

    return content_type or f"image/{image_format.lower()}"


def _parse_vision_analysis(raw_text: str) -> VisionAnalysis:
    candidates = [raw_text]
    start = raw_text.find("{")
    end = raw_text.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidates.append(raw_text[start : end + 1])

    for candidate in candidates:
        try:
            parsed = json.loads(candidate)
            return VisionAnalysis.model_validate(parsed)
        except (json.JSONDecodeError, ValueError, TypeError):
            continue

    logger.error("Grok returned invalid ghost project vision JSON.")
    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail="AI vision analysis returned an invalid JSON response.",
    )


def analyze_project_photo(contents: bytes, content_type: str) -> VisionAnalysis:
    prompt = (
        "Analyze this citizen-submitted photo of a suspected abandoned or fraudulent "
        "government infrastructure project. Return ONLY strict JSON with this exact shape: "
        '{"scene_description": "...", "infrastructure_type": "...", '
        '"completion_pct": 0, "visible_issues": ["..."]}. '
        "completion_pct must be an integer from 0 to 100 estimating visible construction completion."
    )
    encoded_image = base64.b64encode(contents).decode("ascii")
    data_url = f"data:{content_type};base64,{encoded_image}"

    try:
        response = get_grok_client().chat.completions.create(
            model=GROK_TEXT_MODEL,
            max_tokens=GROK_VISION_MAX_TOKENS,
            temperature=0.1,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                }
            ],
        )
        raw_text = response.choices[0].message.content or ""
    except Exception as exc:
        logger.exception("Unable to analyze ghost project photo with Grok")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to analyze project photo.",
        ) from exc

    return _parse_vision_analysis(raw_text)


def _contract_from_row(row: dict[str, Any] | None) -> ContractResponse | None:
    if not row:
        return None
    return ContractResponse.model_validate(row)


def _report_from_row(row: dict[str, Any]) -> CitizenReportResponse:
    data = dict(row)
    contract = data.pop("contracts", None)
    data["matched_contract"] = _contract_from_row(contract)
    return CitizenReportResponse.model_validate(data)


async def query_contracts_within_radius(
    lat: float,
    lng: float,
    access_token: str,
) -> ContractResponse | None:
    """Find the nearest contract using a small bounding box around the reported GPS point."""
    delta = 0.0018
    # Future upgrade: replace this approximation with a proper PostGIS ST_DWithin query when spatial indexes are available.
    try:
        supabase = await get_supabase_client(access_token=access_token)
        response = (
            await supabase.table("contracts")
            .select("*")
            .gte("location_lat", lat - delta)
            .lte("location_lat", lat + delta)
            .gte("location_lng", lng - delta)
            .lte("location_lng", lng + delta)
            .limit(1)
            .execute()
        )
    except Exception as exc:
        logger.exception("Unable to query nearby contracts")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to query nearby contracts.",
        ) from exc

    data = getattr(response, "data", None) or []
    if not data:
        return None
    return ContractResponse.model_validate(data[0])


def build_contradiction_string(
    contract: ContractResponse | None,
    vision_analysis: VisionAnalysis,
) -> str | None:
    if contract is None:
        return None
    if contract.official_status.lower() != "completed":
        return None
    if vision_analysis.completion_pct >= 50:
        return None

    gap = 100 - vision_analysis.completion_pct
    amount = f"{contract.awarded_amount_ngn:,.2f}"
    return (
        f"Public contradiction: {contract.project_name} by {contract.contractor_name} "
        f"was officially marked completed after an award of NGN {amount}, but citizen "
        f"photo evidence suggests only {vision_analysis.completion_pct}% visible completion "
        f"({gap}% gap)."
    )


async def _insert_citizen_report(
    category: str,
    description: str | None,
    lat: float,
    lng: float,
    vision_analysis: VisionAnalysis,
    matched_contract: ContractResponse | None,
    current_user: CurrentUser,
    access_token: str,
) -> UUID:
    record = {
        "category": category,
        "description": description,
        "lat": lat,
        "lng": lng,
        "photo_url": None,
        "vision_analysis": vision_analysis.model_dump(),
        "contract_match_id": str(matched_contract.id) if matched_contract else None,
        "reported_by": current_user.id,
    }

    try:
        supabase = await get_supabase_client(access_token=access_token)
        response = await supabase.table("citizen_reports").insert(record).execute()
    except Exception as exc:
        logger.exception("Unable to insert citizen report")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to store citizen report.",
        ) from exc

    data = getattr(response, "data", None)
    if not data or not isinstance(data, list) or not data[0].get("id"):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Supabase insert succeeded but did not return a report id.",
        )
    return UUID(str(data[0]["id"]))


@router.post("/analyze-photo", response_model=AnalyzePhotoResponse)
async def analyze_photo(
    lat: float = Form(..., ge=-90, le=90),
    lng: float = Form(..., ge=-180, le=180),
    file: UploadFile = File(...),
    description: str | None = Form(default=None),
    authorization: str = Header(...),
    current_user: CurrentUser = Depends(get_current_user),
) -> AnalyzePhotoResponse:
    """Analyze a project photo, match it to nearby contracts, and store a citizen report."""
    try:
        contents = await file.read()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to read uploaded image file.",
        ) from exc

    content_type = _validate_image(contents, file.content_type)
    cache_key = (
        "ghost-vision:"
        + hashlib.sha256(contents + f"{lat}:{lng}".encode("utf-8")).hexdigest()
    )
    vision_analysis = await get_or_set_cache(
        cache_key,
        lambda: analyze_project_photo(contents, content_type),
        ttl_seconds=3600,
        model_class=VisionAnalysis,
    )
    access_token = bearer_token_from_header(authorization)
    matched_contract = await query_contracts_within_radius(lat, lng, access_token)
    contradiction = build_contradiction_string(matched_contract, vision_analysis)
    report_id = await _insert_citizen_report(
        category="ghost_project",
        description=description,
        lat=lat,
        lng=lng,
        vision_analysis=vision_analysis,
        matched_contract=matched_contract,
        current_user=current_user,
        access_token=access_token,
    )

    return AnalyzePhotoResponse(
        vision_analysis=vision_analysis,
        matched_contract=matched_contract,
        contradiction=contradiction,
        report_id=report_id,
    )


@router.get("/reports", response_model=ReportsListResponse)
async def list_reports(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    authorization: str = Header(...),
    current_user: CurrentUser = Depends(get_current_user),
) -> ReportsListResponse:
    """Return recent citizen reports with matched contract context for the public map."""
    access_token = bearer_token_from_header(authorization)
    try:
        supabase = await get_supabase_client(access_token=access_token)
        response = (
            await supabase.table("citizen_reports")
            .select("*, contracts(*)")
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
    except Exception as exc:
        logger.exception("Unable to list ghost project reports")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to load citizen reports.",
        ) from exc

    reports = [_report_from_row(row) for row in (getattr(response, "data", None) or [])]
    return ReportsListResponse(reports=reports, limit=limit, offset=offset)


@router.get("/reports/{report_id}", response_model=CitizenReportResponse)
async def get_report(
    report_id: UUID,
    authorization: str = Header(...),
    current_user: CurrentUser = Depends(get_current_user),
) -> CitizenReportResponse:
    """Return one citizen report with full matched contract detail."""
    access_token = bearer_token_from_header(authorization)
    try:
        supabase = await get_supabase_client(access_token=access_token)
        response = (
            await supabase.table("citizen_reports")
            .select("*, contracts(*)")
            .eq("id", str(report_id))
            .limit(1)
            .execute()
        )
    except Exception as exc:
        logger.exception("Unable to load ghost project report %s", report_id)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to load citizen report.",
        ) from exc

    data = getattr(response, "data", None) or []
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Citizen report not found.",
        )
    return _report_from_row(data[0])


@router.post("/contracts/seed", response_model=SeedContractsResponse)
async def seed_contracts(
    contracts: list[ContractSeed],
    authorization: str = Header(...),
    current_user: CurrentUser = Depends(get_current_user),
) -> SeedContractsResponse:
    """Bulk-insert demo contracts for the Ghost Project Tracker."""
    # REMOVE BEFORE FINAL SUBMISSION: temporary helper endpoint for hackathon demo seeding.
    if not contracts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one contract is required.",
        )

    records = [contract.model_dump(mode="json") for contract in contracts]
    access_token = bearer_token_from_header(authorization)
    try:
        supabase = await get_supabase_client(access_token=access_token)
        response = await supabase.table("contracts").insert(records).execute()
    except Exception as exc:
        logger.exception("Unable to seed ghost project contracts")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to seed contracts.",
        ) from exc

    data = getattr(response, "data", None) or []
    return SeedContractsResponse(
        inserted_count=len(data),
        contracts=[ContractResponse.model_validate(row) for row in data],
    )
