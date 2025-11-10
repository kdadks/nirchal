# NitroX Implementation - Ready-to-Use Code

## Files to Create/Modify

### File 1: Create `src/utils/nitroxTracking.ts`

```typescript
/**
 * NitroX Tracking Integration
 * Official API: https://docs.nitrocommerce.ai/integration-guide
 * 
 * This utility provides simple functions to track visitor behavior
 * and capture email/phone/name for lead generation
 */

declare global {
  interface Window {
    nitro: any;
    nitroOrgToken: string;
  }
}

/**
 * IDENTIFY VISITOR
 * Call this when you capture: email, phone, or name
 * Priority order: Guest checkout > Contact form > Newsletter
 */
export const identifyVisitor = (
  email: string,
  phone?: string,
  name?: string
) => {
  if (!window.nitro) {
    console.warn('[NitroX] Window.nitro not initialized');
    return;
  }

  try {
    window.nitro.identify(email, phone || '', name || '');
    console.log(`[NitroX] ✓ Identified: ${email}`);
  } catch (error) {
    console.error('[NitroX] Identify failed:', error);
  }
};

/**
 * TRACK PAGE VIEW
 * Called automatically but can be used for specific pages
 */
export const trackPageView = (pageUrl: string = window.location.href) => {
  if (!window.nitro) return;

  try {
    window.nitro.view({ page: pageUrl });
    console.log(`[NitroX] ✓ View tracked: ${pageUrl}`);
  } catch (error) {
    console.error('[NitroX] View tracking failed:', error);
  }
};

/**
 * TRACK PRODUCT VIEW
 * Call when user visits product detail page
 */
export const trackProductView = (
  productTitle: string,
  productImage: string,
  pageUrl: string = window.location.href
) => {
  if (!window.nitro) return;

  try {
    window.nitro.productView({
      title: productTitle,
      image: productImage,
      page: pageUrl
    });
    console.log(`[NitroX] ✓ Product viewed: ${productTitle}`);
  } catch (error) {
    console.error('[NitroX] Product view tracking failed:', error);
  }
};

/**
 * TRACK CATEGORY VIEW
 * Call when user browses category
 */
export const trackCategoryView = (
  categoryName: string,
  pageUrl: string = window.location.href
) => {
  if (!window.nitro) return;

  try {
    window.nitro.categoryView({
      page: pageUrl,
      category: categoryName
    });
    console.log(`[NitroX] ✓ Category viewed: ${categoryName}`);
  } catch (error) {
    console.error('[NitroX] Category view tracking failed:', error);
  }
};

/**
 * TRACK ADD TO CART
 * Called when items are added/modified in cart
 * IMPORTANT: Send ALL current cart items, not just the added item
 */
export const trackAddToCart = (
  cartItems: Array<{
    id: string;
    variantId?: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>,
  cartTotal: number
) => {
  if (!window.nitro) return;

  try {
    const lineItems = cartItems.map(item => ({
      quantity: item.quantity,
      title: item.name,
      line_price: item.price,
      id: item.variantId || item.id, // Variant ID (required)
      product_id: item.id, // Product ID
      image_url: item.image
    }));

    window.nitro.updatecart({
      cart_url: window.location.href,
      line_items: lineItems,
      cart_value: cartTotal
    });

    console.log(`[NitroX] ✓ Cart updated: ${cartItems.length} items, ₹${cartTotal}`);
  } catch (error) {
    console.error('[NitroX] Cart tracking failed:', error);
  }
};

/**
 * TRACK CHECKOUT
 * Called when user initiates checkout (before payment)
 */
export const trackCheckout = (
  items: Array<{
    id: string;
    price: number;
    url?: string;
  }>,
  cartTotal: number
) => {
  if (!window.nitro) return;

  try {
    const checkoutItems = items.map(item => ({
      product_id: item.id,
      price: item.price,
      product_url: item.url || window.location.href
    }));

    window.nitro.checkout({
      checkout: window.location.href,
      items: checkoutItems,
      cart_value: cartTotal
    });

    console.log(`[NitroX] ✓ Checkout tracked: ₹${cartTotal}`);
  } catch (error) {
    console.error('[NitroX] Checkout tracking failed:', error);
  }
};

/**
 * TRACK PURCHASE
 * Called when order is successfully completed
 * This is the MOST IMPORTANT event
 */
export const trackPurchase = (
  orderId: string,
  items: Array<{
    id: string;
    price: number;
    url?: string;
  }>,
  cartTotal?: number
) => {
  if (!window.nitro) return;

  try {
    const buyItems = items.map(item => ({
      product_id: item.id,
      price: item.price,
      product_url: item.url || window.location.href
    }));

    window.nitro.buy({
      checkout_url: window.location.href,
      order_id: orderId,
      items: buyItems
    });

    console.log(`[NitroX] ✓ Purchase tracked: Order #${orderId}`);
  } catch (error) {
    console.error('[NitroX] Purchase tracking failed:', error);
  }
};

