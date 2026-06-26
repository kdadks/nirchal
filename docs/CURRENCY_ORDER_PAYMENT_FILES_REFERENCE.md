# Currency, Order Management, and Payment Processing - File Reference Guide

## OVERVIEW
This document maps all files related to currency handling, order management, and payment processing in the Nirchal project.

---

## 1. CURRENCY HANDLING SYSTEM

### Core Currency Context & State Management

#### **[src/contexts/CurrencyContext.tsx](src/contexts/CurrencyContext.tsx)** - Primary Currency Context
- **Purpose**: Manages global currency state (INR/USD/EUR), exchange rates, and price conversion
- **Key Lines**:
  - **Line 1-17**: CurrencyContextType interface definition with currency, setCurrency, getConvertedPrice methods
  - **Line 19-27**: Category-specific minimum prices for EUR (Dupatta, Kurta Sets, etc.)
  - **Line 32-102**: `fetchExchangeRatesFromDB()` function - Fetches USD/EUR rates from Supabase `exchange_rates` table
  - **Line 39-49**: Database query to fetch rates for USD and EUR
  - **Line 52-56**: Default fallback rates (USD=88, EUR=102 INR)
  - **Line 65-78**: Store exchange rates in window object for debugging
  - **Line 102-113**: State initialization - Default currency is INR (₹) with USD/EUR as backups
  - **Line 113-114**: Base exchange rates storage
  - **Line 116-130**: Initial fetch of exchange rates from database with real-time subscription
  - **Line 138-156**: Real-time subscription to exchange_rates table changes
  - **Line 159-196**: Location detection on mount - Uses IP geolocation to determine user location
  - **Line 165-172**: India detection (INR default, all currencies allowed)
  - **Line 174-180**: EU detection (EUR default, EUR+USD allowed)
  - **Line 182-189**: Rest of world (USD default, USD+EUR allowed)
  - **Line 207-245**: `getConvertedPrice()` function - Price conversion logic
  - **Line 223-238**: Conversion formula: (INR price / (base_rate - 5 markup)) × multiplier
    - USD multiplier: 2x
    - EUR multiplier: 1.5x
  - **Line 239-245**: Category-specific minimum price enforcement for EUR

### Currency Utilities

#### **[src/utils/currencyUtils.ts](src/utils/currencyUtils.ts)** - Currency Conversion Utilities
- **Purpose**: Price conversion, currency formatting, symbol retrieval
- **Key Lines**:
  - **Line 3-7**: DEFAULT_CONVERSION_MULTIPLIERS (INR=1, USD=2, EUR=1.5)
  - **Line 19-31**: `convertPrice()` - Converts INR prices to target currency using multipliers
  - **Line 35-48**: `getCurrencySymbol()` - Returns symbol (₹ for INR, $ for USD, € for EUR)
  - **Line 52-74**: `formatPrice()` - Formats prices with currency symbols
  - **Line 76-83**: `isInternationalUser()` - Checks if user is not in India
  - **Line 85-100**: `getCurrencyName()` - Returns full currency names
  - **Line 102-110**: `getExchangeRatesInfo()` - Retrieves cached rates from window object

#### **[src/utils/formatCurrency.ts](src/utils/formatCurrency.ts)** - INR Formatting Utility
- **Purpose**: Format numbers as Indian currency (INR only)
- **Key Lines**:
  - **Line 1-5**: `formatCurrency()` - Formats with en-IN locale, INR currency
  - **Line 7-9**: `formatNumber()` - Formats numbers using en-IN locale
  - **Line 11-15**: `calculateDiscount()` - Calculates discount percentage

### Currency Display Component

#### **[src/components/common/CurrencySwitcher.tsx](src/components/common/CurrencySwitcher.tsx)** - Currency Selector UI
- **Purpose**: Displays currency switcher dropdown, allows user to change currency
- **Key Lines**:
  - **Line 1-23**: Currency options definition (INR 🇮🇳, USD 🇺🇸, EUR 🇪🇺)
  - **Line 28-38**: `useCurrency()` hook to get current currency and setter
  - **Line 40-50**: Filter available currencies based on user's location
  - **Line 55-70**: Hide switcher if only one currency available
  - **Line 72-83**: Handle currency change with `setCurrency()`

