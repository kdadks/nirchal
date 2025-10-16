import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Eye } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { getProductStockInfo } from '../../utils/inventoryUtils';
import CustomerAuthModal from '../auth/CustomerAuthModal';
import QuickViewModal from './QuickViewModal';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  showActionButtons?: boolean; // Optional prop to show Choose Options/Buy Now buttons
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product,
  showActionButtons = false // Default to false - only featured products will have this
}) => {
  const { addToWishlist, isInWishlist } = useWishlist();
  const primaryImage = product.images && product.images.length > 0 ? product.images[0] : '/placeholder-product.jpg';
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageSrc, setImageSrc] = useState(primaryImage);
  const [imageError, setImageError] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if product has any stock available
  const hasStock = React.useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      const hasVariantStock = product.variants.some(variant => {
        const variantQuantity = variant.quantity || 0;
        return variantQuantity > 0;
      });
      
      if (!hasVariantStock) {
        const stockInfo = getProductStockInfo(product);
        return stockInfo.isInStock;
      }
      
      return hasVariantStock;
    } else {
      const stockInfo = getProductStockInfo(product);
      return stockInfo.isInStock;
    }
  }, [product]);

  // Get images for auto-scroll (max 10)
  const displayImages = React.useMemo(() => {
    const images = product.images && product.images.length > 0 
      ? product.images.slice(0, 10) 
      : ['/placeholder-product.jpg'];
    return images;
  }, [product.images]);

  // Update image source when product changes
  useEffect(() => {
    const newPrimaryImage = product.images && product.images.length > 0 ? product.images[0] : '/placeholder-product.jpg';
    setImageSrc(newPrimaryImage);
    setImageError(false);
    setCurrentImageIndex(0);
    setImagesPreloaded(false);
  }, [product]);

  // Preload images when hovering to ensure smooth transitions
  useEffect(() => {
    if (isHovering && !imagesPreloaded && displayImages.length > 1) {
      displayImages.forEach((imageSrc) => {
        const img = new Image();
        img.src = imageSrc;
      });
      setImagesPreloaded(true);
    }
  }, [isHovering, imagesPreloaded, displayImages]);

  // Auto-scroll images on hover - only after images are loaded
  useEffect(() => {
    if (isHovering && displayImages.length > 1 && isInView) {
      // Add a small delay before starting the auto-scroll to ensure first image is loaded
      const startDelay = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          setCurrentImageIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % displayImages.length;
            setImageSrc(displayImages[nextIndex]);
            return nextIndex;
          });
        }, 1500); // 1.5 second interval for smoother experience
      }, 500); // 500ms delay before starting

      return () => {
        clearTimeout(startDelay);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Reset to first image when not hovering
      if (!isHovering) {
        setCurrentImageIndex(0);
        setImageSrc(displayImages[0]);
      }
    }
  }, [isHovering, displayImages, isInView]);

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
    return product.price;
  };

  const handleImageError = () => {
    if (!imageError) {
      setImageSrc('/placeholder-product.jpg');
      setImageError(true);
    }
  };

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const result = await addToWishlist(product.id);
    if (!result.success && result.requiresAuth) {
      setShowAuthModal(true);
    } else if (!result.success) {
      console.error('Failed to add to wishlist');
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const discountPercentage = product.originalPrice && product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Check if product has variants
  const hasVariants = React.useMemo(() => {
    return product.variants && product.variants.length > 0;
  }, [product.variants]);

  const handleChooseOptions = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to product detail page for buy now
    window.location.href = `/products/${product.slug}`;
  };

  return (
    <>
      <div 
        ref={cardRef}
        className="group relative bg-white hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 hover:border-gray-300"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Link to={`/products/${product.slug}`} className="block">
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
            {isInView ? (
              <img
                src={imageSrc}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
              </div>
            )}
            
            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold">
                {discountPercentage}% OFF
              </div>
            )}

            {/* Action Buttons - Show on hover */}
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Quick View Button */}
              <button
                onClick={handleQuickViewClick}
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200 z-10"
                title="Quick View"
              >
                <Eye className="w-5 h-5 text-gray-700" />
              </button>

              {/* Wishlist Button */}
              <button
                onClick={handleWishlistClick}
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 z-10"
                title="Add to Wishlist"
              >
                <Heart 
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isInWishlist(product.id)
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-700 hover:text-red-500'
                  }`}
                />
              </button>
            </div>

            {/* Image Progress Indicator - Show on hover if multiple images */}
            {isHovering && displayImages.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                {displayImages.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'w-4 bg-white' 
                        : 'w-1 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-3">
            {/* Product Name */}
            <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2" title={product.name}>
              {product.name}
            </h3>

            {/* Price Section */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(getDefaultAdjustedPrice())}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-xs text-gray-500 line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                  <span className="text-xs font-semibold text-orange-600">
                    ({discountPercentage}% OFF)
                  </span>
                </>
              )}
            </div>

            {/* Rating and Action Button Row */}
            <div className="flex items-center justify-between gap-2">
              {/* Rating - Always show with 0 if no rating */}
              <div className="flex items-center gap-1">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        star <= Math.round(product.rating || 0) 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-gray-300 fill-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600">
                  ({(product.rating || 0).toFixed(1)})
                </span>
              </div>

              {/* Choose Options or Buy Now Button - Only for featured products */}
              {showActionButtons && hasStock && (
                hasVariants ? (
                  <button
                    onClick={handleChooseOptions}
                    className="text-xs font-medium text-amber-600 hover:text-amber-700 border border-amber-600 hover:border-amber-700 px-2 py-1 rounded transition-colors duration-200"
                  >
                    Choose Options
                  </button>
                ) : (
                  <button
                    onClick={handleBuyNow}
                    className="text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 px-3 py-1 rounded transition-colors duration-200"
                  >
                    Buy Now
                  </button>
                )
              )}
            </div>

            {/* Stock Status */}
            {!hasStock && (
              <div className="mt-2 text-xs text-red-600 font-medium">
                Out of Stock
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />

      {/* Customer Auth Modal */}
      <CustomerAuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default ProductCard;