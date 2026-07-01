import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { formatCurrency as formatCurrencyUtil } from '../utils/formatCurrency';

export type Currency = 'INR' | 'USD' | 'EUR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  getConvertedPrice: (price: number, category?: string, skipRounding?: boolean) => number;
  getCurrencySymbol: () => string;
  getCurrencyLabel: () => string;
  formatCurrency: (amount: number) => string; // Formats amount with current currency
  isInternational: boolean; // Whether user is outside India
  allowedCurrencies: Currency[]; // Only currencies available in user's region
  detectedCountry: string; // ISO country code detected from IP
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

/**
 * Fetch exchange rates from database
 * Returns base rates for USD and EUR conversion
 */
const fetchExchangeRatesFromDB = async (): Promise<Record<Currency, number>> => {
  try {
    console.log('[Currency] Fetching exchange rates from database...');
    
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('currency, rate')
      .in('currency', ['USD', 'EUR']);

    if (error) throw error;

    if (!data || data.length === 0) {
      throw new Error('No exchange rates found in database');
    }

    const rates: Record<Currency, number> = {
      'INR': 1,
      'USD': 88,  // Default fallback (from /admin/exchange-rates)
      'EUR': 102, // Default fallback (from /admin/exchange-rates)
    };

    // Map database rates
    data.forEach((row: any) => {
      const currency = row.currency as Currency;
      if (currency === 'USD' || currency === 'EUR') {
        rates[currency] = parseFloat(row.rate.toString());
      }
    });

    console.log('[Currency] Loaded exchange rates from database:', {
      usdRate: `${rates.USD} Rs`,
      eurRate: `${rates.EUR} Rs`,
      formula: '(INR price / (admin_rate - 5 markup)) × strategic_multiplier',
      source: 'Admin Panel: /admin/exchange-rates',
      usdMultiplier: '2x',
      eurMultiplier: '1.5x',
      note: 'Admin rates with strategic pricing multipliers applied'
    });

    // Store exchange rates info in window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__exchangeRates = {
        usdRate: rates.USD,
        eurRate: rates.EUR,
        formula: '(INR price / (admin_rate - 5 markup)) × strategic_multiplier',
        source: 'Admin Panel: /admin/exchange-rates',
        usdMultiplier: 2,
        eurMultiplier: 1.5,
        note: 'Admin rates from /admin/exchange-rates with pricing strategy multipliers'
      };
    }

    return rates;
  } catch (error) {
    console.error('[Currency] Failed to fetch rates from database:', error);
    
    // Use default rates if database fetch fails
    const defaultRates = {
      'INR': 1 as number,
      'USD': 88 as number,
      'EUR': 102 as number,
    };

    console.log('[Currency] Using default rates:', defaultRates);

    return defaultRates;
  }
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('INR');
  const [isInternational, setIsInternational] = useState(false);
  const [allowedCurrencies, setAllowedCurrencies] = useState<Currency[]>(['INR', 'USD', 'EUR']); // All currencies allowed by default
  const [detectedCountry, setDetectedCountry] = useState<string>('IN'); // Store detected country code
  // Store base exchange rates from admin panel, then apply strategic multipliers
  // Formula: (INR / (admin_rate - 5 markup)) × multiplier (2x USD, 1.5x EUR)
  const [baseExchangeRates, setBaseExchangeRates] = useState<Record<Currency, number>>({
    'INR': 1,
    'USD': 88,     // Admin rate for USD
    'EUR': 102,    // Admin rate for EUR
  });

  // Fetch exchange rates on mount
  useEffect(() => {
    const loadExchangeRates = async () => {
      const rates = await fetchExchangeRatesFromDB();
      setBaseExchangeRates(rates);
    };

    loadExchangeRates();

    // Set up real-time subscription for rate changes
    const subscription = supabase
      .channel('exchange_rates_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'exchange_rates'
      }, async (payload) => {
        console.log('[Currency] Exchange rates updated:', payload);
        // Reload rates when they change
        const rates = await fetchExchangeRatesFromDB();
        setBaseExchangeRates(rates);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
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
        if (!countryCode || countryCode === 'IN') {
          // India (or unknown country): show INR as default, with USD and EUR options
          setCurrencyState('INR');
          setIsInternational(false);
          setAllowedCurrencies(['INR', 'USD', 'EUR']);
          setDetectedCountry(countryCode || 'IN');
          console.log('[Currency] User in India (or unknown) - INR, USD, EUR all allowed');
        } else if (euCountries.includes(countryCode)) {
          // EU: show default EUR, but allow switching to USD
          setCurrencyState('EUR');
          setIsInternational(true);
          setAllowedCurrencies(['EUR', 'USD']);
          setDetectedCountry(countryCode);
          console.log('[Currency] User in EU - EUR and USD allowed');
        } else {
          // Rest of world: show default USD, but allow switching to EUR
          setCurrencyState('USD');
          setIsInternational(true);
          setAllowedCurrencies(['USD', 'EUR']);
          setDetectedCountry(countryCode);
          console.log('[Currency] User outside India/EU - USD and EUR allowed');
        }

        // Save to localStorage
        localStorage.setItem('userCountry', countryCode);
      } catch (error) {
        console.error('Error detecting location:', error);
        // Fallback to INR when geolocation fails — the majority of users are
        // in India, so INR is by far the safest default.
        setCurrencyState('INR');
        setIsInternational(false);
        setAllowedCurrencies(['INR', 'USD', 'EUR']);
      }
    };

    detectLocationAndSetCurrency();
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    setIsInternational(newCurrency !== 'INR');
    localStorage.setItem('preferredCurrency', newCurrency);
  };

  const getConvertedPrice = (inrPrice: number, category?: string, skipRounding = false): number => {
    if (currency === 'INR') {
      return inrPrice;
    }

    const baseRate = baseExchangeRates[currency];
    
    // Safety check - if baseRate is undefined or 0, use fallback
    if (!baseRate || baseRate === 0) {
      console.warn(`[Currency] baseRate is missing for ${currency}, using fallback`, {
        baseRate,
        baseExchangeRates,
        currency
      });
      const fallback = currency === 'USD' ? 88 : 102;
      const fallbackWithMarkup = fallback - 5;
      const multiplier = currency === 'USD' ? 2 : 1.5;
      const result = (inrPrice / fallbackWithMarkup) * multiplier;
      return skipRounding ? result : Math.round(result);
    }
    
    const markup = 5; // Rs 5 markup (subtracted from base rate)
    const rateWithMarkup = baseRate - markup;
    
    // Apply strategic multipliers as part of pricing strategy
    // Formula: (INR price / (admin_rate - 5 markup)) × multiplier
    // Admin rates from /admin/exchange-rates, then multipliers applied
    const multiplier = currency === 'USD' ? 2 : (currency === 'EUR' ? 1.5 : 1);
    const convertedPrice = (inrPrice / rateWithMarkup) * multiplier;
    
    // Round if not skipping rounding
    let finalPrice = skipRounding ? convertedPrice : Math.round(convertedPrice);
    
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

  const formatCurrency = (amount: number): string => {
    return formatCurrencyUtil(amount, currency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        getConvertedPrice,
        getCurrencySymbol,
        getCurrencyLabel,
        formatCurrency,
        isInternational,
        allowedCurrencies,
        detectedCountry,
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
