/* global HTMLImageElement */
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Award, RefreshCw, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePublicProducts } from '../hooks/usePublicProducts';
import { useCategories } from '../hooks/useCategories';
import ProductCard from '../components/product/ProductCard';
import HeroCarousel from '../components/home/HeroCarousel';

const HomePage: React.FC = () => {
  const { products: featuredProducts, loading: featuredLoading } = usePublicProducts(true);
  const { categories, loading: categoriesLoading } = useCategories();
  
  // Filter only featured categories
  const featuredCategories = categories?.filter(category => category.featured && category.image_url) || [];
  
  // Slider state and refs
  const [categoriesScrollPosition, setCategoriesScrollPosition] = useState(0);
  const [productsScrollPosition, setProductsScrollPosition] = useState(0);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const productsScrollRef = useRef<HTMLDivElement>(null);

  // Scroll functions
  const scrollCategories = (direction: 'left' | 'right') => {
    const container = categoriesScrollRef.current;
    if (!container) return;
    
    const scrollAmount = 320; // Approximate width of one category card + gap
    const newScrollPosition = direction === 'left' 
      ? Math.max(0, categoriesScrollPosition - scrollAmount)
      : categoriesScrollPosition + scrollAmount;
    
    container.scrollTo({ left: newScrollPosition, behavior: 'smooth' });
    setCategoriesScrollPosition(newScrollPosition);
  };

  const scrollProducts = (direction: 'left' | 'right') => {
    const container = productsScrollRef.current;
    if (!container) return;
    
    const scrollAmount = 300; // Approximate width of one product card + gap
    const newScrollPosition = direction === 'left' 
      ? Math.max(0, productsScrollPosition - scrollAmount)
      : productsScrollPosition + scrollAmount;
    
    container.scrollTo({ left: newScrollPosition, behavior: 'smooth' });
    setProductsScrollPosition(newScrollPosition);
  };
  
  return (
    <>
      {/* Hero Carousel Section */}
      <HeroCarousel />

      {/* Special Offers Banner */}
      <section className="bg-gradient-to-r from-accent-500 to-primary-500 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-4 text-center">
            <Star className="w-5 h-5" />
            <span className="font-medium">Free Shipping on orders above ₹2,999</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline font-medium">2-day Easy Returns</span>
            <Star className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Trending Now
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Discover our most loved pieces, handpicked by our style experts and loved by thousands of customers
            </p>
          </div>
          
          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 px-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-[3/4] rounded-2xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              {/* Navigation arrows - show only if more than 4 products */}
              {featuredProducts.length > 4 && (
                <>
                  <button
                    onClick={() => scrollProducts('left')}
                    className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2 md:p-3 hover:bg-white transition-all duration-300 group"
                    disabled={productsScrollPosition === 0}
                  >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
                  </button>
                  <button
                    onClick={() => scrollProducts('right')}
                    className="absolute right-0 md:right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2 md:p-3 hover:bg-white transition-all duration-300 group"
                  >
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
                  </button>
                </>
              )}
              
              {/* Products container */}
              <div
                ref={productsScrollRef}
                className="overflow-x-auto scrollbar-hide scroll-smooth py-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className={`flex gap-4 md:gap-6 ${featuredProducts.length <= 4 ? 'justify-center' : 'min-w-max px-4 md:px-8'}`}>
                  {featuredProducts.map((product) => (
                    <div key={product.id} className="transform hover:scale-105 transition-transform duration-300 flex-shrink-0 w-64 sm:w-72 px-1 md:px-2">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="text-center mt-8 md:mt-12">
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
      <section className="py-12 md:py-20 bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Shop by Category
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Discover our handpicked collections of authentic Indian ethnic wear, crafted by skilled artisans from across the country
            </p>
          </div>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 px-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 rounded-2xl mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : featuredCategories.length > 0 ? (
            <div className="relative">
              {/* Navigation arrows - show only if more than 4 categories */}
              {featuredCategories.length > 4 && (
                <>
                  <button
                    onClick={() => scrollCategories('left')}
                    className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2 md:p-3 hover:bg-white transition-all duration-300 group"
                    disabled={categoriesScrollPosition === 0}
                  >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
                  </button>
                  <button
                    onClick={() => scrollCategories('right')}
                    className="absolute right-0 md:right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2 md:p-3 hover:bg-white transition-all duration-300 group"
                  >
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
                  </button>
                </>
              )}
              
              {/* Categories container */}
              <div
                ref={categoriesScrollRef}
                className="overflow-x-auto scrollbar-hide scroll-smooth py-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className={`flex gap-4 md:gap-6 ${featuredCategories.length <= 4 ? 'justify-center' : 'min-w-max px-4 md:px-8'}`}>
                  {featuredCategories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/category/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex-shrink-0 w-72 sm:w-80 mx-1 md:mx-2"
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
                        <div className="absolute top-4 left-4">
                          <span className="bg-gradient-to-r from-accent-500 to-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Featured
                          </span>
                        </div>
                        
                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-accent-300 transition-colors">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-gray-200 mb-4 group-hover:text-white transition-colors">
                              {category.description}
                            </p>
                          )}
                          <div className="flex items-center text-accent-300 group-hover:text-accent-200 transition-colors">
                            <span className="font-medium mr-2">Explore Collection</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No featured categories available at the moment.</p>
              <Link
                to="/categories"
                className="inline-flex items-center bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
              >
                Browse All Categories
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Why Choose Nirchal?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the difference with our commitment to quality, authenticity, and exceptional customer service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Truck className="w-12 h-12 text-white" />,
                title: 'Free Shipping',
                description: 'Complimentary shipping on all orders above ₹2,999 across India',
                color: 'from-green-500 to-green-600'
              },
              {
                icon: <Shield className="w-12 h-12 text-white" />,
                title: 'Secure Payment',
                description: '100% secure payment gateway with multiple payment options',
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: <Award className="w-12 h-12 text-white" />,
                title: 'Premium Quality',
                description: 'Handpicked fabrics and meticulous quality control for every piece',
                color: 'from-purple-500 to-purple-600'
              },
              {
                icon: <RefreshCw className="w-12 h-12 text-white" />,
                title: 'Easy Returns',
                description: 'Hassle-free 2-day return and exchange policy for your peace of mind',
                color: 'from-orange-500 to-orange-600'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">Stay in Style</h2>
            <p className="text-lg md:text-xl text-primary-100 mb-8 leading-relaxed">
              Subscribe to our newsletter and be the first to know about new collections, exclusive offers, and styling tips from our fashion experts.
            </p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/20"
              />
              <button className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105">
                Subscribe
              </button>
            </div>
            <p className="text-sm text-primary-200 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
