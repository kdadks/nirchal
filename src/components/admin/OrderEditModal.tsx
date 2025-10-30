import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Package, User, MapPin, Edit2, Lock, Truck } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { getStorageImageUrl, getProductImageUrls } from '../../utils/storageUtils';
import { useLogisticsPartners } from '../../hooks/useAdmin';
import StateDropdown from '../common/StateDropdown';
import CityDropdown from '../common/CityDropdown';
import toast from 'react-hot-toast';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  total_price: number;
  product_variant_id?: string;
  product_id: string;
  variant_color?: string;
  variant_size?: string;
  product_image?: string;
  products?: {
    id: string;
    name: string;
    product_images?: Array<{
      image_url: string;
      is_primary: boolean;
    }>;
    product_variants?: Array<{
      id: string;
      color: string;
      size: string;
      swatch_image_id: string;
      product_images: {
        image_url: string;
      };
    }>;
  };
}

interface OrderDetails {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  customer_id?: string;
  billing_first_name: string;
  billing_last_name: string;
  billing_email: string;
  billing_phone?: string;
  billing_address_line_1: string;
  billing_address_line_2?: string;
  billing_city: string;
  billing_state: string;
  billing_postal_code: string;
  billing_country?: string;
  shipping_first_name?: string;
  shipping_last_name?: string;
  shipping_address_line_1?: string;
  shipping_address_line_2?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  payment_method?: string;
  payment_status?: string;
  notes?: string;
  logistics_partner_id?: string;
  tracking_number?: string;
  shipped_at?: string;
  order_items: OrderItem[];
}

