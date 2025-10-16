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

## Testing Checklist

- [ ] Cart with only products - no split option shown
- [ ] Cart with only services - no split option shown  
- [ ] Cart with products + services - split option shown
- [ ] Full payment - correct total charged
- [ ] Split payment - correct product amount charged
- [ ] Razorpay notes contain split payment info
- [ ] Session storage stores COD amount
- [ ] Order confirmation displays COD (when implemented)
- [ ] Email shows split payment details (when implemented)

## Files Modified
- `src/pages/CheckoutPage.tsx` - Main implementation
- Payment split calculation logic
- UI components for payment options
- Razorpay order creation with notes
- Session storage for COD amount

---
**Feature Status**: ✅ Implemented and Ready for Testing
**Last Updated**: January 2025
