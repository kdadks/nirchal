import React, { useMemo, useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import ChangePasswordModal from '../components/auth/ChangePasswordModal';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import toast from 'react-hot-toast';
const OrderConfirmationPage: React.FC = () => {
  const { customer } = useCustomerAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [hasCheckedRedirect, setHasCheckedRedirect] = useState(false);
  
  const { orderNumber, email, tempPassword } = useMemo(() => {
    const on = sessionStorage.getItem('last_order_number') || '';
    const em = sessionStorage.getItem('last_order_email') || '';
    const tp = sessionStorage.getItem('new_customer_temp_password') || '';
    
    console.log('OrderConfirmationPage loaded:', {
      orderNumber: on,
      email: em,
      hasTempPassword: !!tp
    });
    
    return { orderNumber: on, email: em, tempPassword: tp };
  }, []);

  // Check if we should redirect (do this in useEffect to avoid render issues)
  useEffect(() => {
    if (!orderNumber) {
      console.log('OrderConfirmationPage: No order number found, redirecting to cart');
      setShouldRedirect(true);
    } else {
      console.log('OrderConfirmationPage: Order found, displaying confirmation');
      setShouldRedirect(false);
    }
    setHasCheckedRedirect(true);
  }, [orderNumber]);

  // Show password change notification for new customers - REMOVED AUTO-MODAL
  // Users will see notification on account page instead
  // useEffect(() => {
  //   console.log('OrderConfirmationPage - useEffect check:', { tempPassword: !!tempPassword, passwordChanged });
  //   if (tempPassword && !passwordChanged) {
  //     // Show notification after a brief delay
  //     const timer = setTimeout(() => {
  //       console.log('OrderConfirmationPage - showing password modal');
  //       setShowPasswordModal(true);
  //     }, 1000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [tempPassword, passwordChanged]);

  // Don't render anything until we've checked the redirect condition
  if (!hasCheckedRedirect) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading order confirmation...</p>
        </div>
      </div>
    );
  }

  // Render redirect if needed
  if (shouldRedirect) {
    return <Navigate to="/cart" replace />;
  }

  const handleGoToAccount = () => {
    if (tempPassword && !passwordChanged) {
      setShowPasswordModal(true);
    } else {
      // Navigate to account orders tab
      window.location.href = '/myaccount?tab=orders';
    }
  };

  const handlePasswordChanged = () => {
    setPasswordChanged(true);
    setShowPasswordModal(false);
    // Clear temp password notification
    sessionStorage.removeItem('new_customer_temp_password');
    toast.success('Password updated successfully! Your account is now secure.');
    // Navigate to account orders tab after password change
    setTimeout(() => {
      window.location.href = '/myaccount?tab=orders';
    }, 500);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
          Thank You for Your Order!
        </h1>
        
        {/* Temporary Password Security Warning */}
        {tempPassword && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Security Notice: Temporary Password Assigned
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    For security, we've created a temporary password for your account. While you can continue using it, 
                    <strong className="font-medium"> we strongly recommend changing it</strong> to protect your account and personal information.
                  </p>
                </div>
                <div className="mt-3">
                  <div className="flex">
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="bg-red-100 hover:bg-red-200 text-red-800 text-sm font-medium px-3 py-1 rounded-md transition-colors"
                    >
                      Change Password Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <p className="text-lg text-gray-600 mb-8">
          Your order has been successfully placed and will be processed shortly.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Details</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-600">Order Number</dt>
              <dd className="text-gray-900 font-medium">{orderNumber || '#ORD-LOADING'}</dd>
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
              {!customer && (
                <li>{email ? `Sign in with ${email} to link this order to your account.` : 'Sign in with your email to link this order to your account.'}</li>
              )}
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
          <button
            onClick={handleGoToAccount}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Go to Account
          </button>
          <Link
            to="/contact"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Contact Support
          </Link>
        </div>
        
        {/* Password Change Modal */}
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          email={email}
          tempPassword={tempPassword}
          onPasswordChanged={handlePasswordChanged}
        />
      </div>
    </div>
  );
};

export default OrderConfirmationPage;