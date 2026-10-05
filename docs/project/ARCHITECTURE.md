# System Architecture

## Architectural Boundaries

```
[ Admin UI (Next.js 14 App Router / Tailwind / Lucide) ]
                   │
                   ▼ (Server Actions / Typed Internal API)
┌────────────────────────────────────────────────────────┐
│                   Application Layer                    │
│  - Session & Auth Guard (Scrypt / Database Sessions)   │
│  - Role-Based Access Control (RBAC)                    │
│  - Input Sanitization & Ceiling Validation (Zod)       │
│  - Health Diagnostics (/api/health)                    │
│  - Append-Only Audit Logging Controller                │
└────────────┬─────────────────────────────┬─────────────┘
             │                             │
             ▼                             ▼
┌────────────────────────┐    ┌───────────────────────────┐
│  Requirement Analyzer  │    │ Deterministic Pricing     │
│  - Interface Abstraction│   │ Engine (Pure TypeScript)  │
│  - Gemini 1.5/Flash    │    │  - Base Services          │
│  - Schema Validation   │    │  - Complexity Multipliers │
│  - Prompt-Injection Tag │   │  - Workload Scales        │
│  - Heuristic Fallback  │    │  - Add-ons (Fixed/Perc)   │
└────────────────────────┘    │  - Active Version Guard   │
                              │  - Discount Ceiling Check │
                              │  - Benchmark Evaluator    │
                              │  - Domain Currency Engine │
                              └─────────────┬─────────────┘
                                            │
                                            ▼
                              ┌───────────────────────────┐
                              │  Persistence Layer        │
                              │  - Prisma ORM             │
                              │  - Managed PostgreSQL     │
                              │  - Connection Pooler      │
                              │  - Production Query Index │
                              │  - Atomic Transactions    │
                              │  - Estimate Revisions     │
                              │  - Audit Logs             │
                              └───────────────────────────┘
```

## Key Architectural Principles

1. **Isolation of Estimation Engine**: The pricing module (`src/lib/pricing/`) is pure TypeScript, 100% testable without database, browser, or LLM mocks.
2. **Untrusted AI Boundary**: Responses from LLM pass through strict Zod schema parsing. LLMs cannot trigger database mutations directly and have zero knowledge of pricing tables.
3. **Immutability of Pricing Snapshots & Version Enforcement**: When an estimate is generated, it serializes the active pricing configuration into a JSON snapshot within the estimate record. The pricing engine requires an `ACTIVE` pricing version to perform calculations.
4. **Revision History**: When an approved or exported estimate is edited, a full snapshot is written to `EstimateRevision` before updating, preserving commercial history.
5. **Separation of Presentation**:
   - Internal View: Shows complete cost build-up, benchmark deviations, applied discount percentages, and internal risk notes.
   - Customer-Safe Proposal View: Omits raw margins, internal discount mechanisms, and confidential benchmark datasets.
6. **Domain Currency Engine**: `src/lib/currency.ts` centralizes all currency representation across the system, guaranteeing consistent Indian numbering notation (Lakhs/Crores) and ISO compliance.
7. **Production PostgreSQL Architecture**: Persistent storage is powered by managed PostgreSQL (Supabase, Neon, AWS RDS) with Prisma ORM. Production queries utilize dedicated performance indexes on status, dates, and lookups. Server components are fortified with `<DatabaseErrorState />` graceful fallbacks during network degradation. SQLite is completely decoupled and eliminated from production builds.
