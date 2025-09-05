import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, ArrowRight, Filter, Grid, List } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useProductsWithFilters } from '../hooks/useProductsWithFilters';
import CategoryCard from '../components/category/CategoryCard';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const productsPerPage = 12;

  // If we have a categoryId, we're showing products for that category
  const isShowingCategoryProducts = !!categoryId;
  
  // Get products for the specific category if categoryId is provided
  const { 
    products, 
    loading: productsLoading, 
    error: productsError, 
    totalPages 
  } = useProductsWithFilters({
    category: isShowingCategoryProducts ? categoryId : undefined,
    sortBy: 'newest'
  }, { page: currentPage, limit: productsPerPage });

  // Find the current category info
  const currentCategory = categories.find(cat => 
    (cat as any).slug === categoryId || cat.name.toLowerCase().replace(/\s+/g, '-') === categoryId
  );

  const handleCategoryClick = (categorySlug: string) => {
    navigate(`/category/${categorySlug}`);
  };

  const loading = isShowingCategoryProducts ? productsLoading : categoriesLoading;
  const error = isShowingCategoryProducts ? productsError : categoriesError;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Shop by Categories</h1>
              <p className="text-lg md:text-xl text-amber-100 max-w-2xl mx-auto">
                Discover our curated collection organized by style
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Shop by Categories</h1>
              <p className="text-lg md:text-xl text-amber-100 max-w-2xl mx-auto">
                Discover our curated collection organized by style
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center">
            <div className="text-amber-500 mb-4">
              <Filter className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Categories</h3>
            <p className="text-gray-600 mb-4">
              We're having trouble connecting to our category database.
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

  return (
    <>
      <Helmet>
        <title>
          {isShowingCategoryProducts 
            ? `${currentCategory?.name || categoryId} - Shop by Category | Nirchal`
            : 'Shop by Categories | Nirchal'
          }
        </title>
        <meta 
          name="description" 
          content={
            isShowingCategoryProducts 
              ? `Browse our complete collection of ${currentCategory?.name || categoryId} ethnic wear`
              : 'Browse our complete collection of ethnic wear organized by categories'
          } 
        />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="text-center">
              {isShowingCategoryProducts ? (
                <>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                    {currentCategory?.name || categoryId}
                  </h1>
                  <p className="text-lg md:text-xl text-amber-100 max-w-2xl mx-auto">
                    Discover our beautiful collection of {currentCategory?.name || categoryId}
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Shop by Categories</h1>
                  <p className="text-lg md:text-xl text-amber-100 max-w-2xl mx-auto">
                    Discover our curated collection organized by style
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-2 text-amber-200">
                    <ShoppingBag className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {categories.length} Categories Available
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isShowingCategoryProducts ? (
            /* Products View */
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-gray-500 mb-6">
                <Link to="/categories" className="hover:text-amber-600 transition-colors">Categories</Link>
                <ArrowRight className="w-4 h-4" />
                <span className="text-gray-700">{currentCategory?.name || categoryId}</span>
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-gray-600">
                  {products.length} products found
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-amber-100 text-amber-700' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-amber-100 text-amber-700' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Products Grid/List */}
              {products.length === 0 ? (
                <div className="text-center py-16">
                  {/* Breadcrumb */}
                  <div className="flex items-center justify-center gap-2 text-gray-500 mb-6">
                    <Link to="/categories" className="hover:text-amber-600 transition-colors">Categories</Link>
                    <ArrowRight className="w-4 h-4" />
                    <span className="text-gray-700">{currentCategory?.name || categoryId}</span>
                  </div>
                  
                  <div className="text-gray-400 mb-4">
                    <ShoppingBag className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
                  <p className="text-gray-600 mb-6">
                    No products are available in this category at the moment.
                  </p>
                  <Link
                    to="/categories"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Browse Other Categories
                  </Link>
                </div>
              ) : (
                <>
                  <div className={viewMode === 'grid' 
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    : "space-y-6"
                  }>
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={productsPerPage}
                        totalItems={products.length}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={() => {}}
                        showItemsPerPage={false}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            /* Categories View */
            <div>
              {categories.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <ShoppingBag className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Available</h3>
                  <p className="text-gray-600">
                    Categories are being updated. Please check back soon.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categories.map((category) => (
                    <CategoryCard 
                      key={category.id} 
                      category={category} 
                      onClick={handleCategoryClick} 
                    />
                  ))}
                </div>
              )}

              {/* Call to Action */}
              <div className="mt-16 text-center">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Can't Find What You're Looking For?
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Browse our complete collection to discover all available products
                  </p>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    View All Products
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryPage;