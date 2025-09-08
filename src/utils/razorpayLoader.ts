// Razorpay loader utility to ensure the script loads properly
export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // If Razorpay is already loaded, resolve immediately
    if (typeof window.Razorpay !== 'undefined') {
      resolve(true);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    
    if (existingScript) {
      // Script exists, wait for it to load
      existingScript.addEventListener('load', () => {
        resolve(typeof window.Razorpay !== 'undefined');
      });
      existingScript.addEventListener('error', () => {
        resolve(false);
      });
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      resolve(typeof window.Razorpay !== 'undefined');
    };
    
    script.onerror = () => {
      resolve(false);
    };
    
    document.head.appendChild(script);
  });
};

// Auto-load Razorpay when this module is imported
if (typeof window !== 'undefined') {
  loadRazorpay().catch(() => {
    console.warn('Failed to load Razorpay script');
  });
}
