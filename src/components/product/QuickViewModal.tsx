import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { getSortedProductSizes } from '../../utils/sizeUtils';
import type { Product } from '../../types';

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to get color value for fallback swatches
const getColorValue = (colorName: string): string => {
  const colorMap: { [key: string]: string } = {
    'Red': '#DC2626',
    'Green': '#16A34A', 
    'Blue': '#2563EB',
    'Yellow': '#FACC15',
    'Orange': '#EA580C',
    'Purple': '#9333EA',
    'Pink': '#EC4899',
    'Black': '#1F2937',
    'White': '#F9FAFB',
    'Gray': '#6B7280',
    'Brown': '#92400E',
    'Navy': '#1E3A8A',
    'Maroon': '#7F1D1D',
    'Teal': '#0F766E',
    'Indigo': '#4338CA'
  };
  
  return colorMap[colorName] || '#6B7280'; // Default to gray if color not found
};

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [userInteractedWithColor, setUserInteractedWithColor] = useState(false);

  // Get all swatch image URLs
  const swatchImageUrls = product.variants 
    ? product.variants.map(v => v.swatchImage).filter(Boolean) as string[]
    : [];

  // Filter gallery images to exclude swatch images
  const galleryImages = product.images.filter(img => !swatchImageUrls.includes(img));
  
  // Compute available colors - only show if there are actual variants with meaningful color differences
  const colors = product.variants && product.variants.length > 0 
    ? product.variants
        .filter(variant => variant.color && variant.color.trim() !== '')
        .map(variant => variant.color!)
        .filter((color, index, arr) => arr.indexOf(color) === index)
    : [];
  
  // Create mapping from gallery image index to original image index
  const galleryToOriginalIndex = (galleryIndex: number): number => {
    const galleryImage = galleryImages[galleryIndex];
    return product.images.findIndex(img => img === galleryImage);
  };

  // Initialize selections when modal opens
  React.useEffect(() => {
    if (isOpen) {
      // Filter out "Free Size" and only set size if valid sizes exist
      const validSizes = getSortedProductSizes(product, true);
      if (validSizes.length > 0) {
        setSelectedSize(validSizes[0] || '');
      } else {
        setSelectedSize('');
      }
      
      // Only show colors if there are actual variants with color differences
      setSelectedColor(colors[0] || '');
      
      // Start with primary image (index 0) instead of swatch image
      setCurrentImageIndex(0);
      // Reset user interaction flag when modal opens
      setUserInteractedWithColor(false);
    }
  }, [isOpen, product.sizes, product.colors]);

  // When color changes, switch image to swatch if available (only if user clicked a color)
  React.useEffect(() => {
    if (!isOpen) return;
    if (!selectedColor) return;
    if (!userInteractedWithColor) return; // Only switch if user clicked a color
    const colorVariant = product.variants?.find(v => v.color === selectedColor);
    const swatchUrl = colorVariant?.swatchImage;
    const swatchId = colorVariant?.swatchImageId;
    if (!swatchUrl && !swatchId) return;
    let idx = swatchUrl ? product.images.findIndex(img => img === swatchUrl) : -1;
    if (idx === -1 && swatchId) {
      const idNoDash = swatchId.replace(/-/g, '');
      idx = product.images.findIndex(img => img.includes(swatchId) || img.includes(idNoDash));
    }
    if (idx >= 0) setCurrentImageIndex(idx);
  }, [isOpen, selectedColor, product.variants, product.images, userInteractedWithColor]);

  if (!isOpen) return null;

  const getSelectedVariant = () => {
    if (!product.variants || product.variants.length === 0) return undefined;
    // Only normalize size if a size is actually selected
    const normalizedSize = selectedSize && selectedSize.toLowerCase() === 'free size' ? undefined : selectedSize;
    return product.variants.find(v => {
      const colorMatch = selectedColor ? v.color === selectedColor : true;
      // If no size is selected (product has no sizes), match any size
      const sizeMatch = selectedSize ? (normalizedSize ? v.size === normalizedSize : true) : true;
      return colorMatch && sizeMatch;
    });
  };

  const selectedVariant = getSelectedVariant();
  const variantPrices = Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants.map(v => v.priceAdjustment || 0)
    : [];
  const positiveVariantPrices = variantPrices.filter(p => p > 0);
  const minPositiveVariantPrice = positiveVariantPrices.length > 0 ? Math.min(...positiveVariantPrices) : undefined;
  const adjustedPriceRaw = (() => {
    if (selectedVariant) {
      const pv = selectedVariant.priceAdjustment || 0;
      return pv > 0 ? pv : (minPositiveVariantPrice ?? product.price);
    }
    return minPositiveVariantPrice ?? product.price;
  })();
  const adjustedPrice = adjustedPriceRaw > 0 ? adjustedPriceRaw : product.price;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: adjustedPrice,
      image: product.images[currentImageIndex] || product.images[0],
      size: selectedSize || undefined,
      color: selectedColor,
      variantId: selectedVariant?.id
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
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

              {/* Thumbnail Images - Show only non-swatch images */}
              {galleryImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {galleryImages.map((image, galleryIndex) => {
                    const originalIndex = galleryToOriginalIndex(galleryIndex);
                    return (
                      <button
                        key={galleryIndex}
                        onClick={() => setCurrentImageIndex(originalIndex)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          originalIndex === currentImageIndex
                            ? 'border-amber-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} view ${galleryIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
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
                  {formatCurrency(adjustedPrice)}
                </span>
              </div>

              {/* Options Section - Always Show */}
              <div className="space-y-4">
                
                {/* Color Selection with Swatches - Only show if there are colors available */}
                {colors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Color</h4>
                  <div className="grid grid-cols-6 gap-3 max-w-sm">
                    {colors.map((color) => {
                      // Find the variant for this color to check for swatch image
                      const colorVariant = product.variants?.find(v => v.color === color);
                      
                      // Only show swatch image if variant has actual swatch_image_id in database
                      let hasSwatchImage = !!(colorVariant?.swatchImageId && colorVariant?.swatchImage);
                      let swatchImageUrl = colorVariant?.swatchImage;
                      const hex = colorVariant?.colorHex;
                      
                      // Debug only during development
                      if (import.meta.env.DEV) {
                        // console.debug('QuickViewModal color variant', color, { colorVariant, hasSwatchImage });
                      }
                      
                      const handleSwatchClick = () => {
                        setSelectedColor(color);
                        setUserInteractedWithColor(true); // Mark that user clicked a color
                        // If swatch has an image, try to find it in main product images
                        if (hasSwatchImage && swatchImageUrl) {
                          // First try to find exact URL match
                          let swatchImageIndex = product.images.findIndex(img => img === swatchImageUrl);
                          
                          // If not found, try to find by checking if the image URL contains the swatch image ID
                          if (swatchImageIndex === -1 && colorVariant?.swatchImageId) {
                            swatchImageIndex = product.images.findIndex(img => 
                              img.includes(colorVariant.swatchImageId!) || 
                              img.includes(colorVariant.swatchImageId!.replace(/-/g, ''))
                            );
                          }
                          
                          // If we found the image in main gallery, switch to it
                          if (swatchImageIndex !== -1) {
                            setCurrentImageIndex(swatchImageIndex);
                          }
                          // Note: If swatch image is not in main gallery, main image stays the same
                        }
                      };
                      
                      if (hasSwatchImage) {
                        // Show only swatch image without text for variants with swatch (40x40 for quick view)
                        return (
                          <button
                            key={color}
                            onClick={handleSwatchClick}
                            className={`relative w-10 h-10 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                              selectedColor === color
                                ? 'border-amber-500 ring-2 ring-amber-200'
                                : 'border-gray-300 hover:border-amber-300'
                            }`}
                            title={color}
                          >
                            <img
                              src={swatchImageUrl}
                              alt={`${color} swatch`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                if (import.meta.env.DEV) {
                                  console.warn(`[QuickViewModal] Swatch image failed to load for ${color}:`, swatchImageUrl);
                                }
                                // Show colored fallback
                                const imgElement = e.target as HTMLImageElement;
                                const fallbackElement = imgElement.nextElementSibling as HTMLElement;
                                imgElement.style.display = 'none';
                                if (fallbackElement) {
                                  fallbackElement.style.display = 'flex';
                                }
                              }}
                            />
                            {/* Fallback colored swatch when image fails to load */}
                            <div 
                              className="w-full h-full rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-inner"
                              style={{ 
                                backgroundColor: hex || getColorValue(color),
                                display: 'none' // Initially hidden, shown when image fails
                              }}
                            >
                              {color.charAt(0)}
                            </div>
                            {selectedColor === color && (
                              <div className="absolute inset-0 bg-amber-500 bg-opacity-20 flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full shadow-md"></div>
                              </div>
                            )}
                          </button>
                        );
                      } else {
                        // If no swatch image, use hex color if available
        if (hex) {
                          return (
                            <button
                              key={color}
                              onClick={handleSwatchClick}
          className={`relative w-10 h-10 overflow-hidden border border-black`}
                              title={color}
                            >
                              <div className="w-full h-full" style={{ backgroundColor: hex }} />
                            </button>
                          );
                        }
                        // Fallback to text button
                        return (
                          <button
                            key={color}
                            onClick={handleSwatchClick}
                            className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                              selectedColor === color
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            title={color}
                          >
                            {color}
                          </button>
                        );
                      }
                    })}
                  </div>
                </div>
                )}

                {/* Size Selection - Only show if sizes are defined and not empty */}
                {(() => {
                  const validSizes = getSortedProductSizes(product, true);
                  return validSizes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Size</h4>
                      <div className="flex flex-wrap gap-2">
                        {validSizes.map((size) => (
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
                  );
                })()}
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

              {/* Buy Now Button - Below availability */}
              <div className="pt-2">
                <button
                  onClick={handleBuyNow}
                  disabled={product.stockStatus === 'Out of Stock'}
                  className="w-full py-3 px-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.stockStatus === 'Out of Stock' ? 'Out of Stock' : 'Buy Now'}
                </button>
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
    </div>,
    document.body
  );
};

export default QuickViewModal;
