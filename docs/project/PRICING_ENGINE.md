# Deterministic Pricing Engine Specification

## 1. Core Mathematical Model

The PrimeCore Pricing Engine evaluates project estimates deterministically through layered calculation stages:

```
Subtotal = (Base_Price * Environment_Multiplier * Scale_Multiplier * Complexity_Multiplier) 
           + Sum(AddOn_Fixed) 
           + Sum(AddOn_Percentage * Scaled_Base)
           + Timeline_Acceleration_Fee

Calculated_PrimeCore_Price = Clamp(Subtotal, Service_Min_Price, Service_Max_Price)

Discount_Amount = Min(
    Calculated_PrimeCore_Price * (Admin_Discount_Percent / 100) + Admin_Discount_Fixed,
    Calculated_PrimeCore_Price * (Max_Allowed_Discount_Percent / 100)
)

Final_PrimeCore_Price = Calculated_PrimeCore_Price - Discount_Amount

Indicative_Band = [
    Round(Final_PrimeCore_Price * (1 - Spread_Percent)),
    Round(Final_PrimeCore_Price * (1 + Spread_Percent))
]
```

## 2. Multiplier Dimensions

### 2.1 Target Environment
- **AWS**: 1.00 (Standard baseline)
- **Azure**: 1.05
- **GCP**: 1.05
- **Hybrid / Multi-Cloud**: 1.30
- **On-Premise / Private Cloud**: 1.15

### 2.2 Workload Scale
- **1 – 10 Workloads / VMs**: 1.00
- **11 – 25 Workloads**: 1.25
- **26 – 50 Workloads**: 1.60
- **51 – 100 Workloads**: 2.10
- **101+ Workloads**: 2.80

### 2.3 Project Complexity
- **Low**: 0.85 (Straightforward rehost/lift-and-shift, minimal dependencies)
- **Medium**: 1.00 (Standard refactoring/replatforming, database migration)
- **High**: 1.35 (Multi-tier, complex network topologies, legacy OS)
- **Enterprise**: 1.75 (Mission critical, zero downtime requirement, regulated workloads)

### 2.4 Timeline Urgency
- **Flexible**: 0.95
- **Standard (8–12 weeks)**: 1.00
- **Accelerated (4–6 weeks)**: 1.20
- **Urgent (< 4 weeks)**: 1.45

## 3. Technical Add-Ons
- **High Availability (Multi-AZ / Redundant)**: Fixed ₹40,000 or 10%
- **Disaster Recovery (Cross-Region RPO/RTO)**: Fixed ₹60,000 or 15%
- **Infrastructure as Code (Terraform / OpenTofu)**: Fixed ₹35,000
- **Automated CI/CD Pipelines**: Fixed ₹30,000
- **Centralized Monitoring & Alerting (Prometheus/Grafana/CloudWatch)**: Fixed ₹25,000
- **Security Hardening & Compliance Baselines**: Fixed ₹45,000
- **24/7 Managed Infrastructure Support (Initial Setup / Handover)**: Fixed ₹50,000
- **Kubernetes / EKS / Container Orchestration**: Fixed ₹65,000

## 4. Market Benchmark Layer
- Benchmark bands are independent from PrimeCore pricing rules.
- Each benchmark entry tracks: Region, Currency, Low, High, Source, Date Retrieved, Scope, Confidence.
- Used side-by-side with PrimeCore Recommended price to demonstrate value and competitive positioning.

## 5. Discount Guardrails
- **Max Discount Enforcement**: Strict cap (default 20%). Discounts exceeding this cap are rejected server-side.
- **Admin Overrides**: Must document explicit `overrideReason`.
