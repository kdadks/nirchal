import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, Eye } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import QuickViewModal from './QuickViewModal';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product 
}) => {
  const { addToWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [imageSrc, setImageSrc] = React.useState(product.images[0] || '/placeholder-product.jpg');
  const [imageError, setImageError] = React.useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for better lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the card comes into view
        threshold: 0.1
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getDefaultAdjustedPrice = () => {
    if (!product.variants || product.variants.length === 0) return product.price;
    // Try to find variant for first color/size combo
    const defaultSize = product.sizes[0] || undefined;
    const defaultColor = product.colors[0] || undefined;
    const match = product.variants.find(v => {
      const colorMatch = defaultColor ? v.color === defaultColor : true;
      const sizeMatch = defaultSize && defaultSize !== 'Free Size' ? v.size === defaultSize : true;
      return colorMatch && sizeMatch;
    });
    if (match && (match.priceAdjustment || 0) > 0) return match.priceAdjustment!;
    const positiveVariantPrices = product.variants.map(v => v.priceAdjustment || 0).filter(p => p > 0);
    if (positiveVariantPrices.length > 0) return Math.min(...positiveVariantPrices);
    return product.price; // fallback to sale price
  };

  const getDefaultVariantId = () => {
    if (!product.variants || product.variants.length === 0) return undefined;
    const defaultSize = product.sizes[0] || undefined;
    const defaultColor = product.colors[0] || undefined;
    const match = product.variants.find(v => {
      const colorMatch = defaultColor ? v.color === defaultColor : true;
      const sizeMatch = defaultSize && defaultSize !== 'Free Size' ? v.size === defaultSize : true;
      return colorMatch && sizeMatch;
    });
    return match?.id;
  };

  const handleAddToCart = () => {
    const defaultSize = product.sizes[0] || 'Free Size';
    addToCart({
      id: product.id,
      name: product.name,
      price: getDefaultAdjustedPrice(),
      image: product.images[0],
  size: defaultSize,
  color: product.colors[0],
  variantId: getDefaultVariantId()
    });
    // Navigate to cart page after adding item
    navigate('/cart');
  };

  const handleImageError = () => {
    if (!imageError) {
      setImageSrc('/placeholder-product.jpg');
      setImageError(true);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToWishlist(product.id);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const truncateTitle = (title: string, maxLength: number = 45) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength).trim() + '...';
  };

  const discountPercentage = product.originalPrice && product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <>
      <div 
        ref={cardRef}
        className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 h-auto flex flex-col"
      >
        <Link to={`/products/${product.slug}`} className="flex-1 flex flex-col">
          {/* Image Container */}
          <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 flex-shrink-0">
            {isInView ? (
              <img
                src={imageSrc}
                srcSet={`${imageSrc} 1x, ${imageSrc}?w=800&q=80 2x`}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 product-image hw-accelerate"
                onError={handleImageError}
                loading="lazy"
                style={{
                  imageRendering: 'auto',
                  filter: 'contrast(1.02) saturate(1.01)',
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
              </div>
            )}
            
            {/* Stock Status Badge */}
            {product.stockStatus === 'Out of Stock' && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                Out of Stock
              </div>
            )}
            
            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                {discountPercentage}% OFF
              </div>
            )}

            {/* Action Buttons - Top Right */}
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {/* Quick View Button - Hidden on mobile */}
              <button
                onClick={handleQuickViewClick}
                className="hidden md:flex w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full items-center justify-center hover:bg-white transition-colors duration-200"
                title="Quick View"
              >
                <Eye className="w-4 h-4 text-gray-600 hover:text-amber-600" />
              </button>
              
              {/* Wishlist Button - Larger on mobile for better touch target */}
              <button
                onClick={handleWishlistClick}
                className="w-9 h-9 md:w-8 md:h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200"
                title="Add to Wishlist"
              >
                <Heart 
                  className={`w-5 h-5 md:w-4 md:h-4 transition-colors duration-200 ${
                    isInWishlist(product.id)
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-600 hover:text-red-500'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 flex-1 flex flex-col">
            {/* Title */}
            <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-1 flex-shrink-0" title={product.name}>
              {truncateTitle(product.name)}
            </h3>

            {/* Rating - Always show */}
            <div className="flex items-center gap-1 mb-1 flex-shrink-0">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${star <= Math.round(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">({(product.rating || 0).toFixed(1)})</span>
            </div>

            {/* Price - Only show sale price */}
            <div className="flex-shrink-0">
              <span className="text-base font-bold text-gray-900">
                {formatCurrency(getDefaultAdjustedPrice())}
              </span>
            </div>

            {/* Add to Cart Button - Larger touch target on mobile */}
            <div className="pt-2.5">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCart();
                }}
                disabled={product.stockStatus === 'Out of Stock'}
                className="w-full py-3 md:py-2 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-sm font-medium rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stockStatus === 'Out of Stock' ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
};

export default ProductCard;