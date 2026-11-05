"""
CANOPY — Comprehensive Calculation Engine Tests

Tests all 13 scenarios from the requirements:
1.  Rooftop solar: 56,000 × 0.048 = 2,688 kgCO2e = 2.688 tCO2e
2.  Grid electricity: 56,000 × 0.82 = 45,920 kgCO2e = 45.920 tCO2e
3.  Zero consumption
4.  Missing emission factor
5.  Walking and cycling
6.  Transportation emissions
7.  Fuel / vehicle transport
8.  Waste calculations
9.  Multiple activity aggregation
10. Unit conversions
11. Database persistence (via SQLite in-memory)
12. Repeated seed-script execution (idempotency)
13. Dashboard analytics consistency

Usage:
    cd backend
    python scripts/test_calculations.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base, SessionLocal
from app.models.emission_factor import EmissionFactor
from app.models.activity import ActivityRecord, ActivityItem
from app.models.campus import Campus, ReportingPeriod
from app.schemas.calculation import PreviewItemInput
from app.services.calculation_service import calculation_service
from app.services.analytics_service import analytics_service
import app.models  # noqa

PASS = 0
FAIL = 0
RESULTS = []


def check(label: str, condition: bool, detail: str = "") -> None:
    global PASS, FAIL
    if condition:
        PASS += 1
        RESULTS.append(f"  [PASS] {label}")
    else:
        FAIL += 1
        RESULTS.append(f"  [FAIL] {label}" + (f" — {detail}" if detail else ""))


def approx_equal(a: float, b: float, tol: float = 0.001) -> bool:
    return abs(a - b) <= tol


def setup_db(db):
    """Create schema and seed the 10 emission factors from seed_emission_factors.py."""
    Base.metadata.create_all(bind=engine)

    factors = [
        dict(id="ef-elec-india-telangana-2024-v1", category="electricity",
             activity_type="grid_electricity", geography="IN-Telangana",
             activity_unit="kWh", factor_value=0.82, factor_unit="kgCO2e_per_kWh",
             source_name="ILLUSTRATIVE", source_url="", methodology="illustrative",
             version="1", valid_from="2024-01-01", valid_to="2026-12-31",
             notes="TEST", is_active=True),
        dict(id="ef-elec-solar-onsite-v1", category="electricity",
             activity_type="solar_electricity", geography="global",
             activity_unit="kWh", factor_value=0.048, factor_unit="kgCO2e_per_kWh",
             source_name="ILLUSTRATIVE", source_url="", methodology="illustrative",
             version="1", valid_from="2024-01-01", valid_to="2026-12-31",
             notes="TEST", is_active=True),
        dict(id="ef-trans-bus-diesel-pkm-v1", category="transport",
             activity_type="bus_diesel", geography="IN",
             activity_unit="passenger_km", factor_value=0.089, factor_unit="kgCO2e_per_passenger_km",
             source_name="ILLUSTRATIVE", source_url="", methodology="illustrative",
             version="1", valid_from="2024-01-01", valid_to="2026-12-31",
             notes="TEST", is_active=True),
        dict(id="ef-trans-car-petrol-vkm-v1", category="transport",
             activity_type="car_petrol", geography="IN",
             activity_unit="vehicle_km", factor_value=0.192, factor_unit="kgCO2e_per_vehicle_km",
             source_name="ILLUSTRATIVE", source_url="", methodology="illustrative",
             version="1", valid_from="2024-01-01", valid_to="2026-12-31",
             notes="TEST", is_active=True),
        dict(id="ef-trans-motorcycle-vkm-v1", category="transport",
             activity_type="motorcycle", geography="IN",
             activity_unit="vehicle_km", factor_value=0.113, factor_unit="kgCO2e_per_vehicle_km",
             source_name="ILLUSTRATIVE", source_url="", methodology="illustrative",
             version="1", valid_from="2024-01-01", valid_to="2026-12-31",
             notes="TEST", is_active=True),
        dict(id="ef-trans-auto-cng-pkm-v1", category="transport",
             activity_type="auto_cng", geography="IN",
             activity_unit="passenger_km", factor_value=0.045, factor_unit="kgCO2e_per_passenger_km",
             source_name="ILLUSTRATIVE", source_url="", methodology="illustrative",
             version="1", valid_from="2024-01-01", valid_to="2026-12-31",
             notes="TEST", is_active=True),
        dict(id="ef-trans-walking-cycling-v1", category="transport",
             activity_type="walking_cycling", geography="global",
             activity_unit="passenger_km", factor_value=0.0, factor_unit="kgCO2e_per_passenger_km",
             source_name="ILLUSTRATIVE", source_url="", methodology="zero tailpipe",
             version="1", valid_from="2020-01-01", valid_to="2030-12-31",
             notes="TEST", is_active=True),
        dict(id="ef-waste-organic-landfill-v1", category="waste",
             activity_type="organic_waste", geography="IN",
             activity_unit="tonne", factor_value=580.0, factor_unit="kgCO2e_per_tonne",
             source_name="ILLUSTRATIVE", source_url="", methodology="illustrative",
             version="1", valid_from="2024-01-01", valid_to="2026-12-31",
             notes="TEST", is_active=True),
        dict(id="ef-waste-organic-compost-v1", category="waste",
             activity_type="organic_waste_compost", geography="IN",
             activity_unit="tonne", factor_value=100.0, factor_unit="kgCO2e_per_tonne",
             source_name="ILLUSTRATIVE", source_url="", methodology="illustrative",
             version="1", valid_from="2024-01-01", valid_to="2026-12-31",
             notes="TEST", is_active=True),
        dict(id="ef-waste-mixed-landfill-v1", category="waste",
             activity_type="mixed_msw", geography="IN",
             activity_unit="tonne", factor_value=467.0, factor_unit="kgCO2e_per_tonne",
             source_name="ILLUSTRATIVE", source_url="", methodology="illustrative",
             version="1", valid_from="2024-01-01", valid_to="2026-12-31",
             notes="TEST", is_active=True),
    ]

    for f in factors:
        if not db.query(EmissionFactor).filter_by(id=f["id"]).first():
            db.add(EmissionFactor(**f))
    db.commit()


def test_1_solar_electricity(db):
    """Test: 56,000 kWh × 0.048 kgCO2e/kWh = 2,688 kgCO2e = 2.688 tCO2e"""
    items = [PreviewItemInput(activity_type="solar_electricity", quantity=56000, unit="kWh", category="electricity")]
    res = calculation_service.calculate_preview(db, items, campus_geography="IN-Telangana")
    line = res.lines[0]
    check("Test 1 — Solar electricity status=calculated", line.status == "calculated", f"got {line.status}")
    check("Test 1 — Solar factor_value=0.048", approx_equal(line.factor_value or 0, 0.048), f"got {line.factor_value}")
    check("Test 1 — Solar emissions_kg_co2e=2688", approx_equal(line.emissions_kg_co2e or 0, 2688.0, tol=0.1), f"got {line.emissions_kg_co2e}")
    check("Test 1 — Solar total_tco2e=2.688", approx_equal(res.total_tco2e, 2.688, tol=0.001), f"got {res.total_tco2e}")
    check("Test 1 — No warnings", len(res.warnings) == 0, f"warnings={res.warnings}")


def test_2_grid_electricity(db):
    """Test: 56,000 kWh × 0.82 kgCO2e/kWh = 45,920 kgCO2e = 45.920 tCO2e"""
    items = [PreviewItemInput(activity_type="grid_electricity", quantity=56000, unit="kWh", category="electricity")]
    res = calculation_service.calculate_preview(db, items, campus_geography="IN-Telangana")
    line = res.lines[0]
    check("Test 2 — Grid status=calculated", line.status == "calculated", f"got {line.status}")
    check("Test 2 — Grid factor_value=0.82", approx_equal(line.factor_value or 0, 0.82), f"got {line.factor_value}")
    check("Test 2 — Grid emissions_kg_co2e=45920", approx_equal(line.emissions_kg_co2e or 0, 45920.0, tol=1.0), f"got {line.emissions_kg_co2e}")
    check("Test 2 — Grid total_tco2e=45.920", approx_equal(res.total_tco2e, 45.920, tol=0.01), f"got {res.total_tco2e}")


def test_3_zero_consumption(db):
    """Test: 0 kWh → 0 emissions, status=calculated (factor found, 0 × factor = 0)"""
    items = [PreviewItemInput(activity_type="grid_electricity", quantity=0, unit="kWh", category="electricity")]
    res = calculation_service.calculate_preview(db, items, campus_geography="IN-Telangana")
    line = res.lines[0]
    check("Test 3 — Zero consumption status=calculated", line.status == "calculated", f"got {line.status}")
    check("Test 3 — Zero emissions_kg_co2e=0", (line.emissions_kg_co2e or 0) == 0.0, f"got {line.emissions_kg_co2e}")
    check("Test 3 — Total tCO2e=0", res.total_tco2e == 0.0, f"got {res.total_tco2e}")


def test_4_missing_factor(db):
    """Test: Unknown activity type → missing_factor status, None emissions, warning in list"""
    items = [PreviewItemInput(activity_type="nonexistent_activity_xyz", quantity=100, unit="kWh", category="electricity")]
    res = calculation_service.calculate_preview(db, items, campus_geography="IN-Telangana")
    line = res.lines[0]
    check("Test 4 — Missing factor status=missing_factor", line.status == "missing_factor", f"got {line.status}")
    check("Test 4 — emissions_kg_co2e is None", line.emissions_kg_co2e is None, f"got {line.emissions_kg_co2e}")
    check("Test 4 — total_kg_co2e=0 (not silently non-zero)", res.total_kg_co2e == 0.0, f"got {res.total_kg_co2e}")
    check("Test 4 — warning contains 'missing_factor'", any("missing_factor" in w for w in res.warnings), f"warnings={res.warnings}")
    check("Test 4 — completeness_status=no_data", res.completeness_status == "no_data", f"got {res.completeness_status}")


def test_5_walking_cycling(db):
    """Test: walking_cycling → factor=0.0 → 0 emissions, status=calculated (zero is valid)"""
    items = [PreviewItemInput(activity_type="walking_cycling", quantity=10000, unit="passenger_km", category="transport")]
    res = calculation_service.calculate_preview(db, items, campus_geography="IN-Telangana")
    line = res.lines[0]
    check("Test 5 — Cycling status=calculated", line.status == "calculated", f"got {line.status}")
    check("Test 5 — Cycling factor_value=0.0", (line.factor_value or 0) == 0.0, f"got {line.factor_value}")
    check("Test 5 — Cycling emissions_kg_co2e=0", (line.emissions_kg_co2e or 0) == 0.0, f"got {line.emissions_kg_co2e}")
    check("Test 5 — No missing_factor warning", not any("missing_factor" in w for w in res.warnings), f"warnings={res.warnings}")


def test_6_bus_transport(db):
    """Test: bus_diesel, 120,000 passenger_km × 0.089 = 10,680 kgCO2e = 10.680 tCO2e"""
    items = [PreviewItemInput(activity_type="bus_diesel", quantity=120000, unit="passenger_km", category="transport")]
    res = calculation_service.calculate_preview(db, items, campus_geography="IN-Telangana")
    line = res.lines[0]
    check("Test 6 — Bus status=calculated", line.status == "calculated", f"got {line.status}")
    check("Test 6 — Bus factor=0.089", approx_equal(line.factor_value or 0, 0.089), f"got {line.factor_value}")
    check("Test 6 — Bus emissions_kg_co2e=10680", approx_equal(line.emissions_kg_co2e or 0, 10680.0, tol=1.0), f"got {line.emissions_kg_co2e}")
    check("Test 6 — Bus total_tco2e=10.680", approx_equal(res.total_tco2e, 10.680, tol=0.01), f"got {res.total_tco2e}")


def test_7_vehicle_transport(db):
    """Test: car_petrol vehicle_km and motorcycle vehicle_km"""
    # Car
    items_car = [PreviewItemInput(activity_type="car_petrol", quantity=5000, unit="vehicle_km", category="transport")]
    res_car = calculation_service.calculate_preview(db, items_car, campus_geography="IN-Telangana")
    line_car = res_car.lines[0]
    check("Test 7 — Car status=calculated", line_car.status == "calculated", f"got {line_car.status}")
    check("Test 7 — Car factor=0.192", approx_equal(line_car.factor_value or 0, 0.192), f"got {line_car.factor_value}")
    check("Test 7 — Car emissions=960.0 kgCO2e", approx_equal(line_car.emissions_kg_co2e or 0, 960.0, tol=0.1), f"got {line_car.emissions_kg_co2e}")

    # Motorcycle
    items_moto = [PreviewItemInput(activity_type="motorcycle", quantity=5000, unit="vehicle_km", category="transport")]
    res_moto = calculation_service.calculate_preview(db, items_moto, campus_geography="IN-Telangana")
    line_moto = res_moto.lines[0]
    check("Test 7 — Motorcycle status=calculated", line_moto.status == "calculated", f"got {line_moto.status}")
    check("Test 7 — Motorcycle factor=0.113", approx_equal(line_moto.factor_value or 0, 0.113), f"got {line_moto.factor_value}")
    check("Test 7 — Motorcycle emissions=565.0 kgCO2e", approx_equal(line_moto.emissions_kg_co2e or 0, 565.0, tol=0.1), f"got {line_moto.emissions_kg_co2e}")


def test_8_waste_calculations(db):
    """Test: organic_waste and organic_waste_compost"""
    # Landfill
    items_lf = [PreviewItemInput(activity_type="organic_waste", quantity=10, unit="tonne", category="waste")]
    res_lf = calculation_service.calculate_preview(db, items_lf, campus_geography="IN-Telangana")
    line_lf = res_lf.lines[0]
    check("Test 8a — Landfill waste status=calculated", line_lf.status == "calculated", f"got {line_lf.status}")
    check("Test 8a — Landfill factor=580", approx_equal(line_lf.factor_value or 0, 580.0), f"got {line_lf.factor_value}")
    check("Test 8a — Landfill emissions=5800 kgCO2e", approx_equal(line_lf.emissions_kg_co2e or 0, 5800.0, tol=0.1), f"got {line_lf.emissions_kg_co2e}")

    # Compost
    items_co = [PreviewItemInput(activity_type="organic_waste_compost", quantity=10, unit="tonne", category="waste")]
    res_co = calculation_service.calculate_preview(db, items_co, campus_geography="IN-Telangana")
    line_co = res_co.lines[0]
    check("Test 8b — Compost status=calculated", line_co.status == "calculated", f"got {line_co.status}")
    check("Test 8b — Compost factor=100", approx_equal(line_co.factor_value or 0, 100.0), f"got {line_co.factor_value}")
    check("Test 8b — Compost emissions=1000 kgCO2e", approx_equal(line_co.emissions_kg_co2e or 0, 1000.0, tol=0.1), f"got {line_co.emissions_kg_co2e}")


def test_9_multiple_activity_aggregation(db):
    """Test: 3 activities summed correctly"""
    items = [
        PreviewItemInput(activity_type="grid_electricity", quantity=10000, unit="kWh", category="electricity"),
        PreviewItemInput(activity_type="bus_diesel", quantity=10000, unit="passenger_km", category="transport"),
        PreviewItemInput(activity_type="organic_waste", quantity=5, unit="tonne", category="waste"),
    ]
    res = calculation_service.calculate_preview(db, items, campus_geography="IN-Telangana")
    expected_kg = 10000 * 0.82 + 10000 * 0.089 + 5 * 580.0
    # = 8200 + 890 + 2900 = 11990 kgCO2e
    check("Test 9 — Multi-activity line count=3", len(res.lines) == 3, f"got {len(res.lines)}")
    check("Test 9 — All lines calculated", all(l.status == "calculated" for l in res.lines), f"statuses={[l.status for l in res.lines]}")
    check("Test 9 — total_kg aggregated correctly", approx_equal(res.total_kg_co2e, expected_kg, tol=1.0), f"expected={expected_kg}, got={res.total_kg_co2e}")
    check("Test 9 — completeness_status=complete", res.completeness_status == "complete", f"got {res.completeness_status}")


def test_10_unit_conversions(db):
    """Test: kgCO2e / 1000 = tCO2e correctly for all lines"""
    items = [
        PreviewItemInput(activity_type="solar_electricity", quantity=56000, unit="kWh", category="electricity"),
        PreviewItemInput(activity_type="bus_diesel", quantity=120000, unit="passenger_km", category="transport"),
    ]
    res = calculation_service.calculate_preview(db, items, campus_geography="IN-Telangana")
    for line in res.lines:
        if line.emissions_kg_co2e is not None and line.emissions_tco2e is not None:
            expected_t = line.emissions_kg_co2e / 1000
            check(
                f"Test 10 — {line.activity_type} kgCO2e/1000=tCO2e",
                approx_equal(line.emissions_tco2e, expected_t, tol=0.0001),
                f"kg={line.emissions_kg_co2e}, t={line.emissions_tco2e}, expected_t={expected_t:.6f}"
            )
    expected_total_t = res.total_kg_co2e / 1000
    check("Test 10 — total_tco2e=total_kg/1000", approx_equal(res.total_tco2e, expected_total_t, tol=0.0001),
          f"kg={res.total_kg_co2e}, t={res.total_tco2e}")


def test_11_database_persistence(db):
    """Test: ActivityRecord + ActivityItem creation and retrieval"""
    from app.schemas.activity import ActivityRecordCreate, ActivityItemCreate

    # Ensure campus and period exist for FK constraint
    if not db.query(Campus).filter_by(id="campus-test-01").first():
        db.add(Campus(id="campus-test-01", name="Test Campus", location="Test", population=100, timezone="UTC"))
    if not db.query(ReportingPeriod).filter_by(id="period-test-01").first():
        db.add(ReportingPeriod(id="period-test-01", campus_id="campus-test-01",
                               start_date="2025-01-01", end_date="2025-12-31",
                               label="Test Period", status="open"))
    db.commit()

    from app.repositories.activity_repo import activity_repo
    payload = ActivityRecordCreate(
        campus_id="campus-test-01",
        reporting_period_id="period-test-01",
        category="electricity",
        status="verified",
        notes="Persistence test",
        data_source="unit test",
        items=[
            ActivityItemCreate(activity_type="solar_electricity", quantity=56000, unit="kWh",
                               factor_id="ef-elec-solar-onsite-v1"),
        ]
    )
    record = activity_repo.create(db, payload)
    check("Test 11 — Record created with ID", bool(record.id), f"got id={record.id}")
    check("Test 11 — Record has 1 activity_item", len(record.activity_items) == 1, f"got {len(record.activity_items)}")
    check("Test 11 — ActivityItem quantity=56000", record.activity_items[0].quantity == 56000, f"got {record.activity_items[0].quantity}")
    check("Test 11 — ActivityItem factor_id persisted", record.activity_items[0].factor_id == "ef-elec-solar-onsite-v1",
          f"got {record.activity_items[0].factor_id}")

    # Fetch it back
    fetched = activity_repo.get(db, record.id)
    check("Test 11 — Record retrievable by ID", fetched is not None and fetched.id == record.id, f"fetched={fetched}")


def test_12_seed_idempotency(db):
    """Test: Running seed_emission_factors twice does not create duplicates"""
    from scripts.seed_emission_factors import seed_factors

    before_count = db.query(EmissionFactor).count()
    seed_factors(dry_run=False)
    after_first = db.query(EmissionFactor).count()
    seed_factors(dry_run=False)
    after_second = db.query(EmissionFactor).count()

    check("Test 12 — Idempotency: count same after 2nd run", after_first == after_second, f"first={after_first}, second={after_second}")
    # The original setup_db already seeded 10 factors; seed_emission_factors seeds 10 as well,
    # so none should be added on 2nd run
    check("Test 12 — No factors deleted by seed script", after_second >= before_count, f"before={before_count}, after={after_second}")


def test_13_analytics_consistency(db):
    """Test: analytics_service.get_summary matches calculation_service.calculate_preview totals"""
    # Ensure campus and period exist
    if not db.query(Campus).filter_by(id="campus-analytics-01").first():
        db.add(Campus(id="campus-analytics-01", name="Analytics Campus", location="Test", population=100, timezone="UTC"))
    if not db.query(ReportingPeriod).filter_by(id="period-analytics-01").first():
        db.add(ReportingPeriod(id="period-analytics-01", campus_id="campus-analytics-01",
                               start_date="2025-01-01", end_date="2025-12-31",
                               label="Analytics Test Period", status="open"))
    db.commit()

    # Clean up any existing activity records for this test campus to ensure clean run
    existing_rec_ids = [r.id for r in db.query(ActivityRecord).filter_by(campus_id="campus-analytics-01").all()]
    if existing_rec_ids:
        db.query(ActivityItem).filter(ActivityItem.activity_record_id.in_(existing_rec_ids)).delete(synchronize_session=False)
        db.query(ActivityRecord).filter_by(campus_id="campus-analytics-01").delete()
        db.commit()

    # Insert a known activity record
    rec = ActivityRecord(campus_id="campus-analytics-01", reporting_period_id="period-analytics-01",
                         category="electricity", status="verified", notes="analytics test",
                         data_source="unit test")
    db.add(rec)
    db.flush()
    db.add(ActivityItem(activity_record_id=rec.id, activity_type="grid_electricity",
                        quantity=10000.0, unit="kWh", subcategory="grid"))
    db.commit()

    summary = analytics_service.get_summary(db, "campus-analytics-01", "period-analytics-01", "IN-Telangana")
    expected_kg = 10000 * 0.82  # 8200 kgCO2e

    check("Test 13 — Analytics total_kg_co2e correct", approx_equal(summary["total_kg_co2e"], expected_kg, tol=1.0),
          f"expected={expected_kg}, got={summary['total_kg_co2e']}")
    check("Test 13 — Analytics total_tco2e=kg/1000", approx_equal(summary["total_tco2e"], expected_kg / 1000, tol=0.001),
          f"got={summary['total_tco2e']}")
    check("Test 13 — Analytics electricity category included", "electricity" in summary["categories"],
          f"categories={summary['categories']}")
    check("Test 13 — Analytics completeness_status=complete", summary["completeness_status"] == "complete",
          f"got {summary['completeness_status']}")


def main():
    print("=" * 65)
    print("CANOPY — Calculation Engine Test Suite")
    print("=" * 65)

    db = SessionLocal()
    try:
        setup_db(db)
        print("\n[SETUP] Schema created and 10 emission factors seeded.\n")

        print("--- Test 1: Rooftop Solar Electricity ---")
        test_1_solar_electricity(db)
        print("--- Test 2: Grid Electricity ---")
        test_2_grid_electricity(db)
        print("--- Test 3: Zero Consumption ---")
        test_3_zero_consumption(db)
        print("--- Test 4: Missing Emission Factor ---")
        test_4_missing_factor(db)
        print("--- Test 5: Walking / Cycling ---")
        test_5_walking_cycling(db)
        print("--- Test 6: Bus Transport ---")
        test_6_bus_transport(db)
        print("--- Test 7: Vehicle Transport (Car + Motorcycle) ---")
        test_7_vehicle_transport(db)
        print("--- Test 8: Waste Calculations ---")
        test_8_waste_calculations(db)
        print("--- Test 9: Multiple Activity Aggregation ---")
        test_9_multiple_activity_aggregation(db)
        print("--- Test 10: Unit Conversions ---")
        test_10_unit_conversions(db)
        print("--- Test 11: Database Persistence ---")
        test_11_database_persistence(db)
        print("--- Test 12: Seed Script Idempotency ---")
        test_12_seed_idempotency(db)
        print("--- Test 13: Analytics / Dashboard Consistency ---")
        test_13_analytics_consistency(db)

    finally:
        db.close()

    print("\n" + "=" * 65)
    print("RESULTS")
    print("=" * 65)
    for r in RESULTS:
        print(r)
    print("=" * 65)
    print(f"TOTAL: {PASS + FAIL}  |  PASSED: {PASS}  |  FAILED: {FAIL}")
    print("=" * 65)

    if FAIL > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
