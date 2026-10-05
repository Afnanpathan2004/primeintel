# Testing Strategy

## Test Coverage Requirements

### 1. Deterministic Pricing Engine (Unit Tests)
- Base service calculation accuracy.
- Compound multipliers (Scale * Complexity * Environment * Timeline).
- Add-on math (both Fixed and Percentage types).
- Maximum discount boundary enforcement (cap at 20%).
- Minimum/Maximum price boundary clamping.
- Indicative band spread calculation.
- Version immutability (same inputs + same snapshot = identical result).

### 2. Requirement Analyzer & Parser
- Standard structured requirements extraction (AWS migration, workload counts).
- Fact vs Inference tagging accuracy.
- Detection of material missing information (RPO/RTO, compliance, database).
- Prompt injection resistance test cases.
- Safe heuristic fallback when AI model is offline or unconfigured.

### 3. End-to-End & Integration Tests
- Admin estimate creation workflow.
- Lead association and status updates.
- Override logging in `AuditLog`.
