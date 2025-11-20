import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'INR' | 'USD' | 'EUR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  getConvertedPrice: (price: number, category?: string) => number;
  getCurrencySymbol: () => string;
  getCurrencyLabel: () => string;
  isInternational: boolean; // Whether user is outside India
  allowedCurrencies: Currency[]; // Only currencies available in user's region
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

// Category-specific minimum prices in EUR
const CATEGORY_MIN_PRICES_EUR: Record<string, number> = {
  'Dupatta': 15,
  'dupatta': 15,
  'Womens Kurta Sets': 20,
  'Womens Lehenga Choli': 40,
  'Womens Gown': 30,
  'Womens Sarees': 25,
  'Blouses': 20,
  'blouses': 20,
};

// Exchange rates cache with timestamp
interface ExchangeRatesCache {
  rates: Record<string, number>;
  timestamp: number;
}

// Store exchange rates in memory
let exchangeRatesCache: ExchangeRatesCache | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Fetch live exchange rates from multiple reliable APIs
 * Returns base rates for USD and EUR conversion
 */
const fetchLiveExchangeRates = async (): Promise<Record<Currency, number>> => {
  try {
    // Check if cache is still valid (skip cache on first load to get fresh rates)
    if (exchangeRatesCache && Date.now() - exchangeRatesCache.timestamp < CACHE_DURATION) {
      console.log('[Currency] Using cached exchange rates');
      return exchangeRatesCache.rates as Record<Currency, number>;
    }

    console.log('[Currency] Fetching live exchange rates...');
    
    // Try multiple APIs for better reliability
    let usdRate: number | null = null;
    let eurRate: number | null = null;

    // API 1: Try exchangerate-api.com (free tier)
    try {
      const response1 = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
      if (response1.ok) {
        const data1 = await response1.json();
        if (data1.rates) {
          const fetchedUsd = data1.rates.USD;
          const fetchedEur = data1.rates.EUR;
          
          if (fetchedUsd && fetchedUsd > 0.005 && fetchedUsd < 0.02) {
            usdRate = 1 / fetchedUsd; // Convert to INR per USD
          }
          if (fetchedEur && fetchedEur > 0.008 && fetchedEur < 0.015) {
            eurRate = 1 / fetchedEur; // Convert to INR per EUR
          }
        }
      }
    } catch (error1) {
      console.log('[Currency] exchangerate-api failed, trying backup API...');
    }

    // API 2: Backup - Try open.er-api.com
    if (!usdRate || !eurRate) {
      try {
        const response2 = await fetch('https://open.er-api.com/v6/latest/INR');
        if (response2.ok) {
          const data2 = await response2.json();
          if (data2.rates) {
            const fetchedUsd = data2.rates.USD;
            const fetchedEur = data2.rates.EUR;
            
            if (fetchedUsd && fetchedUsd > 0.005 && fetchedUsd < 0.02) {
              usdRate = 1 / fetchedUsd;
            }
            if (fetchedEur && fetchedEur > 0.008 && fetchedEur < 0.015) {
              eurRate = 1 / fetchedEur;
            }
          }
        }
      } catch (error2) {
        console.log('[Currency] open.er-api failed, trying third API...');
      }
    }

    // API 3: Backup - Try frankfurter.app (no API key needed)
    if (!usdRate || !eurRate) {
      try {
        const response3 = await fetch('https://api.frankfurter.app/latest?from=INR&to=USD,EUR');
        if (response3.ok) {
          const data3 = await response3.json();
          if (data3.rates) {
            const fetchedUsd = data3.rates.USD;
            const fetchedEur = data3.rates.EUR;
            
            if (fetchedUsd && fetchedUsd > 0.005 && fetchedUsd < 0.02) {
              usdRate = 1 / fetchedUsd;
            }
            if (fetchedEur && fetchedEur > 0.008 && fetchedEur < 0.015) {
              eurRate = 1 / fetchedEur;
            }
          }
        }
      } catch (error3) {
        console.log('[Currency] frankfurter.app failed, will use hardcoded fallback');
      }
    }

    // If we got at least one valid rate, use it. If not, will fall through to hardcoded defaults
    if (usdRate && eurRate) {
      // Store base rates (will be used with multipliers in conversion)
      // Formula: (INR price / (base_rate - 5 markup)) × multiplier
      const rates: Record<Currency, number> = {
        'INR': 1,
        'USD': Math.round(usdRate),  // Base rate for USD (rounded to nearest integer)
        'EUR': Math.round(eurRate),  // Base rate for EUR (rounded to nearest integer)
      };

      // Store in cache
      exchangeRatesCache = {
        rates,
        timestamp: Date.now(),
      };

      // Store exchange rates info in window for debugging
      if (typeof window !== 'undefined') {
        (window as any).__exchangeRates = {
          usdRate: Math.round(usdRate),
          eurRate: Math.round(eurRate),
          formula: '(INR price / (base_rate - 5 markup)) × multiplier',
          source: 'live_api',
          usdMultiplier: 2,
          eurMultiplier: 1.5,
        };
      }



      return rates;
    }

    // If all APIs fail, throw error to use hardcoded fallback
    throw new Error('Could not fetch valid rates from any API');
  } catch (error) {
    console.error('[Currency] Failed to fetch live rates, using hardcoded defaults:', error);
    
    // Hardcoded fallback rates when API fails
    const usdRate = 88; // USD = 88 Rs (hardcoded)
    const eurRate = 102; // EUR = 102 Rs (hardcoded)

    // Store fallback rates in window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__exchangeRates = {
        usdRate,
        eurRate,
        formula: '(INR price / (base_rate - 5 markup)) × multiplier',
        source: 'hardcoded_fallback',
        usdMultiplier: 2,
        eurMultiplier: 1.5,
      };
    }

    console.log('[Currency] Using hardcoded fallback rates:', {
      usdRate: `${usdRate} Rs`,
      eurRate: `${eurRate} Rs`,
      usdRateAfterMarkup: `${usdRate - 5} Rs (with 5 Rs markup subtracted)`,
      eurRateAfterMarkup: `${eurRate - 5} Rs (with 5 Rs markup subtracted)`,
      formula: '(INR price / (base_rate - 5 markup)) × multiplier',
      usdMultiplier: '2x',
      eurMultiplier: '1.5x',
    });

    return {
      'INR': 1,
      'USD': usdRate,  // Base rate for USD
      'EUR': eurRate,  // Base rate for EUR
    };
  }
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('INR');
  const [isInternational, setIsInternational] = useState(false);
  const [allowedCurrencies, setAllowedCurrencies] = useState<Currency[]>(['INR', 'USD', 'EUR']); // All currencies allowed by default
  // Store base exchange rates: USD = 88 Rs, EUR = 102 Rs (with Rs 5 markup subtracted during conversion)
  const [baseExchangeRates, setBaseExchangeRates] = useState<Record<Currency, number>>({
    'INR': 1,
    'USD': 88,     // Base rate for USD
    'EUR': 102,    // Base rate for EUR
  });

  // Fetch exchange rates on mount
  useEffect(() => {
    const loadExchangeRates = async () => {
      const rates = await fetchLiveExchangeRates();
      setBaseExchangeRates(rates);
    };

    loadExchangeRates();
  }, []);

  // Detect user location on mount
  useEffect(() => {
    const detectLocationAndSetCurrency = async () => {
      try {
        // Check localStorage for user override
        const storedCurrency = localStorage.getItem('preferredCurrency');
        if (storedCurrency && ['INR', 'USD', 'EUR'].includes(storedCurrency)) {
          setCurrencyState(storedCurrency as Currency);
          setIsInternational(storedCurrency !== 'INR');
          // If override exists, allow all currencies
          setAllowedCurrencies(['INR', 'USD', 'EUR']);
          return;
        }

        // Get IP location from GeoIP API
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code || '';

        // EU countries list
        const euCountries = [
          'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
          'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
          'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
        ];

        // Determine currency based on location and set allowed currencies
        if (countryCode === 'IN') {
          // India: show INR as default, with USD and EUR options
          setCurrencyState('INR');
          setIsInternational(false);
          setAllowedCurrencies(['INR', 'USD', 'EUR']);
          console.log('[Currency] User in India - INR, USD, EUR all allowed');
        } else if (euCountries.includes(countryCode)) {
          // EU: show default EUR, but allow switching to USD
          setCurrencyState('EUR');
          setIsInternational(true);
          setAllowedCurrencies(['EUR', 'USD']);
          console.log('[Currency] User in EU - EUR and USD allowed');
        } else {
          // Rest of world: show default USD, but allow switching to EUR
          setCurrencyState('USD');
          setIsInternational(true);
          setAllowedCurrencies(['USD', 'EUR']);
          console.log('[Currency] User outside India/EU - USD and EUR allowed');
        }

        // Save to localStorage
        localStorage.setItem('userCountry', countryCode);
      } catch (error) {
        console.error('Error detecting location:', error);
        // Fallback to USD if geolocation fails (for international users)
        setCurrencyState('USD');
        setIsInternational(true);
        setAllowedCurrencies(['USD', 'EUR']);
      }
    };

    detectLocationAndSetCurrency();
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    setIsInternational(newCurrency !== 'INR');
    localStorage.setItem('preferredCurrency', newCurrency);
  };

  const getConvertedPrice = (inrPrice: number, category?: string): number => {
    if (currency === 'INR') {
      return inrPrice;
    }

    const baseRate = baseExchangeRates[currency];
    
    // Safety check - if baseRate is undefined or 0, use fallback
    if (!baseRate || baseRate === 0) {
      console.warn(`[Currency] baseRate is missing for ${currency}, using fallback:`, {
        baseRate,
        baseExchangeRates,
        currency
      });
      const fallback = currency === 'USD' ? 88 : 102;
      const fallbackWithMarkup = fallback - 5;
      const multiplier = currency === 'USD' ? 2 : 1.5;
      return Math.round((inrPrice / fallbackWithMarkup) * multiplier);
    }
    
    const markup = 5; // Rs 5 markup (subtracted from base rate)
    const rateWithMarkup = baseRate - markup;
    
    // Apply multipliers: USD = 2x, EUR = 1.5x
    // Formula: (INR price / (base_rate - 5 markup)) × multiplier
    // Example: (₹1,365 / 88) × 2 = $31
    const multiplier = currency === 'USD' ? 2 : (currency === 'EUR' ? 1.5 : 1);
    const convertedPrice = (inrPrice / rateWithMarkup) * multiplier;
    
    let finalPrice = Math.round(convertedPrice);
    
    // Apply category-specific minimum prices for EUR
    if (currency === 'EUR' && category && CATEGORY_MIN_PRICES_EUR[category]) {
      const minPrice = CATEGORY_MIN_PRICES_EUR[category];
      if (finalPrice < minPrice) {
        finalPrice = minPrice;
      }
    }
    
    return finalPrice;
  };

  const getCurrencySymbol = (): string => {
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

  const getCurrencyLabel = (): string => {
    return currency;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        getConvertedPrice,
        getCurrencySymbol,
        getCurrencyLabel,
        isInternational,
        allowedCurrencies,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
