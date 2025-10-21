/**
 * Google Analytics 4 (GA4) Tracking Utility
 * 
 * Setup Instructions:
 * 1. Create GA4 property at https://analytics.google.com/
 * 2. Get your Measurement ID (G-XXXXXXXXXX)
 * 3. Add to .env file: VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
 * 4. Initialize in App.tsx or main.tsx
 */

// Type definitions for GA4 events
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export interface GA4Event {
  action: string;
  category?: string;
  label?: string;
  value?: number;
}

export interface GA4EcommerceItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
}

/**
 * Initialize Google Analytics 4
 * Call this once in your app's entry point (main.tsx or App.tsx)
 */
export const initGA4 = (measurementId: string): void => {
  if (!measurementId) {
    console.warn('GA4 Measurement ID not provided');
    return;
  }

  // Check if already initialized
  if (window.gtag) {
    console.log('GA4 already initialized');
    return;
  }

  // Create script tag
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer?.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false, // We'll send page views manually
  });

  console.log('GA4 initialized with ID:', measurementId);
};

/**
 * Track page views
 */
export const trackPageView = (path: string, title?: string): void => {
  if (!window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
  });
};

/**
 * Track custom events
 */
export const trackEvent = (eventName: string, params?: Record<string, any>): void => {
  if (!window.gtag) return;

  window.gtag('event', eventName, params);
};

/**
 * Track product view
 */
export const trackProductView = (product: {
  id: string;
  name: string;
  category?: string;
  price: number;
  brand?: string;
}): void => {
  if (!window.gtag) return;

  window.gtag('event', 'view_item', {
    currency: 'INR',
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      item_brand: product.brand || 'Nirchal',
      price: product.price,
    }],
  });
};

/**
 * Track add to cart
 */
export const trackAddToCart = (product: {
  id: string;
  name: string;
  category?: string;
  price: number;
  quantity: number;
  variant?: string;
}): void => {
  if (!window.gtag) return;

  window.gtag('event', 'add_to_cart', {
    currency: 'INR',
    value: product.price * product.quantity,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      item_variant: product.variant,
      price: product.price,
      quantity: product.quantity,
    }],
  });
};

/**
 * Track remove from cart
 */
export const trackRemoveFromCart = (product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
}): void => {
  if (!window.gtag) return;

  window.gtag('event', 'remove_from_cart', {
    currency: 'INR',
    value: product.price * product.quantity,
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      quantity: product.quantity,
    }],
  });
};

/**
 * Track begin checkout
 */
export const trackBeginCheckout = (items: GA4EcommerceItem[], totalValue: number): void => {
  if (!window.gtag) return;

  window.gtag('event', 'begin_checkout', {
    currency: 'INR',
    value: totalValue,
    items: items,
  });
};

/**
 * Track purchase
 */
export const trackPurchase = (
  orderId: string,
  items: GA4EcommerceItem[],
  totalValue: number,
  tax?: number,
  shipping?: number
): void => {
  if (!window.gtag) return;

  window.gtag('event', 'purchase', {
    transaction_id: orderId,
    currency: 'INR',
    value: totalValue,
    tax: tax || 0,
    shipping: shipping || 0,
    items: items,
  });
};

/**
 * Track search
 */
export const trackSearch = (searchTerm: string): void => {
  if (!window.gtag) return;

  window.gtag('event', 'search', {
    search_term: searchTerm,
  });
};

/**
 * Track wishlist add
 */
export const trackAddToWishlist = (product: {
  id: string;
  name: string;
  category?: string;
  price: number;
}): void => {
  if (!window.gtag) return;

  window.gtag('event', 'add_to_wishlist', {
    currency: 'INR',
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      price: product.price,
    }],
  });
};

/**
 * Track user signup
 */
export const trackSignUp = (method: string = 'email'): void => {
  if (!window.gtag) return;

  window.gtag('event', 'sign_up', {
    method: method,
  });
};

/**
 * Track user login
 */
export const trackLogin = (method: string = 'email'): void => {
  if (!window.gtag) return;

  window.gtag('event', 'login', {
    method: method,
  });
};

/**
 * Track category view
 */
export const trackCategoryView = (categoryName: string, itemCount?: number): void => {
  if (!window.gtag) return;

  window.gtag('event', 'view_item_list', {
    item_list_name: categoryName,
    items_count: itemCount,
  });
};

export default {
  initGA4,
  trackPageView,
  trackEvent,
  trackProductView,
  trackAddToCart,
  trackRemoveFromCart,
  trackBeginCheckout,
  trackPurchase,
  trackSearch,
  trackAddToWishlist,
  trackSignUp,
  trackLogin,
  trackCategoryView,
};
