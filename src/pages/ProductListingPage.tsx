import React, { useState, useMemo } from 'react';
import { Filter, Grid, List } from 'lucide-react';
import { useProductsWithFilters } from '../hooks/useProductsWithFilters';
import { useCategories } from '../hooks/useCategories';
import ProductCard from '../components/product/ProductCard';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface ProductFilters {
  category?: string;
  priceRange?: { min: number; max: number };
  fabric?: string;
  occasion?: string;
  sortBy?: 'newest' | 'price_low' | 'price_high' | 'rating' | 'name';
}

const ProductListingPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    sortBy: 'newest'
  });

  // Memoize pagination to prevent unnecessary re-renders
  const paginationOptions = useMemo(() => ({
    page: currentPage,
    limit: 20
  }), [currentPage]);

  // Fetch data from database
  const { products, loading: productsLoading, totalPages, totalCount, error } = useProductsWithFilters(
    filters,
    paginationOptions
  );
  const { categories, loading: categoriesLoading } = useCategories();

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    // Handle empty string values properly
    const cleanValue = value === '' ? undefined : value;
    
    console.log(`[ProductListingPage] Filter change: ${key} = ${cleanValue}`);
    
    setFilters(prev => ({
      ...prev,
      [key]: cleanValue
    }));
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (rangeString: string) => {
    if (rangeString === 'all') {
      handleFilterChange('priceRange', undefined);
      return;
    }

    const [min, max] = rangeString.split('-').map(Number);
    handleFilterChange('priceRange', { min: min || 0, max: max || 100000 });
  };

  const clearFilters = () => {
    setFilters({ sortBy: 'newest' });
    setCurrentPage(1);
  };

  // Show error state if there's a database connection issue
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">
                Discover Ethnic Excellence
              </h1>
              <p className="text-xl text-amber-100 max-w-2xl mx-auto">
                Explore our curated collection of traditional wear
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-amber-500 mb-4">
              <Filter className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Products</h3>
            <p className="text-gray-600 mb-4">
              We're having trouble connecting to our product database.
            </p>
            <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg max-w-md mx-auto">
              <p className="font-medium mb-1">Technical Details:</p>
              <p className="break-words">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'name', label: 'Name A-Z' },
  ];

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-2999', label: 'Under ₹3,000' },
    { value: '3000-7999', label: '₹3,000 - ₹8,000' },
    { value: '8000-15999', label: '₹8,000 - ₹16,000' },
    { value: '16000-30000', label: '₹16,000 - ₹30,000' },
    { value: '30001-100000', label: 'Above ₹30,000' },
  ];

  const fabricTypes = [
    { value: '', label: 'All Fabrics' },
    { value: 'Silk', label: 'Silk' },
    { value: 'Cotton', label: 'Cotton' },
    { value: 'Georgette', label: 'Georgette' },
    { value: 'Chiffon', label: 'Chiffon' },
    { value: 'Velvet', label: 'Velvet' },
  ];

  const occasions = [
    { value: '', label: 'All Occasions' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'party', label: 'Party' },
    { value: 'festival', label: 'Festival' },
    { value: 'casual', label: 'Casual' },
    { value: 'formal', label: 'Formal' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Discover Ethnic Excellence
            </h1>
            <p className="text-xl text-amber-100 max-w-2xl mx-auto">
              Explore our curated collection of traditional wear
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
                {categoriesLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value=""
                        checked={!filters.category}
                        onChange={() => handleFilterChange('category', '')}
                        className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">All Categories</span>
                    </label>
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category.name}
                          checked={filters.category === category.name}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                          className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
                <select
                  value={filters.priceRange ? `${filters.priceRange.min}-${filters.priceRange.max}` : 'all'}
                  onChange={(e) => handlePriceRangeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                >
                  {priceRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fabric */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Fabric</h3>
                <select
                  value={filters.fabric || ''}
                  onChange={(e) => handleFilterChange('fabric', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                >
                  {fabricTypes.map((fabric) => (
                    <option key={fabric.value} value={fabric.value}>
                      {fabric.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Occasion */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Occasion</h3>
                <select
                  value={filters.occasion || ''}
                  onChange={(e) => handleFilterChange('occasion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                >
                  {occasions.map((occasion) => (
                    <option key={occasion.value} value={occasion.value}>
                      {occasion.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile Filters Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            {/* Results Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-600">
                  {totalCount || 0} products found
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Sort by:</label>
                    <select
                      value={filters.sortBy || 'newest'}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
                      className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* View Mode */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-gray-400 mb-4">
                  <Filter className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your filters to see more products.</p>
              </div>
            ) : (
              <>
                <div className={`grid gap-6 ${viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                  : 'grid-cols-1'
                }`}>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative w-full max-w-xs bg-white shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>

            {/* Same filter content as desktop */}
            <div className="space-y-6">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
                {categoriesLoading ? (
                  <div className="text-sm text-gray-500">Loading categories...</div>
                ) : (
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value=""
                        checked={!filters.category}
                        onChange={() => handleFilterChange('category', '')}
                        className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">All Categories</span>
                    </label>
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category.name}
                          checked={filters.category === category.name}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                          className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListingPage;
