import React, { useMemo, useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import ChangePasswordModal from '../components/auth/ChangePasswordModal';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { SecurityUtils } from '../utils/securityUtils';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

const OrderConfirmationPage: React.FC = () => {
  const { customer } = useCustomerAuth();
  const { getConvertedPrice, getCurrencySymbol } = useCurrency();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [hasCheckedRedirect, setHasCheckedRedirect] = useState(false);
  
  const { orderNumber, email, tempPassword, codAmount, paymentSplit, paymentStatus } = useMemo(() => {
    const on = sessionStorage.getItem('last_order_number') || '';
    const em = sessionStorage.getItem('last_order_email') || '';
    const tp = sessionStorage.getItem('new_customer_temp_password') || '';
    const cod = sessionStorage.getItem('cod_amount') || '0';
    const ps = sessionStorage.getItem('payment_split') === 'true';
    const status = sessionStorage.getItem('payment_status') || 'completed';
    
    return { 
      orderNumber: on, 
      email: em, 
      tempPassword: tp ? SecurityUtils.decryptTempData(tp) : '',
      codAmount: parseFloat(cod),
      paymentSplit: ps,
      paymentStatus: status
    };
  }, []);

  // Check if we should redirect (do this in useEffect to avoid render issues)
  useEffect(() => {
    if (!orderNumber) {
      setShouldRedirect(true);
    } else {
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
    <>
      <SEO 
        title="Order Confirmation - Nirchal"
        description="Thank you for your order"
        noindex={true}
        nofollow={true}
      />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${
          paymentStatus === 'pending' ? 'bg-orange-100' : 'bg-green-100'
        }`}>
          {paymentStatus === 'pending' ? (
            <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <CheckCircle className="w-8 h-8 text-green-600" />
          )}
        </div>

        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
          {paymentStatus === 'pending' ? 'Order Created - Payment Pending' : 'Thank You for Your Order!'}
        </h1>
        
        {/* Payment Pending Warning */}
        {paymentStatus === 'pending' && (
          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6 mb-6 text-left">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-semibold text-orange-900 mb-2">
                  ⚠️ Payment Not Completed
                </h3>
                <p className="text-orange-800 mb-4">
                  Your order <strong>#{orderNumber}</strong> has been created successfully, but the payment was not completed. 
                  {' '}Your order will remain in <strong>"Pending Payment"</strong> status until payment is received.
                </p>
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">📌 What happens next?</p>
                  <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                    <li>Your order is saved and reserved for you</li>
                    <li>Go to <strong>My Account → Orders</strong> to view order details</li>
                    <li>Click on the order to see full details and <strong className="text-orange-700">retry payment</strong></li>
                    <li>Complete payment within 24 hours to avoid order cancellation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
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
          {paymentStatus === 'pending' 
            ? 'Please complete payment from your account to confirm your order.'
            : 'Your order has been successfully placed and will be processed shortly.'
          }
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Details</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-600">Order Number</dt>
              <dd className="text-gray-900 font-medium">{orderNumber || '#ORD-LOADING'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Payment Status</dt>
              <dd className={`font-medium ${
                paymentStatus === 'pending' ? 'text-orange-600' : 'text-green-600'
              }`}>
                {paymentStatus === 'pending' ? (
                  <span className="inline-flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Payment Pending
                  </span>
                ) : (
                  'Payment Confirmed'
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Order Status</dt>
              <dd className={`font-medium ${
                paymentStatus === 'pending' ? 'text-orange-600' : 'text-green-600'
              }`}>
                {paymentStatus === 'pending' ? 'Awaiting Payment' : 'Confirmed'}
              </dd>
            </div>
            {paymentStatus !== 'pending' && (
              <div className="flex justify-between">
                <dt className="text-gray-600">Estimated Delivery</dt>
                <dd className="text-gray-900 font-medium">3-5 Business Days</dd>
              </div>
            )}
          </dl>
        </div>

        {/* COD Payment Reminder - Only show if split payment was used */}
        {paymentSplit && codAmount > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6 mb-8 text-left shadow-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  💚 Payment Reminder
                </h3>
                <p className="text-gray-700 mb-4">
                  You've chosen our <strong>Split Payment</strong> option! Products have been paid online, 
                  and services will be collected on delivery.
                </p>
                
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">✅ Paid Online (Products)</span>
                    <span className="text-amber-600 font-bold text-lg">
                      {getCurrencySymbol()}{getConvertedPrice((sessionStorage.getItem('online_paid_amount') || '0') as any).toLocaleString(undefined)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-semibold">💵 Pay on Delivery (Services)</span>
                    <span className="text-green-600 font-bold text-xl">
                      {getCurrencySymbol()}{getConvertedPrice(codAmount).toLocaleString(undefined)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 bg-green-100 border border-green-300 rounded-lg p-3">
                  <p className="text-sm text-green-800 font-medium">
                    📦 <strong>Please keep {getCurrencySymbol()}{getConvertedPrice(codAmount).toLocaleString(undefined)} ready</strong> for payment when your order arrives. 
                    Our delivery partner will collect this amount for the services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {paymentStatus === 'pending' ? (
            <div className="bg-blue-50 border-2 border-blue-300 text-blue-900 rounded-lg p-5 text-left">
              <p className="font-semibold mb-3 text-lg">💡 How to Complete Payment:</p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to <strong>My Account</strong> page (click button below)</li>
                <li>Navigate to the <strong>"Orders"</strong> tab</li>
                <li>Find order <strong>#{orderNumber}</strong> and click to view details</li>
                <li>Click the <strong>"Retry Payment"</strong> button in the order details</li>
                <li>Complete payment to confirm your order</li>
              </ol>
              <p className="mt-4 text-xs text-blue-800 bg-blue-100 p-3 rounded">
                ⏰ <strong>Note:</strong> Orders with pending payment will be automatically cancelled after 24 hours. 
                Please complete payment soon to secure your order.
              </p>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        <div className="mt-8 space-x-4">
          {paymentStatus === 'pending' ? (
            <>
              <button
                onClick={handleGoToAccount}
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 shadow-lg"
              >
                Go to My Account & Complete Payment
              </button>
              <Link
                to="/contact"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Contact Support
              </Link>
            </>
          ) : (
            <>
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
            </>
          )}
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
    </>
  );
};

export default OrderConfirmationPage;
