"""Campus user invitation endpoints."""
import secrets
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_campus_admin
from app.database import get_db
from app.models.campus import Campus
from app.models.invitation import Invitation
from app.models.user import User
from app.schemas.invitation import (
    InvitationCreate,
    InvitationRead,
    InvitationVerifyResponse,
)

router = APIRouter(prefix="/invitations", tags=["invitations"])


@router.post("", response_model=InvitationRead, status_code=status.HTTP_201_CREATED)
def create_invitation(
    payload: InvitationCreate,
    current_user: User = Depends(require_campus_admin),
    db: Session = Depends(get_db),
):
    """Invite a new team member to join the current campus with an assigned role (Campus Admin only)."""
    normalized_email = payload.email.lower().strip()

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User '{normalized_email}' already has an active account on CANOPY.",
        )

    # Check if there is an active pending invitation
    existing_invite = (
        db.query(Invitation)
        .filter(
            Invitation.email == normalized_email,
            Invitation.campus_id == current_user.campus_id,
            Invitation.is_accepted == False,  # noqa: E712
            Invitation.expires_at > datetime.utcnow(),
        )
        .first()
    )
    if existing_invite:
        return InvitationRead.model_validate(existing_invite)

    # Create new invitation
    token = secrets.token_urlsafe(32)
    invitation = Invitation(
        campus_id=current_user.campus_id,
        email=normalized_email,
        role=payload.role.value if hasattr(payload.role, "value") else str(payload.role),
        token=token,
        invited_by_user_id=current_user.id,
        expires_at=datetime.utcnow() + timedelta(days=7),
        is_accepted=False,
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation)
    return InvitationRead.model_validate(invitation)


@router.get("", response_model=List[InvitationRead])
def list_invitations(
    current_user: User = Depends(require_campus_admin),
    db: Session = Depends(get_db),
):
    """List pending invitations issued for this campus (Campus Admin only)."""
    invites = (
        db.query(Invitation)
        .filter(Invitation.campus_id == current_user.campus_id)
        .order_by(Invitation.created_at.desc())
        .all()
    )
    return [InvitationRead.model_validate(inv) for inv in invites]


@router.delete("/{invitation_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_invitation(
    invitation_id: str,
    current_user: User = Depends(require_campus_admin),
    db: Session = Depends(get_db),
):
    """Revoke a pending invitation (Campus Admin only)."""
    invite = (
        db.query(Invitation)
        .filter(Invitation.id == invitation_id, Invitation.campus_id == current_user.campus_id)
        .first()
    )
    if not invite:
        raise HTTPException(status_code=404, detail="Invitation not found")

    db.delete(invite)
    db.commit()
    return None


@router.get("/verify/{token}", response_model=InvitationVerifyResponse)
def verify_invitation_token(
    token: str,
    db: Session = Depends(get_db),
):
    """Verify an invitation token for user registration (Public)."""
    invite = db.query(Invitation).filter(Invitation.token == token).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invalid invitation token.")

    if invite.is_accepted:
        raise HTTPException(status_code=400, detail="This invitation has already been accepted.")

    if invite.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="This invitation link has expired. Contact your Campus Administrator.")

    campus = db.query(Campus).filter(Campus.id == invite.campus_id).first()
    campus_name = campus.name if campus else "CANOPY Campus"
    institution_name = campus.institution_name if campus else None

    return InvitationVerifyResponse(
        token=invite.token,
        email=invite.email,
        campus_name=campus_name,
        institution_name=institution_name,
        role=invite.role,
        is_valid=True,
    )