/**
 * TRACK CUSTOM EVENT
 * For any other events not covered above
 */
export const trackCustomEvent = (
  eventName: string,
  eventData: Record<string, any> = {}
) => {
  if (!window.nitro) return;

  try {
    window.nitro.track(eventName, eventData);
    console.log(`[NitroX] ✓ Custom event: ${eventName}`, eventData);
  } catch (error) {
    console.error('[NitroX] Custom event tracking failed:', error);
  }
};

/**
 * Initialize NitroX (called once on app load)
 */
export const initializeNitroX = () => {
  if (window.nitro) {
    console.log('[NitroX] ✓ Initialized');
    return true;
  }
  console.warn('[NitroX] Script not loaded. Check if snippet is in index.html');
  return false;
};
```

---

### File 2: Update `public/index.html`

```html
<!-- Add this to <head> section of public/index.html -->
<!-- BEFORE: </head> closing tag -->

<!-- NitroX Email Capture Integration -->
<!-- Get the exact snippet from your NitroX dashboard -->
<!-- Replace the script src and window settings below -->
<script>
  window.nitroOrgToken = "YOUR_ORG_TOKEN_FROM_NITROX_DASHBOARD";
</script>
<!-- 
  IMPORTANT: Get the actual script URL from:
  1. Login to https://x.nitrocommerce.ai/
  2. Go to Install → Manual Integration
  3. Copy the exact snippet provided
-->
<script src="https://cdn.nitrocommerce.ai/nitro.js"></script>
```

---

### File 3: Integrate with Newsletter Form

**Update: `src/components/NewsletterSignup.tsx`**

```typescript
import React, { useState } from 'react';
import { identifyVisitor, trackCustomEvent } from '../utils/nitroxTracking';
import { supabase } from '../lib/supabase';

const NewsletterSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // STEP 1: Identify with NitroX
      identifyVisitor(email, '', name);
      trackCustomEvent('newsletter_signup', {
        email,
        name,
        timestamp: new Date().toISOString()
      });

      // STEP 2: Save to Supabase
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{
          email,
          name: name || null,
          subscribed_at: new Date().toISOString(),
          source: 'website_signup'
        }]);

      if (error) throw error;

      // Success
      setEmail('');
      setName('');
      alert('✓ Successfully subscribed! Check your email for confirmation.');
    } catch (error) {
      console.error('Newsletter signup failed:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Your Name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2 border rounded"
      />
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-2 border rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Subscribing...' : 'Subscribe to Newsletter'}
      </button>
    </form>
  );
};

export default NewsletterSignup;
```

---

### File 4: Integrate with Guest Checkout ⭐ HIGHEST PRIORITY

**Update: `src/pages/CheckoutPage.tsx`** (snippet)

```typescript
import { identifyVisitor, trackCheckout, trackPurchase } from '../utils/nitroxTracking';

