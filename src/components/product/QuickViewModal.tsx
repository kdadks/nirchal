import React, { useState } from 'react';
import { X, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import type { Product } from '../../types';

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'Free Size');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || 'Default');

  if (!isOpen) return null;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize
    });
    onClose();
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // Navigate to cart or checkout page
    window.location.href = '/cart';
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col relative">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Quick View</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={product.images[currentImageIndex] || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex
                          ? 'border-amber-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Buy Now Button - Aligned with image */}
              <div className="pt-4">
                <button
                  onClick={handleBuyNow}
                  disabled={product.stockStatus === 'Out of Stock'}
                  className="w-full py-3 px-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.stockStatus === 'Out of Stock' ? 'Out of Stock' : 'Buy Now'}
                </button>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                
                {/* Rating - Always show */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({(product.rating || 0).toFixed(1)})</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatCurrency(product.price)}
                </span>
              </div>

              {/* Variants Section - Always Show */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Variants</h3>
                
                {/* Color Selection */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Color</h4>
                  <div className="flex flex-wrap gap-2">
                    {(product.colors && product.colors.length > 0 ? product.colors : ['Default']).map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1 text-sm border rounded transition-colors ${
                          selectedColor === color
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selection */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Size</h4>
                  <div className="flex flex-wrap gap-2">
                    {(product.sizes && product.sizes.length > 0 ? product.sizes : ['Free Size']).map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1 text-sm border rounded transition-colors ${
                          selectedSize === size
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">Availability:</span>
                <span className={`text-sm font-medium ${
                  product.stockStatus === 'In Stock' 
                    ? 'text-green-600' 
                    : product.stockStatus === 'Low Stock'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {product.stockStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* View Full Details Button - Bottom Right */}
        <div className="absolute bottom-4 right-6">
          <button
            onClick={() => window.location.href = `/products/${product.slug}`}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium hover:underline transition-all duration-200"
          >
            View full details →
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
