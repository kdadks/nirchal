import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, MapPin, Calendar, Package, User, AlertCircle } from 'lucide-react';
import { supabase } from '../../config/supabase';
import toast from 'react-hot-toast';

interface CustomerAddress {
  id: number;
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  is_shipping: boolean;
  is_billing: boolean;
  created_at: string;
  updated_at: string;
}

interface CustomerOrder {
  id: string | number;
  order_number: string;
  total_amount: number;
  payment_status: string;
  status: string;
  created_at: string;
}

interface CustomerDetails {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  password_change_required?: boolean;
  email_verified?: boolean;
  welcome_email_sent?: boolean;
}

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
}

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({ isOpen, onClose, customerId }) => {
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (isOpen && customerId) {
      fetchCustomerDetails();
    }
  }, [isOpen, customerId]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch customer details
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          date_of_birth,
          gender,
          is_active,
          created_at,
          updated_at,
          password_change_required,
          email_verified,
          welcome_email_sent
        `)
        .eq('id', customerId)
        .single();

      if (customerError) throw customerError;
      setCustomer(customerData as unknown as CustomerDetails);

      // Fetch customer addresses
      const { data: addressesData, error: addressesError } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', customerId)
        .order('is_default', { ascending: false });

      if (!addressesError) {
        setAddresses((addressesData as unknown as CustomerAddress[]) || []);
      }

      // Fetch customer orders (last 10)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          payment_status,
          status,
          created_at
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!ordersError) {
        setOrders((ordersData as unknown as CustomerOrder[]) || []);
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load customer details');
      toast.error('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const verifyCustomerEmail = async () => {
    if (!customer) return;

    try {
      setVerifying(true);

      // Generate a verification token (shorter base64 string to fit in 255 char limit)
      // Use a simpler random string that won't exceed 255 chars
      const randomPart1 = Math.random().toString(36).substring(2, 12);
      const randomPart2 = Math.random().toString(36).substring(2, 12);
      const randomPart3 = Date.now().toString(36);
      const verificationToken = btoa(`${randomPart1}${randomPart2}${randomPart3}`).substring(0, 200);
      
      // Create verification link using nirchal.com domain with proper URL encoding
      const encodedToken = encodeURIComponent(verificationToken);
      const verificationLink = `https://nirchal.com/verify-email?token=${encodedToken}&customerId=${customer.id}`;

      // Store token in database with expiry (24 hours)
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + 24);

      // Use RPC function to store token (bypasses RLS restrictions)
      const { data: rpcResult, error: tokenError } = await supabase
        .rpc('store_email_verification_token', {
          p_customer_id: customer.id,
          p_token: verificationToken,
          p_expires_at: expiryTime.toISOString()
        }) as { data: any; error: any };

      if (tokenError) {
        throw tokenError;
      }

      if (!rpcResult?.success) {
        throw new Error(rpcResult?.error || 'Failed to store verification token');
      }

      // Send verification email via Cloudflare function
      const emailResponse = await fetch('/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: customer.email,
          subject: 'Verify Your Email Address - Nirchal',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
              <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h2 style="color: #2563eb; margin-top: 0; margin-bottom: 20px;">Email Verification Required</h2>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">Dear ${customer.first_name},</p>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">Please verify your email address to activate your Nirchal account. Click the button below to confirm your email. This link will expire in 24 hours.</p>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 14px;">
                    Verify Email Address
                  </a>
                </div>
                
                <p style="color: #6b7280; font-size: 13px; margin-top: 30px; margin-bottom: 10px;">Or copy and paste this link in your browser:</p>
                <p style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all; color: #4b5563; font-size: 12px; margin-bottom: 20px;">${verificationLink}</p>
                
                <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">If you did not request this verification, please ignore this email or contact support.</p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                <p style="color: #9ca3af; font-size: 11px; margin-top: 20px; margin-bottom: 0;">© 2025 Nirchal. All rights reserved.</p>
              </div>
            </div>
          `
        })
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.text();
        console.error('Email service error:', errorData);
        throw new Error('Failed to send verification email. Please try again later.');
      }

      toast.success('Verification email sent to ' + customer.email);
    } catch (err) {
      console.error('Error sending verification email:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to send verification email');
    } finally {
      setVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between border-b">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-lg font-bold">
              {customer ? `${customer.first_name.charAt(0)}${customer.last_name.charAt(0)}` : '?'}
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {loading ? 'Loading...' : customer ? `${customer.first_name} ${customer.last_name}` : 'Customer Details'}
              </h2>
              <p className="text-blue-100 text-sm">{customer?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : customer ? (
            <>
              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">First Name</p>
                    <p className="text-gray-900 font-medium mt-1">{customer.first_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Last Name</p>
                    <p className="text-gray-900 font-medium mt-1">{customer.last_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide flex items-center">
                      <Mail className="h-3 w-3 mr-2" />
                      Email
                    </p>
                    <p className="text-gray-900 font-medium mt-1">{customer.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide flex items-center">
                      <Phone className="h-3 w-3 mr-2" />
                      Phone
                    </p>
                    <p className="text-gray-900 font-medium mt-1">{customer.phone || 'Not provided'}</p>
                  </div>
                  {customer.date_of_birth && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide flex items-center">
                        <Calendar className="h-3 w-3 mr-2" />
                        Date of Birth
                      </p>
                      <p className="text-gray-900 font-medium mt-1">
                        {new Date(customer.date_of_birth).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                  {customer.gender && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Gender</p>
                      <p className="text-gray-900 font-medium mt-1 capitalize">{customer.gender}</p>
                    </div>
                  )}
                </div>

                {/* Status Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-300">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Account Status</p>
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        customer.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Email Verified</p>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        customer.email_verified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {customer.email_verified ? 'Verified' : 'Unverified'}
                      </span>
                      {!customer.email_verified && (
                        <button
                          onClick={verifyCustomerEmail}
                          disabled={verifying}
                          className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-50 transition"
                          title="Send verification email to customer"
                        >
                          {verifying ? 'Sending...' : 'Send Verification'}
                        </button>
                      )}
                    </div>
                  </div>
                  {customer.password_change_required && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Password Status</p>
                      <p className="mt-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                          Temporary Password
                        </span>
                      </p>
                    </div>
                  )}
                  {customer.welcome_email_sent && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Welcome Email</p>
                      <p className="mt-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          Sent
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-300">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Joined</p>
                    <p className="text-gray-900 font-medium mt-1">
                      {new Date(customer.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {customer.updated_at && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Last Updated</p>
                      <p className="text-gray-900 font-medium mt-1">
                        {new Date(customer.updated_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Addresses */}
              {addresses.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    Saved Addresses ({addresses.length})
                  </h3>
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-gray-900">
                              {address.first_name} {address.last_name}
                            </p>
                            {address.company && (
                              <p className="text-sm text-gray-600">{address.company}</p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {address.is_default && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Default
                              </span>
                            )}
                            {address.is_shipping && address.is_billing && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Both
                              </span>
                            )}
                            {address.is_shipping && !address.is_billing && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Shipping
                              </span>
                            )}
                            {address.is_billing && !address.is_shipping && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                Billing
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{address.address_line_1}</p>
                        {address.address_line_2 && (
                          <p className="text-sm text-gray-600">{address.address_line_2}</p>
                        )}
                        <p className="text-sm text-gray-700">
                          {address.city}, {address.state} {address.postal_code}
                        </p>
                        <p className="text-sm text-gray-600">{address.country}</p>
                        {address.phone && (
                          <p className="text-sm text-gray-600 mt-2 flex items-center">
                            <Phone className="h-3 w-3 mr-1" /> {address.phone}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders */}
              {orders.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-blue-600" />
                    Recent Orders ({orders.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Order #</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Payment Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Order Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="border-b border-gray-200 hover:bg-white">
                            <td className="py-3 px-4 text-gray-900 font-medium">{order.order_number}</td>
                            <td className="py-3 px-4 text-gray-600">
                              {new Date(order.created_at).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td className="py-3 px-4 text-gray-900 font-medium">
                              ₹{(order.total_amount || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                order.payment_status === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : order.payment_status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : order.payment_status === 'failed'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                              }`}>
                                {order.payment_status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'delivered'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'processing'
                                    ? 'bg-blue-100 text-blue-800'
                                    : order.status === 'cancelled'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {orders.length === 0 && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No orders yet</p>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
