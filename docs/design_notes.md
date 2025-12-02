# P2P Marketplace — Design Notes

This project implements a minimal, extensible MVP for a peer-to-peer marketplace with features focused on discovery, posting, search, a payments/escrow wallet, multi-source marketplace connectors, AI stubs, order routing and fulfillment orchestration.

Core ideas & extensibility points:

- Wallet & Escrow: ledger architecture is implemented via `WalletTransaction` and `Escrow` models. For production you should integrate a payment provider (Stripe/Adyen), and adopt strong reconciliation and KYC workflows.

- Payments: a `payments` provider adapter (base) allows plugging in real SDKs. We include a `StripeStub` for local dev and tests; replace with real provider in `app.payments`.

- Connectors / Aggregator: `app.integrations.connector_manager` centralizes connectors. Add adapters for each external marketplace including id mapping and incremental sync.

- AI & search: MVP includes a small CLIP-like stub (`app.ai.embeddings_provider`) and an in-memory vector store. For production, use an embedding service and persistent vector DB (FAISS, Milvus, Weaviate).

- Fulfillment & routing: order_router + fulfillment_manager implement aggregator logic and multi-split fulfillment. Integrate real 3PLs and tracking.

- Observability: simple audit logs and `ops/metrics` endpoint; add Prometheus exporters and structured logging for production.

- Security: basic JWT auth and role checks. Add proper RBAC, rate limiting (redis), CSP, and secrets management.


Next recommended steps for production hardening (short list):
- Replace stubs with real providers (Stripe, CLIP model or OpenAI embeddings, vector DB, real marketplaces, 3PLs)
- Replace in-memory caches with redis or persistent services
- Add distributed tracing (OpenTelemetry) and metrics export
- Add CI for Docker images and a CD pipeline for deployments
