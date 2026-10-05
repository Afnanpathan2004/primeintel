# Internal API Specification

## Authentication Endpoints

### 1. `POST /api/auth/bootstrap`
- **Purpose**: Initial one-time system bootstrap to create the first `SUPER_ADMIN`.
- **Request Body**: `{ "email": "string", "name": "string", "password": "string" }`
- **Security**: Fails with `403 Forbidden` if any user already exists in the database.
- **Response**: `{ "success": true, "user": { "id", "email", "name", "role" } }` + Session cookie set.

### 2. `POST /api/auth/login`
- **Purpose**: Authenticate user credentials and issue a session cookie.
- **Request Body**: `{ "email": "string", "password": "string" }`
- **Response**: `{ "success": true, "user": { "id", "email", "name", "role" } }` + Session cookie set.

### 3. `POST /api/auth/logout`
- **Purpose**: Invalidate current session and clear session cookie.
- **Response**: `{ "success": true }` + Session cookie deleted.

### 4. `GET /api/auth/me`
- **Purpose**: Retrieve currently authenticated user context.
- **Response**: `{ "authenticated": true, "user": { ... } }` or `{ "authenticated": false, "user": null }`.

---

## Health & Diagnostics Endpoints

### 5. `GET /api/health`
- **Purpose**: System diagnostics check for infrastructure, database, pricing engine, and AI readiness.
- **Response**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-10-05T08:00:00.000Z",
    "uptime": 120.5,
    "environment": "development",
    "checks": {
      "database": { "status": "ok", "latencyMs": 4 },
      "pricingEngine": { "status": "ok", "activeVersion": "2026.10.01" },
      "aiProvider": { "status": "ok", "configured": true }
    }
  }
  ```

---

## Estimation & Analysis Endpoints

### 6. `POST /api/analyze-requirement`
- **Purpose**: Accepts raw customer requirement text and returns structured analysis.
- **Guardrails**: Length capped at 6,000 characters. Prompt injection boundary shielding.
- **Request Body**: `{ "requirement": "string" }`
- **Response**:
  ```json
  {
    "serviceKeys": ["cloud-migration"],
    "currentEnvironment": { "value": "On-premise", "source": "EXPLICIT", "confidence": "HIGH" },
    "targetEnvironment": { "value": "AWS", "source": "EXPLICIT", "confidence": "HIGH" },
    "workloadCount": { "value": 40, "source": "EXPLICIT", "confidence": "HIGH" },
    "applicationCount": { "value": 20, "source": "INFERRED", "confidence": "MEDIUM" },
    "technicalRequirements": [...],
    "addOnCodes": ["ha", "dr", "terraform", "cicd", "monitoring"],
    "complexity": "HIGH",
    "timeline": "2 months",
    "unknowns": [
      {
        "field": "Database Complexity",
        "affectsPricing": true,
        "isCritical": true,
        "suggestedQuestion": "What database engines, sizes, and clustering models are currently deployed?"
      }
    ],
    "assumptions": [...]
  }
  ```

### 7. `POST /api/calculate-estimate`
- **Purpose**: Executes pure deterministic pricing calculation.
- **Pre-condition**: Requires an `ACTIVE` pricing version.
- **Request Body**: Structured requirement + selected options + pricing version ID + discount.
- **Response**: Calculation breakdown, subtotal, discount, final price, indicative spread band, benchmark comparison.

### 8. `POST /api/estimates`
- **Purpose**: Persist finalized estimate with snapshot, generate estimate number, and record audit log in an atomic transaction.
- **Pre-condition**: Requires an `ACTIVE` pricing version and authorized user session.

### 9. `PATCH /api/estimates/[id]`
- **Purpose**: Update estimate attributes, status transitions, or overrides.
- **Revision Control**: Automatically creates an `EstimateRevision` snapshot if an `APPROVED` or `EXPORTED` estimate is modified.

---

## Configuration & Governance Endpoints

### 10. `GET / POST /api/pricing`
- **Purpose**: Manage services catalog, factor multipliers, add-ons, and pricing versions.
- **Authorization**: Restricted to `SUPER_ADMIN` and `ADMIN` roles.

### 11. `GET / POST /api/benchmarks`
- **Purpose**: Manage market rate benchmarks with provenance tracking.
- **Authorization**: Restricted to `SUPER_ADMIN` and `ADMIN` roles.

### 12. `GET /api/audit`
- **Purpose**: Query append-only audit governance logs.
- **Authorization**: Restricted to `SUPER_ADMIN` and `ADMIN` roles.
