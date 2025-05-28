import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { products } from '../../data/mockData';
import { useWishlist } from '../../contexts/WishlistContext';

const TrendingProducts: React.FC = () => {
  const { addToWishlist, isInWishlist } = useWishlist();
  
  // Filter featured products
  const featuredProducts = products.filter(product => product.isFeatured).slice(0, 4);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            Trending Now
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our most popular styles loved by customers across India
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <div key={product.id} className="group">
              <div className="relative overflow-hidden rounded-lg mb-4">
                {/* Product image */}
                <Link to={`/product/${product.id}`}>
                  <img 
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-96 sm:h-80 object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </Link>
                
                {/* Discount badge */}
                {product.discountPercentage && (
                  <div className="absolute top-4 left-4 bg-accent-500 text-white text-sm font-medium py-1 px-2 rounded">
                    {product.discountPercentage}% OFF
                  </div>
                )}
                
                {/* Wishlist button */}
                <button 
                  onClick={() => addToWishlist(product.id)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                  aria-label="Add to wishlist"
                >
                  <Heart 
                    size={18} 
                    className={isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'} 
                  />
                </button>
                
                {/* Quick view */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Link 
                    to={`/product/${product.id}`}
                    className="bg-white text-gray-900 py-2 px-4 rounded-md font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform"
                  >
                    Quick View
                  </Link>
                </div>
              </div>
              
              {/* Product info */}
              <div>
                <Link to={`/product/${product.id}`} className="block">
                  <h3 className="text-lg font-medium text-gray-900 mb-1 hover:text-primary-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-2">({product.reviewCount})</span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-lg font-medium text-gray-900">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link 
            to="/products" 
            className="inline-block bg-primary-600 text-white py-3 px-8 rounded-md hover:bg-primary-700 transition-colors duration-300 font-medium"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;