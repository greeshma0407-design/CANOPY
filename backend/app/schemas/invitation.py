"""Invitation schemas for campus member invitations."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.user import UserRole
from app.schemas.user import validate_email_format


class InvitationCreate(BaseModel):
    email: str
    role: UserRole = UserRole.VIEWER

    @field_validator("email")
    @classmethod
    def check_email(cls, v: str) -> str:
        return validate_email_format(v)


class InvitationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    campus_id: str
    email: str
    role: str
    token: str
    expires_at: datetime
    is_accepted: bool
    created_at: datetime


class InvitationVerifyResponse(BaseModel):
    token: str
    email: str
    campus_name: str
    institution_name: Optional[str] = None
    role: str
    is_valid: bool
    message: Optional[str] = None


class RegisterInvitedRequest(BaseModel):
    token: str
    full_name: str = Field(..., min_length=2, max_length=120)
    password: str = Field(..., min_length=8, max_length=128)
