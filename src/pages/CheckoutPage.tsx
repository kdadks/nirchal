/* global setTimeout, HTMLSelectElement */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-zinc-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              to="/cart"
              className="p-2 hover:bg-white rounded-lg transition-colors duration-200"
            >
              <ArrowLeft size={20} className="text-zinc-600" />
            </Link>
            <div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-zinc-900">
                Checkout
              </h1>
              <p className="text-zinc-600 mt-1">
                Complete your order in just a few steps
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[
                { step: 1, label: 'Shipping' },
                { step: 2, label: 'Payment' },
                { step: 3, label: 'Review' }
              ].map((item, index) => (
                <React.Fragment key={item.step}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                    currentStep >= item.step
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-200 text-zinc-600'
                  }`}>
                    {item.step}
                  </div>
                  <span className={`text-sm font-medium ${
                    currentStep >= item.step ? 'text-zinc-900' : 'text-zinc-500'
                  }`}>
                    {item.label}
                  </span>
                  {index < 2 && (
                    <div className={`w-12 h-0.5 ${
                      currentStep > item.step ? 'bg-zinc-900' : 'bg-zinc-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Shipping Information */}
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                  <h2 className="text-xl font-semibold text-zinc-900 mb-6 flex items-center gap-2">
                    <Truck size={20} />
                    Shipping Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all duration-200"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all duration-200"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all duration-200"
                      placeholder="Street address, apartment, suite, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all duration-200"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={form.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all duration-200"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={form.pincode}
                        onChange={handleInputChange}
                        required
                        pattern="[0-9]{6}"
                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all duration-200"
                        placeholder="123456"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                  <h2 className="text-xl font-semibold text-zinc-900 mb-6 flex items-center gap-2">
                    <CreditCard size={20} />
                    Payment Method
                  </h2>
                  
                  <div className="space-y-4">
                    {[
                      { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive your order', icon: '💵' },
                      { value: 'online', label: 'Credit/Debit Card', desc: 'Secure payment via card', icon: '💳' },
                      { value: 'upi', label: 'UPI Payment', desc: 'Pay using UPI apps', icon: '📱' }
                    ].map((method) => (
                      <label key={method.value} className="flex items-center p-4 border-2 border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors duration-200">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={form.paymentMethod === method.value}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-zinc-900 border-zinc-300 focus:ring-zinc-900 focus:ring-2"
                        />
                        <div className="ml-4 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{method.icon}</span>
                            <span className="font-medium text-zinc-900">{method.label}</span>
                          </div>
                          <p className="text-sm text-zinc-600 mt-1">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 ${
                    isSubmitting
                      ? 'bg-zinc-400 text-zinc-200 cursor-not-allowed'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800 transform hover:scale-[1.02]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-zinc-200 border-t-transparent rounded-full animate-spin" />
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
              <div className="bg-white rounded-2xl p-6 shadow-soft sticky top-8">
                <h2 className="text-xl font-semibold text-zinc-900 mb-6">
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.variantId}`} className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-zinc-900 text-sm leading-tight">
                          {item.name}
                        </h3>
                        <div className="flex gap-2 text-xs text-zinc-600 mt-1">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-zinc-600">Qty: {item.quantity}</span>
                          <span className="font-medium text-zinc-900">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-200 pt-4 space-y-3">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
                      {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-zinc-900 pt-3 border-t border-zinc-200">
                    <span>Total</span>
                    <span>₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Security Features */}
                <div className="mt-6 pt-6 border-t border-zinc-200 space-y-3 text-sm text-zinc-600">
                  <div className="flex items-center gap-3">
                    <Shield size={16} />
                    <span>Secure 256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck size={16} />
                    <span>Free shipping on orders above ₹2,999</span>
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