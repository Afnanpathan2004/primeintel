import { describe, it, expect } from 'vitest';
import { formatCurrency, formatCompactCurrency, formatCurrencyRange } from '../currency';

describe('Domain-Level Currency Engine', () => {
  it('formats standard INR amounts with proper commas and symbols', () => {
    const formatted = formatCurrency(540000, 'INR');
    expect(formatted).toContain('5,40,000');
  });

  it('formats compact lakh representations for Indian market', () => {
    const compactLakh = formatCompactCurrency(540000, 'INR');
    expect(compactLakh).toContain('5.40L');

    const compactCrore = formatCompactCurrency(12500000, 'INR');
    expect(compactCrore).toContain('1.25Cr');
  });

  it('formats indicative currency ranges cleanly', () => {
    const range = formatCurrencyRange(540000, 620000, 'INR');
    expect(range).toContain('5.40L');
    expect(range).toContain('6.20L');
  });
});
