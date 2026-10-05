import {
  CalculationInput,
  PricingCalculationResult,
  PricingConfigurationSnapshot,
  AddOnLineItem,
} from './types';
import { DEFAULT_PRICING_CONFIG } from './defaults';

/**
 * Deterministic Pricing Calculation Engine
 * 
 * Computes transparent, explainable, and reproducible project estimates
 * based on pure mathematical formulas and an immutable configuration snapshot.
 * 
 * HARD RULE: Never relies on generative AI for monetary values.
 */
export function calculateEstimate(
  input: CalculationInput,
  config: PricingConfigurationSnapshot = DEFAULT_PRICING_CONFIG
): PricingCalculationResult {
  // 1. Service Resolution
  const service = config.services.find(
    (s) => s.key === input.serviceKey && s.active
  );
  if (!service) {
    throw new Error(`Active service with key '${input.serviceKey}' not found in pricing configuration.`);
  }

  // 2. Multiplier Resolutions
  const envMultiplierConfig = config.multipliers.find(
    (m) => m.category === 'environment' && m.code === input.environmentCode && m.active
  );
  const environmentMultiplier = envMultiplierConfig?.multiplier ?? 1.0;
  const environmentLabel = envMultiplierConfig?.label ?? input.environmentCode;

  const scaleMultiplierConfig = config.multipliers.find(
    (m) => m.category === 'scale' && m.code === input.scaleCode && m.active
  );
  const scaleMultiplier = scaleMultiplierConfig?.multiplier ?? 1.0;
  const scaleLabel = scaleMultiplierConfig?.label ?? input.scaleCode;

  const complexityMultiplierConfig = config.multipliers.find(
    (m) => m.category === 'complexity' && m.code === input.complexityCode && m.active
  );
  const complexityMultiplier = complexityMultiplierConfig?.multiplier ?? 1.0;
  const complexityLabel = complexityMultiplierConfig?.label ?? input.complexityCode;

  const timelineMultiplierConfig = config.multipliers.find(
    (m) => m.category === 'timeline' && m.code === input.timelineCode && m.active
  );
  const timelineMultiplier = timelineMultiplierConfig?.multiplier ?? 1.0;
  const timelineLabel = timelineMultiplierConfig?.label ?? input.timelineCode;

  // 3. Base Calculation with Factors
  // Scaled Base = BasePrice * Env * Scale * Complexity * Timeline
  const compoundMultiplier =
    environmentMultiplier * scaleMultiplier * complexityMultiplier * timelineMultiplier;
  const scaledBasePrice = Math.round(service.basePrice * compoundMultiplier);

  // 4. Add-Ons Resolution
  const activeAddOnCodes = new Set(input.addOnCodes);
  const selectedAddOns = config.addOns.filter(
    (addon) => activeAddOnCodes.has(addon.code) && addon.active
  );

  const addOnLineItems: AddOnLineItem[] = selectedAddOns.map((addon) => {
    let calculatedAmount = 0;
    if (addon.pricingType === 'FIXED') {
      calculatedAmount = addon.value;
    } else {
      // Percentage of base service price
      calculatedAmount = Math.round(service.basePrice * (addon.value / 100));
    }
    return {
      code: addon.code,
      name: addon.name,
      pricingType: addon.pricingType,
      value: addon.value,
      calculatedAmount,
    };
  });

  const addOnsTotal = addOnLineItems.reduce(
    (acc, curr) => acc + curr.calculatedAmount,
    0
  );

  // 5. Subtotal and Boundary Clamping
  const rawSubtotal = scaledBasePrice + addOnsTotal;
  let subtotal = rawSubtotal;
  let minPriceApplied = false;
  let maxPriceApplied = false;

  if (rawSubtotal < service.minPrice) {
    subtotal = service.minPrice;
    minPriceApplied = true;
  } else if (rawSubtotal > service.maxPrice) {
    subtotal = service.maxPrice;
    maxPriceApplied = true;
  }

  // 6. Discount Calculation with Hard Maximum Cap
  const reqPercent = Math.max(0, input.discountPercentage ?? 0);
  const reqFixed = Math.max(0, input.discountFixed ?? 0);
  const maxAllowedPercent = config.maxDiscountPercentage ?? 20;

  const rawRequestedDiscountAmount =
    Math.round(subtotal * (reqPercent / 100)) + reqFixed;

  const maxAllowedDiscountAmount = Math.round(
    subtotal * (maxAllowedPercent / 100)
  );

  const cappedByMaxLimit =
    rawRequestedDiscountAmount > maxAllowedDiscountAmount;

  const totalDiscountAmount = Math.min(
    rawRequestedDiscountAmount,
    maxAllowedDiscountAmount
  );

  const primeCoreRecommendedPrice = Math.max(
    0,
    subtotal - totalDiscountAmount
  );

  // 7. Admin Override Handling
  let finalPrice = primeCoreRecommendedPrice;
  let adminOverride: PricingCalculationResult['adminOverride'] = undefined;

  if (
    input.adminOverridePrice !== undefined &&
    input.adminOverridePrice !== null &&
    input.adminOverridePrice > 0
  ) {
    adminOverride = {
      originalPrice: primeCoreRecommendedPrice,
      overridePrice: input.adminOverridePrice,
      reason: input.overrideReason || 'Admin commercial adjustment',
    };
    finalPrice = input.adminOverridePrice;
  }

  // 8. Indicative Range Envelope
  const spread = config.spreadPercentage ?? 0.08;
  const indicativeLow = Math.round(finalPrice * (1 - spread));
  const indicativeHigh = Math.round(finalPrice * (1 + spread));

  // 9. Timeline Weeks Estimation
  const timelineWeeks = estimateTimelineWeeks(
    input.scaleCode,
    input.complexityCode,
    input.timelineCode
  );

  // 10. Benchmark Comparison
  const benchmarkComparison = evaluateBenchmark(
    service.key,
    primeCoreRecommendedPrice,
    config
  );

  // 11. Explainable Breakdown Summary
  const breakdownSummary: string[] = [
    `Base Service Fee (${service.name}): ₹${service.basePrice.toLocaleString('en-IN')}`,
    `Target Environment Factor (${environmentLabel}): ×${environmentMultiplier}`,
    `Workload Scale Factor (${scaleLabel}): ×${scaleMultiplier}`,
    `Complexity Factor (${complexityLabel}): ×${complexityMultiplier}`,
    `Timeline Urgency Factor (${timelineLabel}): ×${timelineMultiplier}`,
    `Scaled Infrastructure Base: ₹${scaledBasePrice.toLocaleString('en-IN')}`,
  ];

  if (addOnLineItems.length > 0) {
    breakdownSummary.push(
      `Add-Ons Total (${addOnLineItems.length} selected): +₹${addOnsTotal.toLocaleString('en-IN')}`
    );
    addOnLineItems.forEach((item) => {
      breakdownSummary.push(
        `  • ${item.name}: +₹${item.calculatedAmount.toLocaleString('en-IN')}`
      );
    });
  }

  if (minPriceApplied) {
    breakdownSummary.push(
      `Service Minimum Price Floor Applied: ₹${service.minPrice.toLocaleString('en-IN')}`
    );
  }
  if (maxPriceApplied) {
    breakdownSummary.push(
      `Service Maximum Price Ceiling Applied: ₹${service.maxPrice.toLocaleString('en-IN')}`
    );
  }

  if (totalDiscountAmount > 0) {
    const cappedText = cappedByMaxLimit
      ? ` (Capped at maximum allowed ${maxAllowedPercent}%)`
      : '';
    breakdownSummary.push(
      `Commercial Discount Applied: -₹${totalDiscountAmount.toLocaleString('en-IN')}${cappedText}`
    );
  }

  if (adminOverride) {
    breakdownSummary.push(
      `Admin Final Override Applied: ₹${finalPrice.toLocaleString('en-IN')} (Reason: "${adminOverride.reason}")`
    );
  }

  return {
    pricingVersion: config.version,
    service: {
      key: service.key,
      name: service.name,
      basePrice: service.basePrice,
      minPrice: service.minPrice,
      maxPrice: service.maxPrice,
    },
    factors: {
      environment: {
        code: input.environmentCode,
        label: environmentLabel,
        multiplier: environmentMultiplier,
      },
      scale: {
        code: input.scaleCode,
        label: scaleLabel,
        multiplier: scaleMultiplier,
      },
      complexity: {
        code: input.complexityCode,
        label: complexityLabel,
        multiplier: complexityMultiplier,
      },
      timeline: {
        code: input.timelineCode,
        label: timelineLabel,
        multiplier: timelineMultiplier,
      },
    },
    scaledBasePrice,
    addOns: addOnLineItems,
    addOnsTotal,
    rawSubtotal,
    subtotal,
    minPriceApplied,
    maxPriceApplied,
    discount: {
      requestedPercentage: reqPercent,
      requestedFixed: reqFixed,
      maxAllowedPercentage: maxAllowedPercent,
      cappedByMaxLimit,
      totalDiscountAmount,
    },
    primeCoreRecommendedPrice,
    adminOverride,
    finalPrice,
    indicativeLow,
    indicativeHigh,
    timelineWeeks,
    benchmarkComparison,
    breakdownSummary,
  };
}

