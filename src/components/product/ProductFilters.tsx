import React from 'react';
import { X } from 'lucide-react';

interface Filters {
  priceRange: [number, number];
  categories: string[];
  ratings: number[];
  availability: string[];
}

interface FilterProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const ProductFilters: React.FC<FilterProps> = ({ filters, onChange }) => {
  const handlePriceChange = (min: number, max: number) => {
    onChange({ ...filters, priceRange: [min, max] });
  };

  const handleCategoryChange = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onChange({ ...filters, categories: newCategories });
  };

  const handleRatingChange = (rating: number) => {
    const newRatings = filters.ratings.includes(rating)
      ? filters.ratings.filter(r => r !== rating)
      : [...filters.ratings, rating];
    onChange({ ...filters, ratings: newRatings });
  };

  const handleAvailabilityChange = (status: string) => {
    const newAvailability = filters.availability.includes(status)
      ? filters.availability.filter(s => s !== status)
      : [...filters.availability, status];
    onChange({ ...filters, availability: newAvailability });
  };

  const clearFilters = () => {
    onChange({
      priceRange: [0, 50000],
      categories: [],
      ratings: [],
      availability: []
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
        >
          <X size={16} className="mr-1" />
          Clear all
        </button>
      </div>

      {/* Price Range */}
      <div className="border-t border-gray-200 py-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={filters.priceRange[0]}
            onChange={(e) => handlePriceChange(Number(e.target.value), filters.priceRange[1])}
            className="w-24 px-2 py-1 border border-gray-300 rounded-md"
            placeholder="Min"
          />
          <span className="text-gray-500">to</span>
          <input
            type="number"
            value={filters.priceRange[1]}
            onChange={(e) => handlePriceChange(filters.priceRange[0], Number(e.target.value))}
            className="w-24 px-2 py-1 border border-gray-300 rounded-md"
            placeholder="Max"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="border-t border-gray-200 py-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
        <div className="space-y-2">
          {['sarees', 'lehengas', 'suits', 'kurtis', 'gowns'].map(category => (
            <label key={category} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => handleCategoryChange(category)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-600 capitalize">
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Ratings */}
      <div className="border-t border-gray-200 py-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map(rating => (
            <label key={rating} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.ratings.includes(rating)}
                onChange={() => handleRatingChange(rating)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-600">
                {rating}+ Stars
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="border-t border-gray-200 py-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Availability</h3>
        <div className="space-y-2">
          {['In Stock', 'Low Stock', 'Pre-Order'].map(status => (
            <label key={status} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.availability.includes(status)}
                onChange={() => handleAvailabilityChange(status)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-600">
                {status}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;