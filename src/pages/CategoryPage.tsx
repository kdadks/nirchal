import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/product/ProductCard';
import ProductFilters from '../components/product/ProductFilters';
import ProductSort from '../components/product/ProductSort';
import { products, categories } from '../data/mockData';
import { Product } from '../types';

const ITEMS_PER_PAGE = 9;

interface Filters {
  priceRange: [number, number];
  categories: string[];
  ratings: number[];
  availability: string[];
}

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'featured' | 'price-low' | 'price-high' | 'newest' | 'rating'>('featured');
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 50000],
    categories: [],
    ratings: [],
    availability: []
  });

  // Reset filters and pagination when category changes
  useEffect(() => {
    setFilters({
      priceRange: [0, 50000],
      categories: [],
      ratings: [],
      availability: []
    });
    setCurrentPage(1);
  }, [categoryId]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);
  
  // Apply filters and get category products
  const categoryProducts = products.filter(product => {
    if (categoryId && product.category !== categoryId) return false;
    
    // Price range filter
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) return false;
    
    // Categories filter (if any selected)
    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) return false;
    
    // Ratings filter
    if (filters.ratings.length > 0 && !filters.ratings.some(rating => product.rating >= rating)) return false;
    
    // Availability filter
    if (filters.availability.length > 0 && !filters.availability.includes(product.stockStatus)) return false;
    
    return true;
  });
  
  // Sort products
  const sortedProducts = [...categoryProducts].sort((a, b) => {
    switch (sortOrder) {
      case 'featured':
        return b.isFeatured === a.isFeatured ? 0 : b.isFeatured ? 1 : -1;
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return b.isNew === a.isNew ? 0 : b.isNew ? 1 : -1;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Get category details
  const category = categories.find(cat => cat.id === categoryId);

  // Reset to first page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!categoryId) {
    return (
      <>
        <Helmet>
          <title>All Categories | Your Store Name</title>
          <meta name="description" content="Browse our complete collection of ethnic wear" />
        </Helmet>
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="bg-gray-50 py-6 mb-6">
              <div className="container mx-auto">
                <h1 className="text-4xl font-serif font-bold text-center">All Categories</h1>
                <p className="text-gray-600 max-w-2xl mx-auto text-center mt-2">Discover our complete collection of ethnic wear</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className="group relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Link to={`/category/${cat.id}`} className="block">
                  <div className="relative h-64">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h2 className="text-2xl font-serif font-bold text-white mb-2">{cat.name}</h2>
                        {cat.description && (
                          <p className="text-white text-sm opacity-90">{cat.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (!category) {
    return <div className="container mx-auto px-4 py-8">Category not found</div>;
  }

  return (
    <>
      <Helmet>
        <title>{`${category.name} | Your Store Name`}</title>
        <meta name="description" content={category.description || `Browse our ${category.name} collection`} />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="bg-gray-50 py-6 mb-6">
            <div className="container mx-auto">
              <h1 className="text-4xl font-serif font-bold text-center">{category.name}</h1>
              {category.description && (
                <p className="text-gray-600 max-w-2xl mx-auto text-center mt-2">{category.description}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-1/4">
            <ProductFilters
              filters={filters}
              onChange={setFilters}
            />
          </div>
          
          {/* Product Grid */}
          <div className="w-full lg:w-3/4">
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedProducts.length)} of {sortedProducts.length} products
              </p>
              <ProductSort
                value={sortOrder}
                onChange={(value) => setSortOrder(value as typeof sortOrder)}
              />
            </div>
            
            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600 mb-4">No products found matching your filters</p>
                <button
                  onClick={() => setFilters({
                    priceRange: [0, 50000],
                    categories: [],
                    ratings: [],
                    availability: []
                  })}
                  className="text-primary-600 hover:text-primary-700 font-medium underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && paginatedProducts.length > 0 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded ${
                      currentPage === page
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryPage;