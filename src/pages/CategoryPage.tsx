import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, ArrowRight, Filter } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import CategoryCard from '../components/category/CategoryCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { categories, loading, error } = useCategories();

  // If we have a categoryId, redirect to product listing with category filter
  useEffect(() => {
    if (categoryId) {
      navigate(`/products?category=${categoryId}`);
    }
  }, [categoryId, navigate]);

  const handleCategoryClick = (categorySlug: string) => {
    navigate(`/products?category=${categorySlug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Shop by Categories</h1>
              <p className="text-xl text-amber-100 max-w-2xl mx-auto">
                Discover our curated collection organized by style
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Shop by Categories</h1>
              <p className="text-xl text-amber-100 max-w-2xl mx-auto">
                Discover our curated collection organized by style
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
        <title>Shop by Categories | Nirchal</title>
        <meta name="description" content="Browse our complete collection of ethnic wear organized by categories" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {/* Hero Section - Commented out */}
        {/*
        <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Shop by Categories</h1>
              <p className="text-xl text-amber-100 max-w-2xl mx-auto">
                Discover our curated collection organized by style
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 text-amber-200">
                <ShoppingBag className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {categories.length} Categories Available
                </span>
              </div>
            </div>
          </div>
        </div>
        */}

        {/* Categories Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
      </div>
    </>
  );
};

export default CategoryPage;