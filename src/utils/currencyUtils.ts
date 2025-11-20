import { Currency } from '../contexts/CurrencyContext';

// Default fallback rates (used if live rates cannot be fetched)
export const DEFAULT_CONVERSION_MULTIPLIERS: Record<Currency, number> = {
  'INR': 1,      // Base currency
  'USD': 2,      // Default multiplier (1 USD = 2 × INR/85 or similar)
  'EUR': 1.5,    // Default multiplier (1 EUR = 1.5 × INR/92 or similar)
};

/**
 * Convert price from INR to target currency
 * Uses live exchange rates from xe.com if available, otherwise uses defaults
 * 
 * Formula: (INR price / (exchange_rate + 5 markup)) × multiplier
 * 
 * @param inrPrice Price in INR
 * @param currency Target currency
 * @returns Converted price
 */
export const convertPrice = (inrPrice: number, currency: Currency): number => {
  // Get multiplier from window cache if available (set by CurrencyContext)
  const multipliers = (typeof window !== 'undefined' && (window as any).__exchangeRates) 
    ? {
        'INR': 1,
        'USD': (window as any).__exchangeRates.usdMultiplier || DEFAULT_CONVERSION_MULTIPLIERS['USD'],
        'EUR': (window as any).__exchangeRates.eurMultiplier || DEFAULT_CONVERSION_MULTIPLIERS['EUR'],
      }
    : DEFAULT_CONVERSION_MULTIPLIERS;

  const multiplier = multipliers[currency];
  return Math.round(inrPrice * multiplier);
};

/**
 * Get currency symbol
 * @param currency Currency code
 * @returns Currency symbol
 */
export const getCurrencySymbol = (currency: Currency): string => {
  switch (currency) {
    case 'INR':
      return '₹';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    default:
      return '₹';
  }
};

/**
 * Format price with currency symbol
 * @param price Price amount
 * @param currency Currency code
 * @returns Formatted price string
 */
export const formatPrice = (price: number, currency: Currency): string => {
  const symbol = getCurrencySymbol(currency);
  const formatted = price.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  if (currency === 'USD') {
    return `${symbol}${formatted}`;
  } else if (currency === 'EUR') {
    return `${symbol}${formatted}`;
  } else {
    return `${symbol}${formatted}`;
  }
};

/**
 * Check if user is in international location (not India)
 * @param currency Current currency
 * @returns Boolean indicating if user is international
 */
export const isInternationalUser = (currency: Currency): boolean => {
  return currency !== 'INR';
};

/**
 * Get currency name
 * @param currency Currency code
 * @returns Full currency name
 */
export const getCurrencyName = (currency: Currency): string => {
  switch (currency) {
    case 'INR':
      return 'Indian Rupee';
    case 'USD':
      return 'US Dollar';
    case 'EUR':
      return 'Euro';
    default:
      return 'Indian Rupee';
  }
};

/**
 * Get live exchange rates info for debugging/display
 * @returns Exchange rates information
 */
export const getExchangeRatesInfo = () => {
  if (typeof window !== 'undefined' && (window as any).__exchangeRates) {
    return (window as any).__exchangeRates;
  }
  return null;
};
