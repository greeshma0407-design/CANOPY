"""Invitation model for inviting new users to a campus."""
from __future__ import annotations
import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.campus import Campus
    from app.models.user import User


class Invitation(Base):
    __tablename__ = "invitations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: f"inv-{uuid.uuid4().hex[:12]}")
    campus_id: Mapped[str] = mapped_column(String, ForeignKey("campuses.id"), nullable=False)
    email: Mapped[str] = mapped_column(String, index=True, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False, default="VIEWER")
    token: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    invited_by_user_id: Mapped[str | None] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    is_accepted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    campus: Mapped[Campus] = relationship("Campus", back_populates="invitations")
    invited_by: Mapped[User | None] = relationship("User")

    def __repr__(self) -> str:
        return f"<Invitation id={self.id} email={self.email} campus_id={self.campus_id} role={self.role}>"
