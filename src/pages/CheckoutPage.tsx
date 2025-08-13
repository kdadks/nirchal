/* global setTimeout, HTMLSelectElement */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: 'cod' | 'online' | 'upi';
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { state: { items, total }, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep] = useState(1);
  const [form, setForm] = useState<CheckoutForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod'
  });

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would typically:
      // 1. Validate the form
      // 2. Create an order in your database
      // 3. Process payment if online payment
      // 4. Send confirmation email
      
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearCart();
      navigate('/order-confirmation');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const shippingCost = total >= 2999 ? 0 : 99;
  const finalTotal = total + shippingCost;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero Banner Section */}
      <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Secure Checkout
            </h1>
            <p className="text-xl text-amber-100 max-w-2xl mx-auto">
              Complete your order securely with our trusted checkout process
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back to Cart Link */}
          <div className="mb-8">
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 font-medium transition-colors duration-200"
            >
              <ArrowLeft size={20} />
              Back to Cart
            </Link>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-8 py-6">
              <div className="flex items-center space-x-4">
                {[
                  { step: 1, label: 'Shipping' },
                  { step: 2, label: 'Payment' },
                  { step: 3, label: 'Review' }
                ].map((item, index) => (
                  <React.Fragment key={item.step}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                      currentStep >= item.step
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {item.step}
                    </div>
                    <span className={`text-sm font-medium ${
                      currentStep >= item.step ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {item.label}
                    </span>
                    {index < 2 && (
                      <div className={`w-12 h-0.5 ${
                        currentStep > item.step 
                          ? 'bg-gradient-to-r from-amber-600 to-orange-600' 
                          : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shipping Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Truck size={20} className="text-amber-600" />
                      Shipping Information
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={form.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={form.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        placeholder="Street address, apartment, suite, etc."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={form.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                        value={form.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={form.pincode}
                        onChange={handleInputChange}
                        required
                        pattern="[0-9]{6}"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        placeholder="123456"
                      />
                    </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <CreditCard size={20} className="text-amber-600" />
                      Payment Method
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-4">
                      {[
                        { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive your order', icon: '💵' },
                        { value: 'online', label: 'Credit/Debit Card', desc: 'Secure payment via card', icon: '💳' },
                        { value: 'upi', label: 'UPI Payment', desc: 'Pay using UPI apps', icon: '📱' }
                      ].map((method) => (
                        <label key={method.value} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          form.paymentMethod === method.value
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={form.paymentMethod === method.value}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500 focus:ring-2"
                        />
                        <div className="ml-4 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{method.icon}</span>
                            <span className="font-medium text-gray-900">{method.label}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${
                    isSubmitting
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-200 border-t-transparent rounded-full animate-spin" />
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Place Order - ₹{finalTotal.toLocaleString()}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 sticky top-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ShoppingBag size={24} className="text-amber-600" />
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.variantId}`} className="flex gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                          {item.name}
                        </h3>
                        <div className="flex gap-2 text-xs text-gray-600 mt-1">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                          <span className="font-semibold text-gray-900">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
                      {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-amber-600">₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Security Features */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-green-700 bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200">
                    <Shield size={16} />
                    <span className="font-medium">Secure 256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <Truck size={16} />
                    <span className="font-medium">Free shipping on orders above ₹2,999</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;