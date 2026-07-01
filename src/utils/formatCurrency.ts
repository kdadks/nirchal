export const formatCurrency = (amount: number, currency: 'INR' | 'USD' | 'EUR' = 'INR'): string => {
  // Get locale based on currency
  let locale = 'en-IN';
  if (currency === 'USD') {
    locale = 'en-US';
  } else if (currency === 'EUR') {
    locale = 'de-DE';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};

export const calculateDiscount = (originalPrice: number, salePrice: number): number => {
  if (!originalPrice || !salePrice || originalPrice <= salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};
