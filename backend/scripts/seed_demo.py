"""Seed demo data for CANOPY platform.

Creates:
- Demo campus (id='campus-mlrit-01')
- 3 reporting periods (FY 2023-24, FY 2024-25, CY 2025)
- 9 illustrative emission factors (NOT authoritative — labelled TEST/DEMO ONLY)
- 8 recommendations mirroring frontend data
- 12 months of activity records for CY 2025

Usage:
    cd backend
    python scripts/seed_demo.py
"""
import sys
import os
import json
from datetime import datetime, date

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base, SessionLocal
from app.models.campus import Campus, ReportingPeriod
from app.models.emission_factor import EmissionFactor
from app.models.recommendation import Recommendation
from app.models.activity import ActivityRecord, ActivityItem
import app.models  # noqa: F401

# ---------------------------------------------------------------------------
# ILLUSTRATIVE EMISSION FACTORS — NOT AUTHORITATIVE — TEST/DEMO ONLY
# ---------------------------------------------------------------------------
DEMO_FACTORS = [
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
        "notes": "TEST/DEMO ONLY. Renewable is NOT assumed zero-emission.",
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

# ---------------------------------------------------------------------------
# DEMO CAMPUS & PERIODS
# ---------------------------------------------------------------------------
CAMPUS_ID = "campus-mlrit-01"

DEMO_PERIODS = [
    {
        "id": "period-fy2324-01",
        "campus_id": CAMPUS_ID,
        "start_date": "2023-04-01",
        "end_date": "2024-03-31",
        "label": "FY 2023-24",
        "status": "closed",
    },
    {
        "id": "period-fy2425-01",
        "campus_id": CAMPUS_ID,
        "start_date": "2024-04-01",
        "end_date": "2025-03-31",
        "label": "FY 2024-25",
        "status": "closed",
    },
    {
        "id": "period-cy2025-01",
        "campus_id": CAMPUS_ID,
        "start_date": "2025-01-01",
        "end_date": "2025-12-31",
        "label": "CY 2025",
        "status": "open",
    },
]

# ---------------------------------------------------------------------------
# RECOMMENDATIONS (mirrored from frontend src/data/recommendations.ts)
# ---------------------------------------------------------------------------
DEMO_RECOMMENDATIONS = [
    {
        "id": "rec-01-ac-schedule",
        "title": "Optimize Air Conditioning Scheduling & Setpoints",
        "category": "electricity",
        "short_description": "Standardize thermostat setpoints to 24-25°C across all lecture halls and administrative blocks, with automated shutdown 30 minutes after class conclusion.",
        "rationale": "HVAC cooling accounts for approximately 42% of MLRIT summer electrical loads. Raising cooling setpoints from 21°C to 24°C yields an immediate 15% reduction in chiller energy demand with negligible comfort impact.",
        "effort_level": "Low",
        "impact_level": "High",
        "priority": 1,
        "rule_key": "ELEC_HVAC_SETPOINT_OPTIMIZATION",
        "assumptions": json.dumps(["Applies to 68 split AC units and 4 central VRF systems", "Average 7 operating hours per day during academic semesters", "Grid emission factor: 0.82 kgCO2e/kWh (CEA illustrative baseline)"]),
        "co_benefits": json.dumps(["Extended compressor lifespan", "Reduced peak demand power charges", "Lower equipment maintenance overhead"]),
        "estimated_annual_savings_tco2e": 42.0,
        "cost_estimate": "₹25,000 (Smart programmable thermostats)",
        "payback_period": "1.5 months",
        "target_quarter": "Q1 2026",
        "timeline": "2 weeks implementation",
        "status": "In Progress",
        "is_active": True,
    },
    {
        "id": "rec-02-led-retrofit",
        "title": "Campus-wide LED Lighting & Occupancy Sensors",
        "category": "electricity",
        "short_description": "Replace remaining T8 fluorescent tubes and halogen floodlights in academic corridors, labs, and sports grounds with high-efficiency 140 lm/W LED fixtures and PIR occupancy sensors.",
        "rationale": "Existing legacy lighting consumes roughly 65,000 kWh annually. Switching to LED reduces wattage by 55% while sensors eliminate unnecessary illumination in unoccupied corridors.",
        "effort_level": "Low",
        "impact_level": "High",
        "priority": 2,
        "rule_key": "ELEC_LED_LIGHTING_RETROFIT",
        "assumptions": json.dumps(["Covers 1,200 lighting points across Academic Blocks A, B, and Central Library", "Average burning time: 9 hours/day for classrooms, 12 hours/day for corridors", "Calculated based on 46,340 kWh/yr avoided grid electricity"]),
        "co_benefits": json.dumps(["Superior illuminance (lux) for study environments", "Lower heat dissipation reducing AC cooling loads", "Zero mercury content"]),
        "estimated_annual_savings_tco2e": 38.0,
        "cost_estimate": "₹3,50,000 (Fixtures + labor)",
        "payback_period": "11 months",
        "target_quarter": "Q2 2026",
        "timeline": "6 weeks",
        "status": "Planned",
        "is_active": True,
    },
    {
        "id": "rec-03-solar-pv",
        "title": "250 kWp Rooftop Solar Photovoltaic Installation",
        "category": "electricity",
        "short_description": "Deploy a grid-tied 250 kWp solar PV array across the flat terraces of the Main Mechanical Block and Indoor Sports Complex with net-metering approval from TSSPDCL.",
        "rationale": "Generating clean solar power on campus displaces high-carbon coal-dominated grid electricity during daytime peak hours. Hyderabad averages over 300 sunny days annually with high global horizontal irradiance.",
        "effort_level": "High",
        "impact_level": "Very High",
        "priority": 3,
        "rule_key": "ELEC_RENEWABLE_SOLAR_PV",
        "assumptions": json.dumps(["250 kWp capacity yielding ~375,000 kWh/year (CUF ~17.1%)", "100% self-consumption during campus daytime operations", "Avoided emissions calculated at 0.82 kgCO2e/kWh CEA factor"]),
        "co_benefits": json.dumps(["Fixed electricity cost hedge against future tariff inflation", "Rooftop shading cooling top-floor classrooms", "Live laboratory for Electrical & Renewable Energy engineering students"]),
        "estimated_annual_savings_tco2e": 185.0,
        "cost_estimate": "₹1.15 Cr (Turnkey EPC with net-metering)",
        "payback_period": "3.8 years",
        "target_quarter": "Q3 2026",
        "timeline": "4 months",
        "status": "Planned",
        "is_active": True,
    },
    {
        "id": "rec-04-ev-bus",
        "title": "Transition Core Shuttle Routes to Electric / CNG Buses",
        "category": "transport",
        "short_description": "Replace the 6 oldest diesel buses in the institution transport fleet with dedicated 40-seater electric or CNG buses for high-density commuter corridors from Miyapur and Secunderabad.",
        "rationale": "Student and staff bus transportation currently generates 202 tCO2e annually. Electric shuttles reduce tailpipe emissions to zero and drop lifecycle emissions by over 60% compared to diesel.",
        "effort_level": "Medium",
        "impact_level": "High",
        "priority": 4,
        "rule_key": "TRANS_EV_BUS_CONVERSION",
        "assumptions": json.dumps(["6 buses covering an aggregate of 420 km daily during working semesters", "Diesel bus baseline: 0.089 kgCO2e/p-km vs EV bus: 0.038 kgCO2e/p-km (grid-charged)", "180 operational academic days per annum"]),
        "co_benefits": json.dumps(["Zero tailpipe NOx and particulate PM2.5 pollution near campus gates", "Silent, vibration-free passenger transit", "Alignment with Telangana EV Policy 2020-2030"]),
        "estimated_annual_savings_tco2e": 54.0,
        "cost_estimate": "₹4.5 Lakhs/year incremental lease or OPEX model",
        "payback_period": "2.4 years (fuel cost parity)",
        "target_quarter": "Q4 2026",
        "timeline": "6 months",
        "status": "Not Started",
        "is_active": True,
    },
    {
        "id": "rec-05-cycling-infra",
        "title": "Campus Cycling Infrastructure & Last-Mile Bike Share",
        "category": "transport",
        "short_description": "Construct protected bicycle lanes connecting student residential hostels to classroom clusters, install 100 covered bike racks, and deploy a 50-bicycle student sharing pool.",
        "rationale": "Many day-scholars and hostelites use two-wheelers for short internal 1-2 km campus hops. Providing dedicated cycling paths and bikes eliminates motorized trips on campus grounds.",
        "effort_level": "Low",
        "impact_level": "Medium",
        "priority": 5,
        "rule_key": "TRANS_ACTIVE_CYCLING_LANES",
        "assumptions": json.dumps(["Displaces ~175,000 two-wheeler passenger-km annually", "Two-wheeler emission factor: 0.103 kgCO2e/vehicle-km", "Zero operating tailpipe emissions"]),
        "co_benefits": json.dumps(["Student physical fitness and active lifestyle", "Calmer, pedestrian-safe campus roads", "Reduced parking congestion at main entrance"]),
        "estimated_annual_savings_tco2e": 18.0,
        "cost_estimate": "₹1,80,000 (50 robust campus cycles + signage + shelters)",
        "payback_period": "Immediate (student well-being)",
        "target_quarter": "Q1 2026",
        "timeline": "3 weeks",
        "status": "In Progress",
        "is_active": True,
    },
    {
        "id": "rec-06-organic-composting",
        "title": "Expanded Aerobic Composting Pit for Mess & Garden Waste",
        "category": "waste",
        "short_description": "Upgrade the existing campus composting facility into a 3-chamber aerated static pile composting system handling 100% of cafeteria wet waste and landscape clippings.",
        "rationale": "Organic kitchen waste dumped in municipal landfills undergoes anaerobic decomposition, releasing potent methane (CH4). Managed aerobic composting avoids methane and creates organic nutrient-rich soil fertilizer.",
        "effort_level": "Medium",
        "impact_level": "Medium",
        "priority": 6,
        "rule_key": "WASTE_ORGANIC_AEROBIC_COMPOSTING",
        "assumptions": json.dumps(["Diverts 65 tonnes of wet cafeteria waste and horticultural debris annually from landfill", "Avoids 480 kgCO2e/tonne delta between landfill (580 kg) and composting (100 kg)", "Total avoided emissions: ~31.2 tCO2e/year"]),
        "co_benefits": json.dumps(["Free organic fertilizer for 24 acres of campus lawns and tree plantations", "No foul odors or leachate runoff", "Student environmental club learning project"]),
        "estimated_annual_savings_tco2e": 32.0,
        "cost_estimate": "₹95,000 (Compost pits, shredder, bacterial inoculant)",
        "payback_period": "6 months (fertilizer savings)",
        "target_quarter": "Q4 2025",
        "timeline": "Completed October 2025",
        "status": "Completed",
        "is_active": True,
    },
    {
        "id": "rec-07-single-use-plastic-ban",
        "title": "Single-Use Plastic Ban & RO Water Refill Stations",
        "category": "waste",
        "short_description": "Implement a strict campus ban on disposable plastic bottles, cups, and cutlery in food courts, supplemented by 12 touchless chilled RO water refill stations.",
        "rationale": "Eliminating single-use plastics reduces landfill volume, avoids incineration emissions from contaminated plastic wrappers, and fosters a zero-waste campus ethos.",
        "effort_level": "Low",
        "impact_level": "Low",
        "priority": 7,
        "rule_key": "WASTE_SINGLE_USE_PLASTIC_BAN",
        "assumptions": json.dumps(["Eliminates ~140,000 single-use PET bottles and 200,000 plastic cups annually", "Reduction of 2.1 tonnes of plastic waste from municipal incinerator / landfill streams", "Calculated using avoided plastic manufacture and disposal factors"]),
        "co_benefits": json.dumps(["Cleaner, litter-free campus surroundings", "Substantial savings for students on bottled water", "Promotes circular economy habits"]),
        "estimated_annual_savings_tco2e": 8.0,
        "cost_estimate": "₹1,20,000 (Water stations & reusable steel canteen wares)",
        "payback_period": "4 months",
        "target_quarter": "Q1 2026",
        "timeline": "4 weeks",
        "status": "In Progress",
        "is_active": True,
    },
    {
        "id": "rec-08-carpooling",
        "title": "Staff & Student Carpooling App & Preferred Parking",
        "category": "transport",
        "short_description": "Launch a campus-verified carpool matching board on the student portal, reserving shaded front-row parking slots for vehicles carrying 3 or more campus commuters.",
        "rationale": "Currently over 80 faculty and senior students drive solo to campus from Secunderabad, Banjara Hills, and Gachibowli. Pooling reduces vehicle trips by 35% across participating routes.",
        "effort_level": "Low",
        "impact_level": "Medium",
        "priority": 8,
        "rule_key": "TRANS_COMMUTER_CARPOOL_PROGRAM",
        "assumptions": json.dumps(["Consolidates 45 daily single-occupant passenger cars into shared rides of 3+ passengers", "Average round trip commute: 32 km", "Factor: 0.171 kgCO2e/vehicle-km avoided"]),
        "co_benefits": json.dumps(["Reduces parking lot congestion by 30+ vehicles daily", "Inter-departmental networking and commuter fuel savings", "Reduces peak hour traffic at campus junction"]),
        "estimated_annual_savings_tco2e": 22.0,
        "cost_estimate": "₹15,000 (Carpool parking signage & portal badge integration)",
        "payback_period": "Immediate",
        "target_quarter": "Q2 2026",
        "timeline": "3 weeks",
        "status": "Planned",
        "is_active": True,
    },
]

# Monthly activity data — CY 2025 — illustrative demo values
MONTHLY_ELEC_KWH = [42000, 38500, 41000, 44500, 52000, 58000, 55000, 53000, 47000, 43000, 39500, 41000]
MONTHLY_BUS_PKM = [185000, 170000, 182000, 175000, 190000, 0, 0, 180000, 192000, 188000, 176000, 165000]
MONTHLY_CAR_VKM = [28000, 25500, 27000, 29000, 31000, 0, 0, 29500, 30000, 28500, 27000, 26000]
MONTHLY_WASTE_T = [4.2, 3.8, 4.0, 4.3, 4.5, 3.1, 3.2, 4.1, 4.4, 4.2, 4.0, 4.6]

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Campus
        if not db.query(Campus).filter_by(id=CAMPUS_ID).first():
            db.add(Campus(
                id=CAMPUS_ID,
                name="MLRIT Campus",
                location="Hyderabad, Telangana, India",
                population=4500,
                timezone="Asia/Kolkata",
            ))
            print(f"Created campus: {CAMPUS_ID}")
        else:
            print(f"Campus already exists: {CAMPUS_ID}")

        # Periods
        for p in DEMO_PERIODS:
            if not db.query(ReportingPeriod).filter_by(id=p["id"]).first():
                db.add(ReportingPeriod(**p))
                print(f"Created period: {p['label']}")

        # Factors
        for f in DEMO_FACTORS:
            if not db.query(EmissionFactor).filter_by(id=f["id"]).first():
                db.add(EmissionFactor(**f))
                print(f"Created factor: {f['id']}")

        # Recommendations
        for rec in DEMO_RECOMMENDATIONS:
            if not db.query(Recommendation).filter_by(id=rec["id"]).first():
                db.add(Recommendation(**rec))
                print(f"Created recommendation: {rec['id']}")

        db.commit()

        # Monthly activity records for CY 2025
        period_id = "period-cy2025-01"
        for i, month_name in enumerate(MONTH_NAMES):
            month_num = i + 1
            label = f"2025-{month_num:02d}"

            # Electricity record
            elec_kwh = MONTHLY_ELEC_KWH[i]
            if elec_kwh > 0:
                rec = ActivityRecord(
                    campus_id=CAMPUS_ID,
                    reporting_period_id=period_id,
                    category="electricity",
                    status="submitted",
                    notes=f"Grid electricity — {month_name} 2025 (illustrative demo)",
                    data_source="Smart meter",
                )
                db.add(rec)
                db.flush()
                db.add(ActivityItem(
                    activity_record_id=rec.id,
                    activity_type="grid_electricity",
                    quantity=float(elec_kwh),
                    unit="kWh",
                    subcategory="grid",
                ))

            # Transport — bus
            bus_pkm = MONTHLY_BUS_PKM[i]
            if bus_pkm > 0:
                rec = ActivityRecord(
                    campus_id=CAMPUS_ID,
                    reporting_period_id=period_id,
                    category="transport",
                    status="submitted",
                    notes=f"Diesel college bus — {month_name} 2025 (illustrative demo)",
                    data_source="Fleet log",
                )
                db.add(rec)
                db.flush()
                db.add(ActivityItem(
                    activity_record_id=rec.id,
                    activity_type="bus_diesel",
                    quantity=float(bus_pkm),
                    unit="passenger_km",
                    subcategory="commuter_bus",
                ))

            # Transport — cars
            car_vkm = MONTHLY_CAR_VKM[i]
            if car_vkm > 0:
                rec = ActivityRecord(
                    campus_id=CAMPUS_ID,
                    reporting_period_id=period_id,
                    category="transport",
                    status="submitted",
                    notes=f"Staff/student petrol cars — {month_name} 2025 (illustrative demo)",
                    data_source="Parking log estimate",
                )
                db.add(rec)
                db.flush()
                db.add(ActivityItem(
                    activity_record_id=rec.id,
                    activity_type="car_petrol",
                    quantity=float(car_vkm),
                    unit="vehicle_km",
                    subcategory="personal_vehicle",
                ))

            # Waste
            waste_t = MONTHLY_WASTE_T[i]
            rec = ActivityRecord(
                campus_id=CAMPUS_ID,
                reporting_period_id=period_id,
                category="waste",
                status="submitted",
                notes=f"Organic cafeteria waste to landfill — {month_name} 2025 (illustrative demo)",
                data_source="Waste contractor manifest",
            )
            db.add(rec)
            db.flush()
            db.add(ActivityItem(
                activity_record_id=rec.id,
                activity_type="organic_waste",
                quantity=float(waste_t),
                unit="tonne",
                subcategory="cafeteria",
            ))

        db.commit()
        print("\nSeed complete! Demo campus, periods, factors, recommendations, and 12 months of activity records created.")

    finally:
        db.close()


if __name__ == "__main__":
    main()