// When guest enters email during checkout
const handleGuestCheckout = async (guestData: any) => {
  try {
    // STEP 1: IDENTIFY (HIGH INTENT - Must be first)
    identifyVisitor(
      guestData.email,
      guestData.phone,
      guestData.firstName + ' ' + guestData.lastName
    );

    // STEP 2: Track checkout started
    trackCheckout(cartItems, totalPrice);

    // STEP 3: Process payment...
    const paymentResult = await processPayment(guestData);

    if (paymentResult.success) {
      // STEP 4: Track purchase
      trackPurchase(
        paymentResult.orderId,
        cartItems.map(item => ({
          id: item.id,
          price: item.price
        })),
        totalPrice
      );

      // Save order to Supabase
      await supabase.from('orders').insert([{
        order_id: paymentResult.orderId,
        email: guestData.email,
        phone: guestData.phone,
        items: cartItems,
        total: totalPrice,
        status: 'completed'
      }]);

      // Redirect to success
      navigate('/order-confirmation', { state: { orderId: paymentResult.orderId } });
    }
  } catch (error) {
    console.error('Checkout error:', error);
  }
};
```

---

### File 5: Integrate with Product Pages

**Update: `src/pages/ProductDetailPage.tsx`** (snippet)

```typescript
import { trackProductView } from '../utils/nitroxTracking';

useEffect(() => {
  // Track product view whenever product changes
  if (product) {
    trackProductView(
      product.name,
      product.image,
      window.location.href
    );
  }
}, [product?.id]);
```

---

### File 6: Integrate with Cart Operations

**Update: `src/pages/CartPage.tsx`** (snippet)

```typescript
import { trackAddToCart } from '../utils/nitroxTracking';

// When anything in cart changes (add, remove, quantity update)
const handleCartUpdate = (items: any[], total: number) => {
  trackAddToCart(
    items.map(item => ({
      id: item.id,
      variantId: item.variantId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    })),
    total
  );
};
```

---

### File 7: Initialize in App

**Update: `src/App.tsx`**

```typescript
import { useEffect } from 'react';
import { initializeNitroX } from './utils/nitroxTracking';

function App() {
  useEffect(() => {
    // Initialize NitroX tracking
    initializeNitroX();
  }, []);

  return (
    // Your app JSX
  );
}

export default App;
```

---

## Deployment Checklist

- [ ] Register at https://x.nitrocommerce.ai/register
- [ ] Copy exact snippet from dashboard Install section
- [ ] Update `public/index.html` with snippet
- [ ] Create `src/utils/nitroxTracking.ts`
- [ ] Update `src/App.tsx` to initialize
- [ ] Integrate newsletter form
- [ ] Integrate contact form
- [ ] Integrate guest checkout (CRITICAL)
- [ ] Integrate product pages
- [ ] Integrate cart tracking
- [ ] Test in staging: https://x.nitrocommerce.ai/install
- [ ] Configure Consent Management template
- [ ] Set up CRM integration (Contlo/Interakt)
- [ ] Deploy to production
- [ ] Monitor Live Activity dashboard

---

## Testing Checklist

```javascript
// Open browser console and test:

1. Identify (newsletter test)
window.nitro.identify('test@example.com', '', 'Test User');

2. Product view (product page test)
window.nitro.productView({title: 'Test Product', image: 'url', page: window.location.href});

3. Add to cart (add item to cart)
window.nitro.updatecart({line_items: [{quantity: 1, title: 'Test', id: 'test'}], cart_value: 100});

4. Check dashboard
// Go to https://x.nitrocommerce.ai/ → Live section
// You should see events appearing in real-time
```

---

## Success Indicators (First Week)

✅ NitroX script loading (check Network tab)
✅ Events appearing in Live dashboard
✅ Email identified after newsletter signup
✅ High intent signals (cart, checkout events)
✅ Contacts appearing in Contacts tab

---

## Documentation Links

- Official Docs: https://docs.nitrocommerce.ai/
- JS API Docs: https://docs.nitrocommerce.ai/integration-guide
- Quick Start: https://docs.nitrocommerce.ai/en/quick-start-guide
- Consent Mgmt: https://docs.nitrocommerce.ai/en/consent-management
- Support: support@getnitro.co

---

**Ready to implement? Start with Step 1 this week!**
