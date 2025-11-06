# Inventory Management Fix

## Issue Summary
Inventory quantities were not being updated when:
1. Orders were successfully placed and paid
2. Returns were approved/received and items were restored to stock

## Root Cause Analysis

### 1. Order Inventory Decrement
✅ **Already Implemented** - The webhook handler correctly decrements inventory when `payment.captured` event is received.

**Location:** `functions/razorpay-webhook.ts`
- Function: `updateInventoryForOrder()`
- Called by: `handlePaymentCaptured()` when payment is confirmed
- Process:
  1. Fetches order items
  2. Finds inventory record for each product/variant
  3. Decrements quantity: `newQuantity = oldQuantity - orderedQuantity`
  4. Creates inventory history entry with reason: `Order {orderId} - Payment Captured`

**Important Notes:**
- Inventory is NOT decremented when order is created (to prevent stock issues if payment fails)
- Only decremented AFTER payment confirmation from Razorpay webhook
- Uses `inventory` table, not `products.stockQuantity` field

### 2. Return Inventory Restoration
❌ **Was Missing** - No code existed to restore inventory when returns were approved.

**Problem:** When admin completed inspection and approved a return, the `completeInspection()` function only:
- Updated return item conditions
- Calculated refund amounts
- Changed return status to approved/partially_approved
- Sent email notification

It did NOT restore inventory back to stock.

## Solution Implemented

### Added Inventory Restoration to Return Flow

**Location:** `src/services/returnService.ts`

#### 1. Created `restoreInventoryForReturn()` Function
```typescript
private async restoreInventoryForReturn(input: CompleteInspectionInput): Promise<void>
```

**Features:**
- Fetches all return items with product/variant information
- Loops through each item and its inspection result
- **Skips** items marked as `not_received` (rejected returns)
- For approved items:
  1. Finds inventory record for product/variant
  2. Increments quantity: `newQuantity = oldQuantity + returnedQuantity`
  3. Updates inventory table
  4. Creates inventory history entry with reason: `Return {returnId} - Items Received ({condition})`
- Logs detailed information for debugging
- Continues processing even if one item fails (error isolation)

#### 2. Integrated into `completeInspection()` Function

**Call Location:** After inspection status is updated, before email is sent

```typescript
// ✅ RESTORE INVENTORY: For items that are received and approved/partially approved
// Only restore inventory for items that are NOT rejected (not_received)
if (newStatus !== 'rejected') {
  try {
    await this.restoreInventoryForReturn(input);
  } catch (inventoryError) {
    console.error('Error restoring inventory after inspection:', inventoryError);
    // Don't fail the inspection if inventory update fails
    // This can be manually adjusted later if needed
  }
}
```

**Error Handling:**
- Wrapped in try-catch to prevent inspection failure if inventory update fails
- Allows manual adjustment later if needed
- Logs all errors for debugging

## Inventory Flow Overview

### Complete Order-to-Return Inventory Flow

```
1. Customer places order
   └─> Order created in database
   └─> Inventory NOT changed (payment pending)

2. Customer completes payment
   └─> Razorpay sends payment.captured webhook
   └─> Webhook calls updateInventoryForOrder()
   └─> Inventory DECREMENTED
   └─> History: "Order {id} - Payment Captured"

3. Customer initiates return
   └─> Return request created
   └─> Inventory NOT changed (items not received yet)

4. Customer ships items back
   └─> Status: shipped_by_customer
   └─> Inventory NOT changed (items in transit)

5. Admin marks as received
   └─> Status: received
   └─> Inventory NOT changed (not inspected yet)

6. Admin completes inspection
   └─> Status: approved/partially_approved/rejected
   └─> Inventory INCREMENTED (if approved/partially_approved)
   └─> History: "Return {id} - Items Received ({condition})"
   └─> Items marked as not_received are NOT restored

7. Refund processed via Razorpay
   └─> Webhook updates return status to refund_completed
   └─> Email sent to customer
   └─> Inventory already restored in step 6
```

## Inventory Table Structure

```sql
inventory (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id) NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

inventory_history (
  id UUID PRIMARY KEY,
  inventory_id UUID REFERENCES inventory(id),
  change_type TEXT, -- 'adjustment', 'order', 'return', etc.
  quantity_before INTEGER,
  quantity_after INTEGER,
  quantity_changed INTEGER,
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP
)
```

## Testing the Fix

### Test Case 1: Successful Order
1. Place an order with 5 quantity
2. Complete payment via Razorpay
3. Check inventory - should be decremented by 5
4. Check inventory_history - should have entry: "Order {id} - Payment Captured"

### Test Case 2: Full Return (Approved)
1. Create return request for the order
2. Mark as shipped by customer
3. Mark as received by admin
4. Complete inspection with all items as "excellent"
5. Check inventory - should be incremented by 5 (back to original)
6. Check inventory_history - should have entry: "Return {id} - Items Received (excellent)"

### Test Case 3: Partial Return (Some Items Damaged)
1. Return 5 items
2. Mark 3 as "excellent", 2 as "not_received"
3. Check inventory - should be incremented by 3 only
4. Check inventory_history - should show +3 restored

### Test Case 4: Rejected Return (Not Received)
1. Return 5 items
2. Mark all as "not_received"
3. Check inventory - should NOT be incremented (0 change)
4. No inventory history entry created

## Important Notes

### Product vs Variant Inventory
- System uses `inventory` table, not `products.stockQuantity` field
- Each product/variant has a separate inventory record
- When querying:
  - If variant exists: `product_id = X AND variant_id = Y`
  - If no variant: `product_id = X AND variant_id IS NULL`

### Condition-Based Restoration
All conditions restore inventory EXCEPT `not_received`:
- ✅ `excellent` - No deduction, inventory restored
- ✅ `good` - 5% deduction, inventory restored
- ✅ `fair` - 15% deduction, inventory restored
- ✅ `poor` - 30% deduction, inventory restored
- ✅ `damaged` - 50% deduction, inventory restored
- ❌ `not_received` - 100% deduction, inventory NOT restored

### Error Handling Philosophy
- **Order decrement failure**: Logs error, continues (can be manually adjusted)
- **Return increment failure**: Logs error, inspection still succeeds (can be manually adjusted)
- Rationale: Better to have successful order/return with inventory discrepancy that can be fixed manually than to fail the entire transaction

### Manual Inventory Adjustment
Admins can manually adjust inventory via:
1. Admin Dashboard → Inventory Management
2. Bulk adjust feature for corrections
3. Inventory history tracks all changes with reasons

## Files Modified

1. **src/services/returnService.ts**
   - Added `restoreInventoryForReturn()` private method
   - Updated `completeInspection()` to call inventory restoration

## Deployment Notes

No database migrations required - uses existing `inventory` and `inventory_history` tables.

Deploy and test:
```bash
npm run build
# Deploy to production
```

## Monitoring

Check logs for:
- `📦 Updating inventory for order:` - Order inventory decrement
- `📦 Restoring inventory for return:` - Return inventory increment
- `✅ Inventory restored: Product {id}` - Successful restoration
- `❌ Failed to restore inventory` - Failures requiring attention
- `⚠️ No inventory record found` - Missing inventory records

## Future Improvements

1. **Real-time Stock Alerts**: Notify admin when stock falls below threshold
2. **Inventory Reconciliation Report**: Daily report comparing expected vs actual inventory
3. **Automatic Reservation**: Reserve inventory when order is created (with timeout if payment fails)
4. **Inventory Snapshots**: Daily snapshots for audit trail
5. **Multi-warehouse Support**: Track inventory across multiple locations
