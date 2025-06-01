import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../hooks/useAdmin';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { addItem } = useCart();
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isAdding, setIsAdding] = useState(false);

  const product = products.find(p => p.id === (id ? parseInt(id, 10) : undefined));

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="animate-pulse">
              <div className="bg-gray-200 h-96 rounded-lg mb-4"></div>
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
                ))}
              </div>
            </div>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
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
      const selectedVariant = product.variants.find(
        v => v.size === selectedSize && v.color === selectedColor
      );

      addItem({
        id: product.id.toString(),
        name: product.name,
        price: product.sale_price || product.price,
        image: product.images[0]?.image_url || '/placeholder-product.jpg',
        variantId: selectedVariant?.id?.toString(),
        size: selectedSize,
        color: selectedColor
      });

      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const sizes = Array.from(new Set(product.variants.map(v => v.size))).filter(Boolean);
  const colors = Array.from(new Set(product.variants.map(v => v.color))).filter(Boolean);

  const hasVariants = sizes.length > 0 || colors.length > 0;
  const canAddToCart = !hasVariants || (selectedSize && selectedColor);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="mb-4">
              <img
                src={product.images[selectedImage]?.image_url || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`relative rounded-lg overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-primary-500' : ''
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            <div className="flex items-baseline space-x-4 mb-6">
              <span className="text-2xl font-medium text-gray-900">
                ₹{(product.sale_price || product.price).toLocaleString()}
              </span>
              {product.sale_price && (
                <span className="text-lg text-gray-500 line-through">
                  ₹{product.price.toLocaleString()}
                </span>
              )}
            </div>

            <div className="prose prose-lg mb-8">
              <p>{product.description}</p>
            </div>

            {sizes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Size</h3>
                <div className="grid grid-cols-4 gap-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size!)}
                      className={`border rounded-md py-2 text-sm font-medium
                        ${selectedSize === size
                          ? 'border-primary-500 text-primary-500'
                          : 'border-gray-300 text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Color</h3>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color!)}
                      className={`border rounded-md py-2 text-sm font-medium
                        ${selectedColor === color
                          ? 'border-primary-500 text-primary-500'
                          : 'border-gray-300 text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart || isAdding}
              className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                ${(!canAddToCart || isAdding) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </button>

            {hasVariants && !canAddToCart && (
              <p className="mt-2 text-sm text-red-600">
                Please select {!selectedSize ? 'size' : 'color'} to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;