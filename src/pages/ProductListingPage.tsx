import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Grid, List, Heart, ShoppingBag, X, SlidersHorizontal } from 'lucide-react';
import { usePublicProducts } from '../hooks/usePublicProducts';
import type { Product } from '../types';

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

const filterCategories = [
  { value: 'sarees', label: 'Sarees' },
  { value: 'lehengas', label: 'Lehengas' },
  { value: 'kurtis', label: 'Kurtis' },
  { value: 'dresses', label: 'Dresses' },
  { value: 'suits', label: 'Suits' },
];

const priceRanges = [
  { value: '0-2999', label: 'Under ₹3,000' },
  { value: '3000-7999', label: '₹3,000 - ₹8,000' },
  { value: '8000-15999', label: '₹8,000 - ₹16,000' },
  { value: '16000-30000', label: '₹16,000 - ₹30,000' },
  { value: '30000+', label: 'Above ₹30,000' },
];

const ProductListingPage: React.FC = () => {
  const { products, loading, error } = usePublicProducts();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const togglePriceRange = (range: string) => {
    setSelectedPriceRanges(prev =>
      prev.includes(range)
        ? prev.filter(r => r !== range)
        : [...prev, range]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRanges([]);
  };

  const sortProducts = (products: Product[]) => {
    switch (sortBy) {
      case 'price-asc':
        return [...products].sort((a, b) => (a.originalPrice || a.price) - (b.originalPrice || b.price));
      case 'price-desc':
        return [...products].sort((a, b) => (b.originalPrice || b.price) - (a.originalPrice || a.price));
      case 'newest':
        return [...products].sort((a, b) => a.id.localeCompare(b.id)); // Since we don't have created_at, sort by id
      default:
        return products;
    }
  };

  const filterByPrice = (product: Product, range: string) => {
    const price = product.originalPrice || product.price;
    switch (range) {
      case '0-2999':
        return price < 3000;
      case '3000-7999':
        return price >= 3000 && price < 8000;
      case '8000-15999':
        return price >= 8000 && price < 16000;
      case '16000-30000':
        return price >= 16000 && price <= 30000;
      case '30000+':
        return price > 30000;
      default:
        return true;
    }
  };

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategories.length === 0 ||
      selectedCategories.includes(product.category);
    
    const priceMatch = selectedPriceRanges.length === 0 ||
      selectedPriceRanges.some(range => filterByPrice(product, range));
    
    return categoryMatch && priceMatch;
  });

  const sortedProducts = sortProducts(filteredProducts);
  const activeFiltersCount = selectedCategories.length + selectedPriceRanges.length;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-zinc-900 mb-2">
                Shop Collection
              </h1>
              <p className="text-zinc-600">
                {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'} found
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="hidden md:flex bg-white rounded-lg p-1 border border-zinc-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'grid' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'list' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <List size={18} />
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Filter Button */}
              <button
                onClick={toggleFilter}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-700 hover:bg-zinc-50 transition-colors duration-200 lg:hidden"
              >
                <SlidersHorizontal size={18} />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-zinc-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-zinc-600">Active filters:</span>
              {selectedCategories.map(category => (
                <span key={category} className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-900 text-white text-sm rounded-full">
                  {filterCategories.find(c => c.value === category)?.label}
                  <button onClick={() => toggleCategory(category)} className="hover:bg-zinc-700 rounded-full p-0.5">
                    <X size={12} />
                  </button>
                </span>
              ))}
              {selectedPriceRanges.map(range => (
                <span key={range} className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-900 text-white text-sm rounded-full">
                  {priceRanges.find(r => r.value === range)?.label}
                  <button onClick={() => togglePriceRange(range)} className="hover:bg-zinc-700 rounded-full p-0.5">
                    <X size={12} />
                  </button>
                </span>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-sm text-zinc-600 hover:text-zinc-900 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`
            fixed lg:relative inset-0 z-50 bg-white lg:bg-transparent w-80 lg:w-64 transition-transform duration-300 ease-in-out lg:translate-x-0
            ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="h-full overflow-y-auto p-6 lg:p-0">
              <div className="flex justify-between items-center mb-6 lg:hidden">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button onClick={toggleFilter} className="p-2 hover:bg-zinc-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                {/* Categories */}
                <div>
                  <h3 className="font-semibold text-zinc-900 mb-4">Categories</h3>
                  <div className="space-y-3">
                    {filterCategories.map(category => (
                      <label key={category.value} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.value)}
                          onChange={() => toggleCategory(category.value)}
                          className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900 focus:ring-2"
                        />
                        <span className="ml-3 text-zinc-700 group-hover:text-zinc-900">{category.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-semibold text-zinc-900 mb-4">Price Range</h3>
                  <div className="space-y-3">
                    {priceRanges.map(range => (
                      <label key={range.value} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedPriceRanges.includes(range.value)}
                          onChange={() => togglePriceRange(range.value)}
                          className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900 focus:ring-2"
                        />
                        <span className="ml-3 text-zinc-700 group-hover:text-zinc-900">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-zinc-200 h-80 rounded-xl mb-4"></div>
                    <div className="h-4 bg-zinc-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-zinc-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="text-red-600 mb-4">
                  <p className="text-lg font-medium">Error loading products</p>
                  <p className="text-sm">{error}</p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-zinc-600 mb-2">No products found</p>
                <p className="text-zinc-500">
                  {activeFiltersCount > 0
                    ? 'Try adjusting your filters'
                    : 'Products will appear here once they are added to the database'
                  }
                </p>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {sortedProducts.map((product) => (
                  <div key={product.id} className="group product-card bg-white rounded-xl overflow-hidden shadow-soft">
                    <div className="relative">
                      <Link to={`/products/${product.id}`}>
                        <img
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                          alt={product.name}
                          className={`w-full object-cover product-image ${viewMode === 'grid' ? 'h-80' : 'h-48'}`}
                        />
                      </Link>
                      
                      {/* Sale Badge */}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200">
                          <Heart size={18} className="text-zinc-700" />
                        </button>
                        <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200">
                          <ShoppingBag size={18} className="text-zinc-700" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-semibold text-zinc-900 mb-2 group-hover:text-zinc-700 transition-colors duration-200">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-zinc-900">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-zinc-500 line-through">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleFilter}
        />
      )}
    </div>
  );
};

export default ProductListingPage;