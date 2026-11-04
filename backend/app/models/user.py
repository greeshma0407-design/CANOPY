"""User model for CANOPY authentication and role-based access control."""
from __future__ import annotations
import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.campus import Campus


class UserRole(str, Enum):
    ADMIN = "ADMIN"  # Legacy compatibility, treated as CAMPUS_ADMIN
    CAMPUS_ADMIN = "CAMPUS_ADMIN"
    CAMPUS_MANAGER = "CAMPUS_MANAGER"
    DATA_ENTRY_OPERATOR = "DATA_ENTRY_OPERATOR"
    VIEWER = "VIEWER"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: f"usr-{uuid.uuid4().hex[:12]}")
    campus_id: Mapped[str | None] = mapped_column(String, ForeignKey("campuses.id"), nullable=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False, default=UserRole.VIEWER.value)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    campus: Mapped[Campus | None] = relationship("Campus", back_populates="users")

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role} campus_id={self.campus_id} active={self.is_active}>"
