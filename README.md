# Sentivoy

Sentivoy is a security intelligence platform that ingests application logs, scores them with TensorFlow models, and applies rule-based context to recommend a response. Operators sign in through Supabase and review live metrics, alerts, geo origins, and PDF reports in a React dashboard.

## How it works

1. A client posts a log to `POST /api/logs` with an `X-API-Key`. The key maps the event to a tenant.
2. The API stores the raw event in Supabase and runs the pipeline in the background.
3. Feature extraction builds a 6-value vector from the user's recent history: login frequency, failed-login ratio, time since the previous event, geo distance, request rate, and whether the IP changed.
4. Two TensorFlow models score that vector. An autoencoder, trained only on normal behavior, flags unfamiliar patterns by reconstruction error. An attack classifier labels brute force, impossible travel, API abuse, and account takeover. A confident attack class becomes the anomaly; otherwise the reconstruction error is compared with the trained threshold (or `ANOMALY_THRESHOLD` when that variable is set).
5. The decision engine can override that score. Impossible travel, brute-force failure ratios, burst request rates, and anomalous admin activity escalate severity and set an action: `ignore`, `monitor`, `flag`, or `block`.
6. Anomalies are written to Supabase. Critical and high events that recommend `block` or `flag` can email the tenant through Resend.
7. The dashboard polls `GET /api/dashboard/summary` with the user's Supabase JWT and refreshes about every 5 seconds.

