import React, { useEffect, useState } from 'react';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { usePublicProducts } from '../hooks/usePublicProducts';
import { useUserReviews } from '../hooks/useUserReviews';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../config/supabase';
import ChangePasswordModal from '../components/auth/ChangePasswordModal';
import AddressModal from '../components/account/AddressModal';
import EditProfileModal from '../components/account/EditProfileModal';
import OrderDetailsModal from '../components/account/OrderDetailsModal';
import CustomerAuthModal from '../components/auth/CustomerAuthModal';
import { ReturnRequestForm } from '../components/returns/ReturnRequestForm';
import { CustomerReturnsTab } from '../components/account/CustomerReturnsTab';
import { returnService } from '../services/returnService';
import SEO from '../components/SEO';
import { 
  Heart, 
  ShoppingBag, 
  X, 
  User, 
  Package, 
  MapPin, 
  Settings, 
  Plus, 
  Edit2, 
  Trash2,
  AlertTriangle,
  Star,
  LogIn,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDisplayDate } from '../utils/formatDate';

type OrderRow = {
  id: string;  // UUID type from orders table
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  delivered_at?: string | null;
  payment_status?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  payment_details?: any;
  has_return_request?: boolean; // Track if return request exists
};

type AddressRow = {
  id: number;
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  phone?: string;
  is_default: boolean;
  is_shipping?: boolean;
  is_billing?: boolean;
};