/**
 * Deterministic Timeline Estimation
 */
function estimateTimelineWeeks(
  scaleCode: string,
  complexityCode: string,
  timelineCode: string
): { min: number; max: number; label: string } {
  // Base weeks by scale
  let min = 6;
  let max = 8;

  switch (scaleCode) {
    case '1_10':
      min = 3;
      max = 5;
      break;
    case '11_25':
      min = 5;
      max = 8;
      break;
    case '26_50':
      min = 7;
      max = 11;
      break;
    case '51_100':
      min = 10;
      max = 16;
      break;
    case '101_plus':
      min = 14;
      max = 24;
      break;
  }

  // Complexity adjustments
  if (complexityCode === 'low') {
    min = Math.max(2, min - 1);
    max = Math.max(3, max - 1);
  } else if (complexityCode === 'high') {
    min += 2;
    max += 3;
  } else if (complexityCode === 'enterprise') {
    min += 4;
    max += 6;
  }

  // Timeline urgency adjustments (compression)
  if (timelineCode === 'accelerated') {
    min = Math.max(2, Math.round(min * 0.75));
    max = Math.max(4, Math.round(max * 0.75));
  } else if (timelineCode === 'urgent') {
    min = Math.max(2, Math.round(min * 0.5));
    max = Math.max(3, Math.round(max * 0.55));
  }

  return {
    min,
    max,
    label: `${min} – ${max} weeks`,
  };
}

