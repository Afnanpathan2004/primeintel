export type EnvironmentType = 'aws' | 'azure' | 'gcp' | 'hybrid' | 'on_premise';
export type ScaleRange = '1_10' | '11_25' | '26_50' | '51_100' | '101_plus';
export type ComplexityLevel = 'low' | 'medium' | 'high' | 'enterprise';
export type TimelineUrgency = 'flexible' | 'standard' | 'accelerated' | 'urgent';

export interface ServiceConfig {
  key: string;
  name: string;
  description: string;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  active: boolean;
}

export interface MultiplierConfig {
  category: 'environment' | 'scale' | 'complexity' | 'timeline';
  code: string;
  label: string;
  multiplier: number;
  description?: string;
  active: boolean;
}

export interface AddOnConfig {
  code: string;
  name: string;
  description: string;
  pricingType: 'FIXED' | 'PERCENTAGE';
  value: number; // INR amount if FIXED, or percentage (e.g. 10 for 10%) if PERCENTAGE
  active: boolean;
}

export interface MarketBenchmarkConfig {
  id?: string;
  serviceKey: string;
  region: string;
  currency: string;
  lowPrice: number;
  highPrice: number;
  sourceName: string;
  sourceUrl?: string | null;
  retrievedDate: string;
  scopeDescription: string;
  confidence: 'High' | 'Medium' | 'Low';
  assumptions?: string | null;
  notes?: string | null;
  active: boolean;
}

export interface PricingConfigurationSnapshot {
  version: string;
  description: string;
  maxDiscountPercentage: number; // default 20%
  spreadPercentage: number; // default 0.10 (±10% for indicative low/high)
  services: ServiceConfig[];
  multipliers: MultiplierConfig[];
  addOns: AddOnConfig[];
  benchmarks: MarketBenchmarkConfig[];
}

export interface CalculationInput {
  serviceKey: string;
  environmentCode: string;
  scaleCode: string;
  complexityCode: string;
  timelineCode: string;
  addOnCodes: string[];
  discountPercentage?: number;
  discountFixed?: number;
  adminOverridePrice?: number;
  overrideReason?: string;
}

export interface AddOnLineItem {
  code: string;
  name: string;
  pricingType: 'FIXED' | 'PERCENTAGE';
  value: number;
  calculatedAmount: number;
}

export interface PricingCalculationResult {
  pricingVersion: string;
  service: {
    key: string;
    name: string;
    basePrice: number;
    minPrice: number;
    maxPrice: number;
  };
  factors: {
    environment: { code: string; label: string; multiplier: number };
    scale: { code: string; label: string; multiplier: number };
    complexity: { code: string; label: string; multiplier: number };
    timeline: { code: string; label: string; multiplier: number };
  };
  scaledBasePrice: number;
  addOns: AddOnLineItem[];
  addOnsTotal: number;
  rawSubtotal: number;
  subtotal: number;
  minPriceApplied: boolean;
  maxPriceApplied: boolean;
  discount: {
    requestedPercentage: number;
    requestedFixed: number;
    maxAllowedPercentage: number;
    cappedByMaxLimit: boolean;
    totalDiscountAmount: number;
  };
  primeCoreRecommendedPrice: number;
  adminOverride?: {
    originalPrice: number;
    overridePrice: number;
    reason: string;
  };
  finalPrice: number;
  indicativeLow: number;
  indicativeHigh: number;
  timelineWeeks: {
    min: number;
    max: number;
    label: string;
  };
  benchmarkComparison?: {
    benchmarkFound: boolean;
    benchmarkLow?: number;
    benchmarkHigh?: number;
    currency: string;
    region: string;
    sourceName?: string;
    confidence?: string;
    varianceVsRecommended?: string; // e.g. "Within standard market range" or "15% below market high"
  };
  breakdownSummary: string[];
}
