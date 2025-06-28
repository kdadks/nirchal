import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Share2, Truck, RefreshCw, Shield, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { usePublicProducts } from '../hooks/usePublicProducts';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading } = usePublicProducts();
  const { addItem } = useCart();
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const product = products.find(p => p.id === id);

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

  const sizes = product.sizes || [];
  const colors = [product.color];

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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-zinc-600 mb-8">
            <button onClick={() => navigate('/')} className="hover:text-zinc-900">Home</button>
            <span>/</span>
            <button onClick={() => navigate('/products')} className="hover:text-zinc-900">Products</button>
            <span>/</span>
            <span className="text-zinc-900">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative group">
                <img
                  src={product.images[selectedImage] || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                  alt={product.name}
                  className="w-full h-96 lg:h-[600px] object-cover rounded-2xl"
                />
                
                {/* Sale Badge */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="absolute top-6 left-6 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {discountPercentage}% OFF
                  </div>
                )}

                {/* Navigation Arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative rounded-xl overflow-hidden transition-all duration-200 ${
                        selectedImage === index
                          ? 'ring-2 ring-zinc-900 ring-offset-2'
                          : 'hover:opacity-80'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-3xl lg:text-4xl font-bold text-zinc-900 mb-4">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className="text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-zinc-600">(4.8) • 124 reviews</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-bold text-zinc-900">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-xl text-zinc-500 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                        Save ₹{(product.originalPrice - product.price).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-zinc max-w-none">
                <p className="text-zinc-600 leading-relaxed">
                  {product.description || "Experience the perfect blend of traditional craftsmanship and contemporary design with this exquisite piece. Made from premium quality fabrics with intricate detailing that showcases the rich heritage of Indian ethnic wear."}
                </p>
              </div>

              {/* Size Selection */}
              {sizes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-3">Size</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size!)}
                        className={`py-3 px-4 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedSize === size
                            ? 'border-zinc-900 bg-zinc-900 text-white'
                            : 'border-zinc-200 text-zinc-700 hover:border-zinc-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {colors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-3">Color</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color!)}
                        className={`py-3 px-4 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedColor === color
                            ? 'border-zinc-900 bg-zinc-900 text-white'
                            : 'border-zinc-200 text-zinc-700 hover:border-zinc-300'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-3">Quantity</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-zinc-200 rounded-lg flex items-center justify-center hover:bg-zinc-50 transition-colors duration-200"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-zinc-200 rounded-lg flex items-center justify-center hover:bg-zinc-50 transition-colors duration-200"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart || isAdding}
                  className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 ${
                    (!canAddToCart || isAdding)
                      ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800 transform hover:scale-[1.02]'
                  }`}
                >
                  <ShoppingBag size={20} />
                  {isAdding ? 'Adding to Cart...' : 'Add to Cart'}
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-zinc-200 rounded-xl font-medium hover:bg-zinc-50 transition-colors duration-200">
                    <Heart size={18} />
                    Wishlist
                  </button>
                  <button className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-zinc-200 rounded-xl font-medium hover:bg-zinc-50 transition-colors duration-200">
                    <Share2 size={18} />
                    Share
                  </button>
                </div>
              </div>

              {hasVariants && !canAddToCart && (
                <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  Please select {!selectedSize ? 'size' : 'color'} to continue
                </p>
              )}

              {/* Features */}
              <div className="border-t border-zinc-200 pt-6 space-y-4">
                <div className="flex items-center gap-3 text-zinc-600">
                  <Truck size={20} />
                  <span>Free shipping on orders above ₹2,999</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-600">
                  <RefreshCw size={20} />
                  <span>30-day easy returns</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-600">
                  <Shield size={20} />
                  <span>100% authentic products</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;