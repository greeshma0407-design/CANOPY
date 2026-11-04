# CANOPY — Campus Carbon Accounting & Reduction Intelligence

> **"Small shifts. Greener campuses."**

CANOPY is an advanced full-stack campus carbon accounting platform designed for educational institutions to measure, understand, and reduce their operational greenhouse gas (GHG) emissions across Scope 2 (electricity) and Scope 3 (commuter transportation and solid waste).

---

## Project Structure

```
CANOPY/
├── docs/                # Specification documents (Requirements, UI/UX, Backend Schema, etc.)
├── frontend/            # Prompt 1: React 19 + TypeScript + Vite + Recharts + Lucide
│   ├── src/
│   │   ├── components/  # Botanical design system (KPI, Charts, Modals, AppShell)
│   │   ├── pages/       # 7 core routes (Overview, Calculator, Simulator, Analytics, etc.)
│   │   ├── hooks/       # Custom hooks (useCalculator, useSimulator, useCampusData)
│   │   └── data/        # Illustrative demo dataset and fallback models
│   └── package.json
├── backend/             # Prompt 2: Python + FastAPI + SQLAlchemy 2.x + Alembic + pytest
│   ├── app/             # Routers, calculation engine, models, schemas, repositories
│   ├── alembic/         # Database migrations
│   ├── scripts/         # init_db.py, seed_demo.py
│   ├── tests/           # 21 automated tests covering calculations, scenarios, contracts
│   ├── requirements.txt
│   └── README.md
└── inspo.png            # Design inspiration reference
```

---

## Quick Start

### 1. Backend (FastAPI + SQLite)

```powershell
cd backend

# Install dependencies
pip install -r requirements.txt

# Initialize database & run migrations
python scripts/init_db.py
alembic upgrade head

# Seed illustrative demo data
python scripts/seed_demo.py

# Run the API server
uvicorn app.main:app --reload --port 8000
```

- API Base: `http://localhost:8000/api/v1`
- Swagger UI Documentation: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/v1/health`

### 2. Frontend (React + Vite)

```powershell
cd frontend

# Install dependencies
pnpm install

# Run Vite development server
pnpm run dev
```

- Web App: `http://localhost:5173`

---

## Testing

Run the backend test suite:

```powershell
cd backend
pytest -v
```

All 21 automated tests validate:
1. Known quantity × known factor calculations
2. Unit mismatch handling
3. Missing factor explicit reporting (`missing_factor` warning, no fabricated outputs)
4. Factor validity date ranges
5. Non-negative quantity validation (`422`)
6. Partial data tracking
7. Multi-category calculations (electricity, transportation, waste)
8. What-If scenario comparisons and deltas
9. Data persistence across database restarts
10. REST API 404 / 422 error contracts and CSV report exports
