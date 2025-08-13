import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const CartPage: React.FC = () => {
  const { state: { items, total }, updateQuantity, removeFromCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {/* Hero Banner Section */}
        <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">
                Your Shopping Cart
              </h1>
              <p className="text-xl text-amber-100 max-w-2xl mx-auto">
                Ready to complete your purchase? Your cart is waiting for you.
              </p>
            </div>
          </div>
        </div>

        {/* Empty Cart Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Cart is Empty
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Looks like you haven't added any items to your cart yet. Explore our beautiful collection and find something you love.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
              >
                <ArrowLeft size={20} />
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
      {/* Hero Banner Section */}
      <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Your Shopping Cart
            </h1>
            <p className="text-xl text-amber-100 max-w-2xl mx-auto">
              Review your selected items and proceed to checkout when you're ready.
            </p>
          </div>
        </div>
      </div>

      {/* Cart Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Cart Items ({items.length})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={`${item.id}-${item.variantId}`} className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.name}
                        </h3>
                        <div className="space-y-1 mb-4">
                          {item.size && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Size:</span> {item.size}
                            </p>
                          )}
                          {item.color && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Color:</span> {item.color}
                            </p>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center border border-gray-200 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.variantId)}
                              className="p-2 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={16} className="text-gray-600" />
                            </button>
                            <span className="px-4 py-2 font-medium text-gray-900 min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId)}
                              className="p-2 hover:bg-gray-50 transition-colors duration-200"
                            >
                              <Plus size={16} className="text-gray-600" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id, item.variantId)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900 mb-1">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          ₹{item.price.toLocaleString()} each
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Order Summary
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-base text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Taxes calculated at checkout
                </p>
              </div>

              <div className="p-6 bg-gray-50 space-y-3">
                <Link
                  to="/checkout"
                  className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  to="/products"
                  className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  <ArrowLeft size={18} className="mr-2" />
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