import React, { useState, useEffect } from 'react';
import { useProductReviews } from '../hooks/useProductReviews';
import { useParams, useNavigate } from 'react-router-dom';
import { Truck, RefreshCw, Shield, Star, ChevronLeft, ChevronRight, X, Search, Facebook, Linkedin, MessageCircle, Link2, Check, ShoppingBag, Heart, Share2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { usePublicProducts } from '../hooks/usePublicProducts';
import { useWishlist } from '../contexts/WishlistContext';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import CustomerAuthModal from '../components/auth/CustomerAuthModal';
import { format } from 'date-fns';

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

  const product = products.find(p => p.slug === slug);
  const { reviews, fetchReviews, addReview } = useProductReviews(product?.id || '');

  useEffect(() => {
    if (product?.id) fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  // Default selections when product is loaded
  useEffect(() => {
    if (!product) return;
    // Preselect first available size (including 'Free Size') and color if available
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]!);
    }
    if (!selectedColor && product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]!);
    }
  }, [product, selectedSize, selectedColor]);

  // When color changes (including default), switch main image to that color's swatch if present
  useEffect(() => {
    if (!product || !selectedColor) return;
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
  }, [product, selectedColor]);

  // Handle keyboard events for image modal
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

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isImageModalOpen, product?.images?.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="animate-pulse">
                <div className="bg-zinc-200 h-96 lg:h-[600px] rounded-2xl mb-4"></div>
                <div className="grid grid-cols-4 gap-4">
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
          size: selectedSize,
          color: selectedColor || product.color,
          variantId: selectedVariant?.id
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
          size: selectedSize,
          color: selectedColor || product.color,
          variantId: selectedVariant?.id
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

  const sizes = product.sizes || [];
  const colors = product.colors && product.colors.length > 0 
    ? product.colors 
    : product.color ? [product.color] : [];

  const hasVariants = sizes.length > 0;
  const canAddToCart = !hasVariants || selectedSize;

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
    const normalizedSize = selectedSize && selectedSize.toLowerCase() === 'free size' ? undefined : selectedSize;
    return product.variants.find(v => {
      const colorMatch = selectedColor ? v.color === selectedColor : true;
      const sizeMatch = normalizedSize ? v.size === normalizedSize : true;
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
      {/* Hero Banner Section */}
      <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Premium Quality Products
            </h1>
            <p className="text-xl text-amber-100 max-w-2xl mx-auto">
              Discover our curated collection of authentic, high-quality products crafted with traditional excellence and modern style.
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <button onClick={() => navigate('/')} className="hover:text-amber-600 transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => navigate('/products')} className="hover:text-amber-600 transition-colors">Products</button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* Main Content */}
          <div className="w-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 p-4 lg:p-8">
            {/* Images */}
            <div className="space-y-6">
              <div 
                className="relative group overflow-hidden rounded-xl cursor-pointer"
                onClick={openImageModal}
              >
                {/* Main Image with Click to Open */}
                <img
                  src={product.images[selectedImage] || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'}
                  alt={product.name}
                  className="w-full h-96 lg:h-[500px] object-cover transition-transform duration-500 ease-in-out hover:scale-110 cursor-pointer"
                />

                {/* Click to Zoom Indicator */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                  <div className="bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full shadow-lg">
                    <Search size={24} />
                  </div>
                </div>

                {/* Sale Badge */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg z-10">
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
                      className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 w-12 h-12 lg:w-10 lg:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-80 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-lg z-20"
                    >
                      <ChevronLeft size={24} className="text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 w-12 h-12 lg:w-10 lg:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-80 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-lg z-20"
                    >
                      <ChevronRight size={24} className="text-gray-700" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative rounded-lg overflow-hidden transition-all duration-200 ${
                        selectedImage === index
                          ? 'ring-2 ring-amber-500 ring-offset-2'
                          : 'hover:opacity-80'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Free Shipping Notes */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-100">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-amber-800">
                    <Truck size={18} className="text-amber-600" />
                    <span className="text-sm font-medium">Free shipping on orders above ₹2,999</span>
                  </div>
                  <div className="flex items-center gap-3 text-amber-800">
                    <RefreshCw size={18} className="text-amber-600" />
                    <span className="text-sm font-medium">30-day easy returns</span>
                  </div>
                  <div className="flex items-center gap-3 text-amber-800">
                    <Shield size={18} className="text-amber-600" />
                    <span className="text-sm font-medium">100% authentic products</span>
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
            <div className="space-y-6">
              {/* Product Title and Rating */}
              <div>
                <h2 className="text-2xl lg:text-3xl font-normal text-gray-900 mb-3">
                  {product.name}
                </h2>

                {/* Rating */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={star <= Math.round((reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) : product.rating) || 0)
                            ? 'text-amber-400 fill-current' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">(
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
                      className="ml-3 px-2 py-1 text-xs bg-sky-500 hover:bg-sky-600 text-white rounded transition-colors duration-200"
                    >
                      Write A Review
                    </button>
                  </div>

                  {/* Wishlist and Share Icons */}
                  <div className="flex items-center gap-3">
                    {/* Wishlist Button */}
                    <button
                      onClick={handleWishlistToggle}
                      className={`p-3 lg:p-2 rounded-full border transition-all duration-200 ${
                        isInWishlist(product.id)
                          ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
                          : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                      }`}
                      title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart
                        size={20}
                        className={isInWishlist(product.id) ? 'fill-current' : ''}
                      />
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={handleShareClick}
                      className="p-3 lg:p-2 rounded-full border bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100 transition-all duration-200"
                      title="Share product"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{adjustedPrice.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                      <span className="bg-gradient-to-r from-red-100 to-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium border border-red-200">
                        Save ₹{(product.originalPrice - product.price).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Size Selection */}
              {sizes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size!)}
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
              )}

              {/* Color Selection with Swatches */}
              {colors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Color</h3>
                  <div className="grid grid-cols-5 gap-3 max-w-md">
                    {colors.map(color => {
                      // Find the variant for this color to check for swatch image
                      const colorVariant = product.variants?.find(v => v.color === color);
                      // Only show swatch image if variant has actual swatch_image_id in database
                      const hasSwatchImage = !!(colorVariant?.swatchImageId && colorVariant?.swatchImage);
                      
                      const handleSwatchClick = () => {
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
                            className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                              selectedColor === color
                                ? 'border-amber-500 ring-2 ring-amber-200'
                                : 'border-gray-300 hover:border-amber-300'
                            }`}
                            title={color}
                          >
                            <img
                              src={colorVariant.swatchImage}
                              alt={`${color} swatch`}
                              className="w-full h-full object-cover"
                            />
                            {selectedColor === color && (
                              <div className="absolute inset-0 bg-amber-500 bg-opacity-20 flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full shadow-md"></div>
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
          className={`relative w-20 h-20 overflow-hidden border border-black`}
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
                            className={`px-4 py-2 text-sm border rounded-lg transition-colors ${
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

              {/* Quantity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 lg:w-10 lg:h-10 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-amber-50 hover:border-amber-300 transition-colors duration-200 text-lg lg:text-base"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium text-lg lg:text-base">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 lg:w-10 lg:h-10 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-amber-50 hover:border-amber-300 transition-colors duration-200 text-lg lg:text-base"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!canAddToCart || isAdding}
                    className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-4 lg:py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={20} />
                    {isAdding ? 'Adding...' : 'Add to Cart'}
                  </button>

                  {/* Buy Now Button */}
                  <button
                    onClick={handleBuyNow}
                    disabled={!canAddToCart}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-4 lg:py-3 rounded-xl font-medium transition-colors duration-200"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Description with Rich Text Support */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <div 
                  className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: product.description || "Experience the perfect blend of traditional craftsmanship and contemporary design with this exquisite piece. Made from premium quality fabrics with intricate detailing that showcases the rich heritage of Indian ethnic wear."
                  }}
                />
              </div>

              {/* Mobile Reviews Section - Show only on mobile after description and only when reviews exist */}
              {reviews.length > 0 && (
                <div className="lg:hidden mt-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
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
                </div>
              )}
            </div>
          </div>

          </div>

        </div>
      </div>

      {/* Full Screen Image Modal */}
      {isImageModalOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeImageModal();
            }}
            className="absolute top-4 right-4 z-60 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-200"
          >
            <X size={24} />
          </button>

          {/* Image Navigation - Previous */}
          {product.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImageInModal();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-60 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-200"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Image Navigation - Next */}
          {product.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImageInModal();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-60 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-200"
            >
              <ChevronRight size={24} />
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
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              {selectedImage + 1} / {product.images.length}
            </div>
          )}

          {/* Product Name Overlay */}
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm max-w-xs truncate">
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
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Share Product</h3>
              <button
                onClick={handleCloseShareModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Product Info */}
            <div className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <img
                src={product.images[selectedImage] || product.images[0] || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 line-clamp-2">{product.name}</h4>
                {(selectedSize || selectedColor) && (
                  <div className="text-sm text-gray-600 mb-1">
                    {selectedSize && <span>Size: {selectedSize}</span>}
                    {selectedSize && selectedColor && <span> • </span>}
                    {selectedColor && <span>Color: {selectedColor}</span>}
                  </div>
                )}
                <p className="text-amber-600 font-semibold">₹{adjustedPrice.toLocaleString()}</p>
              </div>
            </div>

            {/* Social Media Buttons */}
            <div className="grid grid-cols-5 gap-3 mb-6">
              <button
                onClick={() => handleSocialShare('whatsapp')}
                className="flex items-center justify-center p-3 bg-[#25D366] hover:bg-[#1ebe57] text-white rounded-lg transition-colors"
                title="Share on WhatsApp"
              >
                <MessageCircle size={20} />
              </button>

              <button
                onClick={() => handleSocialShare('facebook')}
                className="flex items-center justify-center p-3 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-lg transition-colors"
                title="Share on Facebook"
              >
                <Facebook size={20} />
              </button>

              <button
                onClick={() => handleSocialShare('twitter')}
                className="flex items-center justify-center p-3 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
                title="Share on X (Twitter)"
              >
                <XIcon size={20} />
              </button>

              <button
                onClick={() => handleSocialShare('linkedin')}
                className="flex items-center justify-center p-3 bg-[#0A66C2] hover:bg-[#0958a5] text-white rounded-lg transition-colors"
                title="Share on LinkedIn"
              >
                <Linkedin size={20} />
              </button>

              <button
                onClick={() => handleSocialShare('telegram')}
                className="flex items-center justify-center p-3 bg-[#0088CC] hover:bg-[#007bb8] text-white rounded-lg transition-colors"
                title="Share on Telegram"
              >
                <TelegramIcon size={20} />
              </button>
            </div>

            {/* Copy Link */}
            <div className="border-t pt-4">
              <button
                onClick={handleCopyLink}
                className={`w-full flex items-center justify-center gap-3 p-3 border-2 rounded-lg transition-colors ${
                  copySuccess
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                {copySuccess ? (
                  <>
                    <Check size={20} />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 size={20} />
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
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Write a Review</h3>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Simple Review Form */}
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const comment = formData.get('comment') as string;
                addReview({ rating: selectedRating, comment });
                setIsReviewModalOpen(false);
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRating(star)}
                        className="cursor-pointer focus:outline-none"
                      >
                        <Star 
                          size={24} 
                          className={`transition-colors ${
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
                  <label className="block text-sm font-medium mb-2">Comment</label>
                  <textarea
                    name="comment"
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Share your experience with this product..."
                    required
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
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