# Sentivoy backend

FastAPI service that stores logs in Supabase, scores them with TensorFlow, and serves the dashboard, live logs, API keys, PDF reports, and alert email.

## Requirements

- Python 3.11 (TensorFlow 2.20 does not install on every newer Python)
- A [Supabase](https://supabase.com) project with Email auth enabled
- Optional: a [Resend](https://resend.com) API key for alert and report email

## Setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # macOS / Linux
```

Fill in `backend/.env`. The settings loader reads that file, not the repository root.

### Supabase

1. Create a project and turn on Email sign-in under Authentication.
2. In **Project Settings → API**, copy:
   - Project URL → `SUPABASE_URL`
   - `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY`
   - JWT Secret → `SUPABASE_JWT_SECRET` (legacy HS256 projects)
3. Open the SQL editor and run [`supabase/schema.sql`](supabase/schema.sql).

That script creates `logs`, `features`, `anomalies`, and `api_keys`. Row level security is on and there are no policies for the anon key. The API uses the service-role key, which bypasses RLS, and filters rows by the signed-in user's id.

The frontend uses the anon key only for Supabase Auth. Dashboard data goes through this API with `Authorization: Bearer <access_token>`.

If `SUPABASE_JWT_SECRET` does not match the token (common on projects that sign with asymmetric keys), verification falls back to `supabase.auth.get_user`.

`tenant_id` on every row is the Supabase Auth user id (`sub`).

### Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs

Weights are already in `app/ml/model_store/`. If those files are missing, the process trains them on startup. Retrain with:

```bash
python -m app.ml.train
```

Push sample attacks while the server is running. The script uses `API_KEY` from the environment default `sentivoy-dev-api-key-change-me` and attaches logs to the first Auth user:

```bash
python scripts/generate_synthetic_logs.py
```

## Environment

| Variable | Required | Purpose |
|---|---|---|
| `SUPABASE_URL` | Yes | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Database and Auth admin access |
| `SUPABASE_JWT_SECRET` | Yes for local JWT checks | HS256 secret; Auth API is the fallback |
| `FRONTEND_URL` | Yes for browser calls | Extra CORS origin. `localhost:5173` and `localhost:8080` are always allowed |
| `API_KEY` | Dev ingestion | Accepted by `POST /api/logs` and mapped to the first Auth user |
| `APP_NAME`, `APP_ENV`, `DEBUG`, `HOST`, `PORT` | No | Process metadata. Uvicorn's `--host` and `--port` control the actual bind |
| `ANOMALY_THRESHOLD` | No | Overrides the threshold in `calibration.json` |
| `RATE_LIMIT` | No | Documented setting. The SlowAPI limiter is fixed at 60 requests per minute per IP |
| `RESEND_API_KEY` | No | Enables alert and report email |
| `RESEND_FROM_EMAIL` | No | From address. Resend's onboarding sender works for tests |
| `ALERT_EMAIL_ENABLED` | No | Set `false` to skip email even when a Resend key is set |

## Dependencies

Installed from `requirements.txt`:

| Package | Role |
|---|---|
| `fastapi`, `uvicorn[standard]` | HTTP API |
| `python-dotenv`, `pydantic-settings` | `backend/.env` |
| `pyjwt` | Supabase access-token checks |
| `supabase` | Postgres and Auth admin client |
| `numpy`, `tensorflow` | Autoencoder and attack classifier |
| `httpx` | Synthetic log script and ip-api.com geo lookups |
| `slowapi` | 60 requests/minute per IP |
| `resend` | Alert and report email |
| `reportlab` | PDF status reports |

## What the API does

`POST /api/logs` requires `X-API-Key`. A key from `api_keys` sets `tenant_id`. The dev key `sentivoy-dev-api-key-change-me` uses the first Auth user instead.

The background pipeline writes a feature row, runs the TensorFlow models, then writes an anomaly when the event is anomalous or the action is not `ignore`. Critical and high events with action `block` or `flag` email that user when Resend is configured.

Other routes use `Authorization: Bearer <supabase access token>`:

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/` | Health message |
| `POST` | `/api/logs` | Ingest a log (`X-API-Key`, 202) |
| `GET` | `/api/anomalies` | List anomalies for the caller |
| `GET` | `/api/dashboard/summary` | Metrics, trend, threats, geo, alerts |
| `GET` | `/api/live-logs` | Recent logs with severity |
| `POST` | `/api/keys` | Create an ingestion key |
| `GET` | `/api/keys` | List active keys |
| `DELETE` | `/api/keys/{key_id}` | Revoke a key |
| `GET` | `/api/reports/pdf` | Download a status PDF |
| `POST` | `/api/reports/email` | Email that PDF |
| `POST` | `/api/notifications/test` | Send a test alert |
| `GET` | `/api/notifications/status` | Whether email is configured |

Log body:

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

`event_type`: `login`, `logout`, `api_call`, `file_access`, `config_change`, `data_export`. `status`: `success` or `failure`. `user_role` is used by the decision engine and is not stored on `logs`.

## Checks

```bash
python tests/test_detector.py
```

Scores fixed normal, brute-force, impossible-travel, and API-abuse vectors. It does not need Supabase.

```bash
python tests/test_pipeline.py
```

Runs feature extraction against the configured database, then inference and the decision engine.

## Docker

Build from this directory. The image includes the saved TensorFlow weights and does not copy `.env`. Pass the same variables as `.env.example` at runtime. Set `FRONTEND_URL` to the deployed dashboard origin. Hosts that inject `PORT` are honored; otherwise the process listens on 8000.

```bash
docker build -t sentivoy-api .
docker run --rm -p 8000:8000 --env-file .env sentivoy-api
```

## Layout

```
backend/
├── .env.example
├── .gitignore
├── .dockerignore
├── Dockerfile
├── requirements.txt
├── supabase/schema.sql
├── app/
│   ├── main.py
│   ├── api/            HTTP routes
│   ├── agent/          Rule-based severity and actions
│   ├── core/           Settings, JWT check, rate limit
│   ├── db/             Supabase client
│   ├── ml/             TensorFlow models, training, saved weights
│   ├── models/         Pydantic schemas
│   ├── pipeline/       Features, inference, orchestration
│   └── services/       Resend email and PDF reports
├── scripts/generate_synthetic_logs.py
└── tests/
```
