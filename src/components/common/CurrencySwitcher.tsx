import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency, Currency } from '../../contexts/CurrencyContext';
import { ChevronDown } from 'lucide-react';

interface CurrencyOption {
  code: Currency;
  label: string;
  flag: string;
  description: string;
}

const currencyOptions: CurrencyOption[] = [
  {
    code: 'INR',
    label: 'Indian Rupee',
    flag: '🇮🇳',
    description: 'India',
  },
  {
    code: 'USD',
    label: 'US Dollar',
    flag: '🇺🇸',
    description: 'USA & Rest of World',
  },
  {
    code: 'EUR',
    label: 'Euro',
    flag: '🇪🇺',
    description: 'European Union',
  },
];

export const CurrencySwitcher: React.FC = () => {
  const { currency, setCurrency, allowedCurrencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  // Filter currency options based on allowed currencies
  const availableOptions = currencyOptions.filter(opt => allowedCurrencies.includes(opt.code));
  const currentOption = availableOptions.find(opt => opt.code === currency);

  // Fallback to first available option if current not found
  const displayOption = currentOption || availableOptions[0] || currencyOptions[0];

  // Hide switcher if only one currency is available
  if (availableOptions.length <= 1) {
    return (
      <div className="flex items-center gap-1 px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-primary-200/50 text-sm font-medium">
        <span className="text-xl md:text-2xl" title={displayOption?.label}>{displayOption?.flag}</span>
      </div>
    );
  }

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Currency Switcher Button - Mobile responsive */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-primary-200/50 hover:bg-white/95 hover:border-primary-300 transition-all duration-300 shadow-sm hover:shadow-md text-sm font-medium"
        title={`Switch currency - Currently: ${displayOption?.label}`}
      >
        <span className="text-xl md:text-2xl">{displayOption?.flag}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="hidden sm:block"
        >
          <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-primary-600" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu - Mobile responsive */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-48 sm:w-56 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-primary-200/50 overflow-hidden z-[1000]"
          >
            <div className="p-1 sm:p-2">
              <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-primary-600 uppercase tracking-wide">
                Select Currency
              </div>
              {availableOptions.map((option, index) => (
                <motion.button
                  key={option.code}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleCurrencyChange(option.code)}
                  className={`w-full text-left px-2 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-200 flex items-center gap-2 sm:gap-3 border border-transparent ${
                    currency === option.code
                      ? 'bg-gradient-to-r from-primary-100 to-accent-100 border-primary-300/50'
                      : 'hover:bg-primary-50/50 hover:border-primary-200/30'
                  }`}
                >
                  <span className="text-lg sm:text-2xl">{option.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-primary-800 text-sm sm:text-base truncate">{option.label}</div>
                    <div className="text-xs text-primary-600 truncate">{option.description}</div>
                  </div>
                  {currency === option.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center"
                    >
                      <span className="text-white font-bold text-xs sm:text-sm">✓</span>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[999]"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurrencySwitcher;