---

## 2. EXCHANGE RATES MANAGEMENT

### Admin Exchange Rates Page

#### **[src/pages/admin/ExchangeRatesPage.tsx](src/pages/admin/ExchangeRatesPage.tsx)** - Admin Dashboard for Exchange Rates
- **Purpose**: Admin interface to view, update, and fetch exchange rates
- **Key Lines**:
  - **Line 1-20**: Component setup and interface definitions
  - **Line 11-15**: DBExchangeRate interface with id, currency, rate, updated_at, source fields
  - **Line 18-20**: State for USD/EUR rates, last updated timestamps, sources
  - **Line 25-50**: `fetchExchangeRates()` - Fetches rates from Supabase exchange_rates table
  - **Line 51-85**: `handleSave()` - Updates rates via `update_exchange_rate` RPC
  - **Line 85-165**: Attempt to fetch latest rates from external API with fallback
  - **Line 118-165**: Fallback: Fetch directly from exchangerate-api.com
  - **Line 142-166**: Update USD and EUR rates via RPC with source tracking
  - **Line 167-310**: UI sections:
    - **Line 185-220**: Overview and formula explanation (₹ to USD/EUR conversion)
    - **Line 217**: Formula display: (INR / (rate - 5)) × multiplier
    - **Line 222-309**: Rate update forms for USD and EUR
    - **Line 235-275**: USD rate card with manual input and example conversion
    - **Line 276-310**: EUR rate card with manual input and example conversion
    - **Line 259**: Example: ₹1,000 = ${((1000 / (parseFloat(usdRate) - 5)) * 2).toFixed(2)}
    - **Line 356-390**: Display current active rates

### Exchange Rates Edge Function

#### **[supabase/functions/fetch-exchange-rates/index.ts](supabase/functions/fetch-exchange-rates/index.ts)** - Exchange Rates Fetcher
- **Purpose**: Fetches latest exchange rates from external APIs and updates database
- **Key Lines**:
  - **Line 1-22**: Setup and type definitions
  - **Line 24-90**: `fetchExchangeRates()` - Main function
    - **Line 26-42**: Primary API: exchangerate-api.com
    - **Line 44-50**: Calculate INR per USD and INR per EUR
    - **Line 52-91**: Backup API: open.er-api.com with fallback logic
  - **Line 93-200+**: Main serve handler that:
    - Fetches rates using `fetchExchangeRates()`
    - Updates Supabase `exchange_rates` table
    - Stores source and timestamp

### Exchange Rates Documentation

#### **[docs/EXCHANGE_RATES_SYSTEM.md](docs/EXCHANGE_RATES_SYSTEM.md)** - Exchange Rates System Documentation
- **Purpose**: Complete documentation of exchange rates system
- **Key Sections**:
  - **Line 3-21**: System overview and architecture
  - **Line 24-58**: Conversion formula explanation
  - **Line 58-100+**: Component descriptions (Admin UI, Currency Context, Edge Function)
  - **Line 322-370**: API credential configuration guide

---

## 3. ORDER MANAGEMENT SYSTEM

### Admin Order Management

#### **[src/pages/admin/OrdersPage.tsx](src/pages/admin/OrdersPage.tsx)** - Admin Orders List & Management
- **Purpose**: Admin interface to view, filter, and manage all orders
- **Key Lines**:
  - **Line 1-35**: Imports and Order interface definition
  - **Line 6-30**: Order interface with fields:
    - `id, order_number, status, payment_status, total_amount, created_at`
    - Billing info: `billing_first_name, billing_last_name, billing_email, billing_phone`
    - `customer_id, logistics_partner_id, tracking_number, shipped_at`
    - COD fields: `cod_amount, cod_collected, online_amount, payment_split`
    - Return tracking: `has_return_request, return_requests`
  - **Line 37-45**: State management (orders, loading, filters for status/payment/COD)
  - **Line 47-75**: `fetchOrders()` function - Queries orders with:
    - `.select()` with nested logistics_partners data
    - `.order('created_at', { ascending: false })`
    - Filter by order status, payment status, and COD state
    - Search by order number, customer email, or phone

