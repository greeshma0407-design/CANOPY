"""User management endpoints for administrators with campus tenant isolation."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.core.security import hash_password
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=List[UserRead])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """List all registered users belonging to the current campus (Admin only)."""
    query = db.query(User)
    if current_user.campus_id:
        query = query.filter(User.campus_id == current_user.campus_id)
    users = query.order_by(User.created_at.desc()).all()
    return [UserRead.model_validate(u) for u in users]


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Create a new user and assign a role within the current campus (Admin only)."""
    normalized_email = payload.email.lower().strip()
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A user with email '{normalized_email}' already exists.",
        )

    # Campus isolation: user inherits current_user's campus
    assigned_campus_id = current_user.campus_id or payload.campus_id

    new_user = User(
        campus_id=assigned_campus_id,
        email=normalized_email,
        full_name=payload.full_name.strip(),
        hashed_password=hash_password(payload.password),
        role=payload.role.value if isinstance(payload.role, UserRole) else str(payload.role),
        is_active=payload.is_active,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return UserRead.model_validate(new_user)


@router.patch("/{user_id}", response_model=UserRead)
def update_user(
    user_id: str,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update user details, role, status, or reset password within the current campus (Admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found.",
        )

    # Enforce tenant boundary
    if current_user.campus_id and user.campus_id != current_user.campus_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify users from another campus.",
        )

    # Prevent deactivating or demoting the last active campus admin
    if (
        (payload.is_active is False or (payload.role and payload.role not in (UserRole.ADMIN, UserRole.CAMPUS_ADMIN)))
        and user.role in (UserRole.ADMIN.value, UserRole.CAMPUS_ADMIN.value)
    ):
        admin_count = (
            db.query(User)
            .filter(
                User.campus_id == current_user.campus_id,
                User.role.in_([UserRole.ADMIN.value, UserRole.CAMPUS_ADMIN.value]),
                User.is_active == True,  # noqa: E712
            )
            .count()
        )
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot deactivate or demote the last active administrator.",
            )

    if payload.email is not None:
        new_email = payload.email.lower().strip()
        if new_email != user.email:
            existing = db.query(User).filter(User.email == new_email).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Email '{new_email}' is already in use.",
                )
            user.email = new_email

    if payload.full_name is not None:
        user.full_name = payload.full_name.strip()

    if payload.role is not None:
        user.role = payload.role.value if isinstance(payload.role, UserRole) else str(payload.role)

    if payload.is_active is not None:
        user.is_active = payload.is_active

    if payload.password is not None:
        user.hashed_password = hash_password(payload.password)

    db.commit()
    db.refresh(user)
    return UserRead.model_validate(user)


@router.delete("/{user_id}")
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Deactivate or remove a user account within the current campus (Admin only)."""
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own administrator account or the last active administrator.",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found.",
        )

    # Enforce tenant boundary
    if current_user.campus_id and user.campus_id != current_user.campus_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete users from another campus.",
        )

    # Check not last admin
    if user.role in (UserRole.ADMIN.value, UserRole.CAMPUS_ADMIN.value):
        admin_count = (
            db.query(User)
            .filter(
                User.campus_id == current_user.campus_id,
                User.role.in_([UserRole.ADMIN.value, UserRole.CAMPUS_ADMIN.value]),
                User.is_active == True,  # noqa: E712
            )
            .count()
        )
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete the last active administrator.",
            )

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully."}
