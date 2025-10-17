# Payment Split Feature - Implementation Summary

## Overview
Customers can now choose to split their payment between products and services:
- **Option 1**: Pay full amount upfront (Products + Services)
- **Option 2**: Pay for products now + Pay for services on delivery (COD)

## Use Case
When a customer orders both products (like sarees, lehengas) and services (like Faal & Pico, custom stitching), they can:
1. Pay the full amount online
2. OR pay only for products online and pay for services when they receive the finished products

## Implementation Details

### 1. Checkout Page Changes

#### Payment Split Calculation
```typescript
const calculatePaymentSplit = () => {
  let productTotal = 0;
  let serviceTotal = 0;

  items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    // Services identified by size === 'Service' or 'Custom'
    if (item.size === 'Service' || item.size === 'Custom') {
      serviceTotal += itemTotal;
    } else {
      productTotal += itemTotal;
    }
  });

  return { productTotal, serviceTotal };
};
```

#### UI Components Added
1. **Payment Options Radio Buttons** (Only shown when cart has both products and services)
   - Full Payment option - highlighted in amber
   - Split Payment option - highlighted in green, marked as "Recommended"

2. **Dynamic Pricing Summary**
   - **Full Payment Mode**:
     - Subtotal
     - Delivery
     - Total
   
   - **Split Payment Mode**:
     - Products Subtotal
     - Services Subtotal
     - Delivery
     - **Pay Now (Products)** - in amber box
     - **Pay on Delivery (Services)** - in green box
     - Order Total

### 2. Order Processing

#### Razorpay Integration
- When split payment is selected, Razorpay order is created with:
  - Amount = Products total (not full order total)
  - Notes include:
    ```typescript
    {
      payment_split: 'yes',
      online_amount: productTotal,
      cod_amount: serviceTotal,
      payment_note: "Split Payment: Products ₹X (Paid Online) + Services ₹Y (COD)"
    }
    ```

#### Order Storage
- Order total_amount includes both online and COD amounts
- Payment split information stored in Razorpay order notes
- Session storage saves COD amount for confirmation page

### 3. Session Storage
After successful order:
```typescript
sessionStorage.setItem('cod_amount', serviceTotal.toString());
sessionStorage.setItem('payment_split', 'true');
```

This allows the Order Confirmation page to display COD information.

## Customer Experience Flow

### Scenario 1: Full Payment
1. Customer adds saree (₹5,000) + Faal & Pico service (₹150)
2. At checkout, selects "Pay Full Amount Now"
3. Pays ₹5,150 via Razorpay
4. Order confirmed

### Scenario 2: Split Payment
1. Customer adds saree (₹5,000) + Faal & Pico service (₹150)  
2. At checkout, selects "Split Payment"
3. UI shows:
   - Pay Now (Products): ₹5,000
   - Pay on Delivery (Services): ₹150
4. Pays ₹5,000 via Razorpay
5. Order confirmed with note to pay ₹150 on delivery
6. When finished saree is delivered, customer pays ₹150 cash

## Benefits

### For Customers
- ✅ Flexibility in payment
- ✅ Pay for services only after receiving finished products
- ✅ Trust building - see the product before paying for service
- ✅ Better cash flow management

### For Business
- ✅ Reduces friction in checkout
- ✅ Increases conversion (customers more likely to add services)
- ✅ Clear payment tracking in Razorpay notes
- ✅ Delivery person collects service payment

## Service Items Detected
Services are automatically detected by checking if `item.size === 'Service'` or `item.size === 'Custom'`:

**Current Services:**
- Faal & Pico Service (₹150)
- Custom Blouse Stitching (₹1,299)
- Custom Stitching Service (₹1,499)

**Product Items:**
- Sarees
- Lehengas
- Gowns
- Ready-made Blouses
- Jewelry
- Petticoats
- All other products

## Future Enhancements

### Admin Dashboard
- [ ] Show split payment orders with COD pending
- [ ] Mark service payment as collected
- [ ] Track service payment collection rate

### Order Confirmation Page
- [ ] Display COD amount prominently
- [ ] Show payment breakdown in order details
- [ ] Reminder about service payment on delivery

### Email Templates
- [ ] Include COD amount in order confirmation email
- [ ] Send reminder about service payment before delivery
- [ ] Delivery notification should mention COD collection

### Delivery Integration
- [ ] Generate COD collection note for delivery person
- [ ] Update order when COD is collected
- [ ] Send payment confirmation to customer

