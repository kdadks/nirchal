/* global HTMLImageElement */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Award, RefreshCw, Star } from 'lucide-react';
import { usePublicProducts } from '../hooks/usePublicProducts';
import ProductCard from '../components/product/ProductCard';
import HeroCarousel from '../components/home/HeroCarousel';

const HomePage: React.FC = () => {
  const { products: featuredProducts, loading: featuredLoading } = usePublicProducts(true);
  
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

      {/* Featured Categories */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Shop by Category
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our handpicked collections of authentic Indian ethnic wear, crafted by skilled artisans from across the country
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarees',
                description: 'Timeless elegance in silk and cotton',
                image: 'https://images.pexels.com/photos/8369048/pexels-photo-8369048.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=1',
                link: '/category/sarees',
                badge: 'Traditional'
              },
              {
                name: 'Lehengas',
                description: 'Regal designs for special occasions',
                image: 'https://images.pexels.com/photos/2836486/pexels-photo-2836486.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=1',
                link: '/category/lehengas',
                badge: 'Bridal'
              },
              {
                name: 'Gowns',
                description: 'Contemporary elegance meets tradition',
                image: 'https://images.pexels.com/photos/2916814/pexels-photo-2916814.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=1',
                link: '/category/gowns',
                badge: 'Designer'
              }
            ].map((category) => (
              <Link
                key={category.name}
                to={category.link}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="aspect-[3/4] relative">
                  <img
                    src={category.image}
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
                      {category.badge}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-accent-300 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-200 mb-4 group-hover:text-white transition-colors">
                      {category.description}
                    </p>
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
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Trending Now
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our most loved pieces, handpicked by our style experts and loved by thousands of customers
            </p>
          </div>
          
          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-[3/4] rounded-2xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.slice(0, 4).map((product) => (
                <div key={product.id} className="transform hover:scale-105 transition-transform duration-300">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center bg-gradient-to-r from-primary-500 to-accent-500 text-white px-8 py-4 rounded-xl font-medium text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              View All Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
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
