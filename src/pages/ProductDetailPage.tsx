import React, { useState, useEffect } from 'react';
import ProductReviews from '../components/product/ProductReviews';
import { useProductReviews } from '../hooks/useProductReviews';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Share2, Truck, RefreshCw, Shield, Star, ChevronLeft, ChevronRight, X, Search } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { usePublicProducts } from '../hooks/usePublicProducts';

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, loading } = usePublicProducts();
  const { addItem } = useCart();
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const product = products.find(p => p.slug === slug);
  const { reviews, fetchReviews, addReview } = useProductReviews(product?.id || '');

  useEffect(() => {
    if (product?.id) fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

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
          price: product.price,
          image: product.images[0] || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          size: selectedSize,
          color: selectedColor || product.color
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
          price: product.price,
          image: product.images[0] || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          size: selectedSize,
          color: selectedColor || product.color
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
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImageInModal = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const sizes = product.sizes || [];
  const colors = product.colors && product.colors.length > 0 
    ? product.colors 
    : product.color ? [product.color] : [];

  const hasVariants = sizes.length > 0;
  const canAddToCart = !hasVariants || selectedSize;

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-lg z-20"
                    >
                      <ChevronLeft size={20} className="text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-lg z-20"
                    >
                      <ChevronRight size={20} className="text-gray-700" />
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
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Product Title and Rating */}
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  {product.name}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={star <= Math.round(product.rating) ? 'text-amber-400 fill-current' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({product.rating.toFixed(1)}) • {product.reviewCount} reviews</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{product.price.toLocaleString()}
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
                        // Show text button for variants without swatch
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
                    className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-amber-50 hover:border-amber-300 transition-colors duration-200"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-amber-50 hover:border-amber-300 transition-colors duration-200"
                  >
                    +
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

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleBuyNow}
                  disabled={!canAddToCart || isAdding}
                  className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg ${
                    (!canAddToCart || isAdding)
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transform hover:scale-[1.02] hover:shadow-xl'
                  }`}
                >
                  <ShoppingBag size={20} />
                  {isAdding ? 'Processing...' : 'Buy Now'}
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart || isAdding}
                  className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg ${
                    (!canAddToCart || isAdding)
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transform hover:scale-[1.02] hover:shadow-xl'
                  }`}
                >
                  <ShoppingBag size={20} />
                  {isAdding ? 'Adding to Cart...' : 'Add to Cart'}
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-amber-200 rounded-xl font-medium hover:bg-amber-50 hover:border-amber-300 transition-colors duration-200 text-amber-700">
                    <Heart size={18} />
                    Wishlist
                  </button>
                  <button className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-amber-200 rounded-xl font-medium hover:bg-amber-50 hover:border-amber-300 transition-colors duration-200 text-amber-700">
                    <Share2 size={18} />
                    Share
                  </button>
                </div>
              </div>

              {hasVariants && !canAddToCart && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 p-4 rounded-lg">
                  <p className="text-sm font-medium">
                    Please select {!selectedSize ? 'size' : 'color'} to continue
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Product Reviews Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8 p-8">
            <ProductReviews reviews={reviews} onAddReview={(form) => addReview(form, { id: 'anonymous', name: 'Anonymous' })} />
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
    </div>
  );
}

export default ProductDetailPage;