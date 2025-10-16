import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Award, RefreshCw, Star } from 'lucide-react';
import { usePublicProducts } from '../hooks/usePublicProducts';
import { useCategories } from '../hooks/useCategories';
import ProductCard from '../components/product/ProductCard';
import HeroCarousel from '../components/home/HeroCarousel';
import type { Category } from '../types';

const HomePage: React.FC = () => {
  const { products: featuredProducts, loading: featuredLoading } = usePublicProducts(true);
  const { categories, loading: categoriesLoading } = useCategories();
  
  return (
    <>
      {/* Hero Carousel Section */}
      <HeroCarousel />

      {/* Special Offers Banner */}
      <section className="bg-gradient-to-r from-accent-500 to-primary-500 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-4 text-center">
            <Star className="w-5 h-5" />
            <span className="font-medium">Free Shipping on All Orders Across India 🇮🇳</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline font-medium">2-day Easy Returns</span>
            <Star className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Featured Products - Trending Now */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-10">
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-4 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Trending Now
            </h2>
            <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover our most loved pieces, handpicked by our style experts and loved by thousands of customers
            </p>
          </div>
          
          {featuredLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-[3/4] rounded-lg md:rounded-2xl mb-2 md:mb-4"></div>
                  <div className="h-3 md:h-4 bg-gray-200 rounded mb-1 md:mb-2"></div>
                  <div className="h-3 md:h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
              {featuredProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="transform hover:scale-105 transition-transform duration-300">
                  <ProductCard product={product} showActionButtons={true} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-6 md:mt-8">
            <Link
              to="/products"
              className="inline-flex items-center bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-medium text-base md:text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              View All Products
              <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-6 md:py-8 bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-10">
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-4 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Shop by Category
            </h2>
            <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked collections of authentic Indian ethnic wear, crafted by skilled artisans from across the country
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
            {categoriesLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="group relative overflow-hidden rounded-lg md:rounded-2xl shadow-lg animate-pulse">
                  <div className="aspect-[3/4] bg-gray-300"></div>
                </div>
              ))
            ) : (
              (() => {
                const featuredCategories = categories.filter(category => category.featured);
                const displayCategories = featuredCategories.length > 0 
                  ? featuredCategories.slice(0, 5)
                  : categories.slice(0, 5); // Fallback to first 5 categories if no featured ones
                
                return displayCategories.map((category: Category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="group relative overflow-hidden rounded-lg md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="aspect-[3/4] relative">
                      <img
                        src={category.image_url || 'https://images.pexels.com/photos/794064/pexels-photo-794064.jpeg?auto=compress&cs=tinysrgb&w=400&h=600'}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.pexels.com/photos/794064/pexels-photo-794064.jpeg?auto=compress&cs=tinysrgb&w=400&h=600';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      
                      {/* Badge */}
                      <div className="absolute top-2 md:top-3 left-2 md:left-3">
                        <span className="bg-gradient-to-r from-accent-500 to-primary-500 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-xs font-medium">
                          {category.featured ? 'Featured' : 'Popular'}
                        </span>
                      </div>
                      
                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 text-center">
                        <h3 className="text-sm md:text-lg font-bold text-white mb-1 md:mb-2 group-hover:text-accent-300 transition-colors">
                          {category.name}
                        </h3>
                        <div className="flex items-center justify-center text-accent-300 group-hover:text-accent-200 transition-colors">
                          <span className="text-xs md:text-sm font-medium mr-1">Explore Collection</span>
                          <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ));
              })()
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-8 md:py-12 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-10">
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-4 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Why Choose Nirchal?
            </h2>
            <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the difference with our commitment to quality, authenticity, and exceptional customer service
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                icon: <Truck className="w-5 h-5 md:w-8 md:h-8 text-white" />,
                title: 'Free Shipping',
                description: 'On all orders across India 🇮🇳',
                color: 'from-green-500 to-green-600'
              },
              {
                icon: <Shield className="w-5 h-5 md:w-8 md:h-8 text-white" />,
                title: 'Secure Payment',
                description: '100% secure gateway',
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: <Award className="w-5 h-5 md:w-8 md:h-8 text-white" />,
                title: 'Premium Quality',
                description: 'Handpicked fabrics',
                color: 'from-purple-500 to-purple-600'
              },
              {
                icon: <RefreshCw className="w-5 h-5 md:w-8 md:h-8 text-white" />,
                title: 'Easy Returns',
                description: '2-day return policy',
                color: 'from-blue-500 to-blue-600'
              },
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className={`w-10 h-10 md:w-14 md:h-14 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-sm md:text-lg font-bold text-gray-800 mb-1 md:mb-2">{feature.title}</h3>
                <p className="text-xs md:text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-6 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold">Stay in Style</h3>
              <p className="text-sm text-primary-100">Subscribe for new collections & exclusive offers</p>
            </div>
            <div className="flex gap-2 min-w-0 sm:min-w-80">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
              />
              <button className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
