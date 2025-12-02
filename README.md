# Peer-to-Peer Marketplace (MVP)

This repository contains an MVP for a peer-to-peer marketplace that supports posting and discovering buy/sell orders, geolocation-based discovery, order routing, an in-app escrow wallet, and AI feature stubs (price prediction and image matching).

This is a scaffold to get you started. It contains:

- backend: FastAPI service (Postgres + SQLAlchemy)
- frontend: Vite + React skeleton
- docker-compose: Postgres + backend + frontend

Quick start (requires Docker):

1. docker compose up --build
2. Backend API: http://localhost:8000/docs
3. Frontend: http://localhost:3000 (minimal UI)

Run the test suite (backend):

```powershell
# from repository root
cd backend
pytest -q
```

Important development notes:
- Helper scripts (PowerShell) are available under `scripts/` to start the stack and run quick health checks on Windows:

```powershell
.\scripts\start-dev.ps1   # starts docker compose and waits for the backend to be reachable
.\scripts\check-health.ps1   # runs quick HTTP checks against key endpoints
```

If Docker isn't available locally, you can still use the backend with an SQLite DB by setting the DATABASE_URL environment variable (see tests and dev instructions above).
- The backend is implemented with FastAPI and can use Postgres (via docker-compose) or an SQLite file controlled by the DATABASE_URL env var.
- AI features are stubs — replace the image/embedding & price models with production-grade services when scaling up (CLIP, embed APIs, or a GPU-backed model).

More features and integrations are planned. See docs/ for design notes and how to extend connectors and AI components.

New features added in the last iteration:
- Payment provider adapter + Stripe-style stub, payment intent + webhook handling and reconcile endpoint
- In-memory vector store + CLIP-like stub plus embedding endpoints
- Sandbox connectors for multiple external marketplaces; ability to post local listings to connectors and sync listings
- Frontend auth + basic wallet deposit flow (simulation) + improved seller dashboard
- Fulfillment orchestration and shipment execution that updates listings and orders
- RBAC / rate-limiting middleware and audit logs
- E2E / CI improvements and an ops metrics endpoint for simple monitoring

Next recommended improvements:
- Replace stubs with production providers (Stripe, CLIP or embeddings API, FAISS/Weaviate)
Configuration notes (important environment variables):

- STRIPE_API_KEY — if you provide this and install the Stripe SDK, the app will use a real Stripe adapter instead of the local stub.
- STRIPE_WEBHOOK_SECRET — Stripe webhook signing secret for verifying webhooks.
- VECTOR_DB_URL — if set and a Weaviate client is available, the app will use that vector DB; otherwise it uses the local in-memory store.
- REDIS_URL — optional Redis URL for rate-limiter/backing store (future improvement).
- Harden wallet/escrow and payouts (KYC, reconciliation, retries)
- Add real connectors for each target marketplace (sandbox/production APIs)
- Implement real 3PL integration and tracking reconciliation
- Add observability (Prometheus + tracing) and proper infra automation
 
 - VECTOR_STORE_TYPE — explicit override for choosing 'faiss' or 'weaviate' for the vector store. If set to 'faiss' the app will try to use FAISS (faiss-cpu) locally.

Deployment & Production notes are in `docs/deployment.md` — follow these for configuring secrets, Redis, managed Postgres, and monitoring.

Docker compose now includes optional services for `redis` and `weaviate` to run the vector DB and Redis locally. If you don't want them running, you can remove those services or set `VECTOR_DB_URL` / `REDIS_URL` appropriately.
