# Krishi Sarthii — Case Study

## TL;DR
Krishi Sarthii is an end-to-end agri-tech platform combining a TypeScript + React frontend (Vite) with a Python-based backend API and data/ML components. It centralizes mandi/market data, farm management, and decision-support features (geocoding, health scoring, weather/chatbot experiments). This case study summarizes goals, architecture, key features, implementation details, data sources, challenges, outcomes, and future work for use in a portfolio.

## Project at a glance
- Repository root contains a frontend app (`Frontend/`) and a Python API/service layer (`krishisarthii-api/`).
- Frontend: Vite, React + TypeScript (see `Frontend/src/main.tsx`, `tsconfig.*`, `vite.config.ts`).
- Backend: Python API (entry `krishisarthii-api/main.py`) with services, scripts, database helpers, and notebooks for ML/analysis.
- Data: `data/mandi_master.json`, `Dataset/KrishiTwin_Final_Engineered.csv` and other CSV/JSON assets used for analytics and models.

## Role & timeline
- Role: Full-stack implementation (frontend + backend), data integration, API design, and prototype ML/assistant experiments.
- Timeline: Iterative prototype development with notebooks and services; notebooks and `Encoder_and_model/` indicate experimental ML work and model exploration.

## Problem statement
Agricultural stakeholders (farmers, marketplace operators, analysts) need a unified tool to:
- Discover mandi/market price and availability data.
- Manage farm fields and visualize location-based insights.
- Access decision-support: geocoding, imputation/health scores, chat/assistant for weather and guidance.

## Key features
- Marketplace (APMC) browsing and data endpoints (`krishisarthii-api/services/apmc_service.py`).
- Farm workspace and field management UI (`Frontend/src/pages/panel-pages/MyFarmWorkspace.tsx` and `Frontend/src/context/FieldContext.tsx`).
- Multi-language UI support (locales under `Frontend/src/locales/`, includes English, Hindi, Punjabi files).
- Session, Toast, and Crop contexts for app state (`Frontend/src/context/*Context.tsx`).
- Backend services: geocoding, imputation, health scoring, and agro-specific business logic (`krishisarthii-api/services/`).
- Notebooks and model experiments (chatbot, Encoder and model exploration) in `krishisarthii-api/` and `Encoder_and_model/`.

## Tech stack
- Frontend: React, TypeScript, Vite, CSS (see `Frontend/package.json`, `vite.config.ts`).
- Backend: Python (requirements in `krishisarthii-api/requirements.txt`, API entry `main.py`), modular `services/` package.
- Data & ML: Jupyter notebooks, CSV/JSON datasets, experiment code under `chatbot/` and `Encoder_and_model/`.
- Tooling: logging and structured logger config (`krishisarthii-api/logger_config.py`), scripts for DB/schema tasks (`scripts/`).

## Architecture & data flow
1. Frontend (browser) calls backend REST endpoints exposed in `krishisarthii-api/main.py`.
2. Backend orchestrates domain services in `services/` (APMC data, geocoding, health scoring).
3. Persistent datasets (CSV/JSON) are loaded for analytics and model training; `database.py` and scripts show DB migration utilities.
4. Notebooks and model loaders (`chatbot/models_loader.py`, `Encoder_and_model/`) provide experimentation and prototype integration for assistant features.

## Implementation highlights
- Clean React contexts: state is separated into `SessionContext`, `FieldContext`, `CropContext`, and `ToastContext` for modular UI state management.
- i18n approach: JSON locale files in `Frontend/src/locales/` simplify language switching and scaling.
- Backend modularity: `services/` folder isolates domain logic (geocoding, apmc, health score), making endpoints in `main.py` thin orchestrators.
- Logging and observability: `logger_config.py`, `api_logging.py`, and `db_logging.py` provide structured logs for debug and auditing.
- Data engineering: `scripts/migrate_csv_to_postgres.py` and `scripts/schema_check.py` show intention to persist datasets into a relational DB for production workloads.

## Challenges & solutions
- Multi-domain scope: combining UI, API, and ML prototypes required modular separation (contexts + services + notebooks) to keep work manageable.
- Data quality: mandi/market data requires cleaning and imputation—handled via `imputation.py` and `health_score.py` services.
- Localization: ensured text assets were externalized to JSON locale files enabling quick iteration without touching components.

## Testing & validation
- Notebooks for exploratory validation and model analysis (many `.ipynb` files in `krishisarthii-api/` and `Encoder_and_model/`).
- Scripts for migrating and validating schema (`scripts/schema_check.py`) and test data population (`scripts/setup_test_farmer.py`).

## Deployment & run (how-to)
- Frontend (dev):

  cd Frontend
  npm install
  npm run dev

- Backend (dev):

  cd krishisarthii-api
  python -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
  python main.py

Adjust environment variables and database URLs as needed (see `env.example`).

## Notable files to include in portfolio screenshots
- `Frontend/src/pages/PanelPage.tsx` and `Frontend/src/sections/DashboardSection.tsx` — UI snapshots (dashboard, farm workspace).
- `krishisarthii-api/main.py` — API entrypoint (show routing/endpoint examples).
- `data/mandi_master.json` and `Dataset/KrishiTwin_Final_Engineered.csv` — samples of the data used.
- `Encoder_and_model/` or `krishisarthii-api/chatbot/` notebooks — model/experiment snapshots.

## Impact & outcomes
- Centralized access to mandi and farm data for stakeholders.
- A modular codebase that allows rapid iteration on UI features and backend services.
- Prototyped assistant features (chatbot, weather LLM tests) demonstrating extensibility toward conversational decision-support.

## Future work
- Production hardening: add CI/CD pipelines, containerization (Docker), and deployment manifests.
- Data pipeline: schedule ETL, integrate with a production DB, and implement versioned datasets.
- Model ops: package ML models, add inference endpoints, and monitor model performance in production.
- UX: add accessibility improvements and richer analytics dashboards.

## Quick bullets for portfolio copy
- Title: Krishi Sarthii — Agri-tech marketplace & farm workspace
- Role: Full-stack developer (React + TypeScript frontend, Python backend, data engineering & model prototyping)
- Tech: React, TypeScript, Vite, Python, Jupyter, CSV/JSON datasets
- Highlights: Multi-language interface, modular contexts & services, mandi data integration, farm workspace, ML/assistant experiments

## How I verified
- Inspected repository structure and key files (`Frontend/`, `krishisarthii-api/`, `data/`, `scripts/`, `Encoder_and_model/`) to summarize architecture and features.

## Assets & credits
- Use UI screenshots from `Frontend/public` or run the app locally to capture pages listed above.
- Attribution: code authored in this repo; data may be sourced from public mandi datasets (refer to `data/mandi_master.json`).

---

If you'd like, I can:
- Tailor this case study into a shorter one-page summary for your portfolio site.
- Generate social-media sized descriptions or write the entry text for LinkedIn/GitHub Projects.
- Create the actual screenshots by running the frontend and taking images (if you want, I can run dev server steps locally and capture suggestions for screenshots).
