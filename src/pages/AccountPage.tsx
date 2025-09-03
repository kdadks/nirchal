import React, { useEffect, useState } from 'react';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { usePublicProducts } from '../hooks/usePublicProducts';
import { useUserReviews } from '../hooks/useUserReviews';
import { Link, Navigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import ChangePasswordModal from '../components/auth/ChangePasswordModal';
import AddressModal from '../components/account/AddressModal';
import EditProfileModal from '../components/account/EditProfileModal';
import OrderDetailsModal from '../components/account/OrderDetailsModal';
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
  ChevronRight,
  Star 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDisplayDate } from '../utils/formatDate';

type OrderRow = {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
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
  const [editingAddress, setEditingAddress] = useState<AddressRow | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<number | null>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'reviews' | 'addresses' | 'settings'>('profile');

  useEffect(() => {
    const load = async () => {
      if (!customer?.email) { 
        setLoading(false); 
        return; 
      }

      try {
        // Filter orders and addresses by current customer ID
        const [ordersResult, addressesResult] = await Promise.all([
          supabase.from('orders')
            .select('id, order_number, status, total_amount, created_at')
            .eq('customer_id', customer.id)
            .order('created_at', { ascending: false }),
          supabase.from('customer_addresses')
            .select('id, first_name, last_name, company, address_line_1, address_line_2, city, state, postal_code, country, phone, is_default, is_shipping, is_billing')
            .eq('customer_id', customer.id)
            .order('is_default', { ascending: false })
        ]);
        
        if (ordersResult.error) {
          console.error('Error loading orders:', ordersResult.error);
          toast.error('Failed to load orders');
        } else {
          setOrders(ordersResult.data || []);
        }
        
        if (addressesResult.error) {
          console.error('Error loading addresses:', addressesResult.error);
          toast.error('Failed to load addresses');
        } else {
          setAddresses(addressesResult.data || []);
        }
      } catch (error) {
        console.error('Error loading account data:', error);
        toast.error('Failed to load account data');
      }
      setLoading(false);
    };
    load();
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

      const confirmDelete = window.confirm(confirmMessage);
      if (!confirmDelete) return;

      // Delete the address
      const { error } = await supabase
        .from('customer_addresses')
        .delete()
        .eq('id', addressId)
        .eq('customer_id', customer.id);

      if (error) throw error;

      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      toast.success('Address deleted successfully!');
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
            setAddresses(data || []);
          }
        });
    }
  };

  const handleOrderClick = (order: OrderRow) => {
    setSelectedOrderId(order.id);
    setShowOrderDetailsModal(true);
  };

  const handleEditProfile = () => {
    setShowEditProfileModal(true);
  };

  const handleProfileUpdateSuccess = () => {
    // Profile data will be refreshed by the EditProfileModal itself
    // through the refreshCustomer method in CustomerAuthContext
  };

  if (!customer && import.meta.env.PROD) {
    return <Navigate to="/" replace />;
  }

  const sidebarItems = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'orders' as const, label: 'Orders', icon: Package },
    { id: 'wishlist' as const, label: 'Wishlist', icon: Heart, badge: wishlist.length },
    { id: 'reviews' as const, label: 'Reviews & Ratings', icon: Star, badge: totalReviews },
    { id: 'addresses' as const, label: 'Addresses', icon: MapPin },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  if (!customer && import.meta.env.PROD) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            {/* Sidebar Navigation */}
            <div className="lg:w-64 flex-shrink-0">
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
                            <span className="font-medium">{item.label}</span>
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
                    <h2 className="text-xl font-semibold mb-6">Recent Orders</h2>
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
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div 
                            key={order.id} 
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                            onClick={() => handleOrderClick(order)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium text-gray-900">Order #{order.order_number}</h3>
                                <p className="text-sm text-gray-500">
                                  {formatDisplayDate(order.created_at)}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                                <p className="font-semibold text-gray-900 mt-1">₹{order.total_amount}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                              <span>Click to view details</span>
                              <ChevronRight size={16} />
                            </div>
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                              {/* Product Image */}
                              <div className="flex-shrink-0">
                                <img
                                  src={review.product_image || '/placeholder-product.jpg'}
                                  alt={review.product_name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              </div>
                              
                              {/* Review Content */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">{review.product_name}</h3>
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
                                
                                {/* Action */}
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                  <Link
                                    to={`/products/${review.product_id}`}
                                    className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                                  >
                                    View Product →
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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