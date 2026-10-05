# Product Decisions Record

## PD-001: Internal Admin-Side MVP (No Public Website Integration)
- **Date**: 2026-10-05
- **Status**: Settled / Active
- **Context**: PrimeCore possesses a public website (`https://primecoreinfo.com/`) and requires an intelligent project estimation capability.
- **Alternatives Considered**:
  1. Direct integration into public website with customer-facing instant calculator.
  2. Standalone internal admin MVP evaluating real customer requirements.
- **Chosen Approach**: Standalone internal admin-side MVP.
- **Reason**: The objective is to validate whether the AI requirement extraction + deterministic pricing workflow generates commercially accurate, useful estimates for sales/technical teams before risking public deployment or complicating the production website.
- **Consequences**:
  - No public `/estimator` route, no public customer widgets, no anonymous public pricing endpoints.
  - Core pricing engine and analyzer abstractions remain clean and modular for any eventual future consumption.

---

## PD-002: Hard Prohibition of AI Direct Pricing
- **Date**: 2026-10-05
- **Status**: Settled / Active
- **Context**: LLMs can easily output arbitrary currency figures if asked "how much will this cost?", resulting in hallucinated, unrepeatable, and unexplainable prices.
- **Alternatives Considered**:
  1. End-to-end prompt engineering for direct AI cost estimation.
  2. Hybrid AI requirement extraction + Deterministic code/database pricing engine.
- **Chosen Approach**: Hybrid decoupled architecture. LLM extracts technical requirements, metadata, and unknowns; a deterministic, versioned pricing engine computes all monetary figures.
- **Reason**: Guarantees reproducibility, auditability, explainability, and full commercial control by PrimeCore management.
- **Consequences**:
  - All pricing logic lives in pure TypeScript modules evaluated on the server.
  - LLM receives zero pricing rules and does not output monetary values.

---

## PD-003: Technology Stack Selection
- **Date**: 2026-10-05
- **Status**: Settled / Active
- **Context**: Need a fast, reliable, strongly-typed fullstack stack that runs locally out of the box and supports server actions, enterprise dashboard UI, and deterministic calculations.
- **Chosen Approach**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn-inspired modular UI components, Lucide icons, Prisma ORM with SQLite database (with zero external server dependencies, fully portable, easily switched to PostgreSQL for cloud production deployment).
- **Reason**: Standard enterprise architecture, robust server-side security, zero external setup barriers, instant local portability.
- **Consequences**: Prisma schema manages relational models (Estimates, PricingConfigurations, AddOns, Benchmarks, AuditLogs, Users).

---

## PD-004: Requirement Extraction Provider Abstraction
- **Date**: 2026-10-05
- **Status**: Settled / Active
- **Context**: Multiple LLM models (e.g., Gemini 3.8 Flash via `@google/genai`, or heuristic fallback when offline) may be used.
- **Chosen Approach**: Provider abstraction interface `RequirementAnalyzer` with Zod schema validation, prompt-injection defense barriers, and a reliable fallback parser for offline/resilient operations.
- **Reason**: Business logic remains decoupled from specific AI vendors and resistant to prompt injection.
