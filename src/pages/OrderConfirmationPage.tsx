import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const OrderConfirmationPage: React.FC = () => {
  const { state: { items } } = useCart();

  // Redirect if there are no items (meaning no order was just placed)
  if (items.length > 0) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            Thank You for Your Order!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Your order has been successfully placed and will be processed shortly.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Order Details
            </h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-600">Order Number</dt>
                <dd className="text-gray-900 font-medium">#ORD123456</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Status</dt>
                <dd className="text-green-600 font-medium">Confirmed</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Estimated Delivery</dt>
                <dd className="text-gray-900 font-medium">3-5 Business Days</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              We'll send you an email confirmation with order details and tracking information once your order ships.
            </p>
            <p className="text-gray-600">
              If you have any questions about your order, please contact our customer support.
            </p>
          </div>

          <div className="mt-8 space-x-4">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Continue Shopping
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
  );
};

export default OrderConfirmationPage;