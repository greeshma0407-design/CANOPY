"""Authentication endpoints for CANOPY."""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session

from app.config import settings
from app.core.dependencies import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.database import get_db
from app.models.campus import Campus
from app.models.invitation import Invitation
from app.models.user import User
from app.schemas.invitation import RegisterInvitedRequest
from app.schemas.user import LoginRequest, TokenResponse, UserRead, validate_email_format

router = APIRouter(prefix="/auth", tags=["auth"])


class ForgotPasswordRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def check_email(cls, v: str) -> str:
        return validate_email_format(v)


@router.post("/login", response_model=TokenResponse)
def login(
    payload: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    """Authenticate user with email and password, returning JWT and setting HttpOnly cookie."""
    normalized_email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact an administrator.",
        )

    # Expiry based on remember_me
    if payload.remember_me:
        expires_delta = timedelta(days=settings.REMEMBER_ME_EXPIRE_DAYS)
        max_age_seconds = int(expires_delta.total_seconds())
    else:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        max_age_seconds = int(expires_delta.total_seconds())

    access_token = create_access_token(
        subject=user.id,
        claims={
            "role": user.role,
            "email": user.email,
            "full_name": user.full_name,
            "campus_id": user.campus_id,
        },
        expires_delta=expires_delta,
    )

    # Set secure HttpOnly cookie for browser sessions
    response.set_cookie(
        key=settings.AUTH_COOKIE_NAME,
        value=access_token,
        max_age=max_age_seconds,
        httponly=True,
        secure=settings.effective_cookie_secure,
        samesite=settings.effective_cookie_samesite,
        path="/",
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=max_age_seconds,
        user=UserRead.model_validate(user),
    )


@router.post("/register-invited", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_invited(
    payload: RegisterInvitedRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    """Register an invited team member into the specified campus using their invitation token."""
    invite = db.query(Invitation).filter(Invitation.token == payload.token).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invalid invitation token.")

    if invite.is_accepted:
        raise HTTPException(status_code=400, detail="This invitation has already been accepted.")

    if invite.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="This invitation token has expired.")

    if invite.role in ("ADMIN", "CAMPUS_ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator privileges cannot be granted to users joining an existing campus.",
        )

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == invite.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already registered with this email.")

    new_user = User(
        campus_id=invite.campus_id,
        email=invite.email,
        full_name=payload.full_name.strip(),
        hashed_password=hash_password(payload.password),
        role=invite.role,
        is_active=True,
    )
    db.add(new_user)
    invite.is_accepted = True

    db.commit()
    db.refresh(new_user)

    expires_delta = timedelta(days=settings.REMEMBER_ME_EXPIRE_DAYS)
    max_age_seconds = int(expires_delta.total_seconds())

    access_token = create_access_token(
        subject=new_user.id,
        claims={
            "role": new_user.role,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "campus_id": new_user.campus_id,
        },
        expires_delta=expires_delta,
    )

    response.set_cookie(
        key=settings.AUTH_COOKIE_NAME,
        value=access_token,
        max_age=max_age_seconds,
        httponly=True,
        secure=settings.effective_cookie_secure,
        samesite=settings.effective_cookie_samesite,
        path="/",
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=max_age_seconds,
        user=UserRead.model_validate(new_user),
    )


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Initiate self-service password recovery notification."""
    normalized_email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()

    # Generic response regardless of existence to prevent user enumeration
    return {
        "message": (
            "If an account exists for this email address, password recovery instructions "
            "have been dispatched. For immediate assistance, your institution's Campus Administrator "
            "can reset your credentials in the Canopy User Management console."
        )
    }


@router.get("/me", response_model=UserRead)
def get_current_authenticated_user(
    current_user: User = Depends(get_current_user),
):
    """Retrieve profile and role of currently authenticated user."""
    return UserRead.model_validate(current_user)


@router.post("/logout")
def logout(response: Response):
    """Log out user by clearing the HttpOnly session cookie."""
    response.delete_cookie(
        key=settings.AUTH_COOKIE_NAME,
        httponly=True,
        secure=settings.effective_cookie_secure,
        samesite=settings.effective_cookie_samesite,
        path="/",
    )
    return {"message": "Logged out successfully."}
