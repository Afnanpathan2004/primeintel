# PrimeIntel — Production Deployment & Database Architecture Guide

This document defines the deployment, database provisioning, migration protocol, backup lifecycle, and disaster recovery procedures for **PrimeIntel** on Vercel and managed PostgreSQL.

---

## 1. Architectural Overview

PrimeIntel is an internal admin-side project estimation engine built with Next.js and Prisma ORM.

```
                    ┌──────────────────────────────┐
                    │    Vercel Serverless         │
                    │    (Next.js App Router)      │
                    └──────────────┬───────────────┘
                                   │ Prisma Client
                                   │ (Connection Pooler / Direct)
                                   ▼
                    ┌──────────────────────────────┐
                    │      Managed PostgreSQL      │
                    │   (Supabase / Neon / RDS)    │
                    │                              │
                    │  • Estimates (Indexed)       │
                    │  • Pricing Versions          │
                    │  • Services & Multipliers    │
                    │  • Audit Governance Logs     │
                    │  • Sessions & Users          │
                    │  • Market Benchmarks         │
                    └──────────────────────────────┘
```

### Core Architecture Rules:
1. **Zero SQLite in Production**: No SQLite files (`dev.db`) are deployed or mounted in serverless filesystems.
2. **Persistent Managed PostgreSQL**: All operational data (pricing configuration, estimates, customer scopes, audit logs) resides in managed PostgreSQL.
3. **Graceful Degraded Handling**: If the database is temporarily unreachable, all server components render an enterprise `<DatabaseErrorState />` banner instead of crashing or leaking raw Prisma stack traces.
4. **Zero Fallback/Dummy Data**: When disconnected, the system never fabricates estimates or pricing. It surfaces a clear, non-destructive connection error.

---

## 2. Managed PostgreSQL Provider Setup

PrimeIntel is fully compatible with standard PostgreSQL 14+ providers.

