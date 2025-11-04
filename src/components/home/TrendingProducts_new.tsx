import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, TrendingUp, Eye, Sparkles, ArrowRight } from 'lucide-react';
import type { Product } from '../../types';
import { useWishlist } from '../../contexts/WishlistContext';
import CustomerAuthModal from '../auth/CustomerAuthModal';

const TrendingProducts: React.FC = () => {
  const { addToWishlist, isInWishlist } = useWishlist();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Mock trending products for demo
  const featuredProducts: Product[] = [
    {
      id: "1",
      slug: "elegant-banarasi-silk-saree",
      name: "Elegant Banarasi Silk Saree",
      description: "Handwoven silk saree with intricate golden patterns",
      price: 24999,
      originalPrice: 32999,
      images: ["/heroimage1.png"],
      category: "Sarees",
      color: "Gold",
      colors: ["Gold", "Red", "Blue"],
      sizes: ["Free Size"],
      rating: 4.8,
      reviewCount: 156,
      stockStatus: "In Stock" as const,
      reviews: []
    },
    {
      id: "2",
      slug: "royal-lehenga-set",
      name: "Royal Lehenga Set",
      description: "Traditional bridal lehenga with embroidered details",
      price: 45999,
      originalPrice: 58999,
      images: ["/heroimage1.png"],
      category: "Lehengas",
      color: "Red",
      colors: ["Red", "Pink", "Maroon"],
      sizes: ["S", "M", "L", "XL"],
      rating: 4.9,
      reviewCount: 89,
      stockStatus: "In Stock" as const,
      reviews: []
    },
    {
      id: "3",
      slug: "designer-anarkali-suit",
      name: "Designer Anarkali Suit",
      description: "Premium georgette anarkali with mirror work",
      price: 15999,
      originalPrice: 21999,
      images: ["/heroimage1.png"],
      category: "Suits",
      color: "Green",
      colors: ["Green", "Blue", "Purple"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      rating: 4.7,
      reviewCount: 234,
      stockStatus: "In Stock" as const,
      reviews: []
    },
    {
      id: "4",
      slug: "embroidered-sharara-set",
      name: "Embroidered Sharara Set",
      description: "Contemporary sharara with traditional embroidery",
      price: 18999,
      originalPrice: 24999,
      images: ["/heroimage1.png"],
      category: "Suits",
      color: "Pink",
      colors: ["Pink", "Peach", "Yellow"],
      sizes: ["S", "M", "L", "XL"],
      rating: 4.8,
      reviewCount: 98,
      stockStatus: "In Stock" as const,
      reviews: []
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-neutral-50 to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-secondary-400 to-primary-400 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TrendingUp className="w-6 h-6 text-accent-500" />
            <span className="text-accent-600 font-accent font-medium text-sm uppercase tracking-widest">
              Customer Favorites
            </span>
            <Sparkles className="w-5 h-5 text-accent-500" />
          </div>
          
          <h2 className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-800 via-accent-600 to-secondary-600 bg-clip-text text-transparent mb-6">
            Trending Now
          </h2>
          
          <p className="text-neutral-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Discover our most loved designs that are setting trends across India. 
            Each piece is carefully crafted to blend tradition with contemporary elegance.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {featuredProducts.map((product: Product) => (
            <div key={product.id} className="group relative">
              {/* Trend Badge */}
              <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-accent-500 to-secondary-500 text-white px-3 py-1 rounded-full text-xs font-accent font-semibold flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>Trending</span>
              </div>

              {/* Product Card */}
              <div className="bg-white rounded-3xl shadow-lg group-hover:shadow-2xl transition-all duration-500 overflow-hidden border border-neutral-100 group-hover:border-accent-200">
                {/* Product Image Container */}
                <div className="relative overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Discount Badge */}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const result = await addToWishlist(product.id);
                        if (!result.success && result.requiresAuth) {
                          setShowAuthModal(true);
                        } else if (!result.success) {
                          console.error('Failed to add to wishlist');
                        }
                      }}
                      className={`w-12 h-12 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                        isInWishlist(product.id) ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white hover:text-red-500'
                      }`}
                    >
                      <Heart className="w-5 h-5" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                    </button>
                    <Link
                      to={`/product/${product.id}`}
                      className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-primary-600 transition-all duration-300 hover:scale-110"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  {/* Category */}
                  <span className="text-accent-500 font-accent font-medium text-sm uppercase tracking-wide mb-2 block">
                    {product.category}
                  </span>

                  {/* Product Name */}
                  <h3 className="font-display text-xl font-semibold text-primary-800 mb-3 group-hover:text-accent-600 transition-colors duration-300">
                    {product.name}
                  </h3>

                  {/* Description */}
                  <p className="text-neutral-600 text-sm mb-4 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < Math.floor(product.rating) ? 'fill-accent-400 text-accent-400' : 'text-neutral-300'}
                        />
                      ))}
                    </div>
                    <span className="text-neutral-500 text-sm">({product.reviewCount})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline space-x-3 mb-6">
                    <span className="text-2xl font-bold text-primary-800">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-lg text-neutral-400 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <Link
                    to={`/product/${product.id}`}
                    className="w-full bg-gradient-to-r from-primary-600 via-accent-500 to-secondary-500 text-white py-3 px-6 rounded-2xl font-accent font-semibold flex items-center justify-center space-x-2 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group/btn"
                  >
                    <ShoppingBag className="w-5 h-5 group-hover/btn:rotate-12 transition-transform duration-300" />
                    <span>View Details</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Products Button */}
        <div className="text-center">
          <Link
            to="/products"
            className="inline-flex items-center space-x-3 bg-white border-2 border-accent-200 text-accent-600 px-8 py-4 rounded-2xl font-accent font-semibold hover:bg-accent-50 hover:border-accent-300 hover:shadow-lg transition-all duration-300 group"
          >
            <span>Explore All Collections</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>

      {/* Customer Auth Modal */}
      <CustomerAuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </section>
  );
};

export default TrendingProducts;