const AccountPage: React.FC = () => {
  const { customer } = useCustomerAuth();
  
  const { wishlist, removeFromWishlist } = useWishlist();
  const { products } = usePublicProducts();
  const { reviews: userReviews, loading: reviewsLoading, totalReviews } = useUserReviews();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDismissConfirm, setShowDismissConfirm] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressRow | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<number | null>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);  // UUID type
  const [expandedPaymentDetails, setExpandedPaymentDetails] = useState<Set<string>>(new Set());  // UUID type
  const [expandedReturnForms, setExpandedReturnForms] = useState<Set<string>>(new Set());  // UUID type for return forms
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'reviews' | 'addresses' | 'returns' | 'settings'>('profile');
  const location = useLocation();

  // Check URL parameters for tab selection
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'orders', 'wishlist', 'reviews', 'addresses', 'returns', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam as 'profile' | 'orders' | 'wishlist' | 'reviews' | 'addresses' | 'returns' | 'settings');
    }
  }, [location.search]);

  // Extract load function so it can be reused
  const loadAccountData = async () => {
    if (!customer?.email) { 
      setLoading(false); 
      return; 
    }

    try {
      // Filter orders and addresses by current customer ID
      // Fetch return requests using returnService (uses supabaseAdmin, bypasses RLS)
      const [ordersResult, addressesResult, returnsResult] = await Promise.all([
        supabase.from('orders')
          .select(`
            id, 
            order_number, 
            status, 
            total_amount, 
            created_at, 
            delivered_at, 
            payment_status, 
            razorpay_payment_id, 
            razorpay_order_id, 
            payment_details
          `)
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false }),
        supabase.from('customer_addresses')
          .select('id, first_name, last_name, company, address_line_1, address_line_2, city, state, postal_code, country, phone, is_default, is_shipping, is_billing')
          .eq('customer_id', customer.id)
          .order('is_default', { ascending: false }),
        returnService.getReturnRequestsByCustomer(customer.id)
      ]);
      
      if (ordersResult.error) {
        console.error('Error loading orders:', ordersResult.error);
        toast.error('Failed to load orders');
      } else {
        // Create a set of order IDs that have return requests
        const orderIdsWithReturns = new Set(
          (returnsResult.data || []).map((r: any) => r.order_id)
        );
        
        // Map the data to include has_return_request flag
        const ordersWithReturnFlag = (ordersResult.data || []).map((order: any) => ({
          ...order,
          has_return_request: orderIdsWithReturns.has(order.id)
        }));
        setOrders(ordersWithReturnFlag);
      }
      
      if (addressesResult.error) {
        console.error('Error loading addresses:', addressesResult.error);
        toast.error('Failed to load addresses');
      } else {
        setAddresses((addressesResult.data as any) || []);
      }
    } catch (error) {
      console.error('Error loading account data:', error);
      toast.error('Failed to load account data');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAccountData();
  }, [customer?.email, customer?.id]);

  const handleAddressEdit = (address: AddressRow) => {
    setEditingAddress(address);
    setShowAddressModal(true);
  };

  const handleAddressDelete = async (addressId: number) => {
    if (!customer) return;

    try {
      // Get the address details to check if it's the default address
      const { data: addressToDelete } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('id', addressId)
        .eq('customer_id', customer.id)
        .single();

      if (!addressToDelete) {
        toast.error('Address not found');
        return;
      }

      // Check if this is the default address and if it's the only address
      if (addressToDelete.is_default) {
        // Count total addresses for this customer
        const { count: totalAddresses } = await supabase
          .from('customer_addresses')
          .select('*', { count: 'exact', head: true })
          .eq('customer_id', customer.id);

        if (totalAddresses === 1) {
          toast.error('Cannot delete the only address. Please add another address first and make it default before deleting this one.');
          return;
        }

        // Check if there's another default address (should not happen due to constraint, but safety check)
        const { count: defaultCount } = await supabase
          .from('customer_addresses')
          .select('*', { count: 'exact', head: true })
          .eq('customer_id', customer.id)
          .eq('is_default', true)
          .neq('id', addressId);

        if (defaultCount === 0) {
          toast.error('Cannot delete the default address. Please make another address default first.');
          return;
        }
      }

      // Check if this address is associated with any orders
      const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select('id, billing_address_line_1, billing_city, billing_postal_code, shipping_address_line_1, shipping_city, shipping_postal_code')
        .eq('customer_id', customer.id);

      if (orderError) throw orderError;

      // Check if this address is used in any orders
      const isUsedInOrders = orders?.some(order => {
        const billingMatch = order.billing_address_line_1 === addressToDelete.address_line_1 &&
          order.billing_city === addressToDelete.city &&
          order.billing_postal_code === addressToDelete.postal_code;
        
        const shippingMatch = order.shipping_address_line_1 === addressToDelete.address_line_1 &&
          order.shipping_city === addressToDelete.city &&
          order.shipping_postal_code === addressToDelete.postal_code;

        return billingMatch || shippingMatch;
      });

      let confirmMessage = 'Are you sure you want to delete this address?';
      if (isUsedInOrders) {
        confirmMessage = 'This address is associated with your past orders but the order information is safely stored. Are you sure you want to delete this address from your saved addresses?';
      }

      // Show confirmation via toast
      await new Promise<void>((resolve, reject) => {
  toast((t) => (
          <div className="flex flex-col space-y-2">
            <div className="text-sm">{confirmMessage}</div>
            <div className="flex space-x-2">
              <button
                className="px-3 py-1 bg-red-600 text-white rounded"
                onClick={async () => {
                  toast.dismiss(t.id);
                  try {
                    const { error } = await supabase
                      .from('customer_addresses')
                      .delete()
                      .eq('id', addressId)
                      .eq('customer_id', customer.id);

                    if (error) throw error;

                    setAddresses(prev => prev.filter(addr => addr.id !== addressId));
                    toast.success('Address deleted successfully!');
                    resolve();
                  } catch (err) {
                    console.error('Error deleting address:', err);
                    toast.error('Failed to delete address. Please try again.');
                    reject(err);
                  }
                }}
              >
                Delete
              </button>
              <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => toast.dismiss(t.id)}>Cancel</button>
            </div>
          </div>
        ), { duration: 10000 });
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address. Please try again.');
    } finally {
      setDeletingAddress(null);
    }
  };

  const handleAddressModalClose = () => {
    setShowAddressModal(false);
    setEditingAddress(null);
  };

  const handleAddressSuccess = () => {
    // Reload addresses
    if (customer?.id) {
      supabase.from('customer_addresses')
        .select('id, first_name, last_name, company, address_line_1, address_line_2, city, state, postal_code, country, phone, is_default, is_shipping, is_billing')
        .eq('customer_id', customer.id)
        .order('is_default', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            console.error('Error reloading addresses:', error);
            toast.error('Failed to reload addresses');
          } else {
            setAddresses((data as any) || []);
          }
        });
    }
  };

  const handleOrderClick = (order: OrderRow) => {
    setSelectedOrderId(order.id);
    setShowOrderDetailsModal(true);
  };

  const togglePaymentDetails = (orderId: string) => {  // UUID type
    setExpandedPaymentDetails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const toggleReturnForm = (orderId: string) => {  // UUID type
    setExpandedReturnForms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleReturnSuccess = () => {
    toast.success('Return request submitted successfully');
    setExpandedReturnForms(new Set()); // Close all return forms
    loadAccountData(); // Reload orders
  };

  const handleEditProfile = () => {
    setShowEditProfileModal(true);
  };

  const handleProfileUpdateSuccess = () => {
    // Profile data will be refreshed by the EditProfileModal itself
    // through the refreshCustomer method in CustomerAuthContext
  };

  // Show login prompt instead of redirecting for Track Order functionality
  if (!customer && import.meta.env.PROD) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Access Required</h2>
            <p className="text-gray-600 mb-6">
              Please sign in to access your account, track orders, and manage your profile.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Sign In / Register
              </button>
              <Link
                to="/"
                className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        
        {/* Auth Modal */}
        <CustomerAuthModal 
          open={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    );
  }

  const sidebarItems = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'orders' as const, label: 'Orders', icon: Package, badge: orders.length },
    { id: 'returns' as const, label: 'Returns', icon: RotateCcw },
    { id: 'wishlist' as const, label: 'Wishlist', icon: Heart, badge: wishlist.length },
    { id: 'reviews' as const, label: 'Reviews & Ratings', icon: Star, badge: totalReviews },
    { id: 'addresses' as const, label: 'Addresses', icon: MapPin },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO - noindex for account page */}
      <SEO
        title="My Account"
        description="Manage your account, orders, and wishlist"
        noindex={true}
        nofollow={true}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
          {!customer && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg">
              You're not signed in. In development you can still view demo data if available.
            </div>
          )}
          
          {customer && (
            <p className="text-gray-600">
              Welcome back, {customer.first_name} {customer.last_name}!
            </p>
          )}
        </div>

        {/* Temporary Password Security Warning */}
        {customer && sessionStorage.getItem('new_customer_temp_password') && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
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
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading your account...</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Navigation - Tabs at top */}
            <div className="lg:hidden">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6">
                <div className="grid grid-cols-3 gap-1">
                  {sidebarItems.slice(0, 6).map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex flex-col items-center gap-1 px-2 py-3 text-center rounded-lg transition-colors ${
                          activeTab === item.id
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={20} className={activeTab === item.id ? 'text-primary-700' : 'text-gray-500'} />
                        <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
                        {'badge' in item && item.badge !== undefined && item.badge > 0 && (
                          <span className="bg-primary-100 text-primary-700 text-xs font-medium px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Desktop Sidebar Navigation - Expanded width */}
            <div className="hidden lg:block lg:w-72 flex-shrink-0">
              <nav className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <ul className="space-y-2">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-colors ${
                            activeTab === item.id
                              ? 'bg-primary-50 text-primary-700 border border-primary-200'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={20} className={activeTab === item.id ? 'text-primary-700' : 'text-gray-500'} />
                            <span className="font-medium whitespace-nowrap">{item.label}</span>
                          </div>
                          {'badge' in item && item.badge !== undefined && item.badge > 0 && (
                            <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2 py-1 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Profile Information</h2>
                      {customer && (
                        <button
                          onClick={handleEditProfile}
                          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          <Edit2 size={16} className="mr-2" />
                          Edit Profile
                        </button>
                      )}
                    </div>
                    {customer ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{customer.first_name}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{customer.last_name}</p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{customer.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{customer.phone || 'Not provided'}</p>
                        </div>
                        {customer.date_of_birth && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                              {formatDisplayDate(customer.date_of_birth)}
                            </p>
                          </div>
                        )}
                        {customer.gender && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                              {customer.gender.charAt(0).toUpperCase() + customer.gender.slice(1)}
                            </p>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                            {formatDisplayDate(new Date())}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">Please sign in to view your profile.</p>
                    )}
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Your Orders</h2>
                    {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-4">No orders found</p>
                        <Link 
                          to="/products" 
                          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Start Shopping
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((order) => (
                          <div 
                            key={order.id} 
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                          >
                            {/* Desktop layout */}
                            <div className="hidden sm:flex items-center justify-between">
                              {/* Order number - clickable */}
                              <button
                                onClick={() => handleOrderClick(order)}
                                className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
                              >
                                Order #{order.order_number}
                              </button>
                              
                              {/* Order date */}
                              <span className="text-sm text-gray-500">
                                {formatDisplayDate(order.created_at)}
                              </span>
                              
                              {/* Price */}
                              <span className="font-semibold text-gray-900">
                                ₹{order.total_amount?.toLocaleString()}
                              </span>
                              
                              {/* Status and Payment Status */}
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 text-xs font-medium rounded-md ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                                {order.payment_status && (
                                  <span className={`px-2 py-1 text-xs font-medium rounded-md flex items-center gap-1 ${
                                    order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                    order.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                                    order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {order.payment_status === 'paid' ? <CheckCircle size={10} /> :
                                     order.payment_status === 'failed' ? <XCircle size={10} /> :
                                     order.payment_status === 'pending' ? <Clock size={10} /> : null}
                                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                  </span>
                                )}
                                {/* Request Return Button - Desktop */}
                                {order.status === 'delivered' && order.payment_status === 'paid' && order.delivered_at && (
                                  order.has_return_request ? (
                                    <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-600 flex items-center gap-1">
                                      <CheckCircle size={10} />
                                      Return Requested
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => toggleReturnForm(order.id)}
                                      className={`px-2 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition-colors ${
                                        expandedReturnForms.has(order.id)
                                          ? 'bg-orange-100 text-orange-800'
                                          : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                                      }`}
                                    >
                                      <RotateCcw size={10} />
                                      Return
                                    </button>
                                  )
                                )}
                              </div>
                            </div>

                            {/* Mobile layout */}
                            <div className="block sm:hidden space-y-2">
                              <div className="flex items-center justify-between">
                                <button
                                  onClick={() => handleOrderClick(order)}
                                  className="font-medium text-primary-600 hover:text-primary-700 transition-colors text-sm"
                                >
                                  Order #{order.order_number}
                                </button>
                                <div className="flex items-center gap-1">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </span>
                                  {order.payment_status && (
                                    <span className={`px-1 py-1 text-xs font-medium rounded-md flex items-center gap-1 ${
                                      order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                      order.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                                      order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {order.payment_status === 'paid' ? <CheckCircle size={10} /> :
                                       order.payment_status === 'failed' ? <XCircle size={10} /> :
                                       order.payment_status === 'pending' ? <Clock size={10} /> : null}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">
                                  {formatDisplayDate(order.created_at)}
                                </span>
                                <span className="font-semibold text-gray-900">
                                  ₹{order.total_amount?.toLocaleString()}
                                </span>
                              </div>
                              {/* Request Return Button - Mobile */}
                              {order.status === 'delivered' && order.payment_status === 'paid' && order.delivered_at && (
                                order.has_return_request ? (
                                  <div className="w-full px-3 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1 bg-gray-100 text-gray-600">
                                    <CheckCircle size={12} />
                                    Return Requested
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => toggleReturnForm(order.id)}
                                    className={`w-full px-3 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1 transition-colors ${
                                      expandedReturnForms.has(order.id)
                                        ? 'bg-orange-100 text-orange-800'
                                        : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                                    }`}
                                  >
                                    <RotateCcw size={12} />
                                    Request Return
                                  </button>
                                )
                              )}
                            </div>

                            {/* Return Request Form - Inline */}
                            {expandedReturnForms.has(order.id) && order.delivered_at && customer && !order.has_return_request && (
                              <div className="mt-4 border-t pt-4">
                                <ReturnRequestForm
                                  isOpen={true}
                                  onClose={() => toggleReturnForm(order.id)}
                                  order={{
                                    id: order.id,
                                    order_number: order.order_number,
                                    total_amount: order.total_amount,
                                    delivered_at: order.delivered_at,
                                    order_items: []
                                  }}
                                  onSuccess={handleReturnSuccess}
                                  inline={true}
                                />
                              </div>
                            )}

                            {/* Payment History Section */}
                            {(order.payment_status || order.razorpay_payment_id) && (
                              <div className="mt-4 border-t">
                                <button
                                  onClick={() => togglePaymentDetails(order.id)}
                                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg"
                                >
                                  <div className="flex items-center gap-2">
                                    <CreditCard size={16} className="text-gray-600" />
                                    <span className="text-sm font-medium text-gray-900">Payment Details</span>
                                  </div>
                                  {expandedPaymentDetails.has(order.id) ? (
                                    <ChevronDown size={16} className="text-gray-500" />
                                  ) : (
                                    <ChevronRight size={16} className="text-gray-500" />
                                  )}
                                </button>
                                
                                {expandedPaymentDetails.has(order.id) && (
                                  <div className="p-3 bg-gray-50 rounded-b-lg space-y-2">
                                    {/* Payment Status */}
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-gray-600">Payment Status:</span>
                                      <div className="flex items-center gap-1">
                                        {order.payment_status === 'paid' ? (
                                          <>
                                            <CheckCircle size={14} className="text-green-600" />
                                            <span className="text-green-600 font-medium">Paid</span>
                                          </>
                                        ) : order.payment_status === 'failed' ? (
                                          <>
                                            <XCircle size={14} className="text-red-600" />
                                            <span className="text-red-600 font-medium">Failed</span>
                                          </>
                                        ) : order.payment_status === 'pending' ? (
                                          <>
                                            <Clock size={14} className="text-yellow-600" />
                                            <span className="text-yellow-600 font-medium">Pending</span>
                                          </>
                                        ) : (
                                          <span className="text-gray-500 font-medium">{order.payment_status || 'N/A'}</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Transaction ID */}
                                    {order.razorpay_payment_id && (
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Transaction ID:</span>
                                        <span className="font-mono text-xs text-gray-900 bg-white px-2 py-1 rounded border">
                                          {order.razorpay_payment_id}
                                        </span>
                                      </div>
                                    )}

                                    {/* Razorpay Order ID */}
                                    {order.razorpay_order_id && (
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Order ID:</span>
                                        <span className="font-mono text-xs text-gray-900 bg-white px-2 py-1 rounded border">
                                          {order.razorpay_order_id}
                                        </span>
                                      </div>
                                    )}

                                    {/* Payment Method from payment_details */}
                                    {order.payment_details && (
                                      <div className="mt-2 pt-2 border-t border-gray-200">
                                        {order.payment_details.method && (
                                          <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Payment Method:</span>
                                            <span className="text-gray-900 capitalize">
                                              {order.payment_details.method}
                                            </span>
                                          </div>
                                        )}
                                        {order.payment_details.bank && (
                                          <div className="flex items-center justify-between text-sm mt-1">
                                            <span className="text-gray-600">Bank:</span>
                                            <span className="text-gray-900">
                                              {order.payment_details.bank}
                                            </span>
                                          </div>
                                        )}
                                        {order.payment_details.wallet && (
                                          <div className="flex items-center justify-between text-sm mt-1">
                                            <span className="text-gray-600">Wallet:</span>
                                            <span className="text-gray-900">
                                              {order.payment_details.wallet}
                                            </span>
                                          </div>
                                        )}
                                        {/* UPI Transaction ID */}
                                        {order.payment_details.vpa && (
                                          <div className="flex items-center justify-between text-sm mt-1">
                                            <span className="text-gray-600">UPI ID:</span>
                                            <span className="font-mono text-xs text-gray-900 bg-white px-2 py-1 rounded border">
                                              {order.payment_details.vpa}
                                            </span>
                                          </div>
                                        )}
                                        {/* UPI Transaction Reference */}
                                        {order.payment_details.acquirer_data?.upi_transaction_id && (
                                          <div className="flex items-center justify-between text-sm mt-1">
                                            <span className="text-gray-600">UPI Transaction ID:</span>
                                            <span className="font-mono text-xs text-gray-900 bg-white px-2 py-1 rounded border">
                                              {order.payment_details.acquirer_data.upi_transaction_id}
                                            </span>
                                          </div>
                                        )}
                                        {/* Bank Reference Number (for non-UPI) */}
                                        {order.payment_details.acquirer_data?.bank_transaction_id && (
                                          <div className="flex items-center justify-between text-sm mt-1">
                                            <span className="text-gray-600">Bank Transaction ID:</span>
                                            <span className="font-mono text-xs text-gray-900 bg-white px-2 py-1 rounded border">
                                              {order.payment_details.acquirer_data.bank_transaction_id}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Wishlist Tab */}
                {activeTab === 'wishlist' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-6">My Wishlist</h2>
                    {wishlist.length === 0 ? (
                      <div className="text-center py-12">
                        <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-4">Your wishlist is empty</p>
                        <Link 
                          to="/products" 
                          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Discover Products
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {wishlist.map((productId) => {
                          const product = products.find(p => p.id === productId);
                          if (!product) return null;

                          return (
                            <div key={productId} className="bg-gray-50 rounded-lg p-4 relative hover:shadow-sm transition-shadow">
                              <button
                                onClick={() => removeFromWishlist(productId)}
                                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100 z-10"
                              >
                                <X size={16} className="text-gray-500" />
                              </button>
                              
                              <Link to={`/products/${product.slug}`} className="block">
                                <img
                                  src={product.images[0] || '/placeholder-product.jpg'}
                                  alt={product.name}
                                  className="w-full h-48 object-cover rounded-lg mb-3"
                                />
                                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                                  {product.name}
                                </h3>
                                <div className="flex items-center justify-between">
                                  <span className="text-lg font-semibold text-primary-600">
                                    ₹{product.price}
                                  </span>
                                  {product.originalPrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                      ₹{product.originalPrice}
                                    </span>
                                  )}
                                </div>
                              </Link>
                              
                              <Link
                                to={`/products/${product.slug}`}
                                className="mt-3 w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                              >
                                <ShoppingBag size={16} />
                                View Product
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-6">My Reviews & Ratings</h2>
                    {reviewsLoading ? (
                      <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        <p className="mt-4 text-gray-600">Loading your reviews...</p>
                      </div>
                    ) : userReviews.length === 0 ? (
                      <div className="text-center py-12">
                        <Star size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-4">You haven't reviewed any products yet</p>
                        <Link 
                          to="/products" 
                          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Shop Products
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                          <p className="text-blue-800">
                            <strong>Total Reviews:</strong> {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                          </p>
                        </div>
                        {userReviews.map((review) => (
                          <div key={review.id} className="border border-gray-200 rounded-lg p-6 bg-white">
                            <div className="flex gap-4">
                              {/* Product Image - Clickable */}
                              <div className="flex-shrink-0">
                                <Link to={`/products/${review.product_slug}`}>
                                  <img
                                    src={review.product_image || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'}
                                    alt={review.product_name}
                                    className="w-16 h-16 object-cover rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80';
                                    }}
                                  />
                                </Link>
                              </div>
                              
                              {/* Review Content */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <Link to={`/products/${review.product_slug}`}>
                                      <h3 className="font-medium text-gray-900 hover:text-primary-600 transition-colors cursor-pointer">
                                        {review.product_name}
                                      </h3>
                                    </Link>
                                    <div className="flex items-center mt-1 gap-3">
                                      <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star
                                            key={star}
                                            size={16}
                                            className={
                                              star <= review.rating
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300'
                                            }
                                          />
                                        ))}
                                      </div>
                                      <span className="text-sm text-gray-600">
                                        {review.rating} out of 5 stars
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        • {formatDisplayDate(review.created_at)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {review.helpful > 0 && (
                                      <p className="text-xs text-green-600">
                                        {review.helpful} found helpful
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Review Comment */}
                                {review.comment && (
                                  <div className="mt-3">
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                      {review.comment}
                                    </p>
                                  </div>
                                )}
                                
                                {/* Review Images */}
                                {review.images && review.images.length > 0 && (
                                  <div className="mt-3">
                                    <div className="flex gap-2">
                                      {review.images.slice(0, 3).map((image, index) => (
                                        <div key={index} className="w-12 h-12 bg-gray-100 rounded border">
                                          <img
                                            src={image}
                                            alt={`Review image ${index + 1}`}
                                            className="w-full h-full object-cover rounded"
                                          />
                                        </div>
                                      ))}
                                      {review.images.length > 3 && (
                                        <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                                          <span className="text-xs text-gray-600">
                                            +{review.images.length - 3}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Returns Tab */}
                {activeTab === 'returns' && (
                  <div className="p-6">
                    <CustomerReturnsTab />
                  </div>
                )}

                {/* Addresses Tab */}
                {activeTab === 'addresses' && (
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Saved Addresses</h2>
                      <button
                        onClick={() => setShowAddressModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <Plus size={16} className="mr-2" />
                        Add Address
                      </button>
                    </div>
                    
                    {addresses.length === 0 ? (
                      <div className="text-center py-12">
                        <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-4">No addresses saved</p>
                        <button
                          onClick={() => setShowAddressModal(true)}
                          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          <Plus size={16} className="mr-2" />
                          Add Your First Address
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {addresses.map((address) => (
                          <div key={address.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium text-gray-900">
                                    {address.first_name} {address.last_name}
                                  </h4>
                                  {address.is_default && (
                                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                                      Default
                                    </span>
                                  )}
                                </div>
                                
                                {/* Company */}
                                {address.company && (
                                  <p className="text-sm text-gray-600 mb-1 font-medium">{address.company}</p>
                                )}
                                
                                {/* Address Lines */}
                                <p className="text-sm text-gray-600 mb-1">{address.address_line_1}</p>
                                {address.address_line_2 && (
                                  <p className="text-sm text-gray-600 mb-1">{address.address_line_2}</p>
                                )}
                                
                                {/* City, State, Postal Code, Country */}
                                <p className="text-sm text-gray-600 mb-2">
                                  {address.city}, {address.state} {address.postal_code}
                                  {address.country && address.country !== 'India' && (
                                    <span>, {address.country}</span>
                                  )}
                                </p>
                                
                                {/* Phone */}
                                {address.phone && (
                                  <p className="text-sm text-gray-600 mb-2">📞 {address.phone}</p>
                                )}
                                
                                {/* Usage Tags */}
                                <div className="flex gap-2">
                                  {address.is_shipping && (
                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                      Shipping
                                    </span>
                                  )}
                                  {address.is_billing && (
                                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                      Billing
                                    </span>
                                  )}
                                  {!address.is_shipping && !address.is_billing && (
                                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                      Other
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <button
                                  onClick={() => handleAddressEdit(address)}
                                  className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                  title="Edit address"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => setDeletingAddress(address.id)}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete address"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
                    {customer ? (
                      <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-medium text-gray-900 mb-2">Password</h3>
                          <p className="text-sm text-gray-600 mb-3">
                            Update your password to keep your account secure
                          </p>
                          <button
                            onClick={() => setShowPasswordModal(true)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            Change Password
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">Please sign in to access settings.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Address Modal */}
      <AddressModal
        isOpen={showAddressModal}
        onClose={handleAddressModalClose}
        onSuccess={handleAddressSuccess}
        editAddress={editingAddress ? {
          ...editingAddress, 
          country: editingAddress.country || 'India',
          is_shipping: editingAddress.is_shipping || false,
          is_billing: editingAddress.is_billing || false
        } : null}
      />

      {/* Address Delete Confirmation */}
      {deletingAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Address
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this address? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingAddress(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddressDelete(deletingAddress)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Address
              </button>
            </div>
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

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        onSuccess={handleProfileUpdateSuccess}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={showOrderDetailsModal}
        onClose={() => setShowOrderDetailsModal(false)}
        orderId={selectedOrderId}
      />
    </div>
  );
};

export default AccountPage;