### Admin Order Edit Modal

#### **[src/components/admin/OrderEditModal.tsx](src/components/admin/OrderEditModal.tsx)** - Edit Order Details
- **Purpose**: Modal dialog to edit order details (addresses, logistics, notes)
- **Key Lines**:
  - **Line 1-45**: Imports and OrderDetails interface
  - **Line 18-36**: OrderItem interface with product_name, quantity, total_price
  - **Line 38-57**: OrderDetails interface with complete order structure:
    - Billing address fields (first_name through postal_code)
    - Shipping address fields
    - Order dates (created_at, updated_at, shipped_at)
    - Payment info (method, status, transaction_id)
    - Pricing (subtotal, tax, shipping, discount, total)
  - **Line 71-100+**: Component lifecycle (fetch order details, display form)
  - Editing capabilities for address, logistics partner, tracking number

### Customer Order Details

#### **[src/components/account/OrderDetailsModal.tsx](src/components/account/OrderDetailsModal.tsx)** - Customer Order Viewing
- **Purpose**: Modal to display order details for customers
- **Key Lines**:
  - **Line 1-60**: Imports and OrderDetails interface (similar to admin)
  - **Line 8-31**: OrderItem interface for line items
  - **Line 35-60**: OrderDetails interface with UUID type for id
  - **Line 63-80+**: Component props and state setup
  - Features:
    - Display order items with images, sizes, colors
    - Show shipping/billing addresses
    - Display tracking info and URL generation
    - Invoice download capability
    - Retry payment for failed orders

### Order Confirmation Page

#### **[src/pages/OrderConfirmationPage.tsx](src/pages/OrderConfirmationPage.tsx)** - Post-Purchase Confirmation
- **Purpose**: Displays confirmation after order placement, captures session order data
- **Key Lines**:
  - **Line 1-20**: Imports and setup
  - **Line 26-45**: Session storage keys used:
    - `last_order_number, last_order_email, new_customer_temp_password`
    - `cod_amount, payment_split, payment_status, delivery_country`
  - **Line 47-60**: Data extraction from session storage with decryption of temp password
  - **Line 62-77**: Redirect to cart if no order number found
  - **Line 77-100+**: Display order confirmation with:
    - Estimated delivery date calculation (5 business days)
    - COD/Online payment status display
    - Password change modal for new customers

---

## 4. CHECKOUT & PAYMENT PROCESSING

### Checkout Page

#### **[src/pages/CheckoutPage.tsx](src/pages/CheckoutPage.tsx)** - Main Checkout Flow
- **Purpose**: Complete checkout form with address, payment method selection
- **Key Lines**:
  - **Line 1-25**: Imports (Cart, Auth, Currency contexts, Order utils, Payment security)
  - **Line 27-53**: CheckoutForm interface defining:
    - Contact info (firstName, lastName, email, phone)
    - Delivery address (country, address fields, city, state, pincode)
    - Billing address (with same-as-delivery option)
    - Shipping method (standard/express)
    - Payment method (razorpay)
  - **Line 55-70**: CustomerAddress interface (from database)
  - **Line 73-95**: `getPhoneFormatForCurrency()` - Currency-specific phone format
  - **Line 93**: Default for INR (India)
  - Uses:
    - `upsertCustomerByEmail()` to save/update customer
    - `createOrderWithItems()` to create order record
    - `markCheckoutStarted()` for cart abandonment tracking
    - `useRazorpay()` for payment processing
    - Razorpay payment security wrapper

### Razorpay Payment Services

