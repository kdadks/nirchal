import { useEffect, useRef, useCallback } from 'react';
import { getGuestInfo } from '../utils/cookieUtils';
import { supabase } from '../config/supabase';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
  variantId?: string;
}

interface UseCartAbandonmentProps {
  cartItems: CartItem[];
  isAuthenticated: boolean;
  userId?: string;
}

// Get visitor ID from cookie
const getVisitorId = (): string | null => {
  const cookies = document.cookie.split(';');
  const visitorCookie = cookies.find(c => c.trim().startsWith('nirchal_visitor_id='));
  return visitorCookie ? visitorCookie.split('=')[1] : null;
};

// Track if payment/checkout is in progress to prevent false abandoned cart tracking
let isCheckoutInProgress = false;

// Function to mark checkout as started (call from checkout page)
export const markCheckoutStarted = () => {
  isCheckoutInProgress = true;
  sessionStorage.setItem('checkout_in_progress', 'true');
};

// Function to mark checkout as completed (call after successful payment)
export const markCheckoutCompleted = () => {
  isCheckoutInProgress = false;
  sessionStorage.removeItem('checkout_in_progress');
};

// Check if checkout is in progress
const isCheckoutActive = (): boolean => {
  return isCheckoutInProgress || sessionStorage.getItem('checkout_in_progress') === 'true';
};

export const useCartAbandonment = ({ cartItems, isAuthenticated, userId }: UseCartAbandonmentProps) => {
  const hasTrackedRef = useRef(false);
  const isUnloadingRef = useRef(false);
  const lastTrackedCartHash = useRef<string>('');

  /**
   * Generate a hash of cart items to detect if cart has changed
   */
  const getCartHash = useCallback(() => {
    return JSON.stringify(cartItems.map(item => ({
      id: item.id,
      quantity: item.quantity,
      variantId: item.variantId
    })));
  }, [cartItems]);

  /**
   * Save abandoned cart to database
   */
  const saveAbandonedCart = useCallback(async (guestInfo: { name: string; email: string; phone: string } | null) => {
    if (cartItems.length === 0) return;
    
    // Don't track if checkout/payment is in progress
    if (isCheckoutActive()) {
      return;
    }
    
    // Check if we already tracked this exact cart
    const currentCartHash = getCartHash();
    if (hasTrackedRef.current && lastTrackedCartHash.current === currentCartHash) {
      return; // Prevent duplicate submissions for same cart
    }

    hasTrackedRef.current = true;
    lastTrackedCartHash.current = currentCartHash;

    try {
      const visitorId = getVisitorId();
      
      const cartData = {
        guest_name: guestInfo?.name || 'Anonymous',
        guest_email: guestInfo?.email || null,
        guest_phone: guestInfo?.phone || null,
        visitor_id: visitorId, // Link to visitor tracking
        user_id: isAuthenticated && userId ? userId : null,
        cart_items: cartItems,
        total_items: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        total_value: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        abandoned_at: new Date().toISOString(),
        status: 'abandoned',
      };

      // Use sendBeacon for more reliable tracking during page unload
      if (isUnloadingRef.current && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(cartData)], { type: 'application/json' });
        navigator.sendBeacon('/api/cart-abandonment', blob);
      } else {
        // Regular fetch for other scenarios
        await supabase
          .from('abandoned_carts')
          .insert([cartData]);
      }
    } catch (error) {
      // Silent fail
    }
  }, [cartItems, isAuthenticated, userId]);

  /**
   * Handle page visibility change (tab switch, minimize, etc.)
   */
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && cartItems.length > 0) {
      const guestInfo = getGuestInfo();
      const visitorId = getVisitorId();
      // Track if we have guest info, visitor ID, or user is authenticated
      if (guestInfo || visitorId || isAuthenticated) {
        saveAbandonedCart(guestInfo);
      }
    }
  }, [cartItems, isAuthenticated, saveAbandonedCart]);

  /**
   * Handle before unload (browser close, navigation away)
   */
  const handleBeforeUnload = useCallback(() => {
    isUnloadingRef.current = true;
    
    if (cartItems.length > 0) {
      const guestInfo = getGuestInfo();
      const visitorId = getVisitorId();
      // Track if we have guest info, visitor ID, or user is authenticated
      if (guestInfo || visitorId || isAuthenticated) {
        saveAbandonedCart(guestInfo);
      }
    }
  }, [cartItems, isAuthenticated, saveAbandonedCart]);

  /**
   * Handle page unload
   */
  const handleUnload = useCallback(() => {
    if (cartItems.length > 0) {
      const guestInfo = getGuestInfo();
      const visitorId = getVisitorId();
      // Track if we have guest info, visitor ID, or user is authenticated
      if (guestInfo || visitorId || isAuthenticated) {
        saveAbandonedCart(guestInfo);
      }
    }
  }, [cartItems, isAuthenticated, saveAbandonedCart]);

  /**
   * Track cart inactivity (user hasn't interacted with cart for X minutes)
   */
  useEffect(() => {
    if (cartItems.length === 0) return;

    const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        const guestInfo = getGuestInfo();
        const visitorId = getVisitorId();
        // Track if we have guest info, visitor ID, or user is authenticated
        if (guestInfo || visitorId || isAuthenticated) {
          saveAbandonedCart(guestInfo);
        }
      }, INACTIVITY_TIMEOUT);
    };

    // Events that indicate user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true);
      });
    };
  }, [cartItems, isAuthenticated, saveAbandonedCart]);

  /**
   * Set up event listeners
   */
  useEffect(() => {
    // Reset tracking flag when cart becomes empty or changes significantly
    if (cartItems.length === 0) {
      hasTrackedRef.current = false;
      lastTrackedCartHash.current = '';
    } else {
      // If cart changes (items added/removed), allow re-tracking
      const currentHash = getCartHash();
      if (currentHash !== lastTrackedCartHash.current) {
        hasTrackedRef.current = false;
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [handleVisibilityChange, handleBeforeUnload, handleUnload, cartItems.length, getCartHash]);

  return {
    saveAbandonedCart,
  };
};
