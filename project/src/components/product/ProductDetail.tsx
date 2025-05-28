import React, { useState } from 'react';
import { Heart, ShoppingBag, ChevronRight } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

interface ProductDetailProps {
  product: Product;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      {/* Product Images */}
      <div>
        <div className="mb-4 overflow-hidden rounded-lg">
          <img 
            src={product.images[activeImage]}
            alt={`${product.name} - View ${activeImage + 1}`}
            className="w-full h-[500px] object-cover"
          />
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {product.images.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={`border rounded-md overflow-hidden ${
                activeImage === index ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200'
              }`}
            >
              <img 
                src={image}
                alt={`${product.name} - Thumbnail ${index + 1}`}
                className="w-full h-24 object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div>
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-gray-500 mb-4">
          <span>Home</span>
          <ChevronRight size={14} className="mx-1" />
          <span>{product.category.charAt(0).toUpperCase() + product.category.slice(1)}</span>
          <ChevronRight size={14} className="mx-1" />
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2">
          {product.name}
        </h1>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg 
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">{product.rating} ({product.reviewCount} reviews)</span>
        </div>

        {/* Price */}
        <div className="flex items-center mb-6">
          <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-lg text-gray-500 line-through ml-3">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
          {product.discountPercentage && (
            <span className="ml-3 bg-accent-500 text-white text-sm font-medium py-1 px-2 rounded">
              {product.discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mb-6">
          <span 
            className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
              product.stockStatus === 'In Stock' 
                ? 'bg-green-100 text-green-800'
                : product.stockStatus === 'Low Stock'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {product.stockStatus}
          </span>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
          <p className="text-gray-700 leading-relaxed">{product.description}</p>
        </div>

        {/* Details */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {product.fabric && (
              <div>
                <span className="font-medium text-gray-900">Fabric:</span> {product.fabric}
              </div>
            )}
            <div>
              <span className="font-medium text-gray-900">Color:</span> {product.color}
            </div>
            {product.occasion && (
              <div>
                <span className="font-medium text-gray-900">Occasion:</span> {product.occasion.join(', ')}
              </div>
            )}
            <div>
              <span className="font-medium text-gray-900">Category:</span> {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </div>
          </div>
        </div>

        {/* Size Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Size</h2>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 border rounded-md ${
                  selectedSize === size 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Quantity</h2>
          <div className="flex items-center">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-1 border border-gray-300 rounded-l-md hover:bg-gray-100"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-16 text-center py-1 border-t border-b border-gray-300"
            />
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-1 border border-gray-300 rounded-r-md hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-md font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag size={18} />
            Add to Cart
          </button>
          
          <button
            onClick={() => addToWishlist(product.id)}
            className={`flex-1 py-3 px-6 rounded-md font-medium flex items-center justify-center gap-2 ${
              isInWishlist(product.id)
                ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            <Heart 
              size={18} 
              className={isInWishlist(product.id) ? 'fill-red-500' : ''} 
            />
            {isInWishlist(product.id) ? 'Added to Wishlist' : 'Add to Wishlist'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;