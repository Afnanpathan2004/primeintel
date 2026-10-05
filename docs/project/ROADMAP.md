# Product Roadmap

## Phase 1: Internal Admin MVP (Completed)
- [x] Internal admin-side estimation architecture decoupled from public website.
- [x] Pure TypeScript deterministic pricing calculation engine.
- [x] AI Requirement Analyzer with structured outputs and heuristic NLP fallback.
- [x] Fact vs Inference scoring & critical missing information detector.
- [x] Admin interactive review & calculation workflow.
- [x] Dual-mode view: client-safe proposal vs internal margin audit.

## Phase 2: Production Hardening & Enterprise Readiness (Completed)
- [x] Purged all dummy customer data and sample scenario buttons from production UI.
- [x] Implemented scrypt salted password hashing and timing-safe verification.
- [x] Implemented database-backed session management with HTTP-only cookies.
- [x] Role-Based Access Control (RBAC) across 4 roles (`SUPER_ADMIN`, `ADMIN`, `ESTIMATOR`, `VIEWER`).
- [x] Secure first-run bootstrap endpoint (`/api/auth/bootstrap`) with automatic lock.
- [x] Append-only `AuditLog` for governance and traceability.
- [x] `EstimateRevision` model for tracking historical changes to finalized estimates.
- [x] Active pricing version enforcement and discount ceiling governance.
- [x] Domain-level currency engine (`src/lib/currency.ts`) supporting Indian Lakh/Crore notation.
- [x] System health diagnostics endpoint (`/api/health`).
- [x] Empty-state handling across all dashboard views.
- [x] Automated test suite expanded to 17 tests with 100% pass rate.

## Phase 3: PrimeCore Business Configuration & Internal Pilot (Active Next Step)
- [ ] PrimeCore commercial team configures official consulting rate cards and multipliers.
- [ ] Populate verified Indian market benchmarks with citations and provenance.
- [ ] Input corporate branding, GST identification, and standard contract disclaimers.
- [ ] Initialize first Super Admin account via `/admin/login` bootstrap.
- [ ] Conduct internal pilot testing with active client requirement briefs.

## Phase 4: Post-Pilot Enhancements (Future V2)
- Multi-currency expansion (USD / EUR / GBP / AED) with live exchange rate buffers.
- Automated server-side PDF generation for proposal exports.
- Side-by-side scenario comparison workbench.
- Departmental cost-center tracking.

## Phase 5: Future Public Website Integration (V3 - Explicitly Deferred)
- Public lead-gen estimator widget embedded on `primecoreinfo.com`.
- Anonymous customer rate-limiting and reCAPTCHA protection.
- Direct CRM synchronization (HubSpot / Salesforce).
- Customer self-service proposal portal.
