# Deployment & Production notes

This document lists minimal steps and environment variables for running the P2P Marketplace in production.

Recommended platform:
- Docker containers behind a load balancer (AWS ECS, Azure App Service, Kubernetes)
- PostgreSQL (managed) with PostGIS extension
- Redis for rate limiting and caching
- Managed vector DB (Weaviate, Milvus) or persistence layer for embeddings
- Payment provider (Stripe or other) with secrets stored in vault

Important environment variables (examples)
- DATABASE_URL=postgresql+asyncpg://user:password@postgres:5432/marketplace
- REDIS_URL=redis://:password@redis:6379/0
- STRIPE_API_KEY=sk_live_xxx
- STRIPE_WEBHOOK_SECRET=whsec_xxx
- VECTOR_DB_URL=https://weaviate.example.com
- OPENAI_API_KEY=... (optional for OpenAI embedder)

Secrets
- Use secure secret storage (HashiCorp Vault, AWS Secrets Manager, Azure KeyVault). Avoid storing production secrets in plain-text files.

Monitoring
- Add Prometheus exporters and OpenTelemetry instrumentation for traces.
- Log with a structured format (JSON) and centralize logs (Datadog, Elasticsearch + Kibana).

Backups & Recovery
- Backup Postgres daily, snapshot WAL logs
- Monitor vector DB retention

Scaling
- Horizontally scale backend replicas behind a load balancer
- Use object storage (S3) for images & assets
- Offload heavy AI embedding tasks to dedicated workers or model servers

CI/CD
- Keep Docker images small and build in CI
- Use staging environment and blue/green or canary deployments
