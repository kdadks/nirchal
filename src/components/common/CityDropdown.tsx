import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { findCitiesByState } from '../../data/indianStatesAndCities';

interface CityDropdownProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  selectedState?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
  highZIndex?: boolean; // For use in modals that need higher z-index
}

const CityDropdown: React.FC<CityDropdownProps> = ({
  name,
  value,
  onChange,
  selectedState,
  required = false,
  className = "w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm font-medium touch-manipulation",
  placeholder = "Select City",
  highZIndex = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isTyping, setIsTyping] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Get cities based on selected state and filter by current input value
    if (selectedState) {
      const stateCities = findCitiesByState(selectedState);
      
      // Only filter if user is actively typing, otherwise show all cities
      if (isTyping && value) {
        const filtered = stateCities.filter(city => 
          city.toLowerCase().includes(value.toLowerCase())
        ).sort();
        setFilteredCities(filtered);
      } else {
        setFilteredCities(stateCities);
      }
    } else {
      setFilteredCities([]);
    }
  }, [selectedState, value, isTyping]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is outside the input container
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        // Also check if click is not on the portal dropdown
        const portalDropdown = document.querySelector('[data-city-dropdown-portal]');
        if (!portalDropdown || !portalDropdown.contains(target)) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset city when state changes to a different state
  const previousState = useRef(selectedState);
  useEffect(() => {
    if (previousState.current && previousState.current !== selectedState) {
      onChange('');
    }
    previousState.current = selectedState;
  }, [selectedState, onChange]);

  const calculateDropdownPosition = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Calculate available space below the input
      const spaceBelow = viewportHeight - rect.bottom;
      const dropdownHeight = 240; // max-h-60 = 15rem = 240px
      
      // On mobile, ensure dropdown doesn't go off-screen
      let top = rect.bottom;
      let left = rect.left;
      let width = rect.width;
      
      // Adjust for mobile viewport constraints
      if (viewportWidth < 640) { // sm breakpoint
        // Ensure dropdown doesn't go off the right edge
        if (left + width > viewportWidth - 16) {
          left = Math.max(8, viewportWidth - width - 8);
        }
        
        // If not enough space below and more space above, show above
        if (spaceBelow < dropdownHeight && rect.top > spaceBelow) {
          top = rect.top - Math.min(dropdownHeight, rect.top - 8);
        }
      }
      
      setDropdownPosition({
        top,
        left,
        width
      });
    }
  }, []);

  // Handle scroll events to update dropdown position
  useEffect(() => {
    if (isOpen) {
      // Recalculate position immediately when dropdown opens
      calculateDropdownPosition();
      
      let ticking = false;
      let lastScrollTime = 0;
      const throttleDelay = 8; // ~120fps for smooth updates
      
      const handleScroll = () => {
        const now = performance.now();
        if (now - lastScrollTime > throttleDelay && !ticking) {
          lastScrollTime = now;
          ticking = true;
          requestAnimationFrame(() => {
            calculateDropdownPosition();
            ticking = false;
          });
        }
      };

      // Add scroll listeners to window and all scrollable parents
      window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
      window.addEventListener('resize', handleScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [isOpen, calculateDropdownPosition]);

  const handleCitySelect = useCallback((city: string) => {
    onChange(city);
    setIsTyping(false); // Reset typing state when a selection is made
    // Use requestAnimationFrame to ensure the value update is processed
    requestAnimationFrame(() => {
      setIsOpen(false);
    });
  }, [onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsTyping(true); // User is actively typing
    
    // Open dropdown when typing if a state is selected
    if (selectedState && !isOpen) {
      calculateDropdownPosition();
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    if (selectedState) {
      setIsTyping(false); // Reset typing state to show all cities
      calculateDropdownPosition();
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' && !isOpen) {
      e.preventDefault();
      if (selectedState) {
        setIsOpen(true);
      }
    }
  };

  return (
    <div className="relative z-20 overflow-visible" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={selectedState ? placeholder : 'Select City'}
        disabled={!selectedState}
        required={required}
        className={`${className} ${!selectedState ? 'bg-gray-100 cursor-not-allowed' : ''} min-h-[44px] sm:min-h-[40px] pr-10`}
        autoComplete="off"
      />
      
      <div 
        className={`absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer ${!selectedState ? 'text-gray-400' : 'text-gray-600'}`}
        onClick={(e) => {
          e.stopPropagation();
          if (selectedState) {
            if (!isOpen) {
              setIsTyping(false); // Reset typing state to show all cities
              calculateDropdownPosition();
            }
            setIsOpen(!isOpen);
          }
        }}
      >
        <ChevronDown size={20} className={`sm:w-4 sm:h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && selectedState && filteredCities.length > 0 && createPortal(
        <div 
          data-city-dropdown-portal
          className={`fixed bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 sm:max-h-60 overflow-hidden ${highZIndex ? 'z-[9999999]' : 'z-[9999]'}`}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            maxHeight: window.innerHeight < 600 ? '40vh' : '15rem'
          }}
        >
          <div className="max-h-60 sm:max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ maxHeight: window.innerHeight < 600 ? '40vh' : '15rem' }}>
            {filteredCities.slice(0, 20).map((city) => (
              <div
                key={city}
                className="px-4 py-3 sm:px-3 sm:py-2 hover:bg-gray-100 active:bg-gray-200 cursor-pointer text-sm font-medium text-gray-900 min-h-[44px] sm:min-h-[36px] flex items-center touch-manipulation"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCitySelect(city);
                }}
              >
                {city}
              </div>
            ))}
            {filteredCities.length > 20 && (
              <div className="px-3 py-2 text-xs text-gray-500 border-t">
                Showing top 20 of {filteredCities.length} cities. Continue typing to narrow down...
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CityDropdown;