Geo coordinates on the dashboard come from [ip-api.com](http://ip-api.com) batch lookups, cached in process memory. Feature extraction uses a hash-based stand-in for IP geolocation when computing travel distance, so distance is a behavioral signal rather than a real map lookup.

## Repository layout

```
Sentivoy/
├── backend/                 FastAPI API, ML pipeline, email, and PDF reports
│   ├── app/
│   │   ├── api/             HTTP routes
│   │   ├── agent/           Rule-based decision engine
│   │   ├── core/            Settings, JWT verification, rate limiting
│   │   ├── db/              Supabase client
│   │   ├── ml/              TensorFlow autoencoder, attack classifier, training
│   │   ├── models/          Pydantic schemas
│   │   ├── pipeline/        Features, inference, orchestration
│   │   └── services/        Resend email and ReportLab PDFs
│   ├── scripts/             Synthetic log generator
│   ├── tests/               Pipeline tests
│   └── requirements.txt
└── frontend/                TanStack Start dashboard
    └── src/
        ├── routes/          File-based pages
        ├── components/      Sentinel views and shadcn/ui primitives
        ├── hooks/           Dashboard query
        └── lib/             API base URL, Supabase client, auth
```

`frontend/README.md` documents the UI in more detail. Treat this file as the source of truth for how the full system runs.

## Tech stack

| Layer | What it uses |
|---|---|
| API | Python, FastAPI, Uvicorn, Pydantic, SlowAPI (60 requests/minute per IP) |
| Detection | TensorFlow 2 autoencoder and attack classifier (`backend/app/ml/models.py`) |
| Decisions | Rule engine in `backend/app/agent/decision_engine.py` |
| Data and auth | Supabase (Postgres + Auth). Service role on the API, anon key in the browser |
| Alerts | Resend |
| Reports | ReportLab PDFs, download or email |
| Frontend | React 19, TanStack Start / Router / Query, Vite 7, Tailwind CSS 4, shadcn/ui, Recharts |
| Frontend hosting config | Cloudflare Workers (`frontend/wrangler.jsonc`) and a Netlify SPA fallback |

## Prerequisites

- Python 3.11+
- Node.js 18+ (or Bun 1.3+)
- A Supabase project with Auth enabled
- Optional: a [Resend](https://resend.com) API key for alert and report email

## Supabase tables

The API expects these tables. Tenant id is the Supabase Auth user id (`sub`).

| Table | Role |
|---|---|
| `logs` | Raw ingested events (`id`, `tenant_id`, `user_id`, `ip_address`, `timestamp`, `event_type`, `status`) |
| `features` | The 6-value feature vector for a log |
| `anomalies` | Score, severity, action, and reasoning. Reconstruction error is stored as `reconstruction_error` |
| `api_keys` | Per-tenant ingestion keys (`tenant_id`, `key_string`, `name`, `is_active`, `created_at`) |

## Environment

Copy `backend/.env.example` to `backend/.env` and fill in the Supabase values. Run `backend/supabase/schema.sql` in the Supabase SQL editor before ingesting logs. Variable-by-variable notes are in `backend/README.md`.

`API_KEY` is the development ingestion key. When a request uses `sentivoy-dev-api-key-change-me`, the API attaches the log to the first Supabase Auth user. Production clients should use keys created from the dashboard (`POST /api/keys`).

Copy `frontend/.env.example` to `frontend/.env`. Set `VITE_API_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY`. Use the anon key here, not the service-role key.

The API allows CORS from `FRONTEND_URL`, `http://localhost:5173`, and `http://localhost:8080`.

## Run locally

Backend:

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Saved weights live in `backend/app/ml/model_store/` (`autoencoder.keras`, `attack_classifier.keras`, `calibration.json`). If those files are missing, the API trains them on startup. Retrain after changing the feature ranges:

```bash
cd backend
python -m app.ml.train
```

Frontend (from `frontend/`):

```bash
npm install
npm run dev
```

Vite serves the app on the port it prints, usually `http://localhost:5173`. Open `/auth` to sign up or sign in, then use `/dashboard`.

Push sample traffic while the API is running:

```bash
cd backend
python scripts/generate_synthetic_logs.py
```

The script posts normal traffic plus brute-force, geo-jump, and API-abuse patterns to `POST /api/logs`.

## API

Interactive docs: `http://localhost:8000/docs`.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/` | None | Health message |
| `POST` | `/api/logs` | `X-API-Key` | Ingest a log (202). Processing continues in the background |
| `GET` | `/api/anomalies` | Bearer JWT | List anomaly results |
| `GET` | `/api/dashboard/summary` | Bearer JWT | Metrics, trend, threat patterns, geo origins, alerts |
| `GET` | `/api/live-logs` | Bearer JWT | Recent logs for the tenant |
| `POST` | `/api/keys` | Bearer JWT | Create an ingestion key |
| `GET` | `/api/keys` | Bearer JWT | List keys |
| `DELETE` | `/api/keys/{key_id}` | Bearer JWT | Revoke a key |
| `GET` | `/api/reports/pdf` | Bearer JWT | Download a status PDF |
| `POST` | `/api/reports/email` | Bearer JWT | Email that PDF |
| `POST` | `/api/notifications/test` | Bearer JWT | Send a test alert |
| `GET` | `/api/notifications/status` | Bearer JWT | Whether email alerts are configured |

Log body (`POST /api/logs`):

```json
{
  "user_id": "user_42",
  "ip_address": "203.0.113.10",
  "timestamp": "2026-09-24T12:00:00Z",
  "event_type": "login",
  "status": "failure",
  "user_role": "user"
}
```

`event_type` is one of `login`, `logout`, `api_call`, `file_access`, `config_change`, `data_export`. `status` is `success` or `failure`. `user_role` defaults to `user` and is used by the decision engine; it is not stored on the `logs` row.

## Frontend routes

| Path | Page |
|---|---|
| `/` | Marketing landing page |
| `/auth` | Supabase sign-in and sign-up |
| `/dashboard` | Live overview, charts, alerts, PDF export |
| `/alerts` | Alert triage |
| `/live-logs` | Recent ingested logs |
| `/threat-analytics` | Threat patterns from live summary data |
| `/ueba` | User-level view derived from alerts |
| `/geo` | Geographic origins |
| `/incident-response` | Incident view driven by dashboard alerts |
| `/integrations` | Catalog of connectors. Only the Sentivoy ingestion path is wired up |
| `/settings` | API keys and a test alert email |

## Frontend commands

Run these from `frontend/`:

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Tests

From `backend/`, with the virtualenv active and `.env` pointing at Supabase:

```bash
python tests/test_pipeline.py
```

`tests/test_pipeline.py` runs feature extraction, model inference, and the decision engine against the configured database. `tests/test_detector.py` scores fixed attack vectors and does not need Supabase:

```bash
python tests/test_detector.py
```

Other `test_*.py` files at the backend root are one-off Supabase checks, not a test suite. Pytest is not a project dependency.

## Team

- **Utkarsh / NexVed** — model and decision layer
- **Ayush / Ayushhh19** — architecture, ingestion, and frontend

## License

Developed for Byte Me.
