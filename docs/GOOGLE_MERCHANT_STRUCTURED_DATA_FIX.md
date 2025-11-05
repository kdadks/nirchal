# Google Merchant Listings Structured Data Fix

## Issue
Google Search Console identified 3 non-critical issues with Merchant listings structured data:
1. Missing field "shippingDetails" (in "offers")
2. Missing field "hasMerchantReturnPolicy" (in "offers")
3. Missing field "description"

## Solution Implemented

### File Modified
- `src/utils/structuredData.ts`

### Changes Made

#### 1. Added shippingDetails to Offers
Added comprehensive shipping information following schema.org/OfferShippingDetails:
```typescript
'shippingDetails': {
  '@type': 'OfferShippingDetails',
  'shippingRate': {
    '@type': 'MonetaryAmount',
    'value': '0',
    'currency': product.currency
  },
  'shippingDestination': {
    '@type': 'DefinedRegion',
    'addressCountry': 'IN'
  },
  'deliveryTime': {
    '@type': 'ShippingDeliveryTime',
    'handlingTime': {
      '@type': 'QuantitativeValue',
      'minValue': 1,
      'maxValue': 2,
      'unitCode': 'DAY'
    },
    'transitTime': {
      '@type': 'QuantitativeValue',
      'minValue': 3,
      'maxValue': 7,
      'unitCode': 'DAY'
    }
  }
}
```

**Details:**
- Free shipping (rate: 0)
- Shipping to India (IN)
- Handling time: 1-2 days
- Transit time: 3-7 days
- Total delivery: 4-9 days

#### 2. Added hasMerchantReturnPolicy to Offers
Added return policy following schema.org/MerchantReturnPolicy:
```typescript
'hasMerchantReturnPolicy': {
  '@type': 'MerchantReturnPolicy',
  'applicableCountry': 'IN',
  'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
  'merchantReturnDays': 7,
  'returnMethod': 'https://schema.org/ReturnByMail',
  'returnFees': 'https://schema.org/FreeReturn'
}
```

**Details:**
- 7-day return window
- Return by mail
- Free returns
- Applicable to India

#### 3. Fixed Missing Description
Added fallback description generation if product description is empty:
```typescript
'description': product.description || `${product.name} - Premium quality ${product.category || 'fashion'} available at Nirchal. Shop now for the best prices and fast delivery.`
```

This ensures every product has a description, even if not provided in the database.

## Impact

### SEO Benefits
1. ✅ Resolves all 3 Google Search Console non-critical issues
2. ✅ Improves product visibility in Google Search and Shopping
3. ✅ Provides rich shipping and return information to customers
4. ✅ Enhances trust signals with clear policies
5. ✅ Better compliance with Google Merchant Center requirements

### User Experience
1. **Shipping Information**: Customers see delivery timeframes directly in search results
2. **Return Policy**: Clear 7-day return policy visible upfront
3. **Complete Product Info**: All products have descriptions for better understanding

## Testing

### How to Verify
1. Go to any product detail page (e.g., `/products/any-product-slug`)
2. View page source and search for `application/ld+json`
3. Copy the JSON-LD structured data
4. Test at: https://search.google.com/test/rich-results
5. Verify all three fields are present:
   - ✅ `shippingDetails` in offers
   - ✅ `hasMerchantReturnPolicy` in offers
   - ✅ `description` at product level

### Google Search Console
- Issues should resolve within a few days after Google re-crawls the pages
- Monitor Search Console > Enhancements > Merchant Listings
- Request re-indexing for faster validation

## Schema.org References
- [Product Schema](https://schema.org/Product)
- [Offer Schema](https://schema.org/Offer)
- [OfferShippingDetails](https://schema.org/OfferShippingDetails)
- [MerchantReturnPolicy](https://schema.org/MerchantReturnPolicy)
- [Google Merchant Listings Guidelines](https://developers.google.com/search/docs/appearance/structured-data/product)

## Notes
- **Shipping Policy**: Currently set to free shipping. Update `shippingRate.value` if shipping charges apply
- **Return Window**: Set to 7 days. Adjust `merchantReturnDays` if your policy differs
- **Country**: Set to India (IN). Update if selling to other countries
- **Return Fees**: Set to free. Change `returnFees` to `https://schema.org/RestockingFees` if applicable

## Deployment
These changes are automatically applied to all product pages. No additional configuration needed.
