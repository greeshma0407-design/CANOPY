# CANOPY Backend — Carbon Accounting & Reduction Intelligence

CANOPY backend is a Python FastAPI service providing auditable GHG carbon accounting calculations, activity data management, What-If decarbonization scenarios, longitudinal analytics, and compliance reporting for educational campuses.

## Architecture

```
backend/
├── app/
│   ├── config.py              # Environment configuration (Pydantic BaseSettings)
│   ├── database.py            # SQLAlchemy 2.x engine, SessionLocal, get_db dependency
│   ├── main.py                # FastAPI app instance, CORS middleware, API router mounting
│   ├── models/                # SQLAlchemy ORM declarative models (SQLAlchemy 2.x Mapped)
│   │   ├── campus.py          # Campus, ReportingPeriod
│   │   ├── activity.py        # ActivityRecord, ActivityItem
│   │   ├── emission_factor.py # EmissionFactor (versioned, validity-bounded)
│   │   ├── calculation.py     # CalculationRun, CalculationLine
│   │   ├── scenario.py        # Scenario, ScenarioItem
│   │   ├── recommendation.py  # Recommendation (economic + carbon payback)
│   │   └── report.py          # Report metadata and tracking
│   ├── schemas/               # Pydantic v2 validation contracts with explicit units
│   │   ├── common.py
│   │   ├── campus.py
│   │   ├── activity.py
│   │   ├── calculation.py
│   │   ├── scenario.py
│   │   ├── recommendation.py
│   │   └── report.py
│   ├── routers/               # Versioned REST API endpoints (/api/v1)
│   │   ├── health.py          # GET /health
│   │   ├── calculations.py    # POST /calculations/preview
│   │   ├── records.py         # POST, GET /records, GET /records/{id}
│   │   ├── analytics.py       # GET /analytics/summary, GET /analytics/trends
│   │   ├── scenarios.py       # POST, GET /scenarios, GET /scenarios/{id}, POST /scenarios/compare
│   │   ├── recommendations.py # GET /recommendations
│   │   └── reports.py         # POST, GET /reports/{id}, GET /reports/{id}/download
│   ├── services/              # Pure business logic and carbon calculation engine
│   │   ├── calculation_service.py # Core emissions engine (quantity × factor)
│   │   ├── analytics_service.py   # Aggregations and period time-series
│   │   ├── scenario_service.py    # What-If delta modeling
│   │   └── report_service.py      # CSV report generation
│   └── repositories/          # Database persistence abstraction
├── alembic/                   # Alembic schema migrations
│   ├── env.py
│   ├── script.py.mako
│   └── versions/              # Migration versions (c82a67372555_initial_schema.py)
├── scripts/
│   ├── init_db.py             # Database creation script
│   └── seed_demo.py           # Demo data seed script
├── tests/                     # Automated test suite (pytest)
│   ├── conftest.py            # In-memory SQLite fixtures with TEST-ONLY synthetic factors
│   ├── test_calculation_engine.py
│   ├── test_api_health.py
│   ├── test_api_records.py
│   ├── test_api_analytics.py
│   ├── test_api_scenarios.py
│   └── test_api_persistence_and_contracts.py
├── alembic.ini
├── requirements.txt
├── .env.example
└── .gitignore
```

---

## Setup & Running

### 1. Requirements & Environment
Python 3.10+ (tested on Python 3.14).

```powershell
cd c:\Users\DELL\OneDrive\Desktop\CANOPY\backend
pip install -r requirements.txt
```

Copy `.env.example` to `.env`:
```powershell
copy .env.example .env
```

### 2. Database Initialization & Migrations

Initialize database tables:
```powershell
python scripts/init_db.py
```

Or apply Alembic migrations:
```powershell
alembic upgrade head
```

### 3. Seed Demonstration Data

Populates the demo campus (`campus-mlrit-01`), 3 reporting periods (FY 2023-24, FY 2024-25, CY 2025), 9 illustrative emission factors, 8 decarbonization recommendations, and 12 monthly activity records:

```powershell
python scripts/seed_demo.py
```

*Note: All seeded emission factors and activity records are explicitly labelled as illustrative test/demo data.*

### 4. Start Development Server

```powershell
uvicorn app.main:app --reload --port 8000
```

- API Base: `http://localhost:8000/api/v1`
- Swagger UI Documentation: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/v1/health`

---

## Running Automated Tests

Run the full pytest suite:

```powershell
pytest -v
```

The test suite validates:
- Core calculation formula (`activity_quantity × emission_factor`)
- Unit mismatch rejection (returns explicit `missing_factor` instead of fabricating values)
- Missing factor handling (marks completeness as `partial` with detailed warnings)
- Factor validity date range bounds (`valid_from` / `valid_to`)
- Non-negative activity quantity validation (`422 Unprocessable Entity`)
- Partial data calculation and reporting
- Multi-category total sums (electricity + transport + waste)
- Scenario comparisons and delta computation
- Data persistence across application / database restarts
- REST API contracts and 404 / 422 error envelopes

---

## API Endpoints Reference

All endpoints are versioned under `/api/v1`:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status and methodology version |
| `POST` | `/calculations/preview` | Preview calculation for submitted items without persisting |
| `POST` | `/records` | Create an activity record with child activity items |
| `GET` | `/records` | List records with optional filters (`campus_id`, `period_id`, `category`) |
| `GET` | `/records/{record_id}` | Retrieve a specific activity record by ID |
| `GET` | `/analytics/summary` | Aggregated emissions total and category breakdown for a period |
| `GET` | `/analytics/trends` | Multi-period longitudinal emissions time series |
| `POST` | `/scenarios` | Create a What-If scenario with intervention items |
| `GET` | `/scenarios` | List saved scenarios |
| `GET` | `/scenarios/{scenario_id}` | Retrieve scenario details by ID |
| `POST` | `/scenarios/compare` | Compare two scenarios (Baseline vs Proposed) with delta breakdowns |
| `GET` | `/recommendations` | List prioritised recommendations with economic and carbon ROI |
| `POST` | `/reports` | Compile a compliance / inventory report |
| `GET` | `/reports/{report_id}` | Retrieve report status and metadata |
| `GET` | `/reports/{report_id}/download` | Download compiled report as CSV |
