import { useEffect, useState } from 'react';

// Razorpay types (since official types don't exist)
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  timeout?: number;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface UseRazorpayReturn {
  isLoaded: boolean;
  createOrder: (options: CreateOrderOptions) => Promise<any>;
  openCheckout: (options: RazorpayOptions) => void;
  verifyPayment: (verificationData: RazorpayResponse & { order_id: string }) => Promise<any>;
}

interface CreateOrderOptions {
  amount: number;
  currency: string;
  receipt: string;
  customer_email: string;
  customer_phone: string;
  notes?: Record<string, string>;
}

export const useRazorpay = (): UseRazorpayReturn => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      setIsLoaded(true);
      return;
    }

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setIsLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      setIsLoaded(false);
    };

    document.body.appendChild(script);

    // Cleanup function
    return () => {
      // Remove script if component unmounts before loading
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const createOrder = async (options: CreateOrderOptions): Promise<any> => {
    try {
      // For development, use a mock response if the function is not available
      const isDevelopment = import.meta.env.DEV;
      let response;
      
      if (isDevelopment) {
        // Try the Cloudflare function first, but fall back to mock if unavailable
        try {
          response = await fetch('/create-razorpay-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(options),
          });
          
          // If we get a 404 or the response is empty, use mock data
          if (!response.ok && response.status === 404) {
            throw new Error('Function not available in development');
          }
        } catch (fetchError) {
          console.warn('Cloudflare function not available, using mock response for development:', fetchError);
          
          // Return mock Razorpay order for development
          const mockOrder = {
            order: {
              id: `order_dev_${Date.now()}`,
              entity: 'order',
              amount: options.amount * 100,
              currency: options.currency,
              receipt: options.receipt,
              status: 'created',
              created_at: Math.floor(Date.now() / 1000)
            },
            checkout_config: {
              key: 'rzp_test_development_key',
              order_id: `order_dev_${Date.now()}`,
              currency: options.currency,
              amount: options.amount * 100,
              name: 'Nirchal (Development)',
              description: 'Test payment for development',
              prefill: {
                email: options.customer_email,
                contact: options.customer_phone
              },
              theme: {
                color: '#f59e0b'
              },
              timeout: 900,
              handler: function(_response: any) {

              },
              modal: {
                ondismiss: function() {

                }
              }
            }
          };
          
          return mockOrder;
        }
      } else {
        response = await fetch('/create-razorpay-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(options),
        });
      }



      if (!response.ok) {
        const errorText = await response.text();
        console.error('Razorpay order creation failed:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to create order'}`);
      }

      const responseText = await response.text();


      if (!responseText) {
        throw new Error('Empty response from Razorpay order creation endpoint');
      }

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse Razorpay response:', parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  };

  const openCheckout = (options: RazorpayOptions): void => {
    if (!window.Razorpay) {
      throw new Error('Razorpay SDK not loaded');
    }

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const verifyPayment = async (verificationData: RazorpayResponse & { order_id: string }): Promise<any> => {
    try {
      const response = await fetch('/verify-razorpay-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verificationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  };

  return {
    isLoaded,
    createOrder,
    openCheckout,
    verifyPayment,
  };
};

export default useRazorpay;
