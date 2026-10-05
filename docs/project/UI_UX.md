# UI / UX Design System & Workbench Specification

## 1. Design Objective & Tone
- **Impression**: Enterprise technology consulting platform + professional financial/operations workbench.
- **Aesthetic**: Serious, restrained, precise, confident, information-dense, polished, mature, and operational.
- **Target Users**: Cloud solutions architects, technical sales consultants, delivery managers, infrastructure engineers.
- **Anti-Patterns Eliminated**:
  - No template/starter-kit aesthetics, no glowing effects, no glassmorphism, no gradient backgrounds.
  - No chatbot avatars, chat bubbles, or fake "AI thinking" cartoon animations.
  - No oversized cards, excessive card nesting, or floating blobs.
  - No arbitrary border radii (`rounded-2xl` / `rounded-full` replaced with restrained 6-8px).

---

## 2. Color System & Semantic Hierarchy

| Color Token | Hex Code | Semantic Role |
| :--- | :--- | :--- |
| **Canvas** | `#F2F2F2` | Primary application background and neutral workspace surface. |
| **Surface** | `#FFFFFF` | Core container surfaces, tables, workbenches, and input fields. |
| **Cool Gray** | `#CBCBCB` | Structural borders, subtle dividers, disabled states, and inactive elements. |
| **Deep Green** | `#174D38` | Primary brand accent: primary action buttons, active navigation, approved states. |
| **Rich Brown** | `#4D1717` | Secondary alert accent: critical warnings, cancellations, destructive actions. |
| **Ink** | `#1A1A1A` | Primary high-contrast typography. |
| **Ink Muted** | `#595959` | Secondary captions, metadata, table headers, and structural labels. |

---

## 3. Typography & Spacing System
- **Font Stack**: Modern professional sans-serif (`Inter`, `-apple-system`, `sans-serif`) with monospace accents (`JetBrains Mono`, `Consolas`) for technical identifiers and timestamps.
- **Tabular Figures**: Numeric financial values and percentages enforce `tabular-nums` / `font-mono` alignment.
- **Spacing Scale**: Disciplined 4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px rhythm.
- **Border Radii**:
  - Buttons: 6px (`rounded`)
  - Inputs: 6px (`rounded`)
  - Cards & Tables: 6–8px (`rounded`)
  - Badges: 4px (`rounded`)

---

## 4. Screen-by-Screen Architecture

### 4.1 Navigation & Shell (`Sidebar.tsx`, `Header.tsx`, `layout.tsx`)
- **Compact Sidebar (w-56)**: Organized into 4 operational zones: *Workspace*, *Commercial*, *Governance*, and *System*. Active states highlighted with Deep Green (`#174D38`).
- **Minimal Header (h-14)**: Current page breadcrumb, environment mode tag, user profile, and session logout.

### 4.2 Operations Dashboard (`/admin`)
- Four subtle metric blocks: Total Estimates, Average Estimate Value, Active Pricing Baseline, Verified Benchmarks.
- Operational priority: Primary `+ New Estimate` action, recent proposals table, and system configuration checklist.

### 4.3 Two-Column Estimation Workbench (`/admin/estimates/new`)
- **Left Column (Requirements & Scope)**:
  - Account context inputs (Customer, Company, Email, Phone).
  - Natural-language brief input with length guard (<6,000 chars) and injection defense.
  - Restrained AI analysis summary: displays identified requirements count, missing details count, and confidence rating.
  - Subtle Fact/Inference attribution tags (`EXPLICIT`, `INFERRED`, `REQUIRES CONFIRMATION`).
  - Critical unknowns callouts with suggested client questions.
  - Human-in-the-loop parameter overrides (Service, Target Cloud, Scale, Complexity, Timeline, Add-ons).
- **Right Column (Sticky Financial Statement)**:
  - Vertically aligned line-item financial calculation sheet.
  - Commercial discount control clamped to active policy ceiling.
  - PrimeCore Recommended fee and indicative envelope band.
  - Side-by-side Market Benchmark reference comparison.
  - Confidential internal notes and single-click `[Save & Generate Proposal]` action.

### 4.4 Estimate Proposal & Financial Audit (`/admin/estimates/[id]`)
- **Client-Safe Proposal View**: Ready for presentation or printing; includes PrimeCore brand header, engagement scope summary, deliverables checklist, assumptions, commercial envelope, and contract disclaimer.
- **Internal Technical Audit View**: Displays exact deterministic calculation breakdown log, benchmark variance analysis, historical revisions trail (`EstimateRevision`), and raw client brief text.

### 4.5 Commercial Pricing Rules (`/admin/pricing`)
- Console layout with tabs: *Services Catalog*, *Factor Multipliers*, *Technical Add-ons*, and *Version Snapshots*.
- Direct inline editing with validation.

### 4.6 Market Benchmarks Repository (`/admin/benchmarks`)
- Structured data management table with columns: Service, Region, Currency, Low Bound, High Bound, Source & Scope, and Verification Status.
- Inline entry drawer for recording new verified benchmarks with mandatory source provenance.

### 4.7 Client Pipeline & Leads (`/admin/leads`)
- Structured pipeline table with contact info, associated estimate, and indicative deal value.

### 4.8 Audit & Compliance Trail (`/admin/audit`)
- Append-only compliance log table with selective monospace for timestamps and payloads.

### 4.9 System Boundaries (`/admin/settings`)
- Architectural isolation documentation (PD-001) and security boundary parameters.

### 4.10 Admin Access Portal (`/admin/login`)
- Clean, focused authentication card on neutral off-white canvas with scrypt verification and first-run setup mode.
