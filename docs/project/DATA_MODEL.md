# Data Model Specification

## Relational Schema (Prisma)

### 1. `Service`
- `id` (String, cuid)
- `key` (String, unique - e.g. "cloud-migration", "devops-cicd")
- `name` (String - "Cloud Migration")
- `description` (String)
- `basePrice` (Float)
- `minPrice` (Float)
- `maxPrice` (Float)
- `active` (Boolean)
- `createdAt`, `updatedAt`

### 2. `PricingMultiplier`
- `id` (String, cuid)
- `category` (String - "environment", "scale", "complexity", "timeline")
- `code` (String - "aws", "scale_26_50", "high", "urgent")
- `label` (String)
- `multiplier` (Float)
- `description` (String?)
- `active` (Boolean)

### 3. `AddOn`
- `id` (String, cuid)
- `code` (String, unique - "ha", "dr", "terraform", "cicd", "monitoring", "support_24_7")
- `name` (String)
- `description` (String)
- `pricingType` (String - "FIXED" | "PERCENTAGE")
- `value` (Float)
- `active` (Boolean)

### 4. `MarketBenchmark`
- `id` (String, cuid)
- `serviceKey` (String)
- `region` (String - "India", "Global", "US")
- `currency` (String - "INR", "USD")
- `lowPrice` (Float)
- `highPrice` (Float)
- `sourceName` (String)
- `sourceUrl` (String?)
- `retrievedDate` (DateTime)
- `scopeDescription` (String)
- `confidence` (String - "High", "Medium", "Low")
- `notes` (String?)
- `active` (Boolean)

### 5. `PricingVersion`
- `id` (String, cuid)
- `version` (String, unique - e.g. "2026.10.01")
- `description` (String)
- `isActive` (Boolean)
- `configSnapshot` (String - JSON of all services, multipliers, add-ons at this version)
- `createdAt`

### 6. `Estimate`
- `id` (String, cuid)
- `estimateNumber` (String, unique - e.g. "PC-2026-0001")
- `customerName` (String)
- `companyName` (String)
- `email` (String?)
- `phone` (String?)
- `rawRequirement` (String)
- `structuredRequirement` (String - JSON)
- `pricingVersionId` (String)
- `pricingSnapshot` (String - JSON snapshot)
- `status` (String - "DRAFT", "GENERATED", "REVIEWED", "SENT", "WON", "LOST")
- `calculatedBasePrice` (Float)
- `calculatedAddOnsTotal` (Float)
- `calculatedSubtotal` (Float)
- `discountPercentage` (Float)
- `discountAmount` (Float)
- `finalPrice` (Float)
- `indicativeLow` (Float)
- `indicativeHigh` (Float)
- `adminOverridePrice` (Float?)
- `overrideReason` (String?)
- `timelineWeeksMin` (Int)
- `timelineWeeksMax` (Int)
- `assumptions` (String - JSON array)
- `unknowns` (String - JSON array)
- `calculationBreakdown` (String - JSON)
- `benchmarkComparison` (String? - JSON)
- `createdBy` (String)
- `createdAt`, `updatedAt`

### 7. `AuditLog`
- `id` (String, cuid)
- `entityType` (String - "ESTIMATE", "PRICING_RULE", "DISCOUNT")
- `entityId` (String)
- `action` (String - "CREATE", "UPDATE", "OVERRIDE")
- `performedBy` (String)
- `oldValue` (String? - JSON)
- `newValue` (String? - JSON)
- `reason` (String?)
- `createdAt` (DateTime)
