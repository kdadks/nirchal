import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { useProducts } from '../hooks/useAdmin';
import type { ProductWithDetails } from '../types/admin';

const sortOptions = [
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
];

const filterCategories = [
  { value: 'sarees', label: 'Sarees' },
  { value: 'lehengas', label: 'Lehengas' },
  { value: 'kurtis', label: 'Kurtis' },
  { value: 'dresses', label: 'Dresses' },
];

const ProductListingPage: React.FC = () => {
  const { products, loading } = useProducts();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const sortProducts = (products: ProductWithDetails[]) => {
    switch (sortBy) {
      case 'price-asc':
        return [...products].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...products].sort((a, b) => b.price - a.price);
      case 'newest':
        return [...products].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      default:
        return products;
    }
  };

  const filteredProducts = products
    .filter(product => 
      selectedCategories.length === 0 || 
      selectedCategories.includes(product.category?.slug || '')
    );

  const sortedProducts = sortProducts(filteredProducts);

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4 md:mb-0">
            Shop Collection
          </h1>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleFilter}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              <Filter size={20} className="mr-2" />
              Filter
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-4 pr-8 py-2 border border-gray-300 rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex">
          {/* Filters Sidebar */}
          <div className={`
            fixed md:relative inset-0 z-40 bg-white w-80 transition-transform duration-300 ease-in-out
            ${isFilterOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            <div className="p-4">
              <div className="flex justify-between items-center mb-4 md:hidden">
                <h2 className="text-lg font-medium">Filters</h2>
                <button onClick={toggleFilter} className="text-gray-500">
                  ✕
                </button>
              </div>

              <div>
                <h3 className="font-medium mb-2">Categories</h3>
                {filterCategories.map(category => (
                  <label key={category.value} className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.value)}
                      onChange={() => toggleCategory(category.value)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700">{category.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 ml-0 md:ml-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-80 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {sortedProducts.map((product) => (
                  <Link 
                    key={product.id} 
                    to={`/products/${product.id}`}
                    className="group"
                  >
                    <div className="relative rounded-lg overflow-hidden mb-4">
                      <img
                        src={product.images?.[0]?.image_url || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.sale_price && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded">
                          Sale
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-lg font-medium text-gray-900">
                        ₹{product.sale_price || product.price}
                      </span>
                      {product.sale_price && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{product.price}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default ProductListingPage;