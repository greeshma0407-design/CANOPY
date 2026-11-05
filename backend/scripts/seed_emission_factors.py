"""Production-safe emission factor seed script for CANOPY.

Idempotent: safe to run multiple times. Never deletes or resets existing data.
Only inserts emission factor records. Never touches campus, user, inventory,
or calculation records.

Usage:
    cd backend
    python scripts/seed_emission_factors.py            # normal run
    python scripts/seed_emission_factors.py --dry-run  # preview only, no DB changes

Factors sourced from DEMO_FACTORS in seed_demo.py — illustrative only.
All factors are labelled TEST/DEMO ONLY and are not for regulatory submission.
"""
import sys
import os
import argparse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ---------------------------------------------------------------------------
# ILLUSTRATIVE EMISSION FACTORS — NOT AUTHORITATIVE — TEST/DEMO ONLY
# These are the same factors defined in seed_demo.py DEMO_FACTORS list.
# They must remain labelled illustrative and not attributed as authoritative.
# ---------------------------------------------------------------------------
EMISSION_FACTORS = [
    {
        "id": "ef-elec-india-telangana-2024-v1",
        "category": "electricity",
        "activity_type": "grid_electricity",
        "geography": "IN-Telangana",
        "activity_unit": "kWh",
        "factor_value": 0.82,
        "factor_unit": "kgCO2e_per_kWh",
        "source_name": "ILLUSTRATIVE — CEA Baseline Database v19 region approximate",
        "source_url": "https://cea.nic.in/",
        "methodology": "Market-based Scope 2, illustrative demonstration factor",
        "version": "1",
        "valid_from": "2024-01-01",
        "valid_to": "2026-12-31",
        "notes": "TEST/DEMO ONLY. Not for regulatory submission.",
        "is_active": True,
    },
    {
        "id": "ef-elec-solar-onsite-v1",
        "category": "electricity",
        "activity_type": "solar_electricity",
        "geography": "global",
        "activity_unit": "kWh",
        "factor_value": 0.048,
        "factor_unit": "kgCO2e_per_kWh",
        "source_name": "ILLUSTRATIVE — Lifecycle estimate, not zero-emission assumption",
        "source_url": "",
        "methodology": "Lifecycle/upstream illustrative only. Not market-based.",
        "version": "1",
        "valid_from": "2024-01-01",
        "valid_to": "2026-12-31",
        "notes": "TEST/DEMO ONLY. Renewable is NOT assumed zero-emission in this illustrative model.",
        "is_active": True,
    },
    {
        "id": "ef-trans-bus-diesel-pkm-v1",
        "category": "transport",
        "activity_type": "bus_diesel",
        "geography": "IN",
        "activity_unit": "passenger_km",
        "factor_value": 0.089,
        "factor_unit": "kgCO2e_per_passenger_km",
        "source_name": "ILLUSTRATIVE — ARAI/CPCB composite approximation",
        "source_url": "",
        "methodology": "Illustrative composite, demonstration only",
        "version": "1",
        "valid_from": "2024-01-01",
        "valid_to": "2026-12-31",
        "notes": "TEST/DEMO ONLY.",
        "is_active": True,
    },
    {
        "id": "ef-trans-car-petrol-vkm-v1",
        "category": "transport",
        "activity_type": "car_petrol",
        "geography": "IN",
        "activity_unit": "vehicle_km",
        "factor_value": 0.192,
        "factor_unit": "kgCO2e_per_vehicle_km",
        "source_name": "ILLUSTRATIVE — demonstration factor",
        "source_url": "",
        "methodology": "Illustrative demonstration only",
        "version": "1",
        "valid_from": "2024-01-01",
        "valid_to": "2026-12-31",
        "notes": "TEST/DEMO ONLY.",
        "is_active": True,
    },
    {
        "id": "ef-trans-motorcycle-vkm-v1",
        "category": "transport",
        "activity_type": "motorcycle",
        "geography": "IN",
        "activity_unit": "vehicle_km",
        "factor_value": 0.113,
        "factor_unit": "kgCO2e_per_vehicle_km",
        "source_name": "ILLUSTRATIVE — demonstration factor",
        "source_url": "",
        "methodology": "Illustrative demonstration only",
        "version": "1",
        "valid_from": "2024-01-01",
        "valid_to": "2026-12-31",
        "notes": "TEST/DEMO ONLY.",
        "is_active": True,
    },
    {
        "id": "ef-trans-auto-cng-pkm-v1",
        "category": "transport",
        "activity_type": "auto_cng",
        "geography": "IN",
        "activity_unit": "passenger_km",
        "factor_value": 0.045,
        "factor_unit": "kgCO2e_per_passenger_km",
        "source_name": "ILLUSTRATIVE — demonstration factor",
        "source_url": "",
        "methodology": "Illustrative demonstration only",
        "version": "1",
        "valid_from": "2024-01-01",
        "valid_to": "2026-12-31",
        "notes": "TEST/DEMO ONLY.",
        "is_active": True,
    },
    {
        "id": "ef-trans-walking-cycling-v1",
        "category": "transport",
        "activity_type": "walking_cycling",
        "geography": "global",
        "activity_unit": "passenger_km",
        "factor_value": 0.0,
        "factor_unit": "kgCO2e_per_passenger_km",
        "source_name": "ILLUSTRATIVE — Active transport zero direct tailpipe emissions",
        "source_url": "",
        "methodology": "Zero direct operating emissions for active mobility (walking/cycling)",
        "version": "1",
        "valid_from": "2020-01-01",
        "valid_to": "2030-12-31",
        "notes": "TEST/DEMO ONLY. Zero tailpipe emissions for walking and cycling.",
        "is_active": True,
    },
    {
        "id": "ef-waste-organic-landfill-v1",
        "category": "waste",
        "activity_type": "organic_waste",
        "geography": "IN",
        "activity_unit": "tonne",
        "factor_value": 580.0,
        "factor_unit": "kgCO2e_per_tonne",
        "source_name": "ILLUSTRATIVE — IPCC 2006 Tier 1 approximation",
        "source_url": "",
        "methodology": "Illustrative demonstration only",
        "version": "1",
        "valid_from": "2024-01-01",
        "valid_to": "2026-12-31",
        "notes": "TEST/DEMO ONLY. Treatment route: landfill.",
        "is_active": True,
    },
    {
        "id": "ef-waste-organic-compost-v1",
        "category": "waste",
        "activity_type": "organic_waste_compost",
        "geography": "IN",
        "activity_unit": "tonne",
        "factor_value": 100.0,
        "factor_unit": "kgCO2e_per_tonne",
        "source_name": "ILLUSTRATIVE — IPCC 2006 Tier 1 approximation",
        "source_url": "",
        "methodology": "Illustrative demonstration only",
        "version": "1",
        "valid_from": "2024-01-01",
        "valid_to": "2026-12-31",
        "notes": "TEST/DEMO ONLY. Treatment route: composting.",
        "is_active": True,
    },
    {
        "id": "ef-waste-mixed-landfill-v1",
        "category": "waste",
        "activity_type": "mixed_msw",
        "geography": "IN",
        "activity_unit": "tonne",
        "factor_value": 467.0,
        "factor_unit": "kgCO2e_per_tonne",
        "source_name": "ILLUSTRATIVE — demonstration factor",
        "source_url": "",
        "methodology": "Illustrative demonstration only",
        "version": "1",
        "valid_from": "2024-01-01",
        "valid_to": "2026-12-31",
        "notes": "TEST/DEMO ONLY.",
        "is_active": True,
    },
]