### Option A: Supabase (Recommended)
1. Create a project in [Supabase](https://supabase.com).
2. Go to **Project Settings > Database**.
3. Under **Connection string**, select **URI**:
   - For serverless environments (Vercel), use the **Transaction Pooler** (port `6543`) with `?pgbouncer=true` if using high concurrency, or the **Session Pooler** (port `5432`).
   - Example connection string:
     ```env
     DATABASE_URL="postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
     DIRECT_URL="postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
     ```

### Option B: Neon Serverless Postgres
1. Create a project in [Neon](https://neon.tech).
2. Copy the pooled connection string:
   ```env
   DATABASE_URL="postgresql://[USER]:[PASSWORD]@[ENDPOINT]-pooler.[REGION].neon.tech/primeintel?sslmode=require"
   ```

### Option C: AWS RDS / Aurora PostgreSQL
1. Launch a PostgreSQL instance in a private/public subnet with security groups allowing outbound 5432 traffic from Vercel IPs or configured via RDS Proxy.
2. Ensure SSL certificate enforcement (`sslmode=require`).

---

## 3. Environment Variables Specification

Configure the following environment variables in the Vercel Project Settings (**Settings > Environment Variables**):

| Variable Name | Environment | Required | Description | Example / Recommendation |
|---|---|---|---|---|
| `DATABASE_URL` | Production / Preview | **YES** | Managed PostgreSQL connection string with SSL | `postgresql://user:pass@host:5432/primeintel?sslmode=require` |
| `SESSION_SECRET` | Production / Preview | **YES** | 32+ byte cryptographic random string for cookie HMAC | Generate with `openssl rand -hex 32` |
| `GEMINI_API_KEY` | Production / Preview | Optional* | Google Gemini API key for requirement extraction | Gemini 1.5 Pro / Flash. If omitted, heuristic parser runs. |
| `NODE_ENV` | Production | System | Managed by Vercel (`production`) | `production` |

---

## 4. Build and Migration Pipeline

PrimeIntel incorporates automated Prisma migrations into the Vercel build lifecycle via `package.json`:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "vercel-build": "prisma generate && prisma migrate deploy && next build",
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy"
  }
}
```

### How Vercel Applies Migrations:
1. When Vercel executes the build, it detects the `vercel-build` script.
2. `prisma generate` constructs the Prisma Client for Node.js / Linux x86_64.
3. `prisma migrate deploy` applies all unapplied SQL migration files from `prisma/migrations/` to the database referenced by `DATABASE_URL`.
4. `next build` compiles and optimizes the Next.js App Router application.

### Manual / CI Migration Execution:
If running migrations outside Vercel (e.g., via GitHub Actions or local admin terminal):
```bash
npx prisma migrate deploy
```

---

## 5. Post-Deployment Verification & System Initialization

Once deployed to Vercel:

### Step 1: Health Check Endpoint
Query the public health endpoint:
```bash
curl -i https://<your-vercel-domain>.vercel.app/api/health
```
Expected response:
- Status `200 OK` if configured and pricing active.
- Status `503 Service Unavailable` with `pricingEngine.status: "unconfigured"` on first run before bootstrap.

### Step 2: First-Time Admin Bootstrapping
When the database is newly provisioned, no admin accounts exist.
Navigate to:
```
https://<your-vercel-domain>.vercel.app/admin/login
```
Click **"Initialize System & First Administrator"** (or invoke `POST /api/auth/bootstrap`).
This creates:
- The initial primary system administrator.
- The base operational configuration and pricing version.
Once created, subsequent bootstrap requests are permanently locked.

---

## 6. Enterprise Backup & Retention Strategy

Production PostgreSQL databases backing PrimeIntel must adhere to standard data governance protocols.

### Automated Backups
1. **Daily Snapshots**: Automated full database snapshot executed every 24 hours at 00:00 UTC.
2. **Point-In-Time Recovery (PITR)**: Enable Continuous WAL (Write-Ahead Logging) archiving with 7-day to 30-day retention window on Supabase / Neon / RDS.
3. **Manual CLI Dump (On-Demand)**:
   ```bash
   pg_dump "$DATABASE_URL" --format=custom --file="primeintel-backup-$(date +%Y%m%d%H%M%S).dump"
   ```

### Backup Testing Schedule:
- Perform a simulated restore into a staging environment once per quarter to verify backup consistency and recovery time objective (RTO < 30 minutes).

---

## 7. Rollback & Disaster Recovery Procedures

### Scenario A: Erroneous Application Deployment
1. Navigate to Vercel Dashboard > Deployments.
2. Locate the previous stable deployment and click **Instant Rollback**.
3. Since database migrations are backwards-compatible (additive columns/indexes), previous code continues operating safely.

### Scenario B: Database Schema Rollback
1. Review the migration log in `_prisma_migrations`.
2. Generate a down migration script or revert the schema changes in `prisma/schema.prisma`.
3. Apply via `npx prisma migrate resolve --rolled-back <migration_name>` and deploy fix.

### Scenario C: Corrupted Data / Disaster Recovery
1. Use provider PITR to restore database state to a timestamp immediately prior to corruption.
2. Update `DATABASE_URL` in Vercel to point to restored instance.
3. Trigger redeployment or re-evaluate `/api/health`.

---

## 8. Connection Troubleshooting Guide

| Symptom | Root Cause | Solution |
|---|---|---|
| `Unable to open the database file` (Code 14) | Application attempted SQLite read on Vercel filesystem | Ensure `prisma/schema.prisma` specifies `provider = "postgresql"` and `DATABASE_URL` is set in Vercel. |
| `Can't reach database server at ...` | Network firewall / IP restrictions or bad hostname | Verify database provider firewall allows public incoming connections (`0.0.0.0/0`) or configure VPC peering. |
| `Too many connections` | Serverless functions opening too many direct connections | Enable PgBouncer or connection pooling in provider (Supabase pooler on port 6543, Neon connection pooler). Append `?pgbouncer=true&connection_limit=10` to connection string. |
| `SSL connection is required` | Connection string lacks SSL requirement | Append `?sslmode=require` to `DATABASE_URL`. |
| Healthcheck reports `degraded` | Database is down or credentials expired | Check database provider dashboard status and verify credentials. |
