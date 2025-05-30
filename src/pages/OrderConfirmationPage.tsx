import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OrderConfirmationPage: React.FC = () => {
  const { user } = useAuth();
  const orderNumber = Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-medium text-gray-900">Order Confirmed!</h2>
            <p className="mt-2 text-gray-600">
              Thank you for your order, {user?.name}. We'll send you shipping confirmation when your order ships.
            </p>
          </div>

          <div className="border-t border-b py-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Order Number</span>
              <span className="font-medium">{orderNumber}</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              We'll send you shipping confirmation and an order update when your order ships.
              You can check the status of your order at any time in your order history.
            </p>

            <div className="flex justify-center space-x-4">
              <Link
                to="/orders"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                View Order
              </Link>
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;