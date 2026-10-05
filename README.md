# PrimeIntel — Internal Project Estimation Engine

**PrimeIntel** is an internal, admin-side commercial and architectural estimation engine designed for **PrimeCore Technologies**. It transforms unstructured customer project requirements into structured technical scopes, evaluates them against verified market benchmarks, and produces reproducible, explainable, and bounded project estimates using a **deterministic mathematical pricing engine**.

---

## 1. Architectural Guardrails & Foundational Decisions

- **Internal Admin-Only Platform ([PD-001](docs/project/PRODUCT_DECISIONS.md))**:
  PrimeIntel is strictly an internal administrative tool for sales engineers, cloud architects, and estimators. It is completely isolated and decoupled from PrimeCore's public website (`https://primecoreinfo.com/`). No public widgets or anonymous estimation forms exist.
- **Deterministic Pricing Boundary ([PD-002](docs/project/PRODUCT_DECISIONS.md))**:
  Artificial Intelligence is strictly restricted to text analysis, scope extraction, and missing information detection. **The LLM is completely forbidden from calculating, determining, or overriding pricing.** All pricing is evaluated by pure TypeScript mathematical formulas.
- **Zero Dummy Data**:
  The system initializes cleanly with 0 estimates, 0 leads, and 0 historical metrics, providing complete operational empty-state handling across all administrative interfaces.
- **Active Pricing Version Enforcement**:
  Estimates strictly require an active, immutable pricing baseline snapshot (`PricingVersion.status === 'ACTIVE'`) to calculate and persist.

---

## 2. Core Capabilities

```text
Customer Requirement Text
        ↓
Paste into Workbench
        ↓
AI Extraction (Gemini 3.8 Flash / Heuristic Fallback)
        ↓
Structured Scope & Confidence Badges (EXPLICIT vs INFERRED)
        ↓
Uncertainty & Scope Gap Detection (Suggested Client Questions)
        ↓
Human-in-the-Loop Admin Review & Adjustments
        ↓
Market Benchmark Comparison (Verified Reference Bands)
        ↓
Deterministic Calculation Engine (Pure TypeScript)
        ↓
Discount Governance & Ceiling Enforcement
        ↓
Dual Export: Client-Safe Proposal vs. Internal Margin Audit Breakdown
```

1. **Natural-Language Requirement Extraction**:
   Accepts raw customer emails, scope briefs, or RFP specifications and automatically extracts Target Cloud (AWS/Azure/GCP/Hybrid), Workload Scale, Architectural Modules, Project Complexity, and Timeline Urgency.
2. **Fact vs. Inference Attribution**:
   Tags every extracted parameter as `EXPLICIT` (stated directly in the brief) or `INFERRED` (deduced from context) with explicit confidence scoring.
3. **Missing Information & Uncertainty Detector**:
   Identifies critical architectural ambiguities (e.g., database clustering, compliance mandates, RPO/RTO) and generates tailored technical discovery questions for customer follow-up.
4. **Deterministic Pricing Engine**:
   Evaluates base service fees, compound multipliers (Environment $\times$ Scale $\times$ Complexity $\times$ Urgency), and technical add-on modules (HA, DR, IaC Terraform, CI/CD, 24/7 Managed Handover).
5. **Commercial Governance & Discount Controls**:
   Enforces maximum discount ceilings (`PricingVersion.maxDiscountPercentage`, default 20%). Overrides require documented justification and are captured in an append-only audit trail.
6. **Dual Presentation Model**:
   - **Client-Safe Proposal**: Printable/PDF export containing PrimeCore branding, scope overview, deliverables checklist, assumptions, and the commercial envelope. Omits internal margins and confidential benchmark datasets.
   - **Internal Technical Audit**: Displays full formula breakdown logs, benchmark variance analysis, historical revision trails (`EstimateRevision`), and raw requirement briefs.

---

## 3. Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions, TypeScript)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/) with enterprise B2B palette and tabular financial typography
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) (SQLite local / PostgreSQL production ready)
- **AI Engine**: Google Gemini 3.8 Flash via [`@google/genai`](https://www.npmjs.com/package/@google/genai) with resilient deterministic heuristic fallback
- **Authentication**: Salted scrypt derivation (`crypto.scryptSync`) with timing-safe verification (`crypto.timingSafeEqual`) and database-backed session tokens
- **Testing**: [Vitest](https://vitest.dev/) with 100% test coverage across pricing and cryptography

---

## 4. Enterprise B2B Design System

PrimeIntel uses a deliberate, restrained consulting palette:

| Token | Hex | Semantic Role |
| :--- | :--- | :--- |
| **Canvas** | `#F2F2F2` | Primary application background neutral surface. |
| **Surface** | `#FFFFFF` | Working containers, financial sheets, and tables. |
| **Cool Gray** | `#CBCBCB` | Structural borders, subtle dividers, and table grids. |
| **Deep Green** | `#174D38` | Primary brand accent: buttons, active navigation, approved states. |
| **Rich Brown** | `#4D1717` | Secondary accent: critical uncertainty alerts and warnings. |
| **Ink** | `#1A1A1A` | High-contrast body typography with tabular figures (`tabular-nums`). |

---

## 5. Getting Started

### Prerequisites
- Node.js 18.x or 20.x
- npm

### 1. Installation & Environment Configuration
```bash
# Clone repository
git clone git@github.com:Afnanpathan2004/primeintel.git
cd primeintel

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Ensure `.env` contains:
```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="your-high-entropy-session-secret"
GEMINI_API_KEY="your-gemini-api-key" # Optional; offline heuristic fallback active if omitted
NODE_ENV="development"
```

### 2. Database Setup & Seeding
```bash
# Generate Prisma Client and sync schema
npm run db:push

# Seed development rate card baseline (development only)
npm run db:seed
```

### 3. Run Development Server
```bash
npm run dev
```
Navigate to **`http://localhost:3000/admin`**.

On initial load, the system detects an uninitialized database and opens the **First-Run Setup** screen to create your initial `SUPER_ADMIN` account. Once configured, the bootstrap endpoint automatically locks permanently.

---

## 6. Verification & Production Build

```bash
# Run automated test suites (17 tests)
npm test

# Run full production build
npm run build

# Start production server
npm start
```

---

## 7. Project Documentation

Comprehensive architectural and engineering documentation is maintained in the [`/docs/project/`](docs/project/) directory:

- [Project Vision & Overview (`PROJECT.md`)](docs/project/PROJECT.md)
- [System Architecture (`ARCHITECTURE.md`)](docs/project/ARCHITECTURE.md)
- [Product Decisions Log (`PRODUCT_DECISIONS.md`)](docs/project/PRODUCT_DECISIONS.md)
- [Deterministic Pricing Engine Specification (`PRICING_ENGINE.md`)](docs/project/PRICING_ENGINE.md)
- [Relational Data Model (`DATA_MODEL.md`)](docs/project/DATA_MODEL.md)
- [Security & Defensive Architecture (`SECURITY.md`)](docs/project/SECURITY.md)
- [Production Readiness Audit & Business Checklist (`PRODUCTION_READINESS.md`)](docs/project/PRODUCTION_READINESS.md)
- [Enterprise UI/UX Design System (`UI_UX.md`)](docs/project/UI_UX.md)
- [Automated Testing Strategy (`TESTING.md`)](docs/project/TESTING.md)
- [Internal API Specification (`API.md`)](docs/project/API.md)
- [Changelog (`CHANGELOG.md`)](docs/project/CHANGELOG.md)

---

## 8. License

Internal and proprietary to PrimeCore Technologies. All rights reserved.