"""Seed development user accounts with RBAC roles for CANOPY.

Safe development-only seeding mechanism.
Does NOT reset passwords of existing users on repeated runs.

Usage:
    cd backend
    python scripts/seed_users.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings
from app.core.security import hash_password
from app.database import SessionLocal
from app.models.user import User, UserRole


DEV_USERS = [
    {
        "email": "admin@canopy.local",
        "full_name": "Dr. Radhika Rao (Admin)",
        "role": UserRole.ADMIN.value,
        "password": settings.SEED_ADMIN_PASSWORD,
    },
    {
        "email": "manager@canopy.local",
        "full_name": "Suresh Patel (Campus Manager)",
        "role": UserRole.CAMPUS_MANAGER.value,
        "password": settings.SEED_MANAGER_PASSWORD,
    },
    {
        "email": "operator@canopy.local",
        "full_name": "Ananya Sharma (Data Entry Operator)",
        "role": UserRole.DATA_ENTRY_OPERATOR.value,
        "password": settings.SEED_OPERATOR_PASSWORD,
    },
    {
        "email": "viewer@canopy.local",
        "full_name": "Kiran Varma (Auditor / Viewer)",
        "role": UserRole.VIEWER.value,
        "password": settings.SEED_VIEWER_PASSWORD,
    },
]


def seed_users() -> None:
    db = SessionLocal()
    created_count = 0
    skipped_count = 0

    try:
        print("=" * 60)
        print("CANOPY Development User Seeding")
        print("=" * 60)

        for u_data in DEV_USERS:
            existing = db.query(User).filter(User.email == u_data["email"]).first()
            if existing:
                print(f"[-] Existing user '{u_data['email']}' ({existing.role}) preserved. Password not changed.")
                skipped_count += 1
            else:
                new_user = User(
                    email=u_data["email"],
                    full_name=u_data["full_name"],
                    role=u_data["role"],
                    hashed_password=hash_password(u_data["password"]),
                    is_active=True,
                )
                db.add(new_user)
                created_count += 1
                print(f"[+] Created user '{u_data['email']}' with role '{u_data['role']}'")

        db.commit()
        print("-" * 60)
        print(f"Summary: {created_count} users created, {skipped_count} existing users preserved.")
        print("Default development credentials (configured via settings/environment):")
        for u in DEV_USERS:
            print(f"  • {u['email']} [{u['role']}]: {u['password']}")
        print("=" * 60)

    finally:
        db.close()


if __name__ == "__main__":
    seed_users()
