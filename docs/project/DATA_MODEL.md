# Data Model Specification

## Persistence Architecture
- **Provider**: PostgreSQL (Managed Supabase / Neon / AWS RDS)
- **ORM**: Prisma Client v5.21+
- **Indexes**: Explicit B-tree indexes applied on high-cardinality and query-critical fields (`status`, `createdAt`, `companyName`, `serviceKey`, `category`, `pricingType`, `expiresAt`).
- **Migrations**: Governed via `prisma/migrations/` and applied using `prisma migrate deploy`.

---

## Relational Schema (Prisma)

### 1. `User`
- `id` (String, cuid, Primary Key)
- `email` (String, unique)
- `name` (String)
- `role` (String - "SUPER_ADMIN" | "ADMIN" | "ESTIMATOR" | "VIEWER", default: "ESTIMATOR")
- `salt` (String - 16-byte random hex salt)
- `passwordHash` (String - 64-byte scrypt derived key hex)
- `mustChangePassword` (Boolean, default: false)
- `active` (Boolean, default: true)
- `createdAt`, `updatedAt` (DateTime)

### 2. `Session`
- `id` (String, cuid, Primary Key)
- `userId` (String, relation to User)
- `token` (String, unique - 64-byte random hex)
- `expiresAt` (DateTime)
- `createdAt` (DateTime)
- **Indexes**: `@@index([userId])`, `@@index([expiresAt])`

### 3. `Service`
- `id` (String, cuid, Primary Key)
- `key` (String, unique - e.g. "cloud-migration", "devops-cicd")
- `name` (String - "Cloud Migration")
- `description` (String)
- `basePrice` (Float)
- `minPrice` (Float)
- `maxPrice` (Float)
- `active` (Boolean)
- `createdAt`, `updatedAt` (DateTime)
- **Indexes**: `@@index([active])`

### 4. `PricingMultiplier`
- `id` (String, cuid, Primary Key)
- `category` (String - "environment", "scale", "complexity", "timeline")
- `code` (String - "aws", "scale_26_50", "high", "urgent")
- `label` (String)
- `multiplier` (Float)
- `description` (String?)
- `active` (Boolean)
- **Indexes**: `@@index([category])`

### 5. `AddOn`
- `id` (String, cuid, Primary Key)
- `code` (String, unique - "ha", "dr", "terraform", "cicd", "monitoring", "support_24_7")
- `name` (String)
- `description` (String)
- `pricingType` (String - "FIXED" | "PERCENTAGE")
- `value` (Float)
- `active` (Boolean)
- **Indexes**: `@@index([pricingType])`

### 6. `MarketBenchmark`
- `id` (String, cuid, Primary Key)
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
- `status` (String - "VERIFIED" | "DRAFT" | "EXPIRED" | "ARCHIVED", default: "VERIFIED")
- `active` (Boolean)
- **Indexes**: `@@index([serviceKey, status])`, `@@index([status])`

### 7. `PricingVersion`
- `id` (String, cuid, Primary Key)
- `version` (String, unique - e.g. "2026.10.01")
- `description` (String)
- `status` (String - "ACTIVE" | "DRAFT" | "ARCHIVED", default: "DRAFT")
- `isActive` (Boolean, default: false)
- `maxDiscountPercentage` (Float, default: 20.0)
- `spreadPercentage` (Float, default: 0.15)
- `currency` (String, default: "INR")
- `configSnapshot` (String - JSON of all services, multipliers, add-ons at this version)
- `createdAt` (DateTime)
- **Indexes**: `@@index([status])`

### 8. `Estimate`
- `id` (String, cuid, Primary Key)
- `estimateNumber` (String, unique - e.g. "PC-2026-0001")
- `revisionNumber` (Int, default: 1)
- `currency` (String, default: "INR")
- `customerName` (String)
- `companyName` (String)
- `email` (String?)
- `phone` (String?)
- `rawRequirement` (String)
- `structuredRequirement` (String - JSON)
- `pricingVersionId` (String)
- `pricingSnapshot` (String - JSON snapshot)
- `status` (String - "DRAFT" | "CALCULATED" | "REVIEWED" | "APPROVED" | "EXPORTED" | "SENT" | "CLOSED" | "CANCELLED")
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
- `approvedBy` (String?)
- `approvedAt` (DateTime?)
- `createdBy` (String)
- `createdAt`, `updatedAt` (DateTime)
- **Indexes**: `@@index([status])`, `@@index([createdAt])`, `@@index([companyName])`

### 9. `EstimateRevision`
- `id` (String, cuid, Primary Key)
- `estimateId` (String, relation to Estimate)
- `revisionNumber` (Int)
- `snapshotData` (String - Complete JSON serialized Estimate record prior to edit)
- `reason` (String?)
- `changedBy` (String)
- `createdAt` (DateTime)
- **Indexes**: `@@index([estimateId])`

### 10. `AuditLog`
- `id` (String, cuid, Primary Key)
- `actor` (String)
- `action` (String - "CREATE", "UPDATE", "STATUS_CHANGE", "DISCOUNT_OVERRIDE", "CONFIG_CHANGE")
- `entity` (String - "ESTIMATE", "PRICING_VERSION", "BENCHMARK", "USER", "AUTH")
- `entityId` (String)
- `oldValue` (String? - JSON)
- `newValue` (String? - JSON)
- `reason` (String?)
- `metadata` (String? - JSON)
- `createdAt` (DateTime)
- **Indexes**: `@@index([createdAt])`, `@@index([entity, entityId])`
