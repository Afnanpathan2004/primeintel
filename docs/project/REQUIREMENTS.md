# System Requirements Specification

## 1. Functional Scope (Internal Admin MVP)

### 1.1 Input & Requirement Extraction
- **Natural Language Parsing**: Admin pastes unformatted, messy client project text.
- **Fact vs Inference Separation**: Mark every extracted attribute with Value, Source (`Explicit`, `Inferred`, `Default`, `Not Provided`), and Confidence (`High`, `Medium`, `Low`, `None`).
- **Uncertainty & Unknowns Identification**: Detect missing specifications (e.g. database complexity, DR RPO/RTO, compliance requirements, support SLAs).
- **Proactive Question Formulation**: Generate targeted follow-up technical questions for any missing scope that materially affects cost.

### 1.2 Admin Review & Human-in-the-Loop Control
- **Editable Requirements**: Full admin control to edit, add, delete, confirm, or reject any AI-parsed parameter before cost computation.
- **Admin Is Final Authority**: The system never calculates until the admin validates the requirement model.

### 1.3 Deterministic Pricing Engine
- **No Direct LLM Pricing**: Zero dependency on generative models for dollar/rupee amounts.
- **Reproducible Cost Formula**: Base Service + Scale Factor + Complexity Multiplier + Target Environment Multiplier + Technical Add-Ons (HA, DR, DevOps, 24/7 Support) + Timeline Acceleration.
- **Versioned Snapshots**: Every estimate retains an immutable copy of the active pricing configuration version (e.g., `2026.10.01`).

### 1.4 Market Benchmarks
- **Contextual Pricing Bands**: Display benchmark ranges (e.g. ₹5L – ₹7L) with explicit metadata (region, currency, source name, URL/reference, date, scope, confidence).
- **No Fabricated Data**: If no benchmark exists for a niche service, show "Benchmark Unavailable".

### 1.5 Commercial Adjustments & Overrides
- **Discount Engine**: Support % or fixed discount with a hard ceiling (`maxDiscountPercentage`, e.g., 20%).
- **Admin Price Override**: Allows authorized estimators to set custom final numbers with mandatory reason tracking.
- **Indicative Price Range**: Computes standard low–high indicative envelope (e.g., Recommended ± 8-12%).

### 1.6 Professional Output & Estimate Generation
- **Estimate View & Detail**: Summary, scope breakdown, technical assumptions, timeline in weeks, disclaimers.
- **Customer Proposal vs Internal Breakdown**: Clear separation between customer-safe view (scope, timeline, assumptions, indicative price band, disclaimer) and internal admin view (line-item margins, base fees, discounts, audit history).
- **Print / PDF Export**: Clean, printable proposal view.

### 1.7 Lead & Estimate Management
- **Dashboard**: Track estimates, status lifecycle (`Draft`, `Generated`, `Reviewed`, `Sent`, `Assessment Requested`, `Won`, `Lost`).
- **Audit Logging**: Track all edits, discounts, overrides, and pricing updates.

---

## 2. Non-Functional Requirements
- **Performance**: Deterministic pricing calculation < 50ms; AI extraction < 4s with visual loading indicators.
- **Security**: Server-side authorization, input sanitization against prompt injection, zero secret leakage.
- **Explainability**: Every calculation displays an exact mathematical formula breakdown.