def seed_factors(dry_run: bool = False) -> dict:
    """Seed emission factors into the database, skipping existing records."""
    from app.database import engine, Base, SessionLocal
    from app.models.emission_factor import EmissionFactor
    import app.models  # noqa: F401 — ensure all models registered

    if not dry_run:
        Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    inserted = 0
    skipped = 0

    try:
        for factor_data in EMISSION_FACTORS:
            existing = db.query(EmissionFactor).filter_by(id=factor_data["id"]).first()
            if existing:
                print(f"  [SKIP]   {factor_data['id']} (already exists, factor_value={existing.factor_value})", flush=True)
                skipped += 1
            else:
                print(f"  [INSERT] {factor_data['id']} "
                      f"({factor_data['category']}/{factor_data['activity_type']}, "
                      f"geography={factor_data['geography']}, "
                      f"factor={factor_data['factor_value']} {factor_data['factor_unit']})", flush=True)
                if not dry_run:
                    db.add(EmissionFactor(**factor_data))
                inserted += 1

        if dry_run:
            print(f"\n[DRY RUN] Would insert {inserted} factor(s), skip {skipped} existing.", flush=True)
            db.rollback()
        else:
            db.commit()
            print(f"\n[DONE] Inserted {inserted} factor(s), skipped {skipped} existing.", flush=True)

        return {"inserted": inserted, "skipped": skipped, "dry_run": dry_run}

    except Exception as exc:
        db.rollback()
        print(f"\n[ERROR] Transaction rolled back: {exc}", file=sys.stderr, flush=True)
        raise
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Seed illustrative emission factors into CANOPY database (idempotent)."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview what would be inserted without making DB changes.",
    )
    args = parser.parse_args()

    print("=" * 60)
    print("CANOPY — Emission Factor Seeder")
    print("ILLUSTRATIVE FACTORS ONLY — NOT FOR REGULATORY SUBMISSION")
    print("=" * 60)

    if args.dry_run:
        print("\n*** DRY RUN MODE — No database changes will be made ***\n")
    else:
        print(f"\nFactors to process: {len(EMISSION_FACTORS)}\n")

    seed_factors(dry_run=args.dry_run)


if __name__ == "__main__":
    main()
