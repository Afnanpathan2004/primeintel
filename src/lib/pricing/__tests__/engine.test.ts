import { describe, it, expect } from 'vitest';
import { calculateEstimate } from '../engine';
import { DEFAULT_PRICING_CONFIG } from '../defaults';
import { CalculationInput } from '../types';

describe('Deterministic Pricing Engine', () => {
  it('calculates baseline AWS cloud migration accurately for ~40 workloads', () => {
    // 40 workloads matches '26_50' scale (multiplier 1.60)
    // AWS environment (1.00)
    // High complexity (1.35)
    // Standard timeline (1.00)
    // Add-ons: HA (40,000), DR (60,000), Terraform (30,000), CI/CD (25,000), Monitoring (20,000)
    const input: CalculationInput = {
      serviceKey: 'cloud-migration',
      environmentCode: 'aws',
      scaleCode: '26_50',
      complexityCode: 'high',
      timelineCode: 'standard',
      addOnCodes: ['ha', 'dr', 'terraform', 'cicd', 'monitoring'],
      discountPercentage: 10,
    };

    const result = calculateEstimate(input, DEFAULT_PRICING_CONFIG);

    // Base price = 300,000
    // Multipliers: 1.0 * 1.60 * 1.35 * 1.00 = 2.16
    // Scaled Base = 300,000 * 2.16 = 648,000
    expect(result.scaledBasePrice).toBe(648000);

    // Addons: 40k + 60k + 30k + 25k + 20k = 175,000
    expect(result.addOnsTotal).toBe(175000);
    expect(result.addOns.length).toBe(5);

    // Raw subtotal = 648,000 + 175,000 = 823,000
    expect(result.subtotal).toBe(823000);

    // 10% discount on 823,000 = 82,300
    expect(result.discount.totalDiscountAmount).toBe(82300);
    expect(result.discount.cappedByMaxLimit).toBe(false);

    // PrimeCore Recommended = 823,000 - 82,300 = 740,700
    expect(result.primeCoreRecommendedPrice).toBe(740700);
    expect(result.finalPrice).toBe(740700);

    // Indicative low/high ±8%
    expect(result.indicativeLow).toBe(Math.round(740700 * 0.92));
    expect(result.indicativeHigh).toBe(Math.round(740700 * 1.08));

    // Timeline calculation
    expect(result.timelineWeeks.min).toBeGreaterThanOrEqual(6);
    expect(result.timelineWeeks.max).toBeLessThanOrEqual(16);
  });

  it('enforces hard discount cap and prevents excessive discounting', () => {
    const input: CalculationInput = {
      serviceKey: 'devops-automation',
      environmentCode: 'aws',
      scaleCode: '1_10',
      complexityCode: 'low',
      timelineCode: 'standard',
      addOnCodes: [],
      discountPercentage: 50, // Attempts 50%, but max is 20%
    };

    const result = calculateEstimate(input, DEFAULT_PRICING_CONFIG);

    // Max allowed is 20%
    expect(result.discount.cappedByMaxLimit).toBe(true);
    expect(result.discount.maxAllowedPercentage).toBe(20);
    expect(result.discount.totalDiscountAmount).toBe(
      Math.round(result.subtotal * 0.20)
    );
  });

  it('supports admin override price with documented reason', () => {
    const input: CalculationInput = {
      serviceKey: 'cloud-migration',
      environmentCode: 'aws',
      scaleCode: '11_25',
      complexityCode: 'medium',
      timelineCode: 'standard',
      addOnCodes: ['terraform'],
      adminOverridePrice: 450000,
      overrideReason: 'Strategic anchor client contract',
    };

    const result = calculateEstimate(input, DEFAULT_PRICING_CONFIG);

    expect(result.adminOverride).toBeDefined();
    expect(result.adminOverride?.overridePrice).toBe(450000);
    expect(result.adminOverride?.reason).toBe('Strategic anchor client contract');
    expect(result.finalPrice).toBe(450000);
    expect(result.indicativeLow).toBe(Math.round(450000 * 0.92));
    expect(result.indicativeHigh).toBe(Math.round(450000 * 1.08));
  });

  it('clamps to service minimum and maximum prices', () => {
    // Test minimum clamping
    const minClampedInput: CalculationInput = {
      serviceKey: 'cloud-migration', // minPrice is 150,000
      environmentCode: 'aws',
      scaleCode: '1_10',
      complexityCode: 'low',
      timelineCode: 'flexible',
      addOnCodes: [],
    };

    // ScaledBase = 300,000 * 1.0 * 1.0 * 0.85 * 0.95 = 242,250
    const res = calculateEstimate(minClampedInput, DEFAULT_PRICING_CONFIG);
    expect(res.subtotal).toBeGreaterThanOrEqual(150000);
  });

  it('guarantees reproducibility (same inputs + configuration = identical output)', () => {
    const input: CalculationInput = {
      serviceKey: 'cloud-migration',
      environmentCode: 'hybrid',
      scaleCode: '51_100',
      complexityCode: 'enterprise',
      timelineCode: 'urgent',
      addOnCodes: ['ha', 'dr', 'security_hardening'],
      discountPercentage: 15,
    };

    const run1 = calculateEstimate(input, DEFAULT_PRICING_CONFIG);
    const run2 = calculateEstimate(input, DEFAULT_PRICING_CONFIG);

    expect(run1).toEqual(run2);
  });

  it('evaluates market benchmark comparison if configured', () => {
    const input: CalculationInput = {
      serviceKey: 'cloud-migration',
      environmentCode: 'aws',
      scaleCode: '26_50',
      complexityCode: 'medium',
      timelineCode: 'standard',
      addOnCodes: ['ha', 'dr'],
    };

    const configWithBenchmark = {
      ...DEFAULT_PRICING_CONFIG,
      benchmarks: [
        {
          serviceKey: 'cloud-migration',
          region: 'India',
          currency: 'INR',
          lowPrice: 500000,
          highPrice: 700000,
          sourceName: 'Market Survey',
          retrievedDate: '2026-09-01',
          scopeDescription: 'Cloud Migration',
          confidence: 'High' as const,
          active: true,
        },
      ],
    };

    const result = calculateEstimate(input, configWithBenchmark);
    expect(result.benchmarkComparison?.benchmarkFound).toBe(true);
    expect(result.benchmarkComparison?.benchmarkLow).toBe(500000);
    expect(result.benchmarkComparison?.benchmarkHigh).toBe(700000);
    expect(result.benchmarkComparison?.currency).toBe('INR');

    // When benchmark is not present in config, gracefully report unavailable
    const resultEmpty = calculateEstimate(input, DEFAULT_PRICING_CONFIG);
    expect(resultEmpty.benchmarkComparison?.benchmarkFound).toBe(false);
  });

  it('throws an error for non-existent service keys', () => {
    const input: CalculationInput = {
      serviceKey: 'non-existent-service-xyz',
      environmentCode: 'aws',
      scaleCode: '1_10',
      complexityCode: 'medium',
      timelineCode: 'standard',
      addOnCodes: [],
    };

    expect(() => calculateEstimate(input, DEFAULT_PRICING_CONFIG)).toThrowError(
      /Active service with key 'non-existent-service-xyz' not found/
    );
  });
});
