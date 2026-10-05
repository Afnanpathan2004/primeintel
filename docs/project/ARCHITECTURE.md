# System Architecture

## Architectural Boundaries

```
[ Admin UI (Next.js / Tailwind / shadcn) ]
                   │
                   ▼ (Server Actions / Typed Internal API)
┌────────────────────────────────────────────────────────┐
│                   Application Layer                    │
│  - Session & Auth Guard                                │
│  - Input Sanitization & Validation (Zod)               │
│  - Audit Logging Controller                            │
└────────────┬─────────────────────────────┬─────────────┘
             │                             │
             ▼                             ▼
┌────────────────────────┐    ┌───────────────────────────┐
│  Requirement Analyzer  │    │ Deterministic Pricing     │
│  - Interface Abstraction│   │ Engine (Pure TypeScript)  │
│  - Gemini 3.8 Flash    │    │  - Base Services          │
│  - Schema Validation   │    │  - Complexity Multipliers │
│  - Injection Filtering │    │  - Workload Scales        │
│  - Heuristic Fallback  │    │  - Add-ons (Fixed/Perc)   │
└────────────────────────┘    │  - Discount Rules         │
                              │  - Benchmark Evaluator    │
                              └─────────────┬─────────────┘
                                            │
                                            ▼
                              ┌───────────────────────────┐
                              │  Persistence Layer        │
                              │  - Prisma ORM             │
                              │  - SQLite (Local Dev/MVP) │
                              │  - PostgreSQL Ready       │
                              └───────────────────────────┘
```

## Key Architectural Principles

1. **Isolation of Estimation Engine**: The pricing module (`src/lib/pricing/`) is pure TypeScript, 100% testable without database, browser, or LLM mocks.
2. **Untrusted AI Boundary**: Responses from LLM pass through strict Zod schema parsing. LLMs cannot trigger database mutations directly.
3. **Immutability of Pricing Snapshots**: When an estimate is generated, it serializes the active pricing configuration into a JSON snapshot within the estimate record. Any subsequent modification of global pricing rules leaves historical estimates unchanged.
4. **Separation of Presentation**:
   - Internal View: Shows complete cost build-up, benchmark deviations, applied discount percentages, and internal risk notes.
   - Customer-Safe Proposal View: Omits raw margins, internal discount mechanisms, and confidential benchmark datasets.
