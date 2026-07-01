import React, { useMemo, useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import ChangePasswordModal from '../components/auth/ChangePasswordModal';
import GoogleCustomerReviews from '../components/GoogleCustomerReviews';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { SecurityUtils } from '../utils/securityUtils';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

/** Returns a date string (YYYY-MM-DD) that is `businessDays` business days from today. */
function addBusinessDays(days: number): string {
  const date = new Date();
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) added++; // skip Sunday (0) and Saturday (6)
  }
  return date.toISOString().split('T')[0];
}

const OrderConfirmationPage: React.FC = () => {
  const { customer } = useCustomerAuth();
  const { getConvertedPrice, getCurrencySymbol } = useCurrency();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [hasCheckedRedirect, setHasCheckedRedirect] = useState(false);
  
  // Guest account creation states
  const [isCreatingGuestAccount, setIsCreatingGuestAccount] = useState(false);
  const [guestAccountCreated, setGuestAccountCreated] = useState(false);
  const [guestAccountPassword, setGuestAccountPassword] = useState('');
  const [guestAccountError, setGuestAccountError] = useState('');
  
  const { orderNumber, email, tempPassword, codAmount, paymentSplit, paymentStatus, deliveryCountry, estimatedDeliveryDate, guestCheckout, guestFirstName, guestLastName, guestEmail, guestPhone } = useMemo(() => {
    const on = sessionStorage.getItem('last_order_number') || '';
    const em = sessionStorage.getItem('last_order_email') || '';
    const tp = sessionStorage.getItem('new_customer_temp_password') || '';
    const cod = sessionStorage.getItem('cod_amount') || '0';
    const ps = sessionStorage.getItem('payment_split') === 'true';
    const status = sessionStorage.getItem('payment_status') || 'completed';
    const country = sessionStorage.getItem('delivery_country') || 'IN';
    
    // Guest checkout info
    const gc = sessionStorage.getItem('guest_checkout') === 'true';
    const gfn = sessionStorage.getItem('guest_first_name') || '';
    const gln = sessionStorage.getItem('guest_last_name') || '';
    const ge = sessionStorage.getItem('guest_email') || '';
    const gp = sessionStorage.getItem('guest_phone') || '';
    
    return { 
      orderNumber: on, 
      email: em, 
      tempPassword: tp ? SecurityUtils.decryptTempData(tp) : '',
      codAmount: parseFloat(cod),
      paymentSplit: ps,
      paymentStatus: status,
      deliveryCountry: country,
      estimatedDeliveryDate: addBusinessDays(5),
      guestCheckout: gc,
      guestFirstName: gfn,
      guestLastName: gln,
      guestEmail: ge,
      guestPhone: gp,
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

  const handleCreateGuestAccount = async () => {
    if (!guestEmail) {
      setGuestAccountError('Email is required');
      return;
    }

    setIsCreatingGuestAccount(true);
    setGuestAccountError('');

    try {
      // Import the function from utils
      const { upsertCustomerByEmail } = await import('../utils/orders');
      const { createClient } = await import('@supabase/supabase-js');

      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      // Note: Customer record already exists (created after payment)
      // This just ensures password setup and sends welcome email
      const customerRes = await upsertCustomerByEmail(supabase, {
        email: guestEmail.trim(),
        first_name: guestFirstName.trim() || 'Guest',
        last_name: guestLastName.trim() || 'User',
        phone: guestPhone.trim() || undefined,
      });

      if (!customerRes?.id) {
        throw new Error('Failed to verify account');
      }

      // Get the decrypted password if this is a new account
      const decryptedPassword = customerRes?.tempPassword 
        ? SecurityUtils.decryptTempData(customerRes.tempPassword) 
        : '';

      setGuestAccountPassword(decryptedPassword);
      setGuestAccountCreated(true);

      // Send welcome email with temporary password (if new)
      if (decryptedPassword) {
        const { transactionalEmailService } = await import('../services/transactionalEmailService');
        try {
          await transactionalEmailService.sendWelcomeEmail({
            first_name: guestFirstName,
            last_name: guestLastName,
            email: guestEmail,
            temp_password: decryptedPassword
          });
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
        }
      }

      toast.success('Account is ready! Check your email for login details.');
      
      // Fetch order to extract addresses if not already saved
      try {
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('order_number', orderNumber)
          .single();

        if (orderData) {
          // Check if addresses already exist
          const { data: existingAddresses } = await supabase
            .from('customer_addresses')
            .select('id')
            .eq('customer_id', customerRes.id)
            .limit(1);

          // Only save addresses if none exist yet
          if (!existingAddresses || existingAddresses.length === 0) {
            // Save delivery address from order
            if (orderData.shipping_address_line_1) {
              const deliveryAddressData = {
                customer_id: customerRes.id,
                first_name: orderData.shipping_first_name || guestFirstName,
                last_name: orderData.shipping_last_name || guestLastName,
                address_line_1: orderData.shipping_address_line_1,
                address_line_2: orderData.shipping_address_line_2,
                city: orderData.shipping_city,
                state: orderData.shipping_state,
                postal_code: orderData.shipping_postal_code,
                country: orderData.shipping_country || 'India',
                phone: orderData.shipping_phone || guestPhone,
                is_default: true,
                is_shipping: true,
                is_billing: orderData.billing_address_line_1 === orderData.shipping_address_line_1,
              };

              const { error: deliveryError } = await supabase
                .from('customer_addresses')
                .insert(deliveryAddressData);

              if (deliveryError) {
                console.warn('Failed to save delivery address:', deliveryError);
              }
            }

            // Save billing address if different from delivery
            if (
              orderData.billing_address_line_1 &&
              orderData.billing_address_line_1 !== orderData.shipping_address_line_1
            ) {
              const billingAddressData = {
                customer_id: customerRes.id,
                first_name: orderData.billing_first_name || guestFirstName,
                last_name: orderData.billing_last_name || guestLastName,
                address_line_1: orderData.billing_address_line_1,
                address_line_2: orderData.billing_address_line_2,
                city: orderData.billing_city,
                state: orderData.billing_state,
                postal_code: orderData.billing_postal_code,
                country: orderData.billing_country || 'India',
                phone: orderData.billing_phone || guestPhone,
                is_default: false,
                is_shipping: false,
                is_billing: true,
              };

              const { error: billingError } = await supabase
                .from('customer_addresses')
                .insert(billingAddressData);

              if (billingError) {
                console.warn('Failed to save billing address:', billingError);
              }
            }
          }
        }
      } catch (addressError) {
        console.warn('Error verifying/saving addresses:', addressError);
      }
      
      // Clear guest checkout info from sessionStorage after successful setup
      sessionStorage.removeItem('guest_checkout');
      sessionStorage.removeItem('guest_first_name');
      sessionStorage.removeItem('guest_last_name');
      sessionStorage.removeItem('guest_email');
      sessionStorage.removeItem('guest_phone');

    } catch (error: any) {
      console.error('Failed to complete account setup:', error);
      setGuestAccountError(error.message || 'Failed to complete account setup. Please try again or contact support.');
      toast.error('Failed to complete account setup. Please try again.');
    } finally {
      setIsCreatingGuestAccount(false);
    }
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
              
              {/* Guest Account Creation Section */}
              {guestCheckout && !guestAccountCreated && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-6 text-left">
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        🔐 Secure Your Account
                      </h3>
                      <p className="text-gray-700 mb-4">
                        Your order is linked to {guestEmail}. Set a password now to secure your account and access all your orders anytime.
                      </p>
                      
                      {guestAccountError && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                          <p className="text-sm text-red-700">{guestAccountError}</p>
                        </div>
                      )}
                      
                      <button
                        onClick={handleCreateGuestAccount}
                        disabled={isCreatingGuestAccount}
                        className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-medium px-6 py-2 rounded-md transition-colors flex items-center"
                      >
                        {isCreatingGuestAccount ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"></circle>
                              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"></path>
                            </svg>
                            Setting Up...
                          </>
                        ) : (
                          'Set Password Now'
                        )}
                      </button>
                      <p className="text-xs text-gray-600 mt-3">
                        You can skip this now and set your password anytime from your account dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Account Successfully Created */}
              {guestAccountCreated && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6 text-left">
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="ml-3 flex-1">
                      <h3 className="text-lg font-semibold text-green-900 mb-2">
                        ✅ Account Secured!
                      </h3>
                      <p className="text-green-800 mb-3">
                        Your account is now active. You can log in with your email and the credentials we've sent to <strong>{guestEmail}</strong>.
                      </p>
                      <div className="bg-white rounded p-3 border border-green-200 mb-4">
                        <p className="text-sm font-medium text-gray-800 mb-2">📧 Your Email:</p>
                        <p className="text-sm text-gray-600">{guestEmail}</p>
                        {guestAccountPassword && (
                          <>
                            <p className="text-sm font-medium text-gray-800 mt-2 mb-1">🔐 Temporary Password:</p>
                            <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">{guestAccountPassword}</p>
                            <p className="text-xs text-gray-600 mt-2">
                              ⚠️ This is your temporary password. Please change it after logging in for security.
                            </p>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => window.location.href = '/myaccount?tab=orders'}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-md transition-colors"
                      >
                        Go to My Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
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

    {/* Google Customer Reviews Survey Opt-In – only for completed/confirmed orders */}
    {paymentStatus !== 'pending' && (
      <GoogleCustomerReviews
        orderId={orderNumber}
        email={email}
        deliveryCountry={deliveryCountry}
        estimatedDeliveryDate={estimatedDeliveryDate}
      />
    )}
    </>
  );
};

export default OrderConfirmationPage;
