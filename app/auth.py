# Supabase Dashboard setup:
# 1. Go to Authentication > Providers > Email and enable Email signups.
# 2. Configure Confirm email based on whether users must verify email before login.
# 3. Go to Authentication > Sessions and adjust JWT expiry if your app needs longer or shorter sessions.
# 4. Run the SQL in schema.sql to create profiles and enable Row-Level Security policies.

import logging
from typing import Any, Literal

from fastapi import APIRouter, Header, HTTPException, status
from gotrue.errors import AuthApiError
from pydantic import BaseModel, EmailStr, Field

from app.clients import get_supabase_client
from app.utils import bearer_token_from_header

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=1)


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    token: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")
    type: Literal["signup", "email_change"] = "signup"


class AuthMessageResponse(BaseModel):
    message: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserInfo(BaseModel):
    id: str
    email: EmailStr | None = None
    user_metadata: dict[str, Any] = Field(default_factory=dict)


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: UserInfo


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., min_length=1)


class RefreshTokenResponse(BaseModel):
    access_token: str
    refresh_token: str


class CurrentUser(BaseModel):
    id: str
    email: EmailStr | None = None
    user_metadata: dict[str, Any] = Field(default_factory=dict)


def _auth_error_message(exc: AuthApiError) -> str:
    return str(getattr(exc, "message", None) or exc)


def _user_info_from_user(user: Any) -> UserInfo:
    return UserInfo(
        id=str(user.id),
        email=getattr(user, "email", None),
        user_metadata=getattr(user, "user_metadata", None) or {},
    )


def _current_user_from_user(user: Any) -> CurrentUser:
    return CurrentUser(
        id=str(user.id),
        email=getattr(user, "email", None),
        user_metadata=getattr(user, "user_metadata", None) or {},
    )


def _email_is_confirmed(user: Any) -> bool:
    return getattr(user, "email_confirmed_at", None) is not None or getattr(user, "confirmed_at", None) is not None


@router.post("/signup", response_model=AuthMessageResponse)
async def signup(request: SignupRequest) -> AuthMessageResponse:
    """Create a Supabase Auth user with profile metadata for later RLS-owned data."""
    # Supabase Dashboard: Authentication > Providers > Email > Confirm email ON,
    # then Authentication > Email Templates > Confirm signup: use {{ .Token }} instead of {{ .ConfirmationURL }}.
    try:
        supabase = await get_supabase_client()
        await supabase.auth.sign_up(
            {
                "email": str(request.email),
                "password": request.password,
                "options": {"data": {"full_name": request.full_name}},
            }
        )
    except AuthApiError as exc:
        message = _auth_error_message(exc)
        lowered = message.lower()
        if "already" in lowered or "registered" in lowered or "exists" in lowered:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            ) from exc
        logger.warning("Supabase signup failed for %s: %s", request.email, message)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to create account.",
        ) from exc
    except Exception as exc:
        logger.exception("Unexpected signup error for %s", request.email)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to reach authentication service during signup.",
        ) from exc

    return AuthMessageResponse(
        message="Signup successful. A 6-digit verification code has been sent to your email."
    )


@router.post("/verify-otp", response_model=LoginResponse)
async def verify_otp(data: VerifyOTPRequest) -> LoginResponse:
    """Verify a Supabase email OTP and return a logged-in session."""
    try:
        supabase = await get_supabase_client()
        response = await supabase.auth.verify_otp(
            {"email": str(data.email), "token": data.token, "type": data.type}
        )
    except AuthApiError as exc:
        logger.warning(
            "Email OTP verification failed for %s: %s",
            data.email,
            _auth_error_message(exc),
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid, expired, or already used verification code.",
        ) from exc
    except Exception as exc:
        logger.warning(
            "Unexpected email OTP verification error for %s: %s",
            data.email,
            exc.__class__.__name__,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid, expired, or already used verification code.",
        ) from exc

    session = getattr(response, "session", None)
    user = getattr(response, "user", None)
    if session is None or user is None:
        logger.warning("Email OTP verification returned no session for %s", data.email)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid, expired, or already used verification code.",
        )

    return LoginResponse(
        access_token=str(session.access_token),
        refresh_token=str(session.refresh_token),
        user=_user_info_from_user(user),
    )


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest) -> LoginResponse:
    """Authenticate a Supabase user and return access and refresh tokens."""
    try:
        supabase = await get_supabase_client()
        response = await supabase.auth.sign_in_with_password(
            {"email": str(request.email), "password": request.password}
        )
    except AuthApiError as exc:
        message = _auth_error_message(exc)
        lowered = message.lower()
        if "not confirmed" in lowered or "not verified" in lowered:
            logger.warning("Login blocked for unverified user %s: %s", request.email, message)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please verify your email before logging in.",
            ) from exc
        logger.warning("Supabase login failed for %s: %s", request.email, message)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        ) from exc
    except Exception as exc:
        logger.exception("Unexpected login error for %s", request.email)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to reach authentication service during login.",
        ) from exc

    session = getattr(response, "session", None)
    user = getattr(response, "user", None)
    if session is None or user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Login failed because Supabase did not return a valid session.",
        )

    if not _email_is_confirmed(user):
        logger.warning("Login blocked because email is unverified for user %s", request.email)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in.",
        )

    return LoginResponse(
        access_token=str(session.access_token),
        refresh_token=str(session.refresh_token),
        user=_user_info_from_user(user),
    )


@router.post("/forgot-password", response_model=AuthMessageResponse)
async def forgot_password(request: ForgotPasswordRequest) -> AuthMessageResponse:
    """Trigger a Supabase password reset email without revealing account existence."""
    try:
        supabase = await get_supabase_client()
        await supabase.auth.reset_password_for_email(str(request.email))
    except AuthApiError as exc:
        logger.warning(
            "Supabase password reset request failed for %s: %s",
            request.email,
            _auth_error_message(exc),
        )
    except Exception:
        logger.exception("Unexpected password reset request error for %s", request.email)

    return AuthMessageResponse(
        message="If an account exists for that email, a password reset email has been sent."
    )


@router.post("/refresh-token", response_model=RefreshTokenResponse)
async def refresh_token(request: RefreshTokenRequest) -> RefreshTokenResponse:
    """Exchange a Supabase refresh token for a new access token session."""
    try:
        supabase = await get_supabase_client()
        response = await supabase.auth.refresh_session(request.refresh_token)
    except AuthApiError as exc:
        logger.warning("Supabase token refresh failed: %s", _auth_error_message(exc))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unable to refresh session.",
        ) from exc
    except Exception as exc:
        logger.exception("Unexpected token refresh error")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to reach authentication service during token refresh.",
        ) from exc

    session = getattr(response, "session", None)
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Supabase did not return a valid refreshed session.",
        )

    return RefreshTokenResponse(
        access_token=str(session.access_token),
        refresh_token=str(session.refresh_token),
    )


async def get_current_user(authorization: str = Header(...)) -> CurrentUser:
    """Verify a Bearer access token and return the current Supabase user identity."""
    token = bearer_token_from_header(authorization)
    try:
        supabase = await get_supabase_client(access_token=token)
        response = await supabase.auth.get_user(token)
    except AuthApiError as exc:
        logger.warning("Supabase access token verification failed: %s", _auth_error_message(exc))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
        ) from exc
    except Exception as exc:
        logger.exception("Unexpected access token verification error")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unable to verify access token.",
        ) from exc

    user = getattr(response, "user", None)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
        )

    return _current_user_from_user(user)
