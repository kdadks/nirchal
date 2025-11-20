import React, { useState, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { getAllCountries, getStatesByCountry, getCitiesByState } from '../../data/countriesData';

interface InternationalAddressProps {
  country: string;
  state: string;
  city: string;
  onCountryChange: (country: string) => void;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  required?: boolean;
  className?: string;
}

const InternationalAddressSelector: React.FC<InternationalAddressProps> = ({
  country,
  state,
  city,
  onCountryChange,
  onStateChange,
  onCityChange,
  required = false,
  className = ''
}) => {
  const [showCityInput, setShowCityInput] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const countries = getAllCountries();
  const states = country ? getStatesByCountry(country) : [];
  const cities = country && state ? getCitiesByState(country, state) : [];

  // Auto-populate custom city value when city is "Not in List"
  useEffect(() => {
    if (city.startsWith('__CUSTOM__')) {
      setShowCityInput(true);
      const customValue = city.replace('__CUSTOM__', '');
      setCustomCity(customValue);
    } else {
      setShowCityInput(false);
      setCustomCity('');
    }
  }, [city]);

  const handleCitySelect = (selectedCity: string) => {
    if (selectedCity === 'NOT_IN_LIST') {
      setShowCityInput(true);
      setCityOpen(false);
    } else {
      setShowCityInput(false);
      onCityChange(selectedCity);
      setCityOpen(false);
    }
  };

  const handleCustomCityChange = (value: string) => {
    setCustomCity(value);
    // Auto-update the city value as user types
    if (value.trim()) {
      onCityChange(`__CUSTOM__${value.trim()}`);
    }
  };

  const getSelectedCityLabel = () => {
    if (city.startsWith('__CUSTOM__')) {
      return customCity;
    }
    return city || 'Select City';
  };

  const currentCountry = countries.find(c => c.code === country);
  const currentState = states.find(s => s.code === state);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Country Dropdown */}
      <div className="relative">
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
          Country {required && <span className="text-red-500">*</span>}
        </label>
        <button
          onClick={() => {
            setCountryOpen(!countryOpen);
            setStateOpen(false);
            setCityOpen(false);
          }}
          className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-left text-sm"
        >
          <span className={currentCountry ? 'text-gray-900' : 'text-gray-500'}>
            {currentCountry?.name || 'Select Country'}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${countryOpen ? 'rotate-180' : ''}`} />
        </button>

        {countryOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {countries.map(c => (
              <button
                key={c.code}
                onClick={() => {
                  onCountryChange(c.code);
                  onStateChange('');
                  onCityChange('');
                  setCountryOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 hover:bg-primary-50 transition-colors ${
                  country === c.code ? 'bg-primary-100 font-semibold' : ''
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* State Dropdown */}
      {country && (
        <div className="relative">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
            State/Province {required && <span className="text-red-500">*</span>}
          </label>
          <button
            onClick={() => {
              setStateOpen(!stateOpen);
              setCountryOpen(false);
              setCityOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-left text-sm"
          >
            <span className={currentState ? 'text-gray-900' : 'text-gray-500'}>
              {currentState?.name || 'Select State/Province'}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${stateOpen ? 'rotate-180' : ''}`} />
          </button>

          {stateOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {states.map(s => (
                <button
                  key={s.code}
                  onClick={() => {
                    onStateChange(s.code);
                    onCityChange('');
                    setStateOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 hover:bg-primary-50 transition-colors ${
                    state === s.code ? 'bg-primary-100 font-semibold' : ''
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* City Dropdown or Input */}
      {country && state && (
        <>
          {!showCityInput ? (
            <div className="relative">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                City {required && <span className="text-red-500">*</span>}
              </label>
              <button
                onClick={() => {
                  setCityOpen(!cityOpen);
                  setCountryOpen(false);
                  setStateOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-left text-sm"
              >
                <span className={city && !city.startsWith('__CUSTOM__') ? 'text-gray-900' : 'text-gray-500'}>
                  {getSelectedCityLabel()}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${cityOpen ? 'rotate-180' : ''}`} />
              </button>

              {cityOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {cities.map(c => (
                    <button
                      key={c}
                      onClick={() => handleCitySelect(c)}
                      className={`w-full text-left px-4 py-2.5 hover:bg-primary-50 transition-colors ${
                        city === c ? 'bg-primary-100 font-semibold' : ''
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                  {/* "Not in List" Option */}
                  <button
                    onClick={() => handleCitySelect('NOT_IN_LIST')}
                    className={`w-full text-left px-4 py-2.5 hover:bg-orange-50 transition-colors border-t border-gray-200 font-semibold text-orange-600`}
                  >
                    ✏️ Not in List - Type your city
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                Enter City Name {required && <span className="text-red-500">*</span>}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCity}
                  onChange={e => handleCustomCityChange(e.target.value)}
                  placeholder="Type your city name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setShowCityInput(false);
                    setCustomCity('');
                    onCityChange('');
                  }}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Back to city list"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InternationalAddressSelector;
