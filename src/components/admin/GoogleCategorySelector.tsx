/**
 * Google Category Selector Component
 * Searchable dropdown for selecting Google Product Taxonomy categories
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';
import { GoogleTaxonomyService } from '../../services/googleTaxonomyService';
import type { GoogleProductCategory } from '../../types/google-taxonomy';

interface GoogleCategorySelectorProps {
  value: number | null;
  onChange: (categoryId: number | null, category: GoogleProductCategory | null) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export const GoogleCategorySelector: React.FC<GoogleCategorySelectorProps> = ({
  value,
  onChange,
  placeholder = 'Search Google Product Category...',
  className = '',
  error
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<GoogleProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<GoogleProductCategory | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Load selected category on mount
  useEffect(() => {
    if (value && !selectedCategory) {
      GoogleTaxonomyService.getCategoryById(value).then((category: GoogleProductCategory | null) => {
        if (category) {
          setSelectedCategory(category);
        }
      });
    }
  }, [value, selectedCategory]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search categories with debounce
  const handleSearch = useCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setResults([]);
      return;
    }

    console.log('[GoogleCategorySelector] Searching for:', term);
    setIsLoading(true);
    try {
      const categories = await GoogleTaxonomyService.searchCategories(term);
      console.log('[GoogleCategorySelector] Got results:', categories.length);
      setResults(categories);
    } catch (error) {
      console.error('[GoogleCategorySelector] Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(searchTerm);
      }, 300);
    } else {
      setResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, handleSearch]);

  const handleSelectCategory = (category: GoogleProductCategory) => {
    setSelectedCategory(category);
    onChange(category.id, category);
    setSearchTerm('');
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    setSelectedCategory(null);
    onChange(null, null);
    setSearchTerm('');
    setResults([]);
  };

  const getBreadcrumbParts = (fullPath: string): string[] => {
    return fullPath.split('>').map(part => part.trim());
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Category Display */}
      {selectedCategory && !isOpen && (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-300 rounded-lg">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-green-900 mb-1">
              ✓ {selectedCategory.category_name}
            </div>
            <div className="flex flex-wrap items-center gap-1 text-xs text-gray-600">
              {getBreadcrumbParts(selectedCategory.full_path).map((part, index, arr) => (
                <React.Fragment key={index}>
                  <span className={index === arr.length - 1 ? 'font-semibold text-green-800' : 'text-gray-500'}>
                    {part}
                  </span>
                  {index < arr.length - 1 && (
                    <ChevronRight className="w-3 h-3 flex-shrink-0 text-gray-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-3">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search Input */}
      {(!selectedCategory || isOpen) && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className={`w-full pl-10 pr-10 py-3 border ${
                error ? 'border-red-300' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setResults([]);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Dropdown Results */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
              {isLoading && (
                <div className="p-4 text-center text-gray-500">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <div className="mt-2 text-sm">Searching...</div>
                </div>
              )}

              {!isLoading && searchTerm.trim().length < 2 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Type at least 2 characters to search
                </div>
              )}

              {!isLoading && searchTerm.trim().length >= 2 && results.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No categories found
                </div>
              )}

              {!isLoading && results.length > 0 && (
                <ul className="py-1 divide-y divide-gray-100">
                  {results.map((category) => (
                    <li key={category.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectCategory(category)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors group"
                      >
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                          {category.category_name}
                        </div>
                        <div className="flex flex-wrap items-center gap-1 mt-1.5 text-xs text-gray-600">
                          {getBreadcrumbParts(category.full_path).map((part, index, arr) => (
                            <React.Fragment key={index}>
                              <span className={index === arr.length - 1 ? 'font-semibold text-gray-900' : 'text-gray-500'}>
                                {part}
                              </span>
                              {index < arr.length - 1 && (
                                <ChevronRight className="w-3 h-3 flex-shrink-0 text-gray-400" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                        {category.level && (
                          <div className="mt-1 text-xs text-gray-400">
                            Level {category.level}
                          </div>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Helper Text */}
      {!error && !selectedCategory && (
        <p className="mt-1 text-xs text-gray-500">
          Select a Google Product Category to improve SEO and product discovery
        </p>
      )}
    </div>
  );
};
