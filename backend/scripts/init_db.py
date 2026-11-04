"""Initialize the database — create all tables.

Usage:
    cd backend
    python scripts/init_db.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base
import app.models  # noqa: F401 — ensure all models are registered


def main():
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    print("Done. Database initialized at canopy.db")


if __name__ == "__main__":
    main()
