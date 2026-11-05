"""Test suite for CANOPY one-time emission factor seeding mechanism.

Verifies:
1. Default behavior (CANOPY_SEED_EMISSION_FACTORS_ONCE=False): seeding is skipped.
2. Explicitly enabled behavior (CANOPY_SEED_EMISSION_FACTORS_ONCE=True): seeder executes.
3. Idempotency: multiple runs never create duplicate emission factors.
4. Data safety: non-emission-factor data (campus, users, records) is completely untouched.
5. Error handling and safe logging without credential exposure.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings
from app.main import run_startup_seeding_if_enabled, sanitize_log_message
from app.database import SessionLocal, Base, engine
from app.models.emission_factor import EmissionFactor
from app.models.campus import Campus
from scripts.seed_emission_factors import EMISSION_FACTORS
import app.models  # noqa

PASS = 0
FAIL = 0


def check(label: str, condition: bool, detail: str = "") -> None:
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  [PASS] {label}", flush=True)
    else:
        FAIL += 1
        print(f"  [FAIL] {label}" + (f" — {detail}" if detail else ""), flush=True)


def test_disabled_by_default():
    """Verify that when CANOPY_SEED_EMISSION_FACTORS_ONCE is False, no seeding runs."""
    settings.CANOPY_SEED_EMISSION_FACTORS_ONCE = False
    db = SessionLocal()
    count_before = db.query(EmissionFactor).count()
    db.close()

    result = run_startup_seeding_if_enabled()

    db = SessionLocal()
    count_after = db.query(EmissionFactor).count()
    db.close()

    check("Flag disabled: returns None", result is None)
    check("Flag disabled: factor count unchanged", count_before == count_after,
          f"before={count_before}, after={count_after}")


def test_enabled_and_idempotent():
    """Verify that when CANOPY_SEED_EMISSION_FACTORS_ONCE is True, seeder runs safely and idempotently."""
    settings.CANOPY_SEED_EMISSION_FACTORS_ONCE = True

    # First execution (with flag True)
    stats1 = run_startup_seeding_if_enabled()
    check("Flag enabled: returns stats dict", isinstance(stats1, dict))

    db = SessionLocal()
    total_factors = db.query(EmissionFactor).count()
    # Check each of the 10 reference factors exists
    all_present = True
    for ef in EMISSION_FACTORS:
        rec = db.query(EmissionFactor).filter_by(id=ef["id"]).first()
        if not rec or rec.factor_value != ef["factor_value"]:
            all_present = False
            break
    db.close()

    check("Flag enabled: all 10 intended reference factors present in DB", all_present)
    check("Flag enabled: total factor count >= 10", total_factors >= 10, f"got {total_factors}")

    # Second execution (with flag still True to test idempotency)
    stats2 = run_startup_seeding_if_enabled()
    check("Flag enabled 2nd run: 0 new inserted", stats2.get("inserted", -1) == 0,
          f"inserted={stats2.get('inserted')}")
    check("Flag enabled 2nd run: all 10 skipped", stats2.get("skipped", -1) >= 10,
          f"skipped={stats2.get('skipped')}")

    db = SessionLocal()
    count_after_second = db.query(EmissionFactor).count()
    db.close()

    check("Flag enabled 2nd run: total factor count strictly unchanged",
          total_factors == count_after_second,
          f"before={total_factors}, after={count_after_second}")

    # Reset setting
    settings.CANOPY_SEED_EMISSION_FACTORS_ONCE = False


def test_preserves_other_data():
    """Verify that seeding never touches campus or other non-factor tables."""
    db = SessionLocal()
    campus_id = "campus-preserve-test-prod"
    existing_campus = db.query(Campus).filter_by(id=campus_id).first()
    if not existing_campus:
        db.add(Campus(id=campus_id, name="Preserve Test Campus", location="Loc", population=100, timezone="UTC"))
        db.commit()

    settings.CANOPY_SEED_EMISSION_FACTORS_ONCE = True
    run_startup_seeding_if_enabled()

    campus = db.query(Campus).filter_by(id=campus_id).first()
    check("Campus record preserved after seeding", campus is not None and campus.name == "Preserve Test Campus")

    # Clean up test campus
    db.delete(campus)
    db.commit()
    db.close()

    settings.CANOPY_SEED_EMISSION_FACTORS_ONCE = False


def test_credential_sanitization():
    """Verify that database URLs with passwords are never exposed in log outputs."""
    raw_error = "OperationalError: could not connect to postgresql://canopy_user:SecretP@ssword123@dpg-canopy.render.com/canopy_db"
    sanitized = sanitize_log_message(raw_error)
    check("Credential sanitization masks password", "SecretP@ssword123" not in sanitized)
    check("Credential sanitization preserves user and host", "canopy_user:***@dpg-canopy.render.com" in sanitized)


def run_all_tests():
    print("=" * 65, flush=True)
    print("CANOPY — One-Time Seeding Mechanism Test Suite", flush=True)
    print("=" * 65, flush=True)

    print("\n[TEST 1] Testing with flag disabled (default)...", flush=True)
    test_disabled_by_default()

    print("\n[TEST 2] Testing with flag enabled & idempotency...", flush=True)
    test_enabled_and_idempotent()

    print("\n[TEST 3] Testing non-factor data preservation...", flush=True)
    test_preserves_other_data()

    print("\n[TEST 4] Testing credential sanitization in logs...", flush=True)
    test_credential_sanitization()

    print("\n" + "=" * 65, flush=True)
    print(f"TOTAL: {PASS + FAIL}  |  PASSED: {PASS}  |  FAILED: {FAIL}", flush=True)
    print("=" * 65, flush=True)

    if FAIL > 0:
        sys.exit(1)


if __name__ == "__main__":
    run_all_tests()
