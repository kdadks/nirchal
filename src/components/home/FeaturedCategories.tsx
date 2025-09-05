import React from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';

const FeaturedCategories: React.FC = () => {
  // Fetch categories from database
  const { categories, loading, error } = useCategories();

  if (loading) {
    return <div className="py-16 text-center">Loading categories...</div>;
  }
  if (error) {
    return <div className="py-16 text-center text-red-600">Error loading categories: {error}</div>;
  }
  if (!categories || categories.length === 0) {
    return <div className="py-16 text-center text-gray-500">No categories found.</div>;
  }
  const featuredCategories = categories;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our curated collection of premium Indian ethnic wear across various categories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredCategories.map((category) => (
            <Link 
              key={category.id}
              to={`/category/${category.slug || category.name}`}
              className="group block"
            >
              <div className="relative overflow-hidden rounded-lg shadow-md">
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300 z-10" />
                
                {/* Image */}
                <img 
                  src={category.image || 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=320&fit=crop&q=80'}
                  alt={category.name}
                  className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                  <h3 className="text-2xl font-serif font-bold text-white mb-2">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-white/90 text-center max-w-[85%]">
                      {category.description}
                    </p>
                  )}
                  <span className="mt-4 inline-block py-2 px-4 border border-white text-white text-sm font-medium rounded group-hover:bg-white group-hover:text-gray-900 transition-colors duration-300">
                    Explore Collection
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link 
            to="/categories" 
            className="inline-block border border-gray-800 text-gray-800 py-3 px-8 rounded-md hover:bg-gray-800 hover:text-white transition-colors duration-300"
          >
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;