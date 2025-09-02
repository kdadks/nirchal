import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { upsertCustomerByEmail, createOrderWithItems, updateCustomerProfile } from '@utils/orders';
import { sanitizeAddressData, sanitizeOrderAddress } from '../utils/formUtils';

interface CheckoutForm {
  // Contact Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Delivery Address
  deliveryAddress: string;
  deliveryAddressLine2?: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
  selectedDeliveryAddressId?: string;
  
  // Billing Address
  billingFirstName: string;
  billingLastName: string;
  billingAddress: string;
  billingAddressLine2?: string;
  billingCity: string;
  billingState: string;
  billingPincode: string;
  billingPhone: string;
  selectedBillingAddressId?: string;
  billingIsSameAsDelivery: boolean;
  
  paymentMethod: 'cod' | 'online' | 'upi';
}

interface CustomerAddress {
  id: string;
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
  is_shipping: boolean;
  is_billing: boolean;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { state: { items, total }, clearCart } = useCart();
  const { supabase } = useAuth();
  const { customer } = useCustomerAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep] = useState(1);
  const [form, setForm] = useState<CheckoutForm>({
    // Contact Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Delivery Address
    deliveryAddress: '',
    deliveryAddressLine2: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryPincode: '',
    selectedDeliveryAddressId: '',
    
    // Billing Address
    billingFirstName: '',
    billingLastName: '',
    billingAddress: '',
    billingAddressLine2: '',
    billingCity: '',
    billingState: '',
    billingPincode: '',
    billingPhone: '',
    selectedBillingAddressId: '',
    billingIsSameAsDelivery: true,
    
    paymentMethod: 'cod'
  });

  const [customerAddresses, setCustomerAddresses] = useState<CustomerAddress[]>([]);

  // Load customer addresses if logged in
  useEffect(() => {
    const loadCustomerAddresses = async () => {
      if (!customer?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('customer_addresses')
          .select('*')
          .eq('customer_id', customer.id)
          .order('is_default', { ascending: false });
          
        if (error) throw error;
        
        // Deduplicate addresses - merge duplicates with same address details
        const addressMap = new Map();
        const processedAddresses: CustomerAddress[] = [];
        
        data?.forEach(address => {
          const key = `${address.address_line_1}-${address.city}-${address.state}-${address.postal_code}`;
          
          if (addressMap.has(key)) {
            // Merge with existing - combine is_shipping and is_billing flags
            const existing = addressMap.get(key);
            existing.is_shipping = existing.is_shipping || address.is_shipping;
            existing.is_billing = existing.is_billing || address.is_billing;
            existing.is_default = existing.is_default || address.is_default;
            
            // Keep the one with more complete information
            if (address.address_line_2 && !existing.address_line_2) {
              existing.address_line_2 = address.address_line_2;
            }
            if (address.phone && !existing.phone) {
              existing.phone = address.phone;
            }
          } else {
            addressMap.set(key, { ...address });
          }
        });
        
        // Convert map back to array
        addressMap.forEach(address => processedAddresses.push(address));
        
        setCustomerAddresses(processedAddresses);

        // Clean up actual duplicate addresses in database
        if (data && data.length > processedAddresses.length) {
          await cleanupDuplicateAddresses(data, processedAddresses);
        }
        
        // Auto-select default address if available
        const defaultAddress = processedAddresses.find(addr => addr.is_default);
        if (defaultAddress) {
          setForm(prev => ({
            ...prev,
            selectedDeliveryAddressId: defaultAddress.id,
            deliveryAddress: defaultAddress.address_line_1,
            deliveryAddressLine2: defaultAddress.address_line_2 || '',
            deliveryCity: defaultAddress.city,
            deliveryState: defaultAddress.state,
            deliveryPincode: defaultAddress.postal_code,
          }));
        }

        // Auto-select billing address if available and not same as delivery
        const billingAddress = processedAddresses.find(addr => addr.is_billing);
        if (billingAddress && (!defaultAddress || billingAddress.id !== defaultAddress.id)) {
          setForm(prev => ({
            ...prev,
            billingIsSameAsDelivery: false,
            selectedBillingAddressId: billingAddress.id,
            billingFirstName: billingAddress.first_name,
            billingLastName: billingAddress.last_name,
            billingAddress: billingAddress.address_line_1,
            billingAddressLine2: billingAddress.address_line_2 || '',
            billingCity: billingAddress.city,
            billingState: billingAddress.state,
            billingPincode: billingAddress.postal_code,
            billingPhone: billingAddress.phone || '',
          }));
        } else if (billingAddress && defaultAddress && billingAddress.id === defaultAddress.id) {
          // Same address is both default and billing
          setForm(prev => ({
            ...prev,
            billingIsSameAsDelivery: true,
          }));
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
      }
    };

    loadCustomerAddresses();
  }, [customer?.id]);

  // Prefill from logged-in customer
  useEffect(() => {
    if (customer) {
      setForm(prev => ({
        ...prev,
        firstName: customer.first_name || prev.firstName,
        lastName: customer.last_name || prev.lastName,
        email: customer.email || prev.email,
        phone: customer.phone || prev.phone,
      }));
    }
  }, [customer]);

  // Load default delivery address for logged-in customer
  useEffect(() => {
    const loadDefaultAddress = async () => {
      if (!customer) return;
      try {
        const { data } = await supabase
          .from('customer_addresses')
          .select('first_name, last_name, address_line_1, city, state, postal_code, is_default, is_shipping')
          .eq('customer_id', customer.id)
          .eq('is_shipping', true)
          .order('is_default', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setForm(prev => ({
            ...prev,
            firstName: prev.firstName || data.first_name || '',
            lastName: prev.lastName || data.last_name || '',
            deliveryAddress: data.address_line_1 || prev.deliveryAddress,
            deliveryCity: data.city || prev.deliveryCity,
            deliveryState: data.state || prev.deliveryState,
            deliveryPincode: data.postal_code || prev.deliveryPincode,
          }));
        }
      } catch (err) {
        console.warn('Failed to prefill default address:', err);
      }
    };
    loadDefaultAddress();
  }, [customer, supabase]);

  // Redirect to cart if empty (avoid navigating during render)
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, navigate]);
  if (items.length === 0) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1) If logged in, update their profile (email is read-only)
      let customerId: string | null = customer?.id || null;
      if (customer) {
        await updateCustomerProfile(supabase, {
          id: customer.id,
          first_name: form.firstName.trim() || 'Guest',
          last_name: form.lastName.trim() || 'User',
          phone: form.phone.trim() || undefined,
        });
      } else {
        // Not logged in: upsert by email to create a customer record
        const customerRes = await upsertCustomerByEmail(supabase, {
          email: form.email.trim(),
          first_name: form.firstName.trim() || 'Guest',
          last_name: form.lastName.trim() || 'User',
          phone: form.phone.trim() || undefined,
        });
        customerId = customerRes?.id || null;
        
        // Store temp password info if this is a new customer
        if (customerRes?.tempPassword && !customerRes?.existingCustomer) {
          sessionStorage.setItem('new_customer_temp_password', customerRes.tempPassword);
          sessionStorage.setItem('new_customer_email', form.email.trim());
        }
      }

      // 2) Create/Upsert delivery address with proper flags
      if (customerId) {
        // Save delivery address
        const deliveryAddressData = sanitizeAddressData({
          first_name: form.firstName,
          last_name: form.lastName,
          address_line_1: form.deliveryAddress,
          address_line_2: form.deliveryAddressLine2,
          city: form.deliveryCity,
          state: form.deliveryState,
          postal_code: form.deliveryPincode,
          phone: form.phone,
          country: 'India',
          is_default: true,
        });

        await upsertAddressWithFlags(deliveryAddressData, true, false);

        // Handle billing address
        if (form.billingIsSameAsDelivery) {
          // Mark the same address as billing too
          await upsertAddressWithFlags(deliveryAddressData, true, true);
        } else if (form.billingAddress.trim()) {
          // Save different billing address
          const billingAddressData = sanitizeAddressData({
            first_name: form.billingFirstName,
            last_name: form.billingLastName,
            address_line_1: form.billingAddress,
            address_line_2: form.billingAddressLine2,
            city: form.billingCity,
            state: form.billingState,
            postal_code: form.billingPincode,
            phone: form.billingPhone,
            country: 'India',
            is_default: false,
          });
          await upsertAddressWithFlags(billingAddressData, false, true);
        }
      }

      // 3) Create order with items
      const deliveryCost = total >= 2999 ? 0 : 99;
      const finalTotal = total + deliveryCost;
      
      const billingAddress = sanitizeOrderAddress({
        first_name: form.billingIsSameAsDelivery ? form.firstName : form.billingFirstName,
        last_name: form.billingIsSameAsDelivery ? form.lastName : form.billingLastName,
        address_line_1: form.billingIsSameAsDelivery ? form.deliveryAddress : form.billingAddress,
        address_line_2: form.billingIsSameAsDelivery ? form.deliveryAddressLine2 : form.billingAddressLine2,
        city: form.billingIsSameAsDelivery ? form.deliveryCity : form.billingCity,
        state: form.billingIsSameAsDelivery ? form.deliveryState : form.billingState,
        postal_code: form.billingIsSameAsDelivery ? form.deliveryPincode : form.billingPincode,
        country: 'India',
        phone: form.billingIsSameAsDelivery ? form.phone : form.billingPhone,
        email: form.email,
      });

      const deliveryAddress = sanitizeOrderAddress({
        first_name: form.firstName,
        last_name: form.lastName,
        address_line_1: form.deliveryAddress,
        address_line_2: form.deliveryAddressLine2,
        city: form.deliveryCity,
        state: form.deliveryState,
        postal_code: form.deliveryPincode,
        country: 'India',
        phone: form.phone,
      });

      const order = await createOrderWithItems(supabase, {
        customer_id: customerId,
        payment_method: form.paymentMethod,
        subtotal: total,
        shipping_amount: deliveryCost,
        total_amount: finalTotal,
        billing: billingAddress,
        delivery: deliveryAddress,
        items: items.map(it => ({
          product_id: Number(it.id) || null,
          product_variant_id: it.variantId ? Number(it.variantId) : null,
          product_name: it.name,
          product_sku: undefined,
          unit_price: it.price,
          quantity: it.quantity,
          total_price: it.price * it.quantity,
          variant_size: it.size,
          variant_color: it.color,
        })),
      });
      
      if (!order) {
        throw new Error('Order creation failed - no order returned');
      }
      
      // Save basics for confirmation screen
      if (order?.order_number) sessionStorage.setItem('last_order_number', order.order_number);
      if (form?.email) sessionStorage.setItem('last_order_email', form.email.trim());
      
      navigate('/order-confirmation');
      
      // Clear cart AFTER navigation to avoid redirect race condition
      setTimeout(() => {
        clearCart();
      }, 100);
    } catch (error) {
      console.error('Checkout error details:', error);
      
      // Check if order was actually created despite the error
      const orderNumber = sessionStorage.getItem('last_order_number');
      if (orderNumber) {
        navigate('/order-confirmation');
        return;
      }
      
      toast.error('There was an error processing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'billingIsSameAsDelivery') {
        handleBillingSameAsDelivery(checked);
      } else {
        setForm(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
      
      // If user changes billing address fields, update the existing billing address flag
      if (customer && !form.billingIsSameAsDelivery && 
          ['billingFirstName', 'billingLastName', 'billingAddress', 'billingAddressLine2', 'billingCity', 'billingState', 'billingPincode'].includes(name)) {
        handleBillingAddressChange();
      }
    }
  };

  const handleDeliveryAddressSelect = (addressId: string) => {
    const selectedAddress = customerAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setForm(prev => ({
        ...prev,
        selectedDeliveryAddressId: addressId,
        deliveryAddress: selectedAddress.address_line_1,
        deliveryAddressLine2: selectedAddress.address_line_2 || '',
        deliveryCity: selectedAddress.city,
        deliveryState: selectedAddress.state,
        deliveryPincode: selectedAddress.postal_code,
      }));
    }
  };

  const handleBillingSameAsDelivery = (checked: boolean) => {
    setForm(prev => ({
      ...prev,
      billingIsSameAsDelivery: checked,
      ...(checked ? {
        billingFirstName: prev.firstName,
        billingLastName: prev.lastName,
        billingAddress: prev.deliveryAddress,
        billingAddressLine2: prev.deliveryAddressLine2 || '',
        billingCity: prev.deliveryCity,
        billingState: prev.deliveryState,
        billingPincode: prev.deliveryPincode,
        billingPhone: prev.phone,
        selectedBillingAddressId: prev.selectedDeliveryAddressId,
      } : {})
    }));
  };

  const handleBillingAddressChange = async () => {
    if (!customer?.id) return;
    
    try {
      // Find if there's an existing billing address and remove the billing flag
      const existingBillingAddress = customerAddresses.find(addr => addr.is_billing && !addr.is_shipping);
      if (existingBillingAddress) {
        await supabase
          .from('customer_addresses')
          .update({ is_billing: false })
          .eq('id', existingBillingAddress.id)
          .eq('customer_id', customer.id);
      }
    } catch (error) {
      console.error('Error updating billing address flag:', error);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
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

      // Reload addresses
      setCustomerAddresses(prev => prev.filter(addr => addr.id !== addressId));
      
      // Clear selection if deleted address was selected
      setForm(prev => ({
        ...prev,
        ...(prev.selectedDeliveryAddressId === addressId ? { selectedDeliveryAddressId: '' } : {}),
        ...(prev.selectedBillingAddressId === addressId ? { selectedBillingAddressId: '' } : {})
      }));

      toast.success('Address deleted successfully');
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };

  // Function to find or create address and mark it with appropriate flags
  const upsertAddressWithFlags = async (addressData: any, isDelivery: boolean, isBilling: boolean) => {
    if (!customer?.id) return null;

    try {
      // Sanitize the address data
      const sanitizedAddress = sanitizeAddressData(addressData);
      
      // Find existing address with same details
      const { data: existingAddresses } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', customer.id)
        .eq('address_line_1', sanitizedAddress.address_line_1)
        .eq('city', sanitizedAddress.city)
        .eq('state', sanitizedAddress.state)
        .eq('postal_code', sanitizedAddress.postal_code);

      if (existingAddresses && existingAddresses.length > 0) {
        // Update existing address to add new flags
        const existingAddress = existingAddresses[0];
        const { error } = await supabase
          .from('customer_addresses')
          .update({
            is_shipping: existingAddress.is_shipping || isDelivery,
            is_billing: existingAddress.is_billing || isBilling,
            first_name: sanitizedAddress.first_name,
            last_name: sanitizedAddress.last_name,
            phone: sanitizedAddress.phone,
            is_default: sanitizedAddress.is_default || existingAddress.is_default,
          })
          .eq('id', existingAddress.id);

        if (error) throw error;
        return { id: existingAddress.id };
      } else {
        // Create new address
        const { data, error } = await supabase
          .from('customer_addresses')
          .insert({
            customer_id: customer.id,
            ...sanitizedAddress,
            is_shipping: isDelivery,
            is_billing: isBilling,
          })
          .select('id')
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error upserting address:', error);
      return null;
    }
  };

  // Function to clean up duplicate addresses in database
  const cleanupDuplicateAddresses = async (originalAddresses: CustomerAddress[], cleanedAddresses: CustomerAddress[]) => {
    if (!customer?.id) return;

    try {
      const addressesToKeep = new Set(cleanedAddresses.map(addr => addr.id));
      const addressesToDelete = originalAddresses.filter(addr => !addressesToKeep.has(addr.id));

      if (addressesToDelete.length > 0) {
        // Delete duplicate addresses
        const { error } = await supabase
          .from('customer_addresses')
          .delete()
          .in('id', addressesToDelete.map(addr => addr.id));

        if (error) throw error;
        
        console.log(`Cleaned up ${addressesToDelete.length} duplicate addresses`);
      }
    } catch (error) {
      console.error('Error cleaning up duplicate addresses:', error);
    }
  };

  const deliveryCost = total >= 2999 ? 0 : 99;
  const finalTotal = total + deliveryCost;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero Banner Section */}
      <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Secure Checkout
            </h1>
            <p className="text-xl text-amber-100 max-w-2xl mx-auto">
              Complete your order securely with our trusted checkout process
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back to Cart Link */}
          <div className="mb-8">
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 font-medium transition-colors duration-200"
            >
              <ArrowLeft size={20} />
              Back to Cart
            </Link>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-8 py-6">
              <div className="flex items-center space-x-4">
                {[
                  { step: 1, label: 'Shipping' },
                  { step: 2, label: 'Payment' },
                  { step: 3, label: 'Review' }
                ].map((item, index) => (
                  <React.Fragment key={item.step}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                      currentStep >= item.step
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {item.step}
                    </div>
                    <span className={`text-sm font-medium ${
                      currentStep >= item.step ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {item.label}
                    </span>
                    {index < 2 && (
                      <div className={`w-12 h-0.5 ${
                        currentStep > item.step 
                          ? 'bg-gradient-to-r from-amber-600 to-orange-600' 
                          : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Delivery Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Truck size={20} className="text-amber-600" />
                      Delivery Information
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    {/* Address Cards for Logged-in Users */}
                    {customer && customerAddresses.length > 0 && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Select Delivery Address
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          {customerAddresses.map((address) => (
                            <div
                              key={address.id}
                              onClick={() => handleDeliveryAddressSelect(address.id)}
                              className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                form.selectedDeliveryAddressId === address.id
                                  ? 'border-amber-500 bg-amber-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="text-sm">
                                <div className="font-medium text-gray-900 mb-1">
                                  {address.address_line_1}
                                  {address.address_line_2 && (
                                    <div className="font-normal text-gray-700">
                                      {address.address_line_2}
                                    </div>
                                  )}
                                </div>
                                <div className="text-gray-600 mb-1">
                                  {address.city}, {address.state} {address.postal_code}
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex gap-1">
                                    {/* Tags removed for logged-in users */}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteAddress(address.id);
                                    }}
                                    className="text-xs text-red-600 hover:text-red-800 transition-colors duration-200"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, selectedDeliveryAddressId: '' }))}
                            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                          >
                            + Enter new address
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Address Form Fields - Show when no address selected or entering manually */}
                    {(!customer || customerAddresses.length === 0 || !form.selectedDeliveryAddressId) && (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={form.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={form.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleInputChange}
                          required
                          readOnly={!!customer}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        name="deliveryAddress"
                        value={form.deliveryAddress}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        placeholder="Street address, building number"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        name="deliveryAddressLine2"
                        value={form.deliveryAddressLine2 || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        placeholder="Apartment, suite, unit, etc. (optional)"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="deliveryCity"
                          value={form.deliveryCity}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          name="deliveryState"
                        value={form.deliveryState}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        name="deliveryPincode"
                        value={form.deliveryPincode}
                        onChange={handleInputChange}
                        required
                        pattern="[0-9]{6}"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        placeholder="123456"
                      />
                    </div>
                    </div>
                    </>
                    )}
                  </div>
                </div>

                {/* Billing Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <CreditCard size={20} className="text-amber-600" />
                      Billing Information
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    {/* Billing Same as Delivery Checkbox */}
                    <div className="mb-6">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="billingIsSameAsDelivery"
                          checked={form.billingIsSameAsDelivery}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Billing address is the same as delivery address
                        </span>
                      </label>
                    </div>

                    {/* Billing Address Selection (if not same as delivery) */}
                    {!form.billingIsSameAsDelivery && (
                      <>
                        {/* Billing Address Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              First Name *
                            </label>
                            <input
                              type="text"
                              name="billingFirstName"
                              value={form.billingFirstName}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                              placeholder="Enter first name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Last Name *
                            </label>
                            <input
                              type="text"
                              name="billingLastName"
                              value={form.billingLastName}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                              placeholder="Enter last name"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            name="billingPhone"
                            value={form.billingPhone}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter phone number"
                          />
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address Line 1 *
                          </label>
                          <input
                            type="text"
                            name="billingAddress"
                            value={form.billingAddress}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                            placeholder="Street address, building number"
                          />
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address Line 2
                          </label>
                          <input
                            type="text"
                            name="billingAddressLine2"
                            value={form.billingAddressLine2 || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                            placeholder="Apartment, suite, unit, etc. (optional)"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              City *
                            </label>
                            <input
                              type="text"
                              name="billingCity"
                              value={form.billingCity}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              State *
                            </label>
                            <input
                              type="text"
                              name="billingState"
                              value={form.billingState}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                              placeholder="State"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              PIN Code *
                            </label>
                            <input
                              type="text"
                              name="billingPincode"
                              value={form.billingPincode}
                              onChange={handleInputChange}
                              required
                              pattern="[0-9]{6}"
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                              placeholder="123456"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <CreditCard size={20} className="text-amber-600" />
                      Payment Method
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-4">
                      {[
                        { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive your order', icon: '💵' },
                        { value: 'online', label: 'Credit/Debit Card', desc: 'Secure payment via card', icon: '💳' },
                        { value: 'upi', label: 'UPI Payment', desc: 'Pay using UPI apps', icon: '📱' }
                      ].map((method) => (
                        <label key={method.value} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          form.paymentMethod === method.value
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={form.paymentMethod === method.value}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500 focus:ring-2"
                        />
                        <div className="ml-4 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{method.icon}</span>
                            <span className="font-medium text-gray-900">{method.label}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${
                    isSubmitting
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-200 border-t-transparent rounded-full animate-spin" />
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Place Order - ₹{finalTotal.toLocaleString()}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 sticky top-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ShoppingBag size={24} className="text-amber-600" />
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.variantId}`} className="flex gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                          {item.name}
                        </h3>
                        <div className="flex gap-2 text-xs text-gray-600 mt-1">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                          <span className="font-semibold text-gray-900">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className={deliveryCost === 0 ? 'text-green-600 font-medium' : ''}>
                      {deliveryCost === 0 ? 'Free' : `₹${deliveryCost}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-amber-600">₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Security Features */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-green-700 bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200">
                    <Shield size={16} />
                    <span className="font-medium">Secure 256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <Truck size={16} />
                    <span className="font-medium">Free shipping on orders above ₹2,999</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;