#### **[src/services/razorpayService.ts](src/services/razorpayService.ts)** - Razorpay Integration Service
- **Purpose**: Service class to manage Razorpay order creation and verification
- **Key Lines**:
  - **Line 1-30**: Type definitions:
    - RazorpayOrderOptions (amount in paise, currency, receipt)
    - RazorpaySettings (credentials, environment, theme)
    - PaymentVerificationData (order_id, payment_id, signature)
  - **Line 32-200+**: RazorpayService class
  - **Line 45-100**: `loadSettings()` - Loads Razorpay credentials from database with caching
    - Fetches from `settings` table where category='payment'
    - Caches for 5 minutes
    - **Line 107**: Default currency set to 'INR'
  - Provides methods for:
    - Creating Razorpay orders
    - Verifying payment signatures
    - Managing payment flow

#### **[src/services/razorpayRefundService.ts](src/services/razorpayRefundService.ts)** - Refund Processing
- **Purpose**: Handle refunds through Razorpay API

#### **[src/hooks/useRazorpay.ts](src/hooks/useRazorpay.ts)** - Razorpay Hook
- **Purpose**: React hook for Razorpay payment flow

### Payment Security Components

#### **[src/components/security/PaymentSecurityWrapper.tsx](src/components/security/PaymentSecurityWrapper.tsx)** - Payment Security Container
- **Purpose**: Wraps payment form with security validations

#### **[src/components/security/SecurePaymentForm.tsx](src/components/security/SecurePaymentForm.tsx)** - Secure Payment Form
- **Purpose**: Handles secure payment form submission

### Payment Processing Functions

#### **[functions/create-razorpay-order.ts](functions/create-razorpay-order.ts)** - Cloudflare Function: Create Razorpay Order
- **Purpose**: Server-side order creation for payment processing
- **Key Lines**:
  - **Line 1-20**: Type definitions
  - **Line 7-17**: CreateOrderRequest interface with amount, currency, receipt fields
  - **Line 22-30**: Environment variables needed (Supabase, Razorpay credentials)
  - **Line 35-60**: CORS headers setup
  - **Line 63-95**: Validation:
    - Amount, currency, receipt, customer_email required
    - Razorpay credentials validation
    - Supabase credentials validation
  - **Line 97-165**: Fetch Razorpay settings from Supabase
  - **Line 167-250+**: Create order via Razorpay API:
    - Convert amount to paise (1 INR = 100 paise)
    - Send to Razorpay /orders endpoint
    - Return order ID to frontend

#### **[functions/api/create-razorpay-refund.ts](functions/api/create-razorpay-refund.ts)** - Create Refund
- **Purpose**: Process refunds via Razorpay API
- **Key Lines**:
  - **Line 15**: Interface with payment_id for refund
  - **Line 38-45**: Extract payment_id, amount, speed, notes
  - **Line 108-160**: Fetch payment details to verify capturable state
  - **Line 161-175**: Validate payment not already fully refunded
  - **Line 189-220**: Create refund via Razorpay API

#### **[functions/check-razorpay-refund-status.ts](functions/check-razorpay-refund-status.ts)** - Check Refund Status
- **Purpose**: Query refund status from Razorpay

#### **[functions/api/razorpay-webhook.ts](functions/api/razorpay-webhook.ts)** - Razorpay Webhook Handler
- **Purpose**: Handle incoming webhook events from Razorpay
- **Key Lines**:
  - **Line 4**: Handles payment and refund status updates
  - **Line 22+**: Payment object with payment status, ID, etc.

### Order Creation Utilities

#### **[src/utils/orders.ts](src/utils/orders.ts)** - Order Creation & Management Utilities
- **Purpose**: Utility functions for creating orders, updating customer profiles
- **Key Functions**:
  - `upsertCustomerByEmail()` - Create or update customer
  - `createOrderWithItems()` - Create order record with line items
  - `updateCustomerProfile()` - Update customer information
  - `markWelcomeEmailSent()` - Track welcome email status

---

## 5. CONFIGURATION FILES

### Email Configuration

#### **[src/config/email.ts](src/config/email.ts)** - Email Template Configuration
- **Purpose**: Email template settings for various order events
- **Key Lines**:
  - **Line 29-39**: Order-related email templates:
    - `orderConfirmation`: Template for order confirmation emails
    - `orderShipped`: Template for shipment notifications
    - `orderDelivered`: Template for delivery confirmation

