"""Test fixtures and shared configuration for CANOPY backend tests.

All factors here are TEST FIXTURE ONLY - not real emission factors.
Geography is 'TEST' to avoid conflicts with production demo data.
"""
import pytest
from datetime import date
from sqlalchemy.pool import StaticPool
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, get_db
from app.models.emission_factor import EmissionFactor
from app.models.campus import Campus, ReportingPeriod
from app.models.user import User, UserRole
from app.core.security import hash_password, create_access_token
from app.core.dependencies import get_current_user

# ---------------------------------------------------------------------------
# TEST FIXTURE FACTORS — NOT REAL FACTORS — DO NOT USE IN PRODUCTION
# ---------------------------------------------------------------------------
TEST_FACTORS = [
    {
        "id": "tf-elec-test-v1",
        "category": "electricity",
        "activity_type": "grid_electricity",
        "geography": "TEST",
        "activity_unit": "kWh",
        "factor_value": 1.0,
        "factor_unit": "kgCO2e_per_kWh",
        "source_name": "TEST FIXTURE ONLY - not a real factor",
        "source_url": "",
        "methodology": "TEST FIXTURE ONLY",
        "version": "1",
        "valid_from": "2020-01-01",
        "valid_to": "2030-12-31",
        "notes": "TEST FIXTURE ONLY. Not for regulatory submission.",
        "is_active": True,
    },
    {
        "id": "tf-trans-bus-test-v1",
        "category": "transport",
        "activity_type": "bus_diesel",
        "geography": "TEST",
        "activity_unit": "passenger_km",
        "factor_value": 0.1,
        "factor_unit": "kgCO2e_per_passenger_km",
        "source_name": "TEST FIXTURE ONLY - not a real factor",
        "source_url": "",
        "methodology": "TEST FIXTURE ONLY",
        "version": "1",
        "valid_from": "2020-01-01",
        "valid_to": "2030-12-31",
        "notes": "TEST FIXTURE ONLY. Not for regulatory submission.",
        "is_active": True,
    },
    {
        "id": "tf-waste-test-v1",
        "category": "waste",
        "activity_type": "organic_waste",
        "geography": "TEST",
        "activity_unit": "tonne",
        "factor_value": 500.0,
        "factor_unit": "kgCO2e_per_tonne",
        "source_name": "TEST FIXTURE ONLY - not a real factor",
        "source_url": "",
        "methodology": "TEST FIXTURE ONLY",
        "version": "1",
        "valid_from": "2020-01-01",
        "valid_to": "2030-12-31",
        "notes": "TEST FIXTURE ONLY. Not for regulatory submission.",
        "is_active": True,
    },
    {
        "id": "tf-elec-future-v1",
        "category": "electricity",
        "activity_type": "grid_electricity_future",
        "geography": "TEST",
        "activity_unit": "kWh",
        "factor_value": 2.0,
        "factor_unit": "kgCO2e_per_kWh",
        "source_name": "TEST FIXTURE ONLY - future factor not yet valid",
        "source_url": "",
        "methodology": "TEST FIXTURE ONLY",
        "version": "1",
        "valid_from": "2030-01-01",
        "valid_to": "2035-12-31",
        "notes": "TEST FIXTURE ONLY. valid_from=2030-01-01 intentionally future.",
        "is_active": True,
    },
]

TEST_CAMPUS_ID = "campus-test-01"
TEST_PERIOD_ID = "period-test-01"

TEST_ADMIN_ID = "usr-test-admin"
TEST_MANAGER_ID = "usr-test-manager"
TEST_OPERATOR_ID = "usr-test-operator"
TEST_VIEWER_ID = "usr-test-viewer"


@pytest.fixture(scope="session")
def engine():
    """Create an in-memory SQLite engine for the entire test session."""
    eng = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=eng)
    return eng


@pytest.fixture(scope="session")
def session_factory(engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session")
def seed_db(engine, session_factory):
    """Seed test factors, campus, reporting period, and test users once per session."""
    db = session_factory()
    try:
        # Seed factors
        for f in TEST_FACTORS:
            if not db.query(EmissionFactor).filter_by(id=f["id"]).first():
                db.add(EmissionFactor(**f))

        # Seed campus
        if not db.query(Campus).filter_by(id=TEST_CAMPUS_ID).first():
            db.add(Campus(
                id=TEST_CAMPUS_ID,
                name="Test Campus",
                location="Test City",
                timezone="UTC",
            ))

        # Seed reporting period
        if not db.query(ReportingPeriod).filter_by(id=TEST_PERIOD_ID).first():
            db.add(ReportingPeriod(
                id=TEST_PERIOD_ID,
                campus_id=TEST_CAMPUS_ID,
                start_date="2025-01-01",
                end_date="2025-12-31",
                label="CY 2025 Test",
                status="open",
            ))

        # Seed test RBAC users
        test_users = [
            (TEST_ADMIN_ID, "admin@canopy.test", "Test Admin", UserRole.ADMIN.value, "Password123!"),
            (TEST_MANAGER_ID, "manager@canopy.test", "Test Manager", UserRole.CAMPUS_MANAGER.value, "Password123!"),
            (TEST_OPERATOR_ID, "operator@canopy.test", "Test Operator", UserRole.DATA_ENTRY_OPERATOR.value, "Password123!"),
            (TEST_VIEWER_ID, "viewer@canopy.test", "Test Viewer", UserRole.VIEWER.value, "Password123!"),
        ]
        for uid, email, name, role, pwd in test_users:
            if not db.query(User).filter_by(id=uid).first():
                db.add(User(
                    id=uid,
                    email=email,
                    full_name=name,
                    role=role,
                    hashed_password=hash_password(pwd),
                    is_active=True,
                ))

        db.commit()
    finally:
        db.close()
    return True


@pytest.fixture()
def db(engine, session_factory, seed_db):
    """Provide a test DB session with automatic rollback after each test."""
    connection = engine.connect()
    transaction = connection.begin()
    db_session = session_factory(bind=connection)

    yield db_session

    db_session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client(engine, session_factory, seed_db):
    """Provide a FastAPI TestClient with authenticated Admin override for legacy tests."""
    def override_get_db():
        db_session = session_factory()
        try:
            yield db_session
        finally:
            db_session.close()

    def override_current_user():
        db_session = session_factory()
        try:
            return db_session.query(User).filter(User.id == TEST_ADMIN_ID).first()
        finally:
            db_session.close()

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_current_user

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture()
def unauthenticated_client(engine, session_factory, seed_db):
    """Provide a FastAPI TestClient WITHOUT auth overrides to test real authentication."""
    def override_get_db():
        db_session = session_factory()
        try:
            yield db_session
        finally:
            db_session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def make_auth_headers(user_id: str, role: str) -> dict:
    """Helper to generate Authorization header for tests."""
    token = create_access_token(subject=user_id, claims={"role": role})
    return {"Authorization": f"Bearer {token}"}