interface OrderEditModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const OrderEditModal: React.FC<OrderEditModalProps> = ({ orderId, isOpen, onClose, onUpdate }) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<OrderDetails>>({});
  const { logisticsPartners } = useLogisticsPartners();

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch order details first
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('Order fetch error:', orderError);
        throw orderError;
      }

      // Fetch order items - first get all items without products join
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('Order items fetch error:', itemsError);
        console.error('Error details:', JSON.stringify(itemsError, null, 2));
        // Continue without items rather than failing completely
      }
      
      // For items that have product_id, fetch product details separately
      const itemsWithProductDetails = await Promise.all(
        (items || []).map(async (item: any) => {
          // If no product_id (e.g., service items), return item as-is
          if (!item.product_id) {
            return item;
          }
          
          // Fetch product details with images and variants
          const { data: productData } = await supabase
            .from('products')
            .select(`
              id,
              name,
              product_images(image_url, is_primary),
              product_variants(
                id,
                color,
                size,
                swatch_image_id,
                product_images!swatch_image_id(image_url)
              )
            `)
            .eq('id', item.product_id)
            .single();
          
          return {
            ...item,
            products: productData
          };
        })
      );

      // Process items to extract product images with variant-specific swatch support
      const processedItems = (itemsWithProductDetails || []).map((item: any) => {
        let productImage: string | undefined;
        let productData = item.products;
        
        // First priority: Try to find variant-specific swatch image
        if (item.variant_color && productData?.product_variants) {
          const matchingVariant = productData.product_variants.find((variant: any) => {
            const colorMatch = variant.color === item.variant_color;
            const sizeMatch = !item.variant_size || 
                             item.variant_size === 'Free Size' || 
                             variant.size === item.variant_size ||
                             !variant.size;
            return colorMatch && sizeMatch;
          });
          
          if (matchingVariant?.product_images?.image_url) {
            productImage = getStorageImageUrl(matchingVariant.product_images.image_url);
          }
        }
        
        // Second priority: Use primary product image
        if (!productImage && productData?.product_images && Array.isArray(productData.product_images) && productData.product_images.length > 0) {
          const productImages = productData.product_images;
          const primaryImage = productImages.find((img: any) => img.is_primary);
          const selectedImageData = primaryImage || productImages[0];
          
          if (selectedImageData?.image_url) {
            productImage = getStorageImageUrl(selectedImageData.image_url);
          }
        }
        
        // Third priority: Generate image URL based on product name/ID
        if (!productImage && (item.product_id || item.product_name)) {
          const possibleImages = getProductImageUrls(item.product_id || 'unknown', item.product_name);
          productImage = possibleImages[0];
        }
        
        return {
          ...item,
          product_image: productImage
        };
      });

      const completeOrderData: OrderDetails = {
        ...orderData,
        order_items: processedItems || []
      } as OrderDetails;

      setOrderDetails(completeOrderData);
      setFormData(completeOrderData);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
  }, [isOpen, orderId]);

  const handleSave = async () => {
    if (!orderDetails || !formData) return;

    try {
      setSaving(true);
      
      // Update the order
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          billing_first_name: formData.billing_first_name,
          billing_last_name: formData.billing_last_name,
          billing_email: formData.billing_email,
          billing_phone: formData.billing_phone,
          billing_address_line_1: formData.billing_address_line_1,
          billing_address_line_2: formData.billing_address_line_2,
          billing_city: formData.billing_city,
          billing_state: formData.billing_state,
          billing_postal_code: formData.billing_postal_code,
          billing_country: formData.billing_country,
          shipping_first_name: formData.shipping_first_name,
          shipping_last_name: formData.shipping_last_name,
          shipping_address_line_1: formData.shipping_address_line_1,
          shipping_address_line_2: formData.shipping_address_line_2,
          shipping_city: formData.shipping_city,
          shipping_state: formData.shipping_state,
          shipping_postal_code: formData.shipping_postal_code,
          shipping_country: formData.shipping_country,
          notes: formData.notes,
          logistics_partner_id: formData.logistics_partner_id,
          tracking_number: formData.tracking_number,
          // Set shipped_at if tracking number is being added for the first time
          shipped_at: formData.tracking_number && !orderDetails.shipped_at ? new Date().toISOString() : formData.shipped_at,
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Update customer addresses if customer_id exists
      if (orderDetails.customer_id) {
        // Update billing address - find existing billing address or create new one
        if (formData.billing_address_line_1) {
          // First try to find existing billing address
          const { data: existingBilling } = await supabase
            .from('customer_addresses')
            .select('id')
            .eq('customer_id', orderDetails.customer_id)
            .eq('is_billing', true)
            .single();

          const billingAddressData = {
            customer_id: orderDetails.customer_id,
            first_name: formData.billing_first_name,
            last_name: formData.billing_last_name,
            address_line_1: formData.billing_address_line_1,
            address_line_2: formData.billing_address_line_2,
            city: formData.billing_city,
            state: formData.billing_state,
            postal_code: formData.billing_postal_code,
            country: formData.billing_country || 'India',
            phone: formData.billing_phone,
            is_billing: true,
            is_shipping: false,
            is_default: false,
          };

          if (existingBilling && existingBilling.id) {
            // Update existing billing address
            const { error: billingError } = await supabase
              .from('customer_addresses')
              .update(billingAddressData)
              .eq('id', existingBilling.id as string);

            if (billingError) {
              console.error('Error updating billing address:', billingError);
            }
          } else {
            // Create new billing address
            const { error: billingError } = await supabase
              .from('customer_addresses')
              .insert(billingAddressData);

            if (billingError) {
              console.error('Error creating billing address:', billingError);
            }
          }
        }

        // Update shipping address (if different from billing)
        if (formData.shipping_address_line_1) {
          // First try to find existing shipping address
          const { data: existingShipping } = await supabase
            .from('customer_addresses')
            .select('id')
            .eq('customer_id', orderDetails.customer_id)
            .eq('is_shipping', true)
            .single();

          const shippingAddressData = {
            customer_id: orderDetails.customer_id,
            first_name: formData.shipping_first_name,
            last_name: formData.shipping_last_name,
            address_line_1: formData.shipping_address_line_1,
            address_line_2: formData.shipping_address_line_2,
            city: formData.shipping_city,
            state: formData.shipping_state,
            postal_code: formData.shipping_postal_code,
            country: formData.shipping_country || 'India',
            phone: formData.billing_phone, // Use billing phone for shipping
            is_billing: false,
            is_shipping: true,
            is_default: false,
          };

          if (existingShipping && existingShipping.id) {
            // Update existing shipping address
            const { error: shippingError } = await supabase
              .from('customer_addresses')
              .update(shippingAddressData)
              .eq('id', existingShipping.id as string);

            if (shippingError) {
              console.error('Error updating shipping address:', shippingError);
            }
          } else {
            // Create new shipping address
            const { error: shippingError } = await supabase
              .from('customer_addresses')
              .insert(shippingAddressData);

            if (shippingError) {
              console.error('Error creating shipping address:', shippingError);
            }
          }
        }
      }

      toast.success('Order updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof OrderDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBillingStateChange = (value: string) => {
    setFormData(prev => ({ ...prev, billing_state: value, billing_city: '' }));
  };

  const handleBillingCityChange = (city: string) => {
    setFormData(prev => ({ ...prev, billing_city: city }));
  };

  const handleShippingStateChange = (value: string) => {
    setFormData(prev => ({ ...prev, shipping_state: value, shipping_city: '' }));
  };

  const handleShippingCityChange = (city: string) => {
    setFormData(prev => ({ ...prev, shipping_city: city }));
  };

  const isReadOnly = orderDetails?.status === 'shipped' || orderDetails?.status === 'delivered' || orderDetails?.status === 'cancelled';
  const formatCurrency = (amount: number | undefined | null) => {
    if (amount == null) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN');

  if (!isOpen) return null;

  const modal = (
    <div className="admin-modal-overlay">
      <div className="admin-modal modal-xl">
        {/* Header */}
        <div className="admin-modal-header">
          <div className="admin-modal-title">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-blue-600" />
              <span>Order Details - {orderDetails?.order_number}</span>
              {isReadOnly && (
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md">
                  <Lock className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Read Only</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="admin-modal-close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="admin-modal-body">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading order details...</p>
            </div>
          </div>
        ) : orderDetails ? (
          <div className="admin-modal-body">
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-1 ${
                  orderDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  orderDetails.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  orderDetails.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                  orderDetails.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {orderDetails.status}
                </span>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatCurrency(orderDetails.total_amount)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {formatDate(orderDetails.created_at)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Billing Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Billing Information
                  {!isReadOnly && <Edit2 className="h-4 w-4 text-blue-600" />}
                </h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        value={formData.billing_first_name || ''}
                        onChange={(e) => handleInputChange('billing_first_name', e.target.value)}
                        disabled={true}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={formData.billing_last_name || ''}
                        onChange={(e) => handleInputChange('billing_last_name', e.target.value)}
                        disabled={true}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.billing_email || ''}
                      onChange={(e) => handleInputChange('billing_email', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.billing_phone || ''}
                      onChange={(e) => handleInputChange('billing_phone', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                    <input
                      type="text"
                      value={formData.billing_address_line_1 || ''}
                      onChange={(e) => handleInputChange('billing_address_line_1', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                    <input
                      type="text"
                      value={formData.billing_address_line_2 || ''}
                      onChange={(e) => handleInputChange('billing_address_line_2', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      {isReadOnly ? (
                        <input
                          type="text"
                          value={formData.billing_city || ''}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                        />
                      ) : (
                        <CityDropdown
                          name="billing_city"
                          value={formData.billing_city || ''}
                          onChange={handleBillingCityChange}
                          selectedState={formData.billing_state || ''}
                          highZIndex={true}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      {isReadOnly ? (
                        <input
                          type="text"
                          value={formData.billing_state || ''}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                        />
                      ) : (
                        <StateDropdown
                          name="billing_state"
                          value={formData.billing_state || ''}
                          onChange={handleBillingStateChange}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                      <input
                        type="text"
                        value={formData.billing_postal_code || ''}
                        onChange={(e) => handleInputChange('billing_postal_code', e.target.value)}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Information
                  {!isReadOnly && <Edit2 className="h-4 w-4 text-blue-600" />}
                </h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        value={formData.shipping_first_name || ''}
                        onChange={(e) => handleInputChange('shipping_first_name', e.target.value)}
                        disabled={true}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={formData.shipping_last_name || ''}
                        onChange={(e) => handleInputChange('shipping_last_name', e.target.value)}
                        disabled={true}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                    <input
                      type="text"
                      value={formData.shipping_address_line_1 || ''}
                      onChange={(e) => handleInputChange('shipping_address_line_1', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                    <input
                      type="text"
                      value={formData.shipping_address_line_2 || ''}
                      onChange={(e) => handleInputChange('shipping_address_line_2', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      {isReadOnly ? (
                        <input
                          type="text"
                          value={formData.shipping_city || ''}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                        />
                      ) : (
                        <CityDropdown
                          name="shipping_city"
                          value={formData.shipping_city || ''}
                          onChange={handleShippingCityChange}
                          selectedState={formData.shipping_state || ''}
                          highZIndex={true}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      {isReadOnly ? (
                        <input
                          type="text"
                          value={formData.shipping_state || ''}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                        />
                      ) : (
                        <StateDropdown
                          name="shipping_state"
                          value={formData.shipping_state || ''}
                          onChange={handleShippingStateChange}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                      <input
                        type="text"
                        value={formData.shipping_postal_code || ''}
                        onChange={(e) => handleInputChange('shipping_postal_code', e.target.value)}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </h3>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(orderDetails.order_items || []).length > 0 ? (
                      orderDetails.order_items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              {/* Product Image */}
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                  {item.product_image ? (
                                    <img
                                      src={item.product_image}
                                      alt={item.product_name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const placeholder = target.nextElementSibling as HTMLElement;
                                        if (placeholder) placeholder.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div 
                                    className="w-full h-full flex items-center justify-center text-gray-400"
                                    style={{ display: item.product_image ? 'none' : 'flex' }}
                                  >
                                    <Package size={16} />
                                  </div>
                                </div>
                              </div>
                              
                              {/* Product Name */}
                              <div className="flex-1">
                                <div className="flex flex-col gap-1">
                                  <span className="text-sm text-gray-900">{item.product_name || 'Unknown Product'}</span>
                                  {/* Show variant color for services */}
                                  {item.variant_color && (item.variant_size === 'Service' || item.variant_size === 'Custom') && (
                                    <span className="text-xs font-medium text-gray-600">{item.variant_color}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {item.variant_size === 'Service' || item.variant_size === 'Custom' ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {item.variant_size}
                              </span>
                            ) : (
                              item.variant_size || '-'
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.total_price / item.quantity)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {formatCurrency(item.total_price)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                          No order items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Logistics & Tracking */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">Logistics & Tracking</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Logistics Partner */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logistics Partner
                  </label>
                  <select
                    value={formData.logistics_partner_id || ''}
                    onChange={(e) => handleInputChange('logistics_partner_id', e.target.value)}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Logistics Partner</option>
                    {logisticsPartners.filter(partner => partner.is_active).map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tracking Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={formData.tracking_number || ''}
                    onChange={(e) => handleInputChange('tracking_number', e.target.value)}
                    disabled={isReadOnly}
                    placeholder="Enter tracking/waybill number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Tracking URL */}
              {formData.logistics_partner_id && formData.tracking_number && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Track Package
                  </label>
                  {(() => {
                    const selectedPartner = logisticsPartners.find(p => p.id === formData.logistics_partner_id);
                    if (selectedPartner?.tracking_url_template && formData.tracking_number) {
                      const trackingUrl = selectedPartner.tracking_url_template.replace('{tracking_number}', formData.tracking_number);
                      return (
                        <a
                          href={trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <span>Track Package: {formData.tracking_number}</span>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      );
                    }
                    return (
                      <p className="text-sm text-gray-500">
                        Tracking URL will be available once logistics partner and tracking number are set
                      </p>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Notes</h3>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                disabled={isReadOnly}
                rows={3}
                placeholder="Add notes about this order..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            </div>
          </div>
        ) : (
          <div className="admin-modal-body">
            <div className="text-center">
              <p className="text-red-600">Failed to load order details</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="admin-modal-footer">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
          {!isReadOnly && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default OrderEditModal;