### Supabase Configuration

#### **[src/config/supabase.ts](src/config/supabase.ts)** - Supabase Client Setup
- **Purpose**: Supabase client initialization
- **Key Lines**:
  - **Line 44-62**: `getSupabaseAdminClient()` and `supabaseAdmin` export for privileged operations

---

## 6. RELATED DATABASE TABLES (Schema Reference)

### Tables Referenced in Code:

1. **exchange_rates** - Stores USD/EUR exchange rates
   - Fields: id, currency, rate, updated_at, source, created_at

2. **orders** - Customer orders
   - Fields: id, order_number, status, payment_status, total_amount, customer_id, payment_method, razorpay_order_id, created_at
   - COD fields: cod_amount, cod_collected, online_amount, payment_split
   - Shipping fields: logistics_partner_id, tracking_number, shipped_at
   - Address fields: billing_*, shipping_*

3. **order_items** - Line items in orders
   - Fields: id, order_id, product_id, product_variant_id, product_name, quantity, total_price

4. **customers** - Customer profiles
   - Fields: id, email, first_name, last_name, phone, country

5. **customer_addresses** - Saved addresses
   - Fields: id, customer_id, address fields (line_1, line_2, city, state, postal_code, country)

6. **settings** - Configuration storage
   - Where: category='payment', keys like 'razorpay_*', 'razorpay_currency' = 'INR'

7. **return_requests** - Return request tracking

---

## 7. KEY CONVERSION FORMULA

**Price Conversion Formula** (Used in [src/contexts/CurrencyContext.tsx](src/contexts/CurrencyContext.tsx#L223-L238)):

```
Final Price = (INR price / (base_rate - 5)) × multiplier
```

**Where:**
- `base_rate`: Exchange rate from database (USD: 88, EUR: 102)
- `5`: Markup in INR subtracted from base rate
- `multiplier`: USD = 2x, EUR = 1.5x

**Examples:**
- ₹1,000 → $24.10 (using USD rate of 88)
- ₹1,000 → €15.46 (using EUR rate of 102)

---

## 8. DEFAULT CURRENCY CONFIGURATION

- **Default Currency**: INR (₹)
- **Fallback Rates**:
  - USD: 88 INR
  - EUR: 102 INR
- **Set in**:
  - [src/contexts/CurrencyContext.tsx](src/contexts/CurrencyContext.tsx#L52-L56) (database fetch default)
  - [src/contexts/CurrencyContext.tsx](src/contexts/CurrencyContext.tsx#L113) (state initialization)
  - [src/utils/currencyUtils.ts](src/utils/currencyUtils.ts#L3-L7) (conversion multipliers)
  - [src/services/razorpayService.ts](src/services/razorpayService.ts#L107) (payment service default)

---

## 9. LOCATION-BASED CURRENCY DETECTION

**Logic in** [src/contexts/CurrencyContext.tsx](src/contexts/CurrencyContext.tsx#L159-L196):

| Location | Default Currency | Allowed Currencies | Source |
|----------|------------------|-------------------|--------|
| India / Unknown | INR (₹) | INR, USD, EUR | GeoIP API |
| EU Countries | EUR (€) | EUR, USD | GeoIP API |
| Rest of World | USD ($) | USD, EUR | GeoIP API |

**EU Countries List** (Line 167-173): Austria, Belgium, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden

---

## SUMMARY

**Total Files: 20+**

- **Currency Core**: 4 files (Context, Utils, Formatter, Switcher)
- **Exchange Rates**: 3 files (Admin Page, Edge Function, Documentation)
- **Order Management**: 4 files (Admin Page, Edit Modal, Customer View, Confirmation)
- **Payment Processing**: 8 files (Checkout, Razorpay Service, Refund Service, Functions)
- **Configuration**: 2 files (Email, Supabase)
- **Related**: Documentation files

**Key Default**: INR is the base currency with 88 INR/USD and 102 INR/EUR baseline rates
