"""Authentication and RBAC dependencies for FastAPI endpoints."""
from typing import Callable, Sequence
from fastapi import Depends, HTTPException, Request, status
import jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.core.security import decode_access_token
from app.database import get_db
from app.models.user import User, UserRole


def extract_token(request: Request) -> str | None:
    """Extract token from Authorization header or HttpOnly cookie."""
    auth_header = request.headers.get("Authorization")
    if auth_header:
        parts = auth_header.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            return parts[1]

    # Fallback to HttpOnly cookie
    cookie_token = request.cookies.get(settings.AUTH_COOKIE_NAME)
    if cookie_token:
        return cookie_token

    return None


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    """Validate token and return current active user."""
    token = extract_token(request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_access_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (jwt.PyJWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token: missing subject.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated. Contact an administrator.",
        )

    return user


def get_current_campus_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Ensure user is associated with a campus."""
    if not current_user.campus_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not associated with any campus. Please complete onboarding.",
        )
    return current_user


def require_roles(*roles: Sequence[str | UserRole]) -> Callable[[User], User]:
    """Factory dependency to enforce role permissions."""
    allowed: set[str] = set()
    for r in roles:
        if isinstance(r, (list, tuple, set)):
            for item in r:
                val = item.value if isinstance(item, UserRole) else str(item)
                allowed.add(val)
                if val in ("ADMIN", "CAMPUS_ADMIN"):
                    allowed.add("ADMIN")
                    allowed.add("CAMPUS_ADMIN")
        else:
            val = r.value if isinstance(r, UserRole) else str(r)
            allowed.add(val)
            if val in ("ADMIN", "CAMPUS_ADMIN"):
                allowed.add("ADMIN")
                allowed.add("CAMPUS_ADMIN")

    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of the following roles: {sorted(list(allowed))}.",
            )
        return current_user

    return role_checker


# Role-specific dependencies (CAMPUS_ADMIN and legacy ADMIN both satisfy admin roles)
require_campus_admin = require_roles(UserRole.CAMPUS_ADMIN, UserRole.ADMIN)
require_admin = require_roles(UserRole.CAMPUS_ADMIN, UserRole.ADMIN)
require_manager_or_admin = require_roles(
    UserRole.CAMPUS_ADMIN, UserRole.ADMIN, UserRole.CAMPUS_MANAGER
)
require_operator_or_higher = require_roles(
    UserRole.CAMPUS_ADMIN, UserRole.ADMIN, UserRole.CAMPUS_MANAGER, UserRole.DATA_ENTRY_OPERATOR
)
require_any_authenticated = get_current_user
