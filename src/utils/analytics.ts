/**
 * Google Analytics 4 (GA4) & Facebook Pixel Tracking Utility
 * 
 * Setup Instructions:
 * 1. Create GA4 property at https://analytics.google.com/
 * 2. Get your Measurement ID (G-XXXXXXXXXX)
 * 3. Create Facebook Pixel at https://business.facebook.com/events_manager
 * 4. Get your Pixel ID (15-16 digits)
 * 5. Add tracking IDs in Admin Settings > SEO Settings
 */

// Type definitions for GA4 events
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    fbq?: (...args: any[]) => void;
    _fbq?: (...args: any[]) => void;
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
    // Silently skip if no measurement ID - not critical
    return;
  }

  // Check if already initialized
  if (window.gtag) {
    if (import.meta.env.DEV) {
      console.log('GA4 already initialized');
    }
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

  if (import.meta.env.DEV) {
    console.log('GA4 initialized with ID:', measurementId);
  }
};

/**
 * Initialize Facebook Pixel
 * Call this once in your app's entry point (main.tsx or App.tsx)
 */
export const initFacebookPixel = (pixelId: string): void => {
  if (!pixelId) {
    // Silently skip if no pixel ID - not critical
    return;
  }

  // Check if already initialized
  if (window.fbq) {
    if (import.meta.env.DEV) {
      console.log('Facebook Pixel already initialized');
    }
    return;
  }

  // Facebook Pixel Code
  (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq!('init', pixelId);
  window.fbq!('track', 'PageView');

  console.log('Facebook Pixel initialized with ID:', pixelId);
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
  // GA4 tracking
  if (window.gtag) {
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
  }

  // Facebook Pixel tracking
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      content_category: product.category,
      value: product.price,
      currency: 'INR',
    });
  }
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
  // GA4 tracking
  if (window.gtag) {
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
  }

  // Facebook Pixel tracking
  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      content_category: product.category,
      value: product.price * product.quantity,
      currency: 'INR',
    });
  }
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
  // GA4 tracking
  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'INR',
      value: totalValue,
      items: items,
    });
  }

  // Facebook Pixel tracking
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: items.map(item => item.item_id),
      contents: items.map(item => ({
        id: item.item_id,
        quantity: item.quantity || 1,
      })),
      value: totalValue,
      currency: 'INR',
      num_items: items.length,
    });
  }
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
  // GA4 tracking
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: orderId,
      currency: 'INR',
      value: totalValue,
      tax: tax || 0,
      shipping: shipping || 0,
      items: items,
    });
  }

  // Facebook Pixel tracking
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      content_ids: items.map(item => item.item_id),
      contents: items.map(item => ({
        id: item.item_id,
        quantity: item.quantity || 1,
      })),
      value: totalValue,
      currency: 'INR',
      num_items: items.length,
    });
  }
};

/**
 * Track search
 */
export const trackSearch = (searchTerm: string): void => {
  // GA4 tracking
  if (window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm,
    });
  }

  // Facebook Pixel tracking
  if (window.fbq) {
    window.fbq('track', 'Search', {
      search_string: searchTerm,
    });
  }
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
  initFacebookPixel,
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
