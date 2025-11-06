import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle, ShoppingBag, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { upsertCustomerByEmail, createOrderWithItems, updateCustomerProfile, markWelcomeEmailSent } from '@utils/orders';
import { sanitizeAddressData, sanitizeOrderAddress } from '../utils/formUtils';
import { transactionalEmailService } from '../services/transactionalEmailService';
import { useRazorpay } from '../hooks/useRazorpay';
import PaymentSecurityWrapper from '../components/security/PaymentSecurityWrapper';
import SecurePaymentForm from '../components/security/SecurePaymentForm';
import StateDropdown from '../components/common/StateDropdown';
import CityDropdown from '../components/common/CityDropdown';
import { SecurityUtils } from '../utils/securityUtils';
import SEO from '../components/SEO';
import { trackBeginCheckout, trackPurchase } from '../utils/analytics';
import { markCheckoutStarted, markCheckoutCompleted } from '../hooks/useCartAbandonment';
import { trackInitiateCheckout, trackPurchase as trackMetaPurchase } from '../utils/metaPixel';

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
  
  // Shipping Method
  shippingMethod: 'standard' | 'express';
  
  paymentMethod: 'razorpay';
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
  const { isLoaded: isRazorpayLoaded, createOrder: createRazorpayOrder, openCheckout: openRazorpayCheckout, verifyPayment: verifyRazorpayPayment } = useRazorpay();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderProcessing, setIsOrderProcessing] = useState(false);
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
    
    // Shipping Method
    shippingMethod: 'standard', // Default to free standard delivery
    
    paymentMethod: 'razorpay'
  });

  const [customerAddresses, setCustomerAddresses] = useState<CustomerAddress[]>([]);
  const [paymentSplit, setPaymentSplit] = useState<'full' | 'split'>('full'); // full = pay all now, split = products now + services COD

  // Calculate product and service totals separately
  const calculatePaymentSplit = () => {
    let productTotal = 0;
    let serviceTotal = 0;

    items.forEach(item => {
      const itemTotal = item.price * item.quantity;
      // Check if item is a service (size is 'Service' or 'Custom')
      if (item.size === 'Service' || item.size === 'Custom') {
        serviceTotal += itemTotal;
      } else {
        productTotal += itemTotal;
      }
    });

    return { productTotal, serviceTotal };
  };

  const { productTotal, serviceTotal } = calculatePaymentSplit();
  const hasServices = serviceTotal > 0;
  const hasProducts = productTotal > 0;

  // Load customer addresses if logged in
  useEffect(() => {
    // Mark checkout as started to prevent abandoned cart tracking
    markCheckoutStarted();
    
    // Track begin checkout event in GA4
    if (items.length > 0) {
      trackBeginCheckout(
        items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          item_category: item.category,
          item_variant: item.size && item.color ? `${item.size}-${item.color}` : item.size || item.color,
          price: item.price,
          quantity: item.quantity,
        })),
        total
      );
      
      // Track initiate checkout event in Meta Pixel
      trackInitiateCheckout({
        content_ids: items.map(item => item.id),
        contents: items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          item_price: item.price
        })),
        num_items: items.reduce((sum, item) => sum + item.quantity, 0),
        value: total,
        currency: 'INR'
      });
    }
    
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
            if (address.first_name && !existing.first_name) {
              existing.first_name = address.first_name;
            }
            if (address.last_name && !existing.last_name) {
              existing.last_name = address.last_name;
            }
          } else {
            addressMap.set(key, { ...address });
          }
        });
        
        // Convert map back to array - limit to only 1 delivery address to prevent confusion
        addressMap.forEach(address => processedAddresses.push(address));
        
        // Sort addresses: default first, then by ID (latest first)
        processedAddresses.sort((a, b) => {
          if (a.is_default && !b.is_default) return -1;
          if (!a.is_default && b.is_default) return 1;
          return b.id.localeCompare(a.id); // Sort by ID as fallback
        });
        
        setCustomerAddresses(processedAddresses);

        // Warn about duplicate addresses but don't auto-delete
        if (data && data.length > processedAddresses.length) {
          const duplicateCount = data.length - processedAddresses.length;
          console.warn(`⚠️ Found ${duplicateCount} duplicate address(es) in database. Please review your saved addresses.`);
        }
        
        // Auto-select default address if available
        const defaultAddress = processedAddresses.find(addr => addr.is_default) || processedAddresses[0];
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

        // Check if customer has a billing address and auto-select billing checkbox accordingly
        const hasBillingAddress = processedAddresses.some(addr => addr.is_billing);
        const billingAddress = processedAddresses.find(addr => addr.is_billing);
        
        if (hasBillingAddress && billingAddress) {
          // If billing address is the same as default/delivery address, check the "same as delivery" box
          if (defaultAddress && billingAddress.id === defaultAddress.id) {
            setForm(prev => ({
              ...prev,
              billingIsSameAsDelivery: true,
            }));
          } else {
            // Different billing address - uncheck "same as delivery" and populate billing fields
            setForm(prev => ({
              ...prev,
              billingIsSameAsDelivery: false,
              selectedBillingAddressId: billingAddress.id,
              billingFirstName: billingAddress.first_name || '',
              billingLastName: billingAddress.last_name || '',
              billingAddress: billingAddress.address_line_1,
              billingAddressLine2: billingAddress.address_line_2 || '',
              billingCity: billingAddress.city,
              billingState: billingAddress.state,
              billingPincode: billingAddress.postal_code,
              billingPhone: billingAddress.phone || '',
            }));
          }
        } else {
          // No billing address saved - default to "same as delivery"
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

  // Handle sticky sidebar positioning
  useEffect(() => {
    const sidebar = document.getElementById('order-summary-sidebar');
    const placeOrderBtn = document.getElementById('place-order-button-top');
    if (!sidebar || !placeOrderBtn) return;

    let initialTop = 0;
    let isInitialized = false;

    const handleScroll = () => {
      // Calculate initial position on first scroll or if not yet set
      if (!isInitialized && sidebar && placeOrderBtn) {
        // Reset styles first to get natural position
        placeOrderBtn.style.position = 'relative';
        placeOrderBtn.style.top = '0';
        sidebar.style.position = 'relative';
        sidebar.style.top = '0';
        
        const sidebarRect = sidebar.getBoundingClientRect();
        initialTop = sidebarRect.top + window.pageYOffset;
        isInitialized = true;
      }

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Get actual header height dynamically
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 100;
      const stickyTop = headerHeight + 16; // Header + margin
      
      // Calculate when to start sticking - when sidebar would go under header
      const shouldStick = scrollTop > (initialTop - stickyTop);
      
      if (shouldStick && window.innerWidth >= 1024) { // Only on lg screens
        const parentWidth = sidebar.parentElement?.offsetWidth || 0;
        
        // Make place order button fixed at the top
        placeOrderBtn.style.position = 'fixed';
        placeOrderBtn.style.top = stickyTop + 'px';
        placeOrderBtn.style.width = parentWidth + 'px';
        placeOrderBtn.style.zIndex = '999';
        placeOrderBtn.style.display = 'block';
        
        // Make sidebar fixed below the button
        const btnHeight = placeOrderBtn.offsetHeight;
        sidebar.style.position = 'fixed';
        sidebar.style.top = (stickyTop + btnHeight + 16) + 'px'; // Button + gap
        sidebar.style.width = parentWidth + 'px';
        sidebar.style.maxHeight = `calc(100vh - ${stickyTop + btnHeight + 32}px)`;
      } else {
        // Reset to normal flow
        placeOrderBtn.style.position = 'relative';
        placeOrderBtn.style.top = '0';
        placeOrderBtn.style.width = 'auto';
        placeOrderBtn.style.zIndex = 'auto';
        placeOrderBtn.style.display = 'block';
        
        sidebar.style.position = 'relative';
        sidebar.style.top = '0';
        sidebar.style.width = 'auto';
        sidebar.style.maxHeight = 'none';
      }
    };

    // Initial call
    const initTimer = setTimeout(() => {
      handleScroll();
    }, 200);

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', () => {
      isInitialized = false; // Recalculate on resize
      handleScroll();
    });

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

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
    
    // Validate form before proceeding
    const formElement = e.target as HTMLFormElement;
    if (!formElement.checkValidity()) {
      formElement.reportValidity();
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(true);

    try {
      // 1) If logged in, update their profile (email is read-only)
      let customerId: string | null = customer?.id || null;
      let shouldSendWelcomeEmail = false;
      let tempPassword: string | null = null;
      
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
        
        // Determine if we should send welcome email
        shouldSendWelcomeEmail = customerRes?.needsWelcomeEmail || false;
        tempPassword = customerRes?.tempPassword || null;
        

        
        // Store temp password info if this is a new customer with temp password
        if (tempPassword && !customerRes?.existingCustomer) {
          sessionStorage.setItem('new_customer_temp_password', tempPassword);
          sessionStorage.setItem('new_customer_email', form.email.trim());
        }
      }

      // 2) Create/Upsert delivery address with proper flags
      if (customerId) {
        try {
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

          // Determine if same address is used for both shipping and billing
          const isBothShippingAndBilling = form.billingIsSameAsDelivery;
          
          // Save delivery address with correct flags in ONE call
          await upsertAddressWithFlags(deliveryAddressData, true, isBothShippingAndBilling);

          // Handle separate billing address if provided
          if (!form.billingIsSameAsDelivery && form.billingAddress.trim()) {
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
        } catch (addressError: any) {
          console.error('Error saving addresses:', {
            message: addressError?.message || 'Unknown error',
            code: addressError?.code,
            details: addressError?.details,
            hint: addressError?.hint,
            fullError: addressError
          });
          // Don't throw - continue with order creation
          toast.error('Address saving failed, but order will continue');
        }
      }

      // 3) Create order with items
      // Calculate shipping cost based on method selected
      const expressDeliveryFee = form.shippingMethod === 'express' ? 250 : 0;
      const deliveryCountry = form.deliveryAddress ? 'India' : 'India'; // Will be updated when country selection is added
      const deliveryCost = deliveryCountry === 'India' ? expressDeliveryFee : expressDeliveryFee; // International shipping will be calculated later
      // Calculate payment amounts based on split choice
      const { productTotal, serviceTotal } = calculatePaymentSplit();
      const isPaymentSplit = paymentSplit === 'split' && serviceTotal > 0;
      const upfrontPaymentAmount = isPaymentSplit ? productTotal : total;
      const codPaymentAmount = isPaymentSplit ? serviceTotal : 0;
      const finalTotal = upfrontPaymentAmount + deliveryCost;
      
      // Create payment note to track split payment
      const paymentNote = isPaymentSplit
        ? `Split Payment: Products ₹${productTotal} (Paid Online) + Services ₹${serviceTotal} (COD)`
        : 'Full Payment Online';
      
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

      console.log('[Checkout] Cart items before order creation:', items);
      console.log('[Checkout] Mapped order items:', items.map(it => ({
        product_id: it.id,
        product_variant_id: it.variantId,
        product_name: it.name,
        variant_size: it.size,
        variant_color: it.color,
        isService: it.size === 'Service' || it.size === 'Custom' || it.id.startsWith('faal-pico-') || it.id.startsWith('custom-blouse-') || it.id.startsWith('stitching-')
      })));

      const order = await createOrderWithItems(supabase, {
        customer_id: customerId,
        payment_method: form.paymentMethod,
        subtotal: total,
        shipping_amount: deliveryCost,
        shipping_method: form.shippingMethod,
        express_delivery_fee: expressDeliveryFee,
        total_amount: finalTotal + codPaymentAmount, // Total includes both online and COD amounts
        billing: billingAddress,
        delivery: deliveryAddress,
        items: items.map(it => {
          // Check if this is a service item (no product_id)
          const isService = it.size === 'Service' || it.size === 'Custom' || 
                           it.id.startsWith('faal-pico-') || 
                           it.id.startsWith('custom-blouse-') || 
                           it.id.startsWith('stitching-');
          
          return {
            product_id: isService ? null : it.id, // Services don't have product_id
            product_variant_id: isService ? null : (it.variantId ? it.variantId : null),
            product_name: it.name,
            product_sku: undefined,
            unit_price: it.price,
            quantity: it.quantity,
            total_price: it.price * it.quantity,
            variant_size: it.size,
            variant_color: it.color,
          };
        }),
        // Split payment data
        cod_amount: codPaymentAmount,
        cod_collected: false,
        online_amount: finalTotal,
        payment_split: isPaymentSplit,
      });
      
      if (!order) {
        throw new Error('Order creation failed - no order returned');
      }

      // 4) Handle Razorpay payment if selected
      if (form.paymentMethod === 'razorpay') {
        if (!isRazorpayLoaded) {
          throw new Error('Razorpay is not loaded. Please try again.');
        }

        try {
          // Show processing toast
          toast('💳 Initializing secure payment...', {
            duration: 3000,
          });
          
          // Create Razorpay order
          const razorpayOrderData = await createRazorpayOrder({
            amount: finalTotal,
            currency: 'INR',
            receipt: order.order_number,
            customer_email: form.email,
            customer_phone: form.phone,
            notes: {
              order_id: order.id.toString(),
              customer_name: `${form.firstName} ${form.lastName}`,
              payment_split: isPaymentSplit ? 'yes' : 'no',
              online_amount: finalTotal.toString(),
              cod_amount: codPaymentAmount.toString(),
              payment_note: paymentNote
            }
          });

          // 🔥 CRITICAL: Save razorpay_order_id immediately so webhook can find the order
          const { error: updateOrderError } = await supabase
            .from('orders')
            .update({ 
              razorpay_order_id: razorpayOrderData.order.id 
            })
            .eq('id', order.id);

          if (updateOrderError) {
            console.error('Failed to update order with razorpay_order_id:', updateOrderError);
            throw new Error('Failed to link payment order. Please try again.');
          }

          console.log('✅ Saved razorpay_order_id to database:', {
            order_id: order.id,
            razorpay_order_id: razorpayOrderData.order.id
          });

          // Open Razorpay checkout
          openRazorpayCheckout({
            key: razorpayOrderData.checkout_config.key,
            amount: razorpayOrderData.checkout_config.amount,
            currency: razorpayOrderData.checkout_config.currency,
            name: razorpayOrderData.checkout_config.name,
            description: razorpayOrderData.checkout_config.description,
            order_id: razorpayOrderData.order.id,
            image: razorpayOrderData.checkout_config.image,
            prefill: {
              name: `${form.firstName} ${form.lastName}`,
              email: form.email,
              contact: form.phone
            },
            theme: razorpayOrderData.checkout_config.theme,
            handler: async (response) => {
              try {
                // Verify payment
                const verificationResult = await verifyRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  order_id: order.id.toString()
                });

                if (verificationResult.verified) {
                  // 🎉 Payment successful toast
                  toast.success('💳 Payment successful! Processing your order...', {
                    duration: 4000,
                  });
                  
                  // Payment successful - send payment success email first
                  try {
                    await transactionalEmailService.sendPaymentSuccessEmail({
                      customer_name: `${form.firstName} ${form.lastName}`,
                      customer_email: form.email,
                      order_number: order.order_number,
                      amount: finalTotal,
                      payment_id: response.razorpay_payment_id
                    });

                  } catch (emailError) {
                    console.error('Failed to send payment success email:', emailError);
                  }
                  
                  // Payment successful - proceed with post-order actions
                  await handleSuccessfulOrder(order, shouldSendWelcomeEmail, tempPassword, customerId, finalTotal, codPaymentAmount, isPaymentSplit);
                } else {
                  // Check if this is a duplicate payment attempt
                  if (verificationResult.duplicate_payment || verificationResult.duplicate_payment_id) {
                    console.warn('🚫 Duplicate payment detected:', verificationResult);
                    
                    if (verificationResult.duplicate_payment) {
                      // Order already paid - redirect to confirmation
                      toast.success('✅ This order has already been paid successfully!', {
                        duration: 5000,
                      });
                      await handleSuccessfulOrder(order, shouldSendWelcomeEmail, tempPassword, customerId, finalTotal, codPaymentAmount, isPaymentSplit);
                      return;
                    }
                    
                    if (verificationResult.duplicate_payment_id) {
                      // Payment ID already used
                      toast.error('⚠️ This payment has already been processed. Please contact support if you were charged multiple times.', {
                        duration: 6000,
                      });
                      setIsSubmitting(false);
                      return;
                    }
                  }
                  
                  throw new Error(verificationResult.error || 'Payment verification failed');
                }
              } catch (paymentError) {
                console.error('Payment verification error:', paymentError);
                
                // Parse error response for duplicate payment handling
                let errorMessage = paymentError instanceof Error ? paymentError.message : 'Payment verification failed';
                let isDuplicatePayment = false;
                
                try {
                  if (paymentError instanceof Error && paymentError.message.includes('duplicate_payment')) {
                    isDuplicatePayment = true;
                    errorMessage = 'This order has already been paid. No additional payment is required.';
                  }
                } catch (parseError) {
                  // Continue with original error handling
                }
                
                if (isDuplicatePayment) {
                  toast.success('✅ Order already paid successfully!', {
                    duration: 4000,
                  });
                  // Redirect to confirmation for already paid orders
                  await handleSuccessfulOrder(order, shouldSendWelcomeEmail, tempPassword, customerId, finalTotal, codPaymentAmount, isPaymentSplit);
                  return;
                }
                
                // Send payment failure email for actual failures
                try {
                  await transactionalEmailService.sendPaymentFailureEmail({
                    customer_name: `${form.firstName} ${form.lastName}`,
                    customer_email: form.email,
                    order_number: order.order_number,
                    amount: finalTotal,
                    error_reason: errorMessage
                  });

                } catch (emailError) {
                  console.error('Failed to send payment failure email:', emailError);
                }
                
                toast.error('❌ Payment verification failed. Please contact support.', {
                  duration: 6000,
                });
                setIsSubmitting(false);
              }
            },
            modal: {
              ondismiss: async () => {
                console.log('💳 Razorpay modal dismissed - handling order completion');
                
                // Send payment failure email for cancelled payments
                try {
                  await transactionalEmailService.sendPaymentFailureEmail({
                    customer_name: `${form.firstName} ${form.lastName}`,
                    customer_email: form.email,
                    order_number: order.order_number,
                    amount: finalTotal,
                    error_reason: 'Payment cancelled by user'
                  });
                } catch (emailError) {
                  console.error('Failed to send payment cancellation email:', emailError);
                }
                
                // Save order details for confirmation page
                if (order?.order_number) {
                  sessionStorage.setItem('last_order_number', order.order_number);
                  sessionStorage.setItem('payment_status', 'pending');
                  
                  // Save payment split information
                  const { serviceTotal: svcTotal } = calculatePaymentSplit();
                  const isSplitPayment = paymentSplit === 'split' && svcTotal > 0;
                  
                  if (isSplitPayment && svcTotal > 0) {
                    sessionStorage.setItem('cod_amount', svcTotal.toString());
                    sessionStorage.setItem('payment_split', 'true');
                    sessionStorage.setItem('online_paid_amount', finalTotal.toString());
                  }
                }
                
                if (form?.email) {
                  sessionStorage.setItem('last_order_email', form.email.trim());
                }
                
                // Clear cart
                try {
                  await markCheckoutCompleted(customer?.id); // Mark checkout as complete and update abandoned carts
                  clearCart();
                  localStorage.removeItem('cart');
                } catch (cartError) {
                  console.error('Failed to clear cart:', cartError);
                }
                
                // Show informative toast
                toast('💳 Payment pending. Please complete payment from your account.', {
                  duration: 5000,
                  icon: '⚠️'
                });
                
                // Navigate to order confirmation with pending status
                window.location.href = '/order-confirmation';
              }
            }
          });

          // Don't proceed to confirmation page here - wait for payment handler
          return;

        } catch (razorpayError) {
          console.error('Razorpay error:', razorpayError);
          
          // Send payment failure email for Razorpay initialization errors
          try {
            await transactionalEmailService.sendPaymentFailureEmail({
              customer_name: `${form.firstName} ${form.lastName}`,
              customer_email: form.email,
              order_number: order.order_number,
              amount: finalTotal,
              error_reason: razorpayError instanceof Error ? razorpayError.message : 'Payment initialization failed'
            });

          } catch (emailError) {
            console.error('Failed to send payment initialization failure email:', emailError);
          }
          
          toast.error('⚠️ Payment initialization failed. Please try again.', {
            duration: 5000,
          });
          throw razorpayError;
        }
      } else {
        // For non-Razorpay payments (COD, etc.), proceed as usual
        await handleSuccessfulOrder(order, shouldSendWelcomeEmail, tempPassword, customerId, finalTotal, codPaymentAmount, isPaymentSplit);
      }
      
    } catch (error) {
      console.error('Checkout error details:', error);
      
      // Check if order was actually created despite the error
      const orderNumber = sessionStorage.getItem('last_order_number');
      if (orderNumber) {
        window.location.href = '/order-confirmation';
        return;
      }
      
      toast.error('❌ There was an error processing your order. Please try again.', {
        duration: 5000,
      });
    } finally {
      if (form.paymentMethod !== 'razorpay') {
        setIsSubmitting(false);
      }
      // For Razorpay, isSubmitting will be set to false in the payment handler or modal dismiss
    }
  };

  // Extracted function for handling successful orders
  const handleSuccessfulOrder = async (
    order: any, 
    shouldSendWelcomeEmail: boolean, 
    tempPassword: string | null, 
    customerId: string | null, 
    finalTotal: number,
    codAmount: number = 0,
    isPaymentSplit: boolean = false
  ) => {
    // Immediately show processing state to prevent cart page flash
    setIsOrderProcessing(true);
    
    // Track purchase in Google Analytics
    try {
      trackPurchase(
        order.order_number,
        items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          item_category: item.category || 'Ethnic Wear',
          item_variant: item.size && item.color ? `${item.size}-${item.color}` : item.size || item.color,
          price: item.price,
          quantity: item.quantity,
        })),
        finalTotal,
        0, // tax
        0  // shipping
      );
    } catch (analyticsError) {
      console.error('Failed to track purchase in GA4:', analyticsError);
    }
    
    // Track purchase in Meta Pixel
    try {
      trackMetaPurchase({
        content_ids: items.map(item => item.id),
        contents: items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          item_price: item.price
        })),
        content_type: 'product',
        value: finalTotal,
        currency: 'INR',
        num_items: items.reduce((sum, item) => sum + item.quantity, 0)
      });
    } catch (metaError) {
      console.error('Failed to track purchase in Meta Pixel:', metaError);
    }
    
    // Handle welcome email for customers who need it
    if (shouldSendWelcomeEmail && customerId) {
      // Send welcome email (with temp password if available)
      try {
        await transactionalEmailService.sendWelcomeEmail({
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          temp_password: tempPassword ? SecurityUtils.decryptTempData(tempPassword) : undefined // Decrypt temp password for email
        });

        
        // Mark welcome email as sent in database
        if (customerId) {
          await markWelcomeEmailSent(supabase, customerId);
        }
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't block the checkout process if email fails
      }
    }
    
    // ALWAYS send order received email for successful orders (not confirmation yet)
    // For customers with temp password: Send after 30 seconds delay
    // For all other customers: Send immediately
    const sendOrderReceived = async () => {
      try {
        await transactionalEmailService.sendOrderReceivedEmail({
          id: order.id.toString(),
          order_number: order.order_number,
          customer_name: `${form.firstName} ${form.lastName}`,
          customer_email: form.email,
          total_amount: finalTotal,
          status: 'received',
          items: items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: (item.price * item.quantity).toFixed(2),
            size: item.size,
            color: item.color,
            image: item.image
          })),
          cod_amount: codAmount,
          payment_split: isPaymentSplit,
          online_amount: finalTotal
        });

      } catch (emailError) {
        console.error('Failed to send order received email:', emailError);
      }
    };

    // Send order notification to support team
    const sendOrderNotification = async () => {
      try {
        await transactionalEmailService.sendOrderNotificationToSupport({
          order_number: order.order_number,
          customer_name: `${form.firstName} ${form.lastName}`,
          customer_email: form.email,
          total_amount: finalTotal,
          items_count: items.length,
          payment_method: form.paymentMethod
        });

      } catch (emailError) {
        console.error('Failed to send order notification to support:', emailError);
      }
    };
    
    if (tempPassword && shouldSendWelcomeEmail) {
      // New customer with temp password: Send order received email after 30 seconds delay

      setTimeout(sendOrderReceived, 30000);
    } else {
      // All other cases: Send order received email immediately

      await sendOrderReceived();
    }

    // Send order notification to support team (always immediate)
    await sendOrderNotification();
    
    // Save basics for confirmation screen

    
    if (order?.order_number) {
      sessionStorage.setItem('last_order_number', order.order_number);
      
      // Save payment split information for confirmation page
      const { serviceTotal: svcTotal } = calculatePaymentSplit();
      const isSplitPayment = paymentSplit === 'split' && svcTotal > 0;
      
      if (isSplitPayment && svcTotal > 0) {
        sessionStorage.setItem('cod_amount', svcTotal.toString());
        sessionStorage.setItem('payment_split', 'true');
        sessionStorage.setItem('online_paid_amount', finalTotal.toString());
      } else {
        sessionStorage.removeItem('cod_amount');
        sessionStorage.removeItem('payment_split');
        sessionStorage.removeItem('online_paid_amount');
      }

    } else {
      console.error('No order number to save!', order);
    }
    
    if (form?.email) {
      sessionStorage.setItem('last_order_email', form.email.trim());

    }
    
    // Verify the values were saved


    // Navigate to order confirmation page
    // Using window.location.href for reliable navigation in production
    try {
      await markCheckoutCompleted(customer?.id); // Mark checkout as complete and update abandoned carts
      clearCart();
      localStorage.removeItem('cart');
    } catch (cartError) {
      console.error('CheckoutPage: Failed to clear cart after order placement', cartError);
    }

    window.location.href = '/order-confirmation';
    setIsSubmitting(false);
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

  const handleDeliveryStateChange = (value: string) => {
    setForm(prev => ({ ...prev, deliveryState: value, deliveryCity: '' }));
  };

  const handleBillingStateChange = (value: string) => {
    setForm(prev => ({ ...prev, billingState: value, billingCity: '' }));
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

  const handleBillingAddressSelect = (addressId: string) => {
    const selectedAddress = customerAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setForm(prev => ({
        ...prev,
        selectedBillingAddressId: addressId,
        billingFirstName: selectedAddress.first_name || '',
        billingLastName: selectedAddress.last_name || '',
        billingAddress: selectedAddress.address_line_1,
        billingAddressLine2: selectedAddress.address_line_2 || '',
        billingCity: selectedAddress.city,
        billingState: selectedAddress.state,
        billingPincode: selectedAddress.postal_code,
        billingPhone: selectedAddress.phone || '',
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

  // City dropdown handlers
  const handleDeliveryCityChange = (value: string) => {
    setForm(prev => ({ ...prev, deliveryCity: value }));
  };

  const handleBillingCityChange = (value: string) => {
    setForm(prev => ({ ...prev, billingCity: value }));
  };

  // Note: Address management (add/edit/delete) is handled in customer dashboard, not in checkout

  // Function to find or create address and mark it with appropriate flags
  const upsertAddressWithFlags = async (addressData: any, isDelivery: boolean, isBilling: boolean) => {
    if (!customer?.id) return null;

    try {
      // Sanitize the address data
      const sanitizedAddress = sanitizeAddressData(addressData);
      
      // Find existing address with same details
      const { data: existingAddresses, error: selectError } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', customer.id)
        .eq('address_line_1', sanitizedAddress.address_line_1)
        .eq('city', sanitizedAddress.city)
        .eq('state', sanitizedAddress.state)
        .eq('postal_code', sanitizedAddress.postal_code);

      if (selectError) throw selectError;

      if (existingAddresses && existingAddresses.length > 0) {
        // Update existing address to add new flags
        const existingAddress = existingAddresses[0];
        console.log(`✅ Found existing address (ID: ${existingAddress.id}), updating flags:`, {
          current: { is_shipping: existingAddress.is_shipping, is_billing: existingAddress.is_billing, is_default: existingAddress.is_default },
          new: { is_shipping: existingAddress.is_shipping || isDelivery, is_billing: existingAddress.is_billing || isBilling, is_default: sanitizedAddress.is_default || existingAddress.is_default }
        });
        
        // If setting this address as default, first remove default from other addresses
        const shouldBeDefault = sanitizedAddress.is_default || existingAddress.is_default;
        if (shouldBeDefault && !existingAddress.is_default) {
          console.log('🔄 Removing default flag from other addresses before updating');
          await supabase
            .from('customer_addresses')
            .update({ is_default: false })
            .eq('customer_id', customer.id)
            .eq('is_default', true)
            .neq('id', existingAddress.id); // Don't update the current address
        }
        
        const { error: updateError } = await supabase
          .from('customer_addresses')
          .update({
            is_shipping: existingAddress.is_shipping || isDelivery,
            is_billing: existingAddress.is_billing || isBilling,
            first_name: sanitizedAddress.first_name,
            last_name: sanitizedAddress.last_name,
            phone: sanitizedAddress.phone,
            is_default: shouldBeDefault,
          })
          .eq('id', existingAddress.id);

        if (updateError) throw updateError;
        console.log(`✅ Successfully updated address ID: ${existingAddress.id}`);
        return { id: existingAddress.id };
      } else {
        console.log('📝 No existing address found, creating new one:', {
          address: sanitizedAddress.address_line_1,
          city: sanitizedAddress.city,
          is_shipping: isDelivery,
          is_billing: isBilling
        });
        // Create new address
        // If this address should be default, first remove default flag from other addresses
        if (sanitizedAddress.is_default) {
          await supabase
            .from('customer_addresses')
            .update({ is_default: false })
            .eq('customer_id', customer.id)
            .eq('is_default', true);
        }
        
        const { data, error: insertError } = await supabase
          .from('customer_addresses')
          .insert({
            customer_id: customer.id,
            ...sanitizedAddress,
            is_shipping: isDelivery,
            is_billing: isBilling,
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        return data;
      }
    } catch (error: any) {
      console.error('Error upserting address:', {
        message: error?.message || 'Unknown error',
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        fullError: error
      });
      throw error;
    }
  };

  // Calculate shipping cost based on selected method
  const expressDeliveryFee = form.shippingMethod === 'express' ? 250 : 0;
  const deliveryCost = expressDeliveryFee; // Standard is free, Express is ₹250
  
  // Calculate final total based on payment split choice
  const upfrontAmount = paymentSplit === 'split' && hasServices ? productTotal : total;
  const codAmount = paymentSplit === 'split' && hasServices ? serviceTotal : 0;
  const finalTotal = upfrontAmount + deliveryCost;

  return (
    <PaymentSecurityWrapper>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative">
        {/* SEO - noindex for checkout page */}
        <SEO
          title="Checkout"
          description="Complete your purchase"
          noindex={true}
          nofollow={true}
        />
        
        {/* Order Processing Overlay - positioned to cover only main content area */}
        {isOrderProcessing && (
          <div className="absolute inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
              <p className="text-gray-600 mb-4">Processing your order details...</p>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 sm:px-8 py-4 sm:py-6 w-full max-w-md sm:max-w-none">
              <div className="flex items-center justify-between sm:justify-center sm:space-x-4">
                {[
                  { step: 1, label: 'Shipping' },
                  { step: 2, label: 'Payment' },
                  { step: 3, label: 'Review' }
                ].map((item, index) => (
                  <React.Fragment key={item.step}>
                    <div className="flex flex-col sm:flex-row items-center sm:space-x-2">
                      <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full font-semibold text-sm ${
                        currentStep >= item.step
                          ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {item.step}
                      </div>
                      <span className={`text-xs sm:text-sm font-medium mt-1 sm:mt-0 ${
                        currentStep >= item.step ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                    {index < 2 && (
                      <div className={`hidden sm:block w-12 h-0.5 ${
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
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Delivery Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Truck size={20} className="text-amber-600" />
                      Delivery Information
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    {/* Address Cards for Logged-in Users - Show all shipping addresses */}
                    {customer && customerAddresses.length > 0 && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Select Delivery Address
                        </label>
                        
                        {/* Show all addresses marked as shipping */}
                        <div className="space-y-3 mb-4">
                          {customerAddresses
                            .filter(addr => addr.is_shipping || addr.is_default)
                            .map(address => (
                              <div
                                key={address.id}
                                onClick={() => handleDeliveryAddressSelect(address.id)}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                  form.selectedDeliveryAddressId === address.id
                                    ? 'border-amber-500 bg-amber-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="text-sm">
                                  <div className="font-medium text-gray-900 mb-1">
                                    {address.first_name} {address.last_name}
                                  </div>
                                  <div className="text-gray-700 mb-1">
                                    {address.address_line_1}
                                    {address.address_line_2 && (
                                      <div className="text-gray-600">
                                        {address.address_line_2}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-gray-600 mb-1">
                                    {address.city}, {address.state} {address.postal_code}
                                  </div>
                                  {address.phone && (
                                    <div className="text-gray-600 text-xs mb-2">
                                      Phone: {address.phone}
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs">
                                      {address.is_default && (
                                        <span className="text-green-600">✓ Default</span>
                                      )}
                                      {address.is_shipping && (
                                        <span className="text-blue-600">📦 Shipping</span>
                                      )}
                                    </div>
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
                            + Use different address
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
                          State *
                        </label>
                        <StateDropdown
                          name="deliveryState"
                          value={form.deliveryState}
                          onChange={handleDeliveryStateChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                          placeholder="Select State"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <CityDropdown
                          name="deliveryCity"
                          value={form.deliveryCity}
                          onChange={handleDeliveryCityChange}
                          selectedState={form.deliveryState}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                          placeholder="Select City"
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

                {/* Shipping Method Selection */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Package size={18} className="text-amber-600" />
                      Delivery Speed
                    </h2>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {/* Standard Delivery */}
                    <label className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      form.shippingMethod === 'standard' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="standard"
                        checked={form.shippingMethod === 'standard'}
                        onChange={(e) => setForm({...form, shippingMethod: e.target.value as 'standard' | 'express'})}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <div className="ml-3 flex-1 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 text-sm">Standard</span>
                            <span className="bg-green-600 text-white px-1.5 py-0.5 rounded text-xs font-semibold">FREE</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">3-7 business days</p>
                        </div>
                        <span className="text-base font-bold text-green-600">₹0</span>
                      </div>
                    </label>

                    {/* Express Delivery */}
                    <label className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      form.shippingMethod === 'express' 
                        ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-amber-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="express"
                        checked={form.shippingMethod === 'express'}
                        onChange={(e) => setForm({...form, shippingMethod: e.target.value as 'standard' | 'express'})}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                      />
                      <div className="ml-3 flex-1 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 text-sm">Express</span>
                            <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-1.5 py-0.5 rounded text-xs font-semibold">PREMIUM</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">1-3 business days • Priority processing</p>
                        </div>
                        <span className="text-base font-bold text-orange-600">₹250</span>
                      </div>
                    </label>
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
                        {/* Show saved billing addresses for logged-in users */}
                        {customer && customerAddresses.length > 0 && (
                          <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Select Billing Address
                            </label>
                            
                            {/* Show all addresses marked as billing */}
                            <div className="space-y-3 mb-4">
                              {customerAddresses
                                .filter(addr => addr.is_billing || addr.is_default)
                                .map(address => (
                                  <div
                                    key={address.id}
                                    onClick={() => handleBillingAddressSelect(address.id)}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                      form.selectedBillingAddressId === address.id
                                        ? 'border-amber-500 bg-amber-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                  >
                                    <div className="text-sm">
                                      <div className="font-medium text-gray-900 mb-1">
                                        {address.first_name} {address.last_name}
                                      </div>
                                      <div className="text-gray-700 mb-1">
                                        {address.address_line_1}
                                        {address.address_line_2 && (
                                          <div className="text-gray-600">
                                            {address.address_line_2}
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-gray-600 mb-1">
                                        {address.city}, {address.state} {address.postal_code}
                                      </div>
                                      {address.phone && (
                                        <div className="text-gray-600 text-xs mb-2">
                                          Phone: {address.phone}
                                        </div>
                                      )}
                                      <div className="flex items-center gap-2 text-xs">
                                        {address.is_default && (
                                          <span className="text-green-600">✓ Default</span>
                                        )}
                                        {address.is_billing && (
                                          <span className="text-purple-600">💳 Billing</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                            
                            <div className="text-center mb-4">
                              <button
                                type="button"
                                onClick={() => setForm(prev => ({ ...prev, selectedBillingAddressId: '' }))}
                                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                              >
                                + Use different billing address
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Billing Address Form - Show when no address selected or for guest users */}
                        {(!customer || customerAddresses.length === 0 || !form.selectedBillingAddressId) && (
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
                              State *
                            </label>
                            <StateDropdown
                              name="billingState"
                              value={form.billingState}
                              onChange={handleBillingStateChange}
                              required
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                              placeholder="Select State"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              City *
                            </label>
                            <CityDropdown
                              name="billingCity"
                              value={form.billingCity}
                              onChange={handleBillingCityChange}
                              selectedState={form.billingState}
                              required
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                              placeholder="Select City"
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
                      </>
                    )}
                  </div>
                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                  <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                      <CreditCard size={20} className="text-amber-600" />
                                      Payment Method
                                    </h2>
                                  </div>
                                  
                                  <div className="p-6">
                                    <SecurePaymentForm
                                      paymentMethod={form.paymentMethod}
                                      onPaymentMethodChange={(method) => setForm(prev => ({ ...prev, paymentMethod: method }))}
                                    />
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
            <div className="lg:col-span-1 relative">
              {/* Additional Place Order Button - Hidden on Mobile */}
              <div id="place-order-button-top" className="mb-4 hidden lg:block">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    // Trigger the form submission using the form ID
                    const form = document.getElementById('checkout-form') as HTMLFormElement;
                    if (form) {
                      if (form.requestSubmit) {
                        form.requestSubmit();
                      } else {
                        // Fallback for older browsers
                        const submitButton = form.querySelector('button[type="submit"]');
                        if (submitButton) {
                          (submitButton as HTMLButtonElement).click();
                        }
                      }
                    }
                  }}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${
                    isSubmitting
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-200 border-t-transparent rounded-full animate-spin" />
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Place Order - ₹{finalTotal.toLocaleString()}
                    </>
                  )}
                </button>
              </div>
              
              <div id="order-summary-sidebar" className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 transition-all duration-200 z-[999]" style={{ maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingBag size={20} className="text-amber-600" />
                  Order Summary
                </h2>
                
                <div className="space-y-2.5 mb-4">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.variantId}`} className="flex gap-2.5 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-xs leading-tight">
                          {item.name}
                        </h3>
                        {/* Hide size/color for service items */}
                        {!(item.size === 'Service' || item.size === 'Custom') && (
                          <div className="flex gap-2 text-xs text-gray-600 mt-0.5">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>Color: {item.color}</span>}
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-1.5">
                          <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                          <span className="font-semibold text-gray-900 text-sm">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Split Option - Only show if cart has both products and services */}
                {hasServices && hasProducts && (
                  <div className="border-t border-gray-200 pt-3 pb-3">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Payment Options</h3>
                    <div className="space-y-2">
                      {/* Full Payment Option */}
                      <label className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        paymentSplit === 'full' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
                      }`}>
                        <input
                          type="radio"
                          name="paymentSplit"
                          value="full"
                          checked={paymentSplit === 'full'}
                          onChange={() => setPaymentSplit('full')}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">Pay Full Amount Now</div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Pay ₹{(productTotal + serviceTotal).toLocaleString()} (Products + Services)
                          </div>
                        </div>
                      </label>

                      {/* Split Payment Option */}
                      <label className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        paymentSplit === 'split' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
                      }`}>
                        <input
                          type="radio"
                          name="paymentSplit"
                          value="split"
                          checked={paymentSplit === 'split'}
                          onChange={() => setPaymentSplit('split')}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900 flex items-center gap-1">
                            Split Payment
                            <span className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded">Recommended</span>
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Pay ₹{productTotal.toLocaleString()} now (Products)<br/>
                            Pay ₹{serviceTotal.toLocaleString()} on delivery (Services)
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3 space-y-2">
                  {/* Show breakdown if split payment is selected */}
                  {paymentSplit === 'split' && hasServices ? (
                    <>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Products Subtotal</span>
                        <span>₹{productTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Services Subtotal</span>
                        <span>₹{serviceTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Delivery</span>
                        <span className={deliveryCost === 0 ? 'text-green-600 font-medium' : ''}>
                          {deliveryCost === 0 ? 'Free' : `₹${deliveryCost}`}
                        </span>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
                        <div className="flex justify-between text-sm font-semibold text-amber-900">
                          <span>Pay Now (Products)</span>
                          <span>₹{upfrontAmount.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                        <div className="flex justify-between text-sm font-semibold text-green-900">
                          <span>Pay on Delivery (Services)</span>
                          <span>₹{codAmount.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                        <span>Order Total</span>
                        <span className="text-amber-600">₹{(upfrontAmount + codAmount).toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>₹{total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Delivery</span>
                        <span className={deliveryCost === 0 ? 'text-green-600 font-medium' : ''}>
                          {deliveryCost === 0 ? 'Free' : `₹${deliveryCost}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span className="text-amber-600">₹{finalTotal.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Security Features */}
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-green-700 bg-gradient-to-r from-green-50 to-blue-50 p-2 rounded-lg border border-green-200">
                    <Shield size={14} />
                    <span className="font-medium">PCI DSS compliant secure encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 p-2 rounded-lg border border-green-200">
                    <Truck size={14} />
                    <span className="font-medium">Free shipping on all orders across India 🇮🇳</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </PaymentSecurityWrapper>
  );
};

export default CheckoutPage;