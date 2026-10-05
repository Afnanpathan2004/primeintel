# Changelog

All notable changes to the PrimeIntel Internal Project Estimation Engine are documented here.

## [1.1.0] - 2026-10-05
### Added
- Enterprise authentication using Node.js salted scrypt password hashing (`crypto.scryptSync`) and timing-safe verification (`crypto.timingSafeEqual`).
- Database-backed session manager with 64-byte cryptographic tokens, 7-day expiration, and HTTP-only SameSite=Lax cookies.
- Role-Based Access Control (RBAC) supporting `SUPER_ADMIN`, `ADMIN`, `ESTIMATOR`, and `VIEWER`.
- First-run bootstrap setup endpoint (`/api/auth/bootstrap`) with automatic permanent lock once the initial Super Admin is provisioned.
- Admin authentication interface (`/admin/login`) supporting both first-run initialization and standard credentials.
- Immutable revision tracking (`EstimateRevision`) capturing previous state when approved or exported estimates are modified.
- Append-only governance `AuditLog` tracking all mutations, discount overrides, status changes, and configurations.
- Domain-level currency engine (`src/lib/currency.ts`) with Indian numbering notation (Lakhs and Crores), range bands, and standard formatting.
- System diagnostics endpoint (`/api/health`) reporting DB connectivity, pricing status, and AI provider readiness.
- Comprehensive production readiness and enterprise audit documentation (`docs/project/PRODUCTION_READINESS.md`).
- Expanded automated unit test suite from 10 to 17 tests, including cryptography and currency formatting suites.

### Changed
- Hardened estimate creation and calculation workflows to enforce active pricing versions (`PricingVersion.status === 'ACTIVE'`).
- Enforced discount ceiling rules based on `PricingVersion.maxDiscountPercentage` (default 20%) with mandatory override reasons.
- Implemented atomic `prisma.$transaction` blocks for estimate persistence and audit logging.
- Capped customer requirement input length at 6,000 characters to prevent token inflation and denial-of-service attempts.
- Upgraded all admin interfaces (Dashboard, Estimates, Leads, Benchmarks, Audit) to handle clean empty states gracefully.

### Removed
- Purged all fake customer data (`PC-2026-0001`, Vikram Sharma, AcroPulse) and hardcoded placeholders.
- Removed sample scenario shortcut buttons (`40 Servers AWS Migration`, `70 Physical Servers`) from `/admin/estimates/new`.
- Blocked automatic seed script execution in production environments (`NODE_ENV === 'production'`).

## [1.0.0] - 2026-10-05
### Added
- Complete internal admin-side Project Estimation Engine MVP.
- Persistent single-source-of-truth project documentation system in `/docs/project/`.
- Pure TypeScript deterministic pricing calculation engine with factor multipliers, add-ons, min/max clamps, 20% max discount caps, and indicative spreads.
- AI Requirement Analyzer with Gemini 3.8 Flash, strict prompt-injection shielding, Fact vs Inference confidence scoring, and resilient offline heuristic fallback.
- Missing information & uncertainty detector identifying critical scope gaps (Database, DR RPO/RTO, compliance) with suggested client questions.
- Prisma ORM data layer with SQLite, seeded with realistic Indian enterprise cloud consulting rate cards, benchmarks, and immutable pricing version `2026.10.01`.
- Admin Dashboard (`/admin`), interactive New Estimate workbench (`/admin/estimates/new`), and dual-mode Proposal Detail view (`/admin/estimates/[id]`).
- Pricing configuration manager (`/admin/pricing`), Market benchmarks repository (`/admin/benchmarks`), Leads pipeline (`/admin/leads`), and Audit governance trail (`/admin/audit`).
- Full automated test suite passing in Vitest and successful zero-error production build.
