import React, { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
const OrderConfirmationPage: React.FC = () => {
  const { orderNumber, email } = useMemo(() => {
    const on = sessionStorage.getItem('last_order_number') || '#ORD123456';
    const em = sessionStorage.getItem('last_order_email') || '';
    return { orderNumber: on, email: em };
  }, []);

  // Only redirect if we don't have order details (meaning user didn't come from checkout)
  if (!sessionStorage.getItem('last_order_number')) {
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
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Details</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-600">Order Number</dt>
              <dd className="text-gray-900 font-medium">{orderNumber}</dd>
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
          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded p-4 text-left">
            <p className="font-medium mb-1">Manage your order</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Use the Account page to view orders and saved addresses.</li>
              <li>{email ? `Sign in with ${email} to link this order to your account.` : 'Sign in with your email to link this order to your account.'}</li>
              <li>In production, an account is required to see order history.</li>
            </ul>
          </div>
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
            to="/account"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Go to Account
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