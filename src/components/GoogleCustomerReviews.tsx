import React, { useEffect } from 'react';

interface GoogleCustomerReviewsProps {
  orderId: string;
  email: string;
  deliveryCountry: string;
  estimatedDeliveryDate: string; // YYYY-MM-DD
}

const MERCHANT_ID = 5587404837;

declare global {
  interface Window {
    renderOptIn?: () => void;
    gapi?: {
      load: (module: string, callback: () => void) => void;
      surveyoptin?: {
        render: (config: {
          merchant_id: number;
          order_id: string;
          email: string;
          delivery_country: string;
          estimated_delivery_date: string;
          products?: Array<{ gtin: string }>;
        }) => void;
      };
    };
  }
}

/**
 * Google Customer Reviews Survey Opt-In
 * Renders the Google Customer Reviews opt-in survey on the order confirmation page.
 * Only renders for successfully paid orders (not pending).
 * https://support.google.com/merchants/answer/14629205
 */
const GoogleCustomerReviews: React.FC<GoogleCustomerReviewsProps> = ({
  orderId,
  email,
  deliveryCountry,
  estimatedDeliveryDate,
}) => {
  useEffect(() => {
    if (!orderId || !email) return;

    // Define the renderOptIn callback before loading the script
    window.renderOptIn = function () {
      if (window.gapi) {
        window.gapi.load('surveyoptin', function () {
          if (window.gapi?.surveyoptin) {
            window.gapi.surveyoptin.render({
              merchant_id: MERCHANT_ID,
              order_id: orderId,
              email: email,
              delivery_country: deliveryCountry || 'IN',
              estimated_delivery_date: estimatedDeliveryDate,
            });
          }
        });
      }
    };

    // Check if script is already loaded to avoid duplicates
    const existingScript = document.querySelector(
      'script[src*="apis.google.com/js/platform.js"]'
    );
    if (existingScript) {
      // Script already loaded, call renderOptIn directly if gapi is ready
      if (window.gapi) {
        window.renderOptIn();
      }
      return;
    }

    // Inject the Google platform.js script
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/platform.js?onload=renderOptIn';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      // Clean up the renderOptIn reference on unmount
      delete window.renderOptIn;
    };
  }, [orderId, email, deliveryCountry, estimatedDeliveryDate]);

  // The opt-in widget is rendered by Google's script into a floating element;
  // no DOM container is needed here.
  return null;
};

export default GoogleCustomerReviews;
