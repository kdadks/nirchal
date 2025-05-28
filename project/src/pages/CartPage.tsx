import React from 'react';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import CartItem from '../components/cart/CartItem';
import { useCart } from '../contexts/CartContext';

const CartPage: React.FC = () => {
  const { cart, totalItems, subtotal, clearCart } = useCart();
  
  // Calculate shipping cost (free for orders above ₹5000)
  const shippingCost = subtotal > 5000 ? 0 : 150;
  
  // Calculate total amount
  const totalAmount = subtotal + shippingCost;

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen pt-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={36} className="text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link 
            to="/" 
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-md font-medium hover:bg-primary-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-6">
          Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-grow">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {cart.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
              
              <div className="flex justify-between mt-6 pt-6 border-t border-gray-200">
                <button 
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  Clear Cart
                </button>
                
                <Link 
                  to="/" 
                  className="text-primary-600 hover:text-primary-700 transition-colors flex items-center"
                >
                  Continue Shopping
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-32">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
                </div>
                
                <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between font-medium text-gray-900">
                  <span>Total</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
              
              <button className="w-full bg-primary-600 text-white py-3 rounded-md font-medium hover:bg-primary-700 transition-colors">
                Proceed to Checkout
              </button>
              
              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>Free shipping on orders above ₹5,000</p>
                <p className="mt-1">Taxes calculated at checkout</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;