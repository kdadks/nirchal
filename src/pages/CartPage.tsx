import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import CartAddOns from '../components/CartAddOns';
import SEO from '../components/SEO';
import { trackViewCart } from '../utils/analytics';

const CartPage: React.FC = () => {
  const { state: { items, total }, updateQuantity, removeFromCart } = useCart();
  
  // Track view cart event when cart has items
  useEffect(() => {
    if (items.length > 0) {
      trackViewCart(
        items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          item_category: item.category || 'Ethnic Wear',
          item_variant: item.size && item.color ? `${item.size}-${item.color}` : item.size || item.color,
          price: item.price,
          quantity: item.quantity,
        })),
        total
      );
    }
  }, []); // Only track on mount

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {/* SEO - noindex for cart page */}
        <SEO
          title="Shopping Cart"
          description="Your shopping cart"
          noindex={true}
          nofollow={true}
        />
        
        {/* Empty Cart Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Your Cart is Empty
              </h2>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                Looks like you haven't added any items to your cart yet. Explore our beautiful collection and find something you love.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
              >
                <ArrowLeft size={18} />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* SEO - noindex for cart page */}
      <SEO
        title="Shopping Cart"
        description="Review your shopping cart items"
        noindex={true}
        nofollow={true}
      />
      
      {/* Cart Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-3 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-900">
                  Cart Items ({items.length})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={`${item.id}-${item.variantId}`} className="p-3">
                    <div className="flex items-start space-x-3">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                          {item.name}
                        </h3>
                        {/* Only show size/color for non-service items */}
                        {item.size !== 'Service' && item.size !== 'Custom' && (
                          <div className="space-y-0.5 mb-2">
                            {item.size && (
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Size:</span> {item.size}
                              </p>
                            )}
                            {item.color && (
                              <p className="text-xs text-gray-600 line-clamp-1">
                                <span className="font-medium">Color:</span> {item.color}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center border border-gray-200 rounded">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.variantId)}
                              className="p-1 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={14} className="text-gray-600" />
                            </button>
                            <span className="px-2 py-1 font-medium text-sm text-gray-900 min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId)}
                              className="p-1 hover:bg-gray-50 transition-colors duration-200"
                            >
                              <Plus size={14} className="text-gray-600" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id, item.variantId)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-base font-bold text-gray-900 mb-0.5">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          ₹{item.price.toLocaleString()} each
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add-Ons Suggestions */}
            <div className="mt-4">
              <CartAddOns cartItems={items} />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-8">
              <div className="p-3 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-900">
                  Order Summary
                </h2>
              </div>
              
              <div className="p-3 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery</span>
                  <span className="text-green-600 font-semibold">Free 🇮🇳</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center pt-1">
                  Taxes calculated at checkout
                </p>
              </div>

              <div className="p-3 bg-gray-50 space-y-2">
                <Link
                  to="/checkout"
                  className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  to="/products"
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;