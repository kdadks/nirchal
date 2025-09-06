import React from 'react';
import { ChevronDown } from 'lucide-react';
import { ALL_STATES_AND_UTS } from '../../data/indianStatesAndCities';

interface StateDropdownProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

const StateDropdown: React.FC<StateDropdownProps> = ({
  name,
  value,
  onChange,
  required = false,
  className = "w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm font-medium touch-manipulation",
  placeholder = "Select State"
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  // Sort states alphabetically by name
  const sortedStates = [...ALL_STATES_AND_UTS].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={handleChange}
        required={required}
        className={`${className} appearance-none cursor-pointer pr-10 min-h-[44px] sm:min-h-[40px]`}
      >
        <option value="" className="text-sm font-medium py-2">{placeholder}</option>
        {sortedStates.map((state) => (
          <option key={state.code} value={state.name} className="text-sm font-medium py-2">
            {state.name}
          </option>
        ))}
      </select>
      
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-600">
        <ChevronDown size={20} className="sm:w-4 sm:h-4" />
      </div>
    </div>
  );
};

export default StateDropdown;
