import React, { useEffect, useState } from 'react';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { Link, Navigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import ChangePasswordModal from '../components/auth/ChangePasswordModal';
import toast from 'react-hot-toast';

type OrderRow = {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
};

type AddressRow = {
  id: number;
  type: string;
  first_name: string;
  last_name: string;
  address_line_1: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
};

const AccountPage: React.FC = () => {
  const { customer } = useCustomerAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDismissConfirm, setShowDismissConfirm] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!customer?.email) { 
        setLoading(false); 
        return; 
      }

      try {
        // Filter orders and addresses by current customer ID
        const [{ data: ords }, { data: addrs }] = await Promise.all([
          supabase.from('orders')
            .select('id, order_number, status, total_amount, created_at')
            .eq('customer_id', customer.id)
            .order('created_at', { ascending: false }),
          supabase.from('customer_addresses')
            .select('id, type, first_name, last_name, address_line_1, city, state, postal_code, is_default')
            .eq('customer_id', customer.id)
            .order('is_default', { ascending: false })
        ]);
        
        setOrders(ords || []);
        setAddresses(addrs || []);
      } catch (error) {
        console.error('Error loading account data:', error);
      }
      setLoading(false);
    };
    load();
  }, [customer?.email, customer?.id]);

  if (!customer && import.meta.env.PROD) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-serif font-bold mb-6">My Account</h1>
      
      {!customer && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
          You're not signed in. In development you can still view demo data if available.
        </div>
      )}
      
      {customer && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded">
          Welcome back, {customer.first_name} {customer.last_name}! ({customer.email})
        </div>
      )}

      {/* Temporary Password Security Warning */}
      {customer && sessionStorage.getItem('new_customer_temp_password') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                🔒 Action Required: Change Your Temporary Password
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  You're currently using a temporary password created during checkout. 
                  <strong className="font-medium"> For your account security, please change it immediately.</strong>
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>Temporary passwords are less secure than your chosen password</li>
                  <li>Anyone with access to your email could potentially access your account</li>
                  <li>Your order history and personal information need better protection</li>
                </ul>
              </div>
              <div className="mt-4">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
                  >
                    Change Password Now
                  </button>
                  <button
                    onClick={() => setShowDismissConfirm(true)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm font-medium px-4 py-2 rounded-md transition-colors"
                  >
                    Dismiss (Not Recommended)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading your account...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No orders found</p>
                <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">Order #{order.order_number}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded">
                          {order.status}
                        </span>
                        <p className="font-medium mt-1">₹{order.total_amount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Saved Addresses</h2>
            {addresses.length === 0 ? (
              <p className="text-gray-500">No addresses saved</p>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{address.first_name} {address.last_name}</h4>
                        <p className="text-sm text-gray-600">{address.address_line_1}</p>
                        <p className="text-sm text-gray-600">{address.city}, {address.state} {address.postal_code}</p>
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded mt-1">
                          {address.type}
                        </span>
                      </div>
                      {address.is_default && (
                        <span className="text-xs text-primary-600 font-medium">Default</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Account Actions */}
            {customer && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium mb-3">Account Settings</h3>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  Change Password
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Change Password Modal */}
      {customer && (
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          email={customer.email}
          onPasswordChanged={() => {
            setShowPasswordModal(false);
            // Clear temp password notification
            sessionStorage.removeItem('new_customer_temp_password');
            toast.success('Password updated successfully! Your account is now secure.');
            // Refresh page to hide notification
            window.location.reload();
          }}
        />
      )}

      {/* Dismiss Confirmation Dialog */}
      {showDismissConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Are you sure?
            </h3>
            <p className="text-gray-600 mb-6">
              We strongly recommend changing your password for security. Your account may be at risk with the temporary password.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDismissConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  sessionStorage.removeItem('new_customer_temp_password');
                  setShowDismissConfirm(false);
                  toast('Password notification dismissed. Please change your password soon for security.', {
                    icon: '⚠️',
                    style: { background: '#FEF3C7', color: '#92400E' }
                  });
                  window.location.reload();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Dismiss Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;