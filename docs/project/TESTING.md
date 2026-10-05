# Testing Strategy & Automated Test Suite

## Test Coverage Matrix

The PrimeIntel automated test suite contains **17 tests across 4 suites**, executing with 100% pass rate via Vitest.

### 1. Authentication & Cryptography (`src/lib/auth/__tests__/passwords.test.ts`)
- **Password Hashing**: Verifies salted scrypt derivation (salt length 32 hex chars, hash length 128 hex chars).
- **Password Verification**: Confirms valid passwords match the stored salt and hash.
- **Mismatch Rejection**: Confirms incorrect passwords fail verification without throwing exceptions.
- **Timing-Safe Equality**: Validates tamper protection against malformed or mismatched hash inputs.

### 2. Domain Currency Engine (`src/lib/__tests__/currency.test.ts`)
- **Standard Currency Formatting**: Verifies standard INR commas and currency symbol (e.g. `₹5,40,000`).
- **Compact Indian Notation**: Verifies accurate scaling into Thousands (`₹50K`), Lakhs (`₹5.40L`), and Crores (`₹1.25Cr`).
- **Range Formatting**: Verifies consistent spread band formatting (e.g. `₹5.40L – ₹6.20L`).

### 3. Deterministic Pricing Engine (`src/lib/pricing/__tests__/engine.test.ts`)
- **Base Service Math**: Verifies exact baseline calculations for standalone services.
- **Compound Multipliers**: Verifies multiplicative compounding across Environment, Scale, Complexity, and Timeline.
- **Add-On Calculations**: Tests fixed price vs scaled percentage add-ons.
- **Discount Ceiling Enforcement**: Validates strict clamping at maximum discount percentage (e.g., 20%).
- **Boundary Clamping**: Verifies minimum and maximum price clamp boundaries.
- **Configuration Immutability**: Proves identical inputs and pricing configuration snapshots produce identical outputs.

### 4. AI Requirement Analyzer (`src/lib/ai/__tests__/analyzer.test.ts`)
- **Extraction Accuracy**: Verifies extraction of target cloud, workload counts, and service types.
- **Fact vs Inference Tagging**: Verifies confidence levels and provenance attribution (`EXPLICIT` vs `INFERRED`).
- **Unknowns & Questions**: Verifies identification of missing architectural details (RPO/RTO, database type) and generated client questions.
- **Heuristic Fallback Resilience**: Verifies extraction operates correctly when the LLM is unconfigured or offline.

---

## Running the Automated Tests

To execute all unit and domain test suites:
```bash
npm test
```

To run tests in watch mode:
```bash
npx vitest
```

To run full production typecheck and build verification:
```bash
npm run build
```
