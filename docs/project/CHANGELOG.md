# Changelog

All notable changes to the PrimeCore Internal Project Estimation Engine will be documented here.

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