## Technical Notes

### Payment Flow
1. Customer selects split payment
2. Frontend calculates: `onlineAmount = productTotal`, `codAmount = serviceTotal`
3. Razorpay order created with `amount = onlineAmount`
4. Order stored with `total_amount = onlineAmount + codAmount`
5. Razorpay notes contain split payment details
6. Session storage saves COD amount
7. Order confirmation shows payment breakdown

### Database Considerations
- Current: No separate COD field in orders table
- Payment split info stored in Razorpay order notes
- Total amount includes both online + COD

### Recommended Database Updates (Future)
```sql
ALTER TABLE orders 
ADD COLUMN cod_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN cod_collected BOOLEAN DEFAULT FALSE,
ADD COLUMN cod_collected_at TIMESTAMP,
ADD COLUMN payment_split BOOLEAN DEFAULT FALSE;
```

## Database Schema

### Orders Table - New Columns
```sql
-- COD payment columns added to orders table
cod_amount         NUMERIC(10, 2) DEFAULT 0.00    -- Amount to be collected on delivery
cod_collected      BOOLEAN DEFAULT FALSE          -- Whether COD has been collected  
online_amount      NUMERIC(10, 2) DEFAULT 0.00    -- Amount paid online
payment_split      BOOLEAN DEFAULT FALSE          -- Whether order used split payment

-- Indexes for performance
idx_orders_cod_pending      -- Fast filtering of pending COD collections (WHERE cod_amount > 0 AND cod_collected = FALSE)
idx_orders_payment_split    -- COD analytics queries
idx_orders_cod_status       -- COD collection status queries
```

### Migration File
- **Location**: `add-cod-columns.sql`
- Adds 4 new columns to orders table
- Creates 3 performance indexes
- Includes column comments for documentation
- Includes verification queries
- Includes COD analytics sample queries

## Testing Checklist

- [x] Cart with only products - no split option shown
- [x] Cart with only services - no split option shown  
- [x] Cart with products + services - split option shown
- [x] Full payment - correct total charged
- [x] Split payment - correct product amount charged
- [x] Razorpay notes contain split payment info
- [x] Session storage stores COD amount
- [x] Order confirmation displays COD reminder
- [x] Email shows split payment details with COD amount
- [x] Database stores COD amount and split status
- [x] Order type definitions updated with COD fields
- [ ] Admin can view COD amounts in orders list
- [ ] Admin can mark COD as collected
- [ ] Admin dashboard shows COD analytics

## Files Modified
- `src/pages/CheckoutPage.tsx` - Main implementation (payment split calculation, UI, Razorpay integration, session storage)
- `src/pages/OrderConfirmationPage.tsx` - COD reminder display with payment breakdown
- `src/services/transactionalEmailService.ts` - Updated OrderData interface with COD fields
- `src/services/outlookCompatibleEmailTemplates.ts` - Enhanced email template with split payment info
- `src/types/index.ts` - Added COD fields to Order interface  
- `src/utils/orders.ts` - Added COD fields to CreateOrderInput type and order creation
- `add-cod-columns.sql` - Database migration for COD columns

## Customer Experience

### Order Confirmation Page
When split payment is used, customers see:
- ✅ Paid Online (Products): Amount in amber
- 💵 Pay on Delivery (Services): Amount in green (prominent)
- 📦 Reminder to keep COD amount ready for delivery

### Order Confirmation Email
- Complete item breakdown with sizes, colors, measurements
- Payment split summary (if applicable)
  - Paid Online (Products): Amber highlight
  - Pay on Delivery (Services): Green highlight, larger font
- Important reminder about COD amount collection

## Admin Features (To Be Implemented)

### Orders List Enhancements
1. **COD Column**: Show cod_amount for orders with split payment
2. **COD Status Badge**: 
   - 🟡 Pending (cod_collected = false)
   - 🟢 Collected (cod_collected = true)
3. **Collection Button**: Mark COD as collected
4. **Filter**: "Pending COD Collection" filter

### Dashboard Widget
- **Total Pending COD**: Sum of uncollected COD amounts
- **Total Collected COD**: Sum of collected COD amounts
- **Pending COD Orders List**: Quick access to orders awaiting collection
- **Today's COD Collections**: Track daily COD revenue

---
**Feature Status**: ✅ Core Implementation Complete | 🚧 Admin Features Pending
**Last Updated**: October 16, 2025
