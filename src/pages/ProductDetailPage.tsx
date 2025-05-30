import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Check } from 'lucide-react';
import ProductTabs from '../components/product/ProductTabs';
import { useProducts } from '../hooks/useData';
import { useReviews } from '../hooks/useReviews';
import { useCart } from '../contexts/CartContext';
import type { ReviewFormData } from '../types';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const products = useProducts();
  const initialProduct = products.find(p => p.id === id);
  const { product, addReview } = useReviews(initialProduct || products[0]);
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState<string>(initialProduct?.images[0] || '');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset success message after 2 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Update selected image when product changes
  useEffect(() => {
    if (initialProduct) {
      setSelectedImage(initialProduct.images[0]);
    }
  }, [initialProduct]);

  if (!initialProduct) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <p>Product not found</p>
      </div>
    );
  }

  const handleAddReview = (formData: ReviewFormData) => {
    addReview(formData);
  };

  return (
    <>
      <Helmet>
        <title>{`${product.name} | Your Store Name`}</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Product Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative pb-[100%] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={selectedImage || product.images[0]}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover rounded-lg transition-opacity duration-300"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className={`relative pb-[100%] bg-gray-100 rounded cursor-pointer overflow-hidden ${
                    selectedImage === image ? 'ring-2 ring-primary-600' : ''
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover hover:opacity-80 transition-opacity duration-200"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-serif font-bold mb-2">{product.name}</h1>
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div>
              <div className="flex items-baseline space-x-4">
                <span className="text-2xl font-bold">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-gray-500 line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
                {product.discountPercentage && (
                  <span className="text-green-600">
                    {product.discountPercentage}% OFF
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex text-yellow-400">
                  {'★'.repeat(Math.floor(product.rating))}
                  <span className="text-gray-300">
                    {'★'.repeat(5 - Math.floor(product.rating))}
                  </span>
                </div>
                <span className="text-gray-600">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900">Color</h3>
                <p className="mt-1">{product.color}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900">Size</h3>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      className={`border rounded-md py-2 text-sm font-medium hover:border-gray-400 ${
                        selectedSize === size ? 'border-primary-600 bg-primary-50' : ''
                      }`}
                      onClick={() => {
                        setSelectedSize(size);
                        setError('');
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900">Fabric</h3>
                <p className="mt-1">{product.fabric}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900">Occasion</h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  {product.occasion?.map(occ => (
                    <span
                      key={occ}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100"
                    >
                      {occ}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Availability
                </h3>
                <p className={`mt-1 ${
                  product.stockStatus === 'In Stock'
                    ? 'text-green-600'
                    : product.stockStatus === 'Low Stock'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {product.stockStatus}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            {/* Add to Cart Button */}
            <button
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed relative"
              disabled={product.stockStatus === 'Out of Stock'}
              onClick={() => {
                if (!selectedSize) {
                  setError('Please select a size');
                  return;
                }
                addToCart(product, selectedSize, 1);
                setShowSuccess(true);
              }}
            >
              <span className="flex items-center justify-center">
                {showSuccess ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    {product.stockStatus === 'Out of Stock' ? 'Out of Stock' : 'Add to Cart'}
                  </>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Tabs Section */}
        <ProductTabs 
          product={product}
          onAddReview={handleAddReview}
        />
      </div>
    </>
  );
};

export default ProductDetailPage;