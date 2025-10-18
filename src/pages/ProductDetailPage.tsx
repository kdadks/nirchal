import React, { useState, useEffect } from 'react';
import { useProductReviews } from '../hooks/useProductReviews';
import { useProductSuggestions } from '../hooks/useProductSuggestions';
import { useParams, useNavigate } from 'react-router-dom';
import { Truck, RefreshCw, Shield, Star, ChevronLeft, ChevronRight, X, Search, Facebook, Linkedin, MessageCircle, Link2, Check, ShoppingBag, Heart, Share2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { usePublicProducts } from '../hooks/usePublicProducts';
import { useWishlist } from '../contexts/WishlistContext';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { useCategories } from '../hooks/useCategories';
import CustomerAuthModal from '../components/auth/CustomerAuthModal';
import ProductCard from '../components/product/ProductCard';
import { format } from 'date-fns';
import { 
  getSelectedProductStockInfo, 
  isSizeAvailable, 
  isColorAvailable, 
  getMaxQuantity,
  getAvailableColors,
  getAvailableSizes
} from '../utils/inventoryUtils';
import { getSortedProductSizes } from '../utils/sizeUtils';
import type { Product } from '../types';

// Custom SVG Icons
const TelegramIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const XIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z"/>
  </svg>
);

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, loading } = usePublicProducts();
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { customer } = useCustomerAuth();
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [hasUserInteractedWithColor, setHasUserInteractedWithColor] = useState(false);

  const product = products.find(p => p.slug === slug);
  const { categories } = useCategories();
  const { reviews, fetchReviews, addReview } = useProductReviews(product?.id || '');
  const { suggestions } = useProductSuggestions({ currentProduct: product || null });

  // Get category slug from database
  const categorySlug = product?.category 
    ? categories.find(cat => cat.name === product.category)?.slug || product.category.toLowerCase().replace(/\s+/g, '-')
    : '';

  useEffect(() => {
    if (product?.id) fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  // Default selections when product is loaded
  useEffect(() => {
    if (!product) return;
    
    // Reset selections for new product
    setSelectedSize('');
    setSelectedColor('');
    setHasUserInteractedWithColor(false);
    
    // Get available sizes and colors (without filtering by current selection)
    const availableColors = product.variants && product.variants.length > 0 
      ? getAvailableColors(product) // Don't filter by selectedSize initially
      : [];
    const availableSizes = getAvailableSizes(product); // Don't filter by selectedColor initially
    
    // Preselect first available size
    if (availableSizes.length > 0) {
      setSelectedSize(availableSizes[0]!);
    }
    
    // Preselect first color that has a swatch image (to avoid non-image variants in cart)
    let selectedColorValue = '';
    if (availableColors.length > 0) {
      // Try to find the first color variant with a swatch image
      const colorWithSwatch = availableColors.find(color => {
        const variant = product.variants?.find(v => v.color === color);
        return variant && (variant.swatchImage || variant.swatchImageId);
      });
      
      // Use color with swatch if found, otherwise fall back to first available color
      selectedColorValue = colorWithSwatch || availableColors[0]!;
      setSelectedColor(selectedColorValue);
    }

    // Set the selected image based on the chosen color's swatch
    if (selectedColorValue && product.variants) {
      const colorVariant = product.variants.find(v => v.color === selectedColorValue);
      if (colorVariant && (colorVariant.swatchImage || colorVariant.swatchImageId)) {
        const swatchUrl = colorVariant.swatchImage;
        const swatchId = colorVariant.swatchImageId;
        
        // Try exact URL match first
        let idx = swatchUrl ? product.images.findIndex(img => img === swatchUrl) : -1;
        if (idx === -1 && swatchId) {
          const idNoDash = swatchId.replace(/-/g, '');
          idx = product.images.findIndex(img => img.includes(swatchId) || img.includes(idNoDash));
        }
        if (idx >= 0) {
          setSelectedImage(idx);
        } else if (product.images && product.images.length > 0) {
          // Fallback to first image if swatch not found
          setSelectedImage(0);
        }
      } else if (product.images && product.images.length > 0) {
        // Always set to primary image (index 0) when no swatch is available
        setSelectedImage(0);
      }
    } else if (product.images && product.images.length > 0) {
      // Always set to primary image (index 0) when product first loads
      setSelectedImage(0);
    }
  }, [product]);

  // When color changes (only after user interaction), switch main image to that color's swatch if present
  useEffect(() => {
    if (!product || !selectedColor || !hasUserInteractedWithColor) return;
    const colorVariant = product.variants?.find(v => v.color === selectedColor);
    if (!colorVariant) return;
    const swatchUrl = colorVariant.swatchImage;
    const swatchId = colorVariant.swatchImageId;
    if (!swatchUrl && !swatchId) return;

    // Try exact URL match first
    let idx = swatchUrl ? product.images.findIndex(img => img === swatchUrl) : -1;
    if (idx === -1 && swatchId) {
      const idNoDash = swatchId.replace(/-/g, '');
      idx = product.images.findIndex(img => img.includes(swatchId) || img.includes(idNoDash));
    }
    if (idx >= 0) {
      setSelectedImage(idx);
    }
  }, [product, selectedColor, hasUserInteractedWithColor]);

  // Handle keyboard events for image modal and body scroll lock
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isImageModalOpen || !product) return;
      
      switch (event.key) {
        case 'Escape':
          closeImageModal();
          break;
        case 'ArrowLeft':
          if (product.images.length > 1) prevImageInModal();
          break;
        case 'ArrowRight':
          if (product.images.length > 1) nextImageInModal();
          break;
      }
    };

    // Lock body scroll when modal is open (especially important for mobile)
    if (isImageModalOpen) {
      document.body.classList.add('modal-open');
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isImageModalOpen, product?.images?.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="animate-pulse">
                <div className="bg-zinc-200 h-96 lg:h-[600px] rounded-2xl mb-4"></div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-zinc-200 h-24 rounded-xl"></div>
                  ))}
                </div>
              </div>
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-zinc-200 rounded w-3/4"></div>
                <div className="h-6 bg-zinc-200 rounded w-1/4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-zinc-200 rounded w-full"></div>
                  <div className="h-4 bg-zinc-200 rounded w-5/6"></div>
                  <div className="h-4 bg-zinc-200 rounded w-4/6"></div>
                </div>
                <div className="h-12 bg-zinc-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    navigate('/products');
    return null;
  }

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: product.id,
          name: product.name,
          price: adjustedPrice,
          image: product.images[selectedImage] || product.images[0] || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          size: selectedSize || undefined,
          color: selectedColor || product.color,
          variantId: selectedVariant?.id,
          category: product.category // Include category for add-ons detection
        });
      }

      // Show success message or navigate to cart
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    setIsAdding(true);
    try {
      // Add to cart first
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: product.id,
          name: product.name,
          price: adjustedPrice,
          image: product.images[selectedImage] || product.images[0] || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          size: selectedSize || undefined,
          color: selectedColor || product.color,
          variantId: selectedVariant?.id,
          category: product.category // Include category for add-ons detection
        });
      }

      // Navigate directly to checkout
      navigate('/checkout');
    } catch (error) {
      console.error('Error buying product:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const openImageModal = () => {
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  const nextImageInModal = () => {
    if (!product || !product.images || product.images.length === 0) return;
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImageInModal = () => {
    if (!product || !product.images || product.images.length === 0) return;
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const sizes = getSortedProductSizes(product, true);
  // Only show colors if there are actual variants, and only available colors
  const colors = product.variants && product.variants.length > 0 
    ? getAvailableColors(product, selectedSize)
    : [];

  // Get all swatch image URLs
  const swatchImageUrls = product.variants 
    ? product.variants.map(v => v.swatchImage).filter(Boolean) as string[]
    : [];

  // Filter gallery images to exclude swatch images
  const galleryImages = product.images.filter(img => !swatchImageUrls.includes(img));
  
  // Create mapping from gallery image index to original image index
  const galleryToOriginalIndex = (galleryIndex: number): number => {
    const galleryImage = galleryImages[galleryIndex];
    return product.images.findIndex(img => img === galleryImage);
  };

  // Only consider it as having variants if sizes exist and are not empty
  const hasVariants = sizes.length > 0 && sizes.some(size => size && size.trim() !== '');
  
  // Check stock availability for current selection
  const stockInfo = getSelectedProductStockInfo(product, selectedSize, selectedColor);
  const maxQuantity = getMaxQuantity(product, selectedSize, selectedColor);
  
  // Can add to cart if: has no variants OR size is selected AND stock is available
  const canAddToCart = (!hasVariants || selectedSize) && stockInfo.isAvailable;

  const nextImage = () => {
    if (!product || !product.images || product.images.length === 0) return;
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product || !product.images || product.images.length === 0) return;
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  // Helper: find selected variant and compute adjusted price
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

  // Wishlist handlers
  const handleWishlistToggle = async () => {
    if (!product) return;
    
    if (isInWishlist(product.id)) {
      const result = await removeFromWishlist(product.id);
      if (!result.success) {
        console.error('Failed to remove from wishlist');
      }
    } else {
      const result = await addToWishlist(product.id);
      if (!result.success && result.requiresAuth) {
        setShowAuthModal(true);
      } else if (!result.success) {
        console.error('Failed to add to wishlist');
      }
    }
  };

  // Share handlers
  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    setCopySuccess(false);
  };

  const getProductUrl = () => {
    return window.location.href;
  };

  const getShareData = () => {
    const url = getProductUrl();
    const title = product?.name || 'Check out this product';
    let description = `${title} - Starting from ₹${product?.price}`;
    
    // Add selected variant info if available
    if (selectedSize || selectedColor) {
      const variantInfo = [];
      if (selectedSize) variantInfo.push(`Size: ${selectedSize}`);
      if (selectedColor) variantInfo.push(`Color: ${selectedColor}`);
      description += ` (${variantInfo.join(', ')})`;
    }
    
    return { url, title, description };
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getProductUrl());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleSocialShare = (platform: string) => {
    const { url, description } = getShareData();
    const encodedUrl = encodeURIComponent(url);
    const encodedDescription = encodeURIComponent(description);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedDescription}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedDescription}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedDescription}%20${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedDescription}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const selectedVariant = getSelectedVariant();
  // New pricing rule:
  // - If variants exist and have priceAdj, show variant's priceAdj (ignore product sale/cost)
  // - If no variant selected/match, fall back to the minimum variant priceAdj if available
  // - If no variants at all, show product.price (which represents Sale Price from loader)
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

  const discountPercentage = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Breadcrumb - with top padding for mobile to avoid header overlap */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pt-20 sm:pt-6">
        <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 overflow-x-auto whitespace-nowrap">
          <button onClick={() => navigate('/')} className="hover:text-amber-600 transition-colors flex-shrink-0">Home</button>
          <span className="flex-shrink-0">/</span>
          <button onClick={() => navigate('/products')} className="hover:text-amber-600 transition-colors flex-shrink-0">Products</button>
          {product.category && categorySlug && (
            <>
              <span className="flex-shrink-0">/</span>
              <button 
                onClick={() => navigate(`/category/${categorySlug}`)} 
                className="hover:text-amber-600 transition-colors flex-shrink-0"
              >
                {product.category}
              </button>
            </>
          )}
          <span className="flex-shrink-0">/</span>
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="w-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-3 sm:p-4 lg:p-8">
            {/* Images */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <div 
                className="relative group overflow-hidden rounded-xl cursor-pointer"
                onClick={openImageModal}
              >
                {/* Main Image with Click to Open */}
                <img
                  src={product.images[selectedImage] || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'}
                  srcSet={`${product.images[selectedImage] || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'} 1x, ${product.images[selectedImage] || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=85'} 2x`}
                  alt={product.name}
                  className="w-full h-64 sm:h-80 lg:h-[500px] object-cover transition-transform duration-500 ease-in-out hover:scale-110 cursor-pointer product-image hw-accelerate"
                  loading="lazy"
                  style={{
                    imageRendering: 'auto',
                    filter: 'contrast(1.03) saturate(1.02) brightness(1.01)',
                  }}
                  onLoad={() => {
                    // Preload other images in the background
                    product.images.forEach((img, index) => {
                      if (index !== selectedImage && index < 3) {
                        const preloadImg = new Image();
                        preloadImg.src = img;
                      }
                    });
                  }}
                />

                {/* Click to Zoom Indicator */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                  <div className="bg-white/90 backdrop-blur-sm text-gray-800 p-2 sm:p-3 rounded-full shadow-lg">
                    <Search size={20} className="sm:w-6 sm:h-6" />
                  </div>
                </div>

                {/* Sale Badge */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg z-10">
                    {discountPercentage}% OFF
                  </div>
                )}

                {/* Navigation Arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-2 sm:left-3 lg:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 lg:w-10 lg:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-80 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-lg z-20"
                    >
                      <ChevronLeft size={20} className="sm:w-6 sm:h-6 lg:w-6 lg:h-6 text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-2 sm:right-3 lg:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 lg:w-10 lg:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-80 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-lg z-20"
                    >
                      <ChevronRight size={20} className="sm:w-6 sm:h-6 lg:w-6 lg:h-6 text-gray-700" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Images - Show only non-swatch images */}
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                  {galleryImages.map((image, galleryIndex) => {
                    const originalIndex = galleryToOriginalIndex(galleryIndex);
                    return (
                      <button
                        key={galleryIndex}
                        onClick={() => setSelectedImage(originalIndex)}
                        className={`relative rounded-lg overflow-hidden transition-all duration-200 ${
                          selectedImage === originalIndex
                            ? 'ring-2 ring-amber-500 ring-offset-2'
                            : 'hover:opacity-80'
                        }`}
                      >
                        <img
                          src={image}
                          srcSet={`${image} 1x, ${image}?w=320&q=85 2x`}
                          alt={`${product.name} view ${galleryIndex + 1}`}
                          className="w-full h-16 sm:h-20 object-cover product-image hw-accelerate"
                          loading="lazy"
                          style={{
                            imageRendering: 'auto',
                            filter: 'contrast(1.02) saturate(1.01)',
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Free Shipping Notes */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 sm:p-4 rounded-lg border border-amber-100">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3 text-amber-800">
                    <Truck size={16} className="sm:w-[18px] sm:h-[18px] text-amber-600" />
                    <span className="text-xs sm:text-sm font-medium">Free shipping on all orders across India 🇮🇳</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-amber-800">
                    <RefreshCw size={16} className="sm:w-[18px] sm:h-[18px] text-amber-600" />
                    <span className="text-xs sm:text-sm font-medium">2-day easy returns</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-amber-800">
                    <Shield size={16} className="sm:w-[18px] sm:h-[18px] text-amber-600" />
                    <span className="text-xs sm:text-sm font-medium">100% authentic products</span>
                  </div>
                </div>
              </div>

              {/* Compact Reviews Display - Hide on mobile, show only on desktop */}
              {reviews.length > 0 && (
                <div className="hidden lg:block bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Customer Reviews</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="bg-white p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={12}
                                  className={star <= review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-medium text-gray-900">{review.userName}</span>
                          </div>
                          <span className="text-xs text-gray-500">{format(new Date(review.createdAt), 'MMM dd, yyyy')}</span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{review.comment}</p>
                      </div>
                    ))}
                    {reviews.length > 3 && (
                      <button 
                        onClick={() => {
                          if (!customer) {
                            setShowAuthModal(true);
                          } else {
                            setSelectedRating(5);
                            setIsReviewModalOpen(true);
                          }
                        }}
                        className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                      >
                        View all {reviews.length} reviews
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
              {/* Product Title and Rating */}
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-normal text-gray-900 mb-2 sm:mb-3">
                  {product.name}
                </h2>

                {/* Rating */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={`sm:w-4 sm:h-4 ${star <= Math.round((reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) : product.rating) || 0)
                            ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600">(
                      {(reviews.length > 0
                        ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length)
                        : product.rating
                      ).toFixed(1)}
                      ) • {reviews.length > 0 ? reviews.length : product.reviewCount} reviews</span>
                    
                    {/* Write A Review Button */}
                    <button
                      onClick={() => {
                        if (!customer) {
                          setShowAuthModal(true);
                        } else {
                          setSelectedRating(5);
                          setIsReviewModalOpen(true);
                        }
                      }}
                      className="ml-2 sm:ml-3 px-2 sm:px-3 py-1 text-xs sm:text-sm bg-sky-500 hover:bg-sky-600 text-white rounded transition-colors duration-200"
                    >
                      <span className="hidden sm:inline">Write A Review</span>
                      <span className="sm:hidden">Review</span>
                    </button>
                  </div>

                  {/* Wishlist and Share Icons */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Wishlist Button */}
                    <button
                      onClick={handleWishlistToggle}
                      className={`p-2 sm:p-3 lg:p-2 rounded-full border transition-all duration-200 retina-button hw-accelerate ${
                        isInWishlist(product.id)
                          ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
                          : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                      }`}
                      title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
                    >
                      <Heart
                        size={18}
                        className={`sm:w-5 sm:h-5 lucide ${isInWishlist(product.id) ? 'fill-current' : ''}`}
                        style={{ shapeRendering: 'geometricPrecision' }}
                      />
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={handleShareClick}
                      className="p-2 sm:p-3 lg:p-2 rounded-full border bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100 transition-all duration-200"
                      title="Share product"
                    >
                      <Share2 size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    ₹{adjustedPrice.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-base sm:text-lg lg:text-xl text-gray-500 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                      <span className="bg-gradient-to-r from-red-100 to-red-50 text-red-700 px-2 sm:px-3 py-1 rounded-full text-xs font-medium border border-red-200">
                        Save ₹{(product.originalPrice - product.price).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Size Selection - Only show if sizes are defined and not empty */}
              {sizes.length > 0 && sizes.some(size => size && size.trim() !== '') && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(size => {
                      const isAvailable = isSizeAvailable(product, size!, selectedColor);
                      return (
                        <button
                          key={size}
                          onClick={() => isAvailable && setSelectedSize(size!)}
                          disabled={!isAvailable}
                          className={`px-3 sm:px-4 py-2 sm:py-2 text-sm border rounded transition-colors ${
                            selectedSize === size
                              ? 'border-amber-500 bg-amber-50 text-amber-700'
                              : isAvailable
                                ? 'border-gray-300 hover:border-gray-400'
                                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color Selection with Swatches */}
              {colors.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Color</h3>
                    <span className="text-xs text-gray-500 italic">(Select Here)</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4 max-w-lg">
                    {colors.map(color => {
                      // Find the variant for this color to check for swatch image
                      const colorVariant = product.variants?.find(v => v.color === color);
                      // Only show swatch image if variant has actual swatch_image_id in database
                      const hasSwatchImage = !!(colorVariant?.swatchImageId && colorVariant?.swatchImage);
                      // Check if this color is available based on selected size
                      const isAvailable = isColorAvailable(product, color!, selectedSize);
                      
                      const handleSwatchClick = () => {
                        if (!isAvailable) return;
                        
                        setHasUserInteractedWithColor(true);
                        setSelectedColor(color!);
                        // If swatch has an image, try to find it in main product images
                        if (hasSwatchImage && colorVariant.swatchImage) {
                          // First try to find exact URL match
                          let swatchImageIndex = product.images.findIndex(img => img === colorVariant.swatchImage);
                          
                          // If not found, try to find by checking if the image URL contains the swatch image ID
                          if (swatchImageIndex === -1 && colorVariant.swatchImageId) {
                            swatchImageIndex = product.images.findIndex(img => 
                              img.includes(colorVariant.swatchImageId!) || 
                              img.includes(colorVariant.swatchImageId!.replace(/-/g, ''))
                            );
                          }
                          
                          // If we found the image in main gallery, switch to it
                          if (swatchImageIndex !== -1) {
                            setSelectedImage(swatchImageIndex);
                          }
                          // Note: If swatch image is not in main gallery, main image stays the same
                        }
                      };
                      
                      if (hasSwatchImage) {
                        // Show only swatch image without text for variants with swatch (80x80 for product detail)
                        return (
                          <button
                            key={color}
                            onClick={handleSwatchClick}
                            disabled={!isAvailable}
                            className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                              selectedColor === color
                                ? 'border-amber-500 ring-2 ring-amber-200'
                                : isAvailable
                                  ? 'border-gray-300 hover:border-amber-300'
                                  : 'border-gray-200 opacity-50 cursor-not-allowed'
                            }`}
                            title={`${color}${!isAvailable ? ' (Out of Stock)' : ''}`}
                          >
                            <img
                              src={colorVariant.swatchImage}
                              alt={`${color} swatch`}
                              className={`w-full h-full object-cover ${!isAvailable ? 'grayscale' : ''}`}
                            />
                            {selectedColor === color && (
                              <div className="absolute inset-0 bg-amber-500 bg-opacity-20 flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full shadow-md"></div>
                              </div>
                            )}
                            {!isAvailable && (
                              <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
                                <div className="w-6 h-0.5 bg-red-500 rotate-45"></div>
                                <div className="w-6 h-0.5 bg-red-500 -rotate-45 absolute"></div>
                              </div>
                            )}
                          </button>
                        );
                      } else {
                        // If no swatch image, try to use hex color if available for this color's variant
                        const hex = colorVariant?.colorHex;
        if (hex) {
                          return (
                            <button
                              key={color}
                              onClick={handleSwatchClick}
                              disabled={!isAvailable}
          className={`relative w-20 h-20 overflow-hidden border border-black ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={`${color}${!isAvailable ? ' (Out of Stock)' : ''}`}
                            >
                              <div className={`w-full h-full ${!isAvailable ? 'grayscale' : ''}`} style={{ backgroundColor: hex }} />
                              {!isAvailable && (
                                <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
                                  <div className="w-6 h-0.5 bg-red-500 rotate-45"></div>
                                  <div className="w-6 h-0.5 bg-red-500 -rotate-45 absolute"></div>
                                </div>
                              )}
                            </button>
                          );
                        }
                        // Fallback to text button
                        return (
                          <button
                            key={color}
                            onClick={handleSwatchClick}
                            disabled={!isAvailable}
                            className={`px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg transition-colors ${
                              selectedColor === color
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : isAvailable
                                  ? 'border-gray-300 hover:border-gray-400'
                                  : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            title={`${color}${!isAvailable ? ' (Out of Stock)' : ''}`}
                          >
                            {color}
                          </button>
                        );
                      }
                    })}
                  </div>
                </div>
              )}

              {/* Stock Status Display */}
              {!stockInfo.isAvailable ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm font-medium">Out of Stock</p>
                  <p className="text-red-600 text-xs mt-1">This item is currently unavailable</p>
                </div>
              ) : stockInfo.stockStatus === 'Low Stock' ? (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-orange-800 text-sm font-medium">Low Stock</p>
                  <p className="text-orange-600 text-xs mt-1">Only {stockInfo.quantity} left in stock</p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm font-medium">In Stock</p>
                  <p className="text-green-600 text-xs mt-1">{stockInfo.quantity} available</p>
                </div>
              )}

              {/* Quantity and Action Buttons - Responsive Layout */}
              <div className="space-y-4">
                {/* Desktop Layout - Quantity and Buttons Side by Side */}
                <div className="hidden md:flex items-center gap-4">
                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 whitespace-nowrap">Qty:</h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={!stockInfo.isAvailable}
                        className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-amber-50 hover:border-amber-300 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium text-sm">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                        disabled={!stockInfo.isAvailable || quantity >= maxQuantity}
                        className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-amber-50 hover:border-amber-300 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Desktop Action Buttons - Side by Side */}
                  <div className="flex gap-2 flex-1">
                    {/* Add to Cart Button */}
                    <button
                      onClick={handleAddToCart}
                      disabled={!canAddToCart || isAdding}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                    >
                      <ShoppingBag size={16} />
                      {!stockInfo.isAvailable ? 'Out of Stock' : isAdding ? 'Adding...' : 'Add to Cart'}
                    </button>

                    {/* Buy Now Button */}
                    <button
                      onClick={handleBuyNow}
                      disabled={!canAddToCart}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 text-sm"
                    >
                      {!stockInfo.isAvailable ? 'Out of Stock' : 'Buy Now'}
                    </button>
                  </div>
                </div>

                {/* Mobile Layout - Quantity First, Then Buttons Stacked */}
                <div className="md:hidden space-y-4">
                  {/* Quantity Section */}
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 whitespace-nowrap">Qty:</h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={!stockInfo.isAvailable}
                        className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-amber-50 hover:border-amber-300 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium text-sm">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                        disabled={!stockInfo.isAvailable || quantity >= maxQuantity}
                        className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-amber-50 hover:border-amber-300 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Mobile Action Buttons - Stacked Vertically */}
                  <div className="flex flex-col gap-3">
                    {/* Add to Cart Button */}
                    <button
                      onClick={handleAddToCart}
                      disabled={!canAddToCart || isAdding}
                      className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                    >
                      <ShoppingBag size={16} />
                      {!stockInfo.isAvailable ? 'Out of Stock' : isAdding ? 'Adding...' : 'Add to Cart'}
                    </button>

                    {/* Buy Now Button */}
                    <button
                      onClick={handleBuyNow}
                      disabled={!canAddToCart}
                      className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-3 rounded-lg font-medium transition-colors duration-200 text-sm"
                    >
                      {!stockInfo.isAvailable ? 'Out of Stock' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Description with Rich Text Support */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 sm:p-4 rounded-lg border border-amber-100">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <div 
                  className="quill-content text-sm"
                  dangerouslySetInnerHTML={{
                    __html: product.description || "Experience the perfect blend of traditional craftsmanship and contemporary design with this exquisite piece. Made from premium quality fabrics with intricate detailing that showcases the rich heritage of Indian ethnic wear."
                  }}
                />
              </div>

              {/* Mobile Reviews Section - Show only on mobile after description and only when reviews exist */}
              {reviews.length > 0 && (
                <div className="lg:hidden mt-4 sm:mt-6">
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Customer Reviews</h4>
                    <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
                      {reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="bg-white p-2 sm:p-3 rounded-lg border border-gray-100">
                          <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={10}
                                    className={`sm:w-3 sm:h-3 ${star <= review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs sm:text-sm font-medium text-gray-900">{review.userName}</span>
                            </div>
                            <span className="text-xs text-gray-500">{format(new Date(review.createdAt), 'MMM dd, yyyy')}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">{review.comment}</p>
                        </div>
                      ))}
                      {reviews.length > 3 && (
                        <button 
                          onClick={() => {
                            if (!customer) {
                              setShowAuthModal(true);
                            } else {
                              setSelectedRating(5);
                              setIsReviewModalOpen(true);
                            }
                          }}
                          className="text-xs sm:text-sm text-amber-600 hover:text-amber-700 font-medium"
                        >
                          View all {reviews.length} reviews
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          </div>

        </div>

        {/* You May Like Section */}
        {suggestions.length > 0 && (
          <div className="mt-2 md:mt-4">
            <div className="text-center mb-3 md:mb-6">
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-1 md:mb-2 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                You May Like
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-xl md:max-w-2xl mx-auto leading-relaxed px-4">
                More beautiful pieces selected for you
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {suggestions.map((suggestion: Product) => (
                <ProductCard key={suggestion.id} product={suggestion} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Image Modal */}
      {isImageModalOpen && (
        <div 
          className="fixed inset-0 bg-black/95 z-[10100] flex items-center justify-center p-2 sm:p-4 mobile-fullscreen"
          onClick={closeImageModal}
          style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeImageModal();
            }}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 z-[10101] w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-200 safe-top"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>

          {/* Image Navigation - Previous */}
          {product.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImageInModal();
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-[10101] w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-200"
            >
              <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Image Navigation - Next */}
          {product.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImageInModal();
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-[10101] w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-200"
            >
              <ChevronRight size={20} className="sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Full Size Image */}
          <div 
            className="relative max-w-full max-h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={product.images[selectedImage] || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'}
              alt={product.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-pointer"
              onClick={closeImageModal}
            />
          </div>

          {/* Image Counter */}
          {product.images.length > 1 && (
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm">
              {selectedImage + 1} / {product.images.length}
            </div>
          )}

          {/* Product Name Overlay */}
          <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black/50 backdrop-blur-sm text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm max-w-xs truncate">
            {product.name}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {isShareModalOpen && product && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleCloseShareModal}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Share Product</h3>
              <button
                onClick={handleCloseShareModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Product Info */}
            <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <img
                src={product.images[selectedImage] || product.images[0] || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 line-clamp-2 text-sm sm:text-base">{product.name}</h4>
                {(selectedSize || selectedColor) && (
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">
                    {selectedSize && <span>Size: {selectedSize}</span>}
                    {selectedSize && selectedColor && <span> • </span>}
                    {selectedColor && <span>Color: {selectedColor}</span>}
                  </div>
                )}
                <p className="text-amber-600 font-semibold text-sm sm:text-base">₹{adjustedPrice.toLocaleString()}</p>
              </div>
            </div>

            {/* Social Media Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
              <button
                onClick={() => handleSocialShare('whatsapp')}
                className="flex items-center justify-center p-2 sm:p-3 bg-[#25D366] hover:bg-[#1ebe57] text-white rounded-lg transition-colors"
                title="Share on WhatsApp"
              >
                <MessageCircle size={18} className="sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={() => handleSocialShare('facebook')}
                className="flex items-center justify-center p-2 sm:p-3 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-lg transition-colors"
                title="Share on Facebook"
              >
                <Facebook size={18} className="sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={() => handleSocialShare('twitter')}
                className="flex items-center justify-center p-2 sm:p-3 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
                title="Share on X (Twitter)"
              >
                <XIcon size={18} />
              </button>

              <button
                onClick={() => handleSocialShare('linkedin')}
                className="flex items-center justify-center p-2 sm:p-3 bg-[#0A66C2] hover:bg-[#0958a5] text-white rounded-lg transition-colors"
                title="Share on LinkedIn"
              >
                <Linkedin size={18} className="sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={() => handleSocialShare('telegram')}
                className="flex items-center justify-center p-2 sm:p-3 bg-[#0088CC] hover:bg-[#007bb8] text-white rounded-lg transition-colors"
                title="Share on Telegram"
              >
                <TelegramIcon size={18} />
              </button>
            </div>

            {/* Copy Link */}
            <div className="border-t pt-3 sm:pt-4">
              <button
                onClick={handleCopyLink}
                className={`w-full flex items-center justify-center gap-2 sm:gap-3 p-2 sm:p-3 border-2 rounded-lg transition-colors text-sm sm:text-base ${
                  copySuccess
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                {copySuccess ? (
                  <>
                    <Check size={16} className="sm:w-5 sm:h-5" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 size={16} className="sm:w-5 sm:h-5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

      {/* Customer Auth Modal */}
      {showAuthModal && (
        <CustomerAuthModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Write a Review</h3>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
              
              {/* Simple Review Form */}
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const comment = formData.get('comment') as string;
                addReview({ rating: selectedRating, comment });
                setIsReviewModalOpen(false);
              }} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 sm:mb-2">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRating(star)}
                        className="cursor-pointer focus:outline-none"
                      >
                        <Star 
                          size={20} 
                          className={`sm:w-6 sm:h-6 transition-colors ${
                            star <= selectedRating 
                              ? 'text-amber-400 fill-amber-400' 
                              : 'text-gray-300 hover:text-amber-400'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 sm:mb-2">Comment</label>
                  <textarea
                    name="comment"
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Share your experience with this product..."
                    required
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 sm:py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm sm:text-base"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetailPage;