# Razorpay Payment Gateway Integration

This document outlines the complete Razorpay payment gateway integration for the Nirchal e-commerce platform.

## Overview

The integration provides a secure, seamless payment experience for customers using Razorpay's industry-standard payment gateway. It supports multiple payment methods including credit/debit cards, UPI, net banking, and wallets.

## Features

- **Multiple Payment Methods**: Cards, UPI, Net Banking, Wallets
- **Secure Payment Processing**: Industry-standard security with Razorpay
- **Payment Verification**: Server-side signature verification
- **Order Management**: Automatic order status updates
- **Error Handling**: Comprehensive error handling and user feedback
- **Mobile Responsive**: Optimized for mobile and desktop
- **Test/Live Environment**: Support for both test and production environments

## Architecture

### Frontend Components
- **useRazorpay Hook**: React hook for Razorpay SDK integration
- **CheckoutPage**: Updated checkout flow with Razorpay option
- **Payment UI**: Integrated payment method selection

### Backend Services
- **Netlify Functions**: Server-side order creation and verification
- **Razorpay Service**: TypeScript service for Razorpay operations
- **Database Integration**: Order and payment tracking

### Database Schema
- **Settings Table**: Razorpay configuration storage
- **Orders Table**: Enhanced with Razorpay fields
- **Helper Functions**: Payment status management

## Setup Instructions

### 1. Database Migration

Run the following SQL files in order:

```sql
-- 1. Add Razorpay settings to settings table
\i src/db/add_razorpay_settings.sql

-- 2. Add Razorpay fields to orders table
\i src/db/add_razorpay_orders_integration.sql
```

### 2. Razorpay Account Setup

1. **Create Razorpay Account**
   - Visit [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Sign up for a business account
   - Complete KYC verification

2. **Get API Keys**
   - Navigate to Settings > API Keys
   - Generate Key ID and Key Secret for Test mode
   - For Live mode, complete activation and generate Live keys

3. **Configure Webhooks** (Optional but recommended)
   - Go to Settings > Webhooks
   - Add webhook URL: `https://yoursite.com/.netlify/functions/razorpay-webhook`
   - Select events: `payment.captured`, `payment.failed`, `order.paid`

### 3. Environment Configuration

Update your Supabase settings table with Razorpay configuration:

```sql
-- Test Environment Configuration
UPDATE settings SET value = 'rzp_test_your_key_id_here' 
WHERE category = 'payment' AND key = 'razorpay_test_key_id';

UPDATE settings SET value = 'your_test_key_secret_here' 
WHERE category = 'payment' AND key = 'razorpay_test_key_secret';

UPDATE settings SET value = 'test' 
WHERE category = 'payment' AND key = 'razorpay_environment';

UPDATE settings SET value = 'true' 
WHERE category = 'payment' AND key = 'razorpay_enabled';

-- Company Branding (Optional)
UPDATE settings SET value = 'Nirchal' 
WHERE category = 'payment' AND key = 'razorpay_company_name';

UPDATE settings SET value = '#f59e0b' 
WHERE category = 'payment' AND key = 'razorpay_theme_color';
```

### 4. Deploy and Test

1. **Deploy the Application**
   ```bash
   npm run build
   netlify deploy --prod
   ```

2. **Test Payment Flow**
   - Use Razorpay test card numbers
   - Test Card: 4111 1111 1111 1111
   - CVV: Any 3-digit number
   - Expiry: Any future date

## Configuration Reference

### Settings Table Configuration

| Setting Key | Description | Example Value | Required |
|-------------|-------------|---------------|----------|
| `razorpay_enabled` | Enable/disable Razorpay | `true` | Yes |
| `razorpay_environment` | Environment mode | `test` or `live` | Yes |
| `razorpay_key_id` | Live Key ID | `rzp_live_xxx` | Yes (for live) |
| `razorpay_key_secret` | Live Key Secret | `secret_xxx` | Yes (for live) |
| `razorpay_test_key_id` | Test Key ID | `rzp_test_xxx` | Yes (for test) |
| `razorpay_test_key_secret` | Test Key Secret | `secret_xxx` | Yes (for test) |
| `razorpay_company_name` | Company name in checkout | `Nirchal` | No |
| `razorpay_theme_color` | Checkout theme color | `#f59e0b` | No |
| `razorpay_currency` | Default currency | `INR` | No |
| `razorpay_auto_capture` | Auto-capture payments | `true` | No |

### Test vs Live Environment

**Test Environment:**
- Use `razorpay_test_key_id` and `razorpay_test_key_secret`
- Set `razorpay_environment` to `test`
- Use test card numbers from Razorpay documentation

**Live Environment:**
- Use `razorpay_key_id` and `razorpay_key_secret`
- Set `razorpay_environment` to `live`
- Complete Razorpay KYC and activation
- Use real payment methods

## API Endpoints

### Create Order
- **Endpoint**: `/.netlify/functions/create-razorpay-order`
- **Method**: POST
- **Purpose**: Creates a Razorpay order and returns checkout configuration

**Request Body:**
```json
{
  "amount": 1000.00,
  "currency": "INR",
  "receipt": "ORD001",
  "customer_email": "customer@example.com",
  "customer_phone": "+919999999999",
  "notes": {
    "order_id": "123",
    "customer_name": "John Doe"
  }
}
```

**Response:**
```json
{
  "order": {
    "id": "order_xxx",
    "amount": 100000,
    "currency": "INR",
    "receipt": "ORD001"
  },
  "checkout_config": {
    "key": "rzp_test_xxx",
    "order_id": "order_xxx",
    "name": "Nirchal",
    "description": "Payment for Nirchal order",
    "theme": {
      "color": "#f59e0b"
    }
  }
}
```

### Verify Payment
- **Endpoint**: `/.netlify/functions/verify-razorpay-payment`
- **Method**: POST
- **Purpose**: Verifies payment signature and updates order status

**Request Body:**
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx",
  "order_id": "123"
}
```

**Response:**
```json
{
  "verified": true,
  "order": {
    "id": 123,
    "payment_status": "paid",
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_xxx"
  },
  "payment_details": {
    "id": "pay_xxx",
    "amount": 100000,
    "currency": "INR",
    "status": "captured",
    "method": "card"
  }
}
```

## Payment Flow

### 1. Customer Selects Razorpay
1. Customer fills checkout form
2. Selects "Credit/Debit Card & UPI" payment method
3. Clicks "Place Order"

### 2. Order Creation
1. System creates order record in database
2. Calls `create-razorpay-order` endpoint
3. Receives Razorpay order ID and checkout config

### 3. Payment Processing
1. Razorpay checkout modal opens
2. Customer enters payment details
3. Razorpay processes payment
4. Returns payment response to frontend

### 4. Payment Verification
1. Frontend receives payment response
2. Calls `verify-razorpay-payment` endpoint
3. Server verifies payment signature
4. Updates order status in database

### 5. Order Completion
1. Customer redirected to confirmation page
2. Order confirmation email sent
3. Cart cleared
4. Payment complete

## Error Handling

### Common Error Scenarios

1. **Razorpay SDK Not Loaded**
   - Error: "Razorpay is not loaded"
   - Solution: Check internet connection, retry

2. **Invalid Payment Signature**
   - Error: "Payment verification failed"
   - Action: Order marked as failed, customer notified

3. **Network Timeout**
   - Error: "Payment initialization failed"
   - Action: Customer can retry payment

4. **Insufficient Funds**
   - Error: From Razorpay payment modal
   - Action: Customer can try different payment method

### Error Logging

All payment errors are logged with context:
- Order ID
- Customer information
- Error details
- Timestamp

## Security Considerations

### Payment Security
- All payment processing handled by Razorpay (PCI DSS compliant)
- No sensitive payment data stored locally
- Server-side signature verification for all payments

### Data Protection
- Razorpay keys stored encrypted in database
- Environment-specific key usage
- Webhook signature validation

### API Security
- CORS headers configured
- Input validation on all endpoints
- SQL injection protection
- Rate limiting (via Netlify)

## Testing

### Test Card Numbers

| Card Type | Number | CVV | Expiry |
|-----------|--------|-----|--------|
| Visa | 4111 1111 1111 1111 | Any | Future |
| Mastercard | 5555 5555 5555 4444 | Any | Future |
| Rupay | 6073 8499 9999 9999 | Any | Future |

### Test UPI IDs
- `success@razorpay`
- `failure@razorpay`

### Test Scenarios

1. **Successful Payment**
   - Use test card numbers
   - Complete payment flow
   - Verify order status updated

2. **Failed Payment**
   - Use failure@razorpay UPI ID
   - Verify error handling
   - Check order status remains pending

3. **Payment Cancellation**
   - Close Razorpay modal
   - Verify order remains in pending state
   - Customer can retry payment

## Monitoring and Analytics

### Key Metrics to Monitor
- Payment success rate
- Average payment completion time
- Failed payment reasons
- Customer payment method preferences

### Database Queries

```sql
-- Payment success rate
SELECT 
  COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) * 100.0 / COUNT(*) as success_rate
FROM orders 
WHERE payment_method = 'razorpay' 
  AND created_at > NOW() - INTERVAL '30 days';

-- Failed payments by reason
SELECT 
  payment_details->>'error'->>'code' as error_code,
  COUNT(*) as count
FROM orders 
WHERE payment_method = 'razorpay' 
  AND payment_status = 'failed'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY error_code
ORDER BY count DESC;

-- Revenue from Razorpay payments
SELECT 
  DATE(created_at) as date,
  SUM(total_amount) as revenue,
  COUNT(*) as order_count
FROM orders 
WHERE payment_method = 'razorpay' 
  AND payment_status = 'paid'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Troubleshooting

### Common Issues

1. **"Razorpay is disabled" Error**
   - Check `razorpay_enabled` setting in database
   - Verify environment configuration

2. **"Invalid API key" Error**
   - Verify key ID and secret in settings
   - Check environment (test vs live) settings

3. **Payment Modal Not Opening**
   - Check browser console for JavaScript errors
   - Verify Razorpay SDK loaded correctly
   - Check for popup blockers

4. **Webhook Not Receiving Events**
   - Verify webhook URL in Razorpay dashboard
   - Check SSL certificate validity
   - Verify webhook signature validation

### Debug Mode

Enable debug logging by setting:
```sql
UPDATE settings SET value = 'true' 
WHERE category = 'payment' AND key = 'razorpay_debug_mode';
```

### Support Contacts

- **Razorpay Support**: support@razorpay.com
- **Technical Documentation**: https://razorpay.com/docs/
- **API Reference**: https://razorpay.com/docs/api/

## Changelog

### Version 1.0.0 (Current)
- Initial Razorpay integration
- Support for cards, UPI, net banking, wallets
- Test and live environment support
- Payment verification and order management
- Comprehensive error handling
- Mobile-responsive checkout experience

## Future Enhancements

### Planned Features
1. **Webhook Integration**: Real-time payment status updates
2. **Refund Management**: Admin panel for processing refunds
3. **Payment Analytics**: Advanced reporting dashboard
4. **Subscription Support**: Recurring payment plans
5. **Multi-currency**: Support for international payments
6. **EMI Options**: Easy installment plans
7. **Payment Links**: Generate payment links for offline orders

### Integration Opportunities
- **Inventory Management**: Auto-reserve stock on payment
- **Loyalty Program**: Points on successful payments
- **Fraud Detection**: Advanced payment screening
- **Customer Insights**: Payment behavior analytics
