/**
 * Domain-Level Currency Formatting & Multi-Currency Architecture
 * 
 * Centralizes currency symbols, formatting rules, and localized abbreviations.
 * Avoids scattered hard-coded currency characters across the codebase.
 */

export type SupportedCurrency = 'INR' | 'USD' | 'EUR' | 'GBP';

interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  locale: string;
  lakhScale: boolean; // Indian numbering scale (Lakh/Crore)
}

const CURRENCY_CONFIGS: Record<SupportedCurrency, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    locale: 'en-IN',
    lakhScale: true,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
    lakhScale: false,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    locale: 'de-DE',
    lakhScale: false,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    locale: 'en-GB',
    lakhScale: false,
  },
};

export function getCurrencyConfig(currency: string = 'INR'): CurrencyConfig {
  const upper = currency.toUpperCase() as SupportedCurrency;
  return CURRENCY_CONFIGS[upper] || CURRENCY_CONFIGS.INR;
}

/**
 * Standard formatted monetary string: e.g. "₹5,40,000" or "$50,000"
 */
export function formatCurrency(
  amount: number,
  currency: string = 'INR'
): string {
  const cfg = getCurrencyConfig(currency);
  return new Intl.NumberFormat(cfg.locale, {
    style: 'currency',
    currency: cfg.code,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Compact commercial band string: e.g. "₹5.40L" (INR) or "$50K" (USD)
 */
export function formatCompactCurrency(
  amount: number,
  currency: string = 'INR'
): string {
  const cfg = getCurrencyConfig(currency);
  if (cfg.lakhScale) {
    if (amount >= 10000000) {
      return `${cfg.symbol}${(amount / 10000000).toFixed(2)}Cr`;
    }
    if (amount >= 100000) {
      return `${cfg.symbol}${(amount / 100000).toFixed(2)}L`;
    }
    return formatCurrency(amount, currency);
  }

  return new Intl.NumberFormat(cfg.locale, {
    style: 'currency',
    currency: cfg.code,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

/**
 * Formats a bounded indicative envelope: e.g. "₹5.4L – ₹6.3L"
 */
export function formatCurrencyRange(
  low: number,
  high: number,
  currency: string = 'INR'
): string {
  const cfg = getCurrencyConfig(currency);
  if (cfg.lakhScale) {
    const lowLakh = (low / 100000).toFixed(2);
    const highLakh = (high / 100000).toFixed(2);
    return `${cfg.symbol}${lowLakh}L – ${cfg.symbol}${highLakh}L`;
  }
  return `${formatCompactCurrency(low, currency)} – ${formatCompactCurrency(high, currency)}`;
}