/**
 * Market Benchmark Evaluator
 */
function evaluateBenchmark(
  serviceKey: string,
  recommendedPrice: number,
  config: PricingConfigurationSnapshot
): PricingCalculationResult['benchmarkComparison'] {
  const benchmark = config.benchmarks.find(
    (b) => b.serviceKey === serviceKey && b.active
  );

  if (!benchmark) {
    return {
      benchmarkFound: false,
      currency: 'INR',
      region: 'India',
    };
  }

  let varianceVsRecommended = 'Within standard market benchmark band';
  if (recommendedPrice < benchmark.lowPrice) {
    const diffPercent = Math.round(
      ((benchmark.lowPrice - recommendedPrice) / benchmark.lowPrice) * 100
    );
    varianceVsRecommended = `${diffPercent}% below market benchmark lower bound (Highly competitive)`;
  } else if (recommendedPrice > benchmark.highPrice) {
    const diffPercent = Math.round(
      ((recommendedPrice - benchmark.highPrice) / benchmark.highPrice) * 100
    );
    varianceVsRecommended = `${diffPercent}% above standard benchmark upper bound (Premium tier)`;
  } else {
    varianceVsRecommended = 'Aligns within standard industry benchmark range';
  }

  return {
    benchmarkFound: true,
    benchmarkLow: benchmark.lowPrice,
    benchmarkHigh: benchmark.highPrice,
    currency: benchmark.currency,
    region: benchmark.region,
    sourceName: benchmark.sourceName,
    confidence: benchmark.confidence,
    varianceVsRecommended,
  };
}
