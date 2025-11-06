/**
 * Meta Pixel (Facebook Pixel) Tracking Utility
 * 
 * Provides type-safe wrapper functions for Meta Pixel events
 * Pixel ID: 1357497815967725
 */

// Extend window object to include fbq
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: (...args: any[]) => void;
  }
}

/**
 * Check if Meta Pixel is loaded
 */
export const isMetaPixelLoaded = (): boolean => {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
};

/**
 * Track PageView - automatically called on initial load
 */
export const trackPageView = (): void => {
  if (isMetaPixelLoaded()) {
    window.fbq!('track', 'PageView');
  }
};

/**
 * Track ViewContent event when user views a product
 */
export const trackViewContent = (params: {
  content_name: string;
  content_category?: string;
  content_ids: string[];
  content_type: string;
  value: number;
  currency: string;
}): void => {
  if (isMetaPixelLoaded()) {
    window.fbq!('track', 'ViewContent', params);
  }
};

/**
 * Track Search event when user searches
 */
export const trackSearch = (params: {
  search_string: string;
  content_category?: string;
}): void => {
  if (isMetaPixelLoaded()) {
    window.fbq!('track', 'Search', params);
  }
};

/**
 * Track AddToCart event when user adds item to cart
 */
export const trackAddToCart = (params: {
  content_name: string;
  content_ids: string[];
  content_type: string;
  value: number;
  currency: string;
}): void => {
  if (isMetaPixelLoaded()) {
    window.fbq!('track', 'AddToCart', params);
  }
};

/**
 * Track AddToWishlist event when user adds item to wishlist
 */
export const trackAddToWishlist = (params: {
  content_name: string;
  content_ids: string[];
  content_category?: string;
  value: number;
  currency: string;
}): void => {
  if (isMetaPixelLoaded()) {
    window.fbq!('track', 'AddToWishlist', params);
  }
};

/**
 * Track InitiateCheckout event when user starts checkout
 */
export const trackInitiateCheckout = (params: {
  content_ids: string[];
  contents: Array<{
    id: string;
    quantity: number;
    item_price?: number;
  }>;
  num_items: number;
  value: number;
  currency: string;
}): void => {
  if (isMetaPixelLoaded()) {
    window.fbq!('track', 'InitiateCheckout', params);
  }
};

/**
 * Track AddPaymentInfo event when user adds payment info
 */
export const trackAddPaymentInfo = (params: {
  content_ids: string[];
  value: number;
  currency: string;
}): void => {
  if (isMetaPixelLoaded()) {
    window.fbq!('track', 'AddPaymentInfo', params);
  }
};

/**
 * Track Purchase event when order is completed
 */
export const trackPurchase = (params: {
  content_ids: string[];
  contents: Array<{
    id: string;
    quantity: number;
    item_price?: number;
  }>;
  content_type: string;
  value: number;
  currency: string;
  num_items?: number;
}): void => {
  if (isMetaPixelLoaded()) {
    window.fbq!('track', 'Purchase', params);
  }
};

/**
 * Track Lead event (for newsletter signup, contact form, etc.)
 */
export const trackLead = (params?: {
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
}): void => {
  if (isMetaPixelLoaded()) {
    window.fbq!('track', 'Lead', params);
  }
};

/**
 * Track CompleteRegistration event when user signs up
 */
export const trackCompleteRegistration = (params?: {
  content_name?: string;
  value?: number;
  currency?: string;
}): void => {
  if (isMetaPixelLoaded()) {
    window.fbq!('track', 'CompleteRegistration', params);
  }
};

/**
 * Track custom event
 */
export const trackCustomEvent = (eventName: string, params?: Record<string, any>): void => {
  if (isMetaPixelLoaded()) {
    window.fbq!('trackCustom', eventName, params);
  }
};
