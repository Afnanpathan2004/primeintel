# Internal API Specification

## Endpoints / Server Actions

### 1. `POST /api/analyze-requirement`
- **Purpose**: Accepts raw customer requirement text and returns structured analysis.
- **Request Body**: `{ requirement: string }`
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

### 2. `POST /api/calculate-estimate`
- **Purpose**: Executes pure deterministic pricing calculation.
- **Request Body**: Structured requirement + selected options + pricing version ID + discount.
- **Response**: Full calculation breakdown, PrimeCore recommended price, indicative low/high, benchmark comparisons.

### 3. `POST /api/estimates`
- **Purpose**: Persist finalized estimate with snapshot and generate estimate number.
