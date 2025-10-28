# Return & Refund System - Services Implementation Summary

## Overview
Complete implementation of core services for the Return & Refund Management System.

## Completed Services

### 1. Return Eligibility Service (`src/services/returnEligibilityService.ts`)
**Purpose**: Validates if an order is eligible for return based on business rules

**Key Methods**:
- `checkOrderEligibility(orderId)` - Comprehensive eligibility check
- `getDaysRemaining(orderId)` - Calculate remaining return window days
- `checkItemsEligibilityForOrder(orderId, itemIds)` - Validate specific items

**Business Rules Implemented**:
✅ Returns must be globally enabled (setting: `return_enabled`)
✅ Order must have `delivered` status
✅ Must be within return window (default: 2 days from delivery)
✅ Must meet minimum order amount (if configured)
✅ Payment must be completed (`payment_status = 'paid'`)
✅ No active return request already exists
✅ Service items excluded (detected via `variant_size` = "Service" or "Custom")
✅ At least one eligible item required

**Return Value**: `ReturnEligibilityCheck`
```typescript
{
  isEligible: boolean;
  reasons: string[]; // Rejection reasons if not eligible
  eligibleItems: OrderItem[]; // Products that can be returned
  ineligibleItems: OrderItem[]; // Services or excluded items
  daysRemaining: number; // Days left in return window
}
```

**Service Detection Logic**:
- Checks order item's `variant_size` field from `order_items` table
- Service items identified when `variant_size` = "Service" or "Custom" (case-insensitive)
- Simple, direct detection without category lookup

---

### 2. Return CRUD Service (`src/services/returnService.ts`)
**Purpose**: Database operations for return requests and items

**Key Methods**:

#### Create Operations
- `createReturnRequest(input: CreateReturnRequestInput)` 
  - Creates return request + return items in transaction
  - Auto-generates return number (e.g., `RTN-2025-001234`)
  - Sets initial status to `pending_shipment`
  - Rollback on error

#### Read Operations
- `getReturnRequestById(id, includeHistory)` - Fetch single return with items (and history)
- `getReturnRequestsByCustomer(customerId, limit, offset)` - Paginated customer returns
- `getAllReturnRequests(filters, limit, offset)` - Admin view with filters
- `getReturnStatistics(dateFrom, dateTo)` - Dashboard metrics

#### Update Operations  
- `updateReturnStatus(id, status, notes)` - Change status with audit trail
- `markAsShipped(id, trackingInfo)` - Customer ships item (status → `shipped_by_customer`)
- `markAsReceived(id, receivedBy)` - Admin receives package (status → `received`)
- `completeInspection(input)` - Process inspection with item conditions
- `cancelReturnRequest(id, customerId, reason)` - Customer cancellation (before received)

#### Helper Methods
- `calculateRefundAmount(items)` - Calculate deductions based on condition
- `getReturnStatistics(dateFrom, dateTo)` - Analytics data

**Inspection Workflow**:
```typescript
completeInspection({
  return_request_id: string;
  inspection_results: [
    {
      item_id: string;
      item_condition: ItemCondition; // excellent, good, fair, poor, damaged, not_received
      inspection_notes: string;
      quality_issue_description: string;
      deduction_percentage: number; // 0%, 5%, 15%, 30%, 50%, 100%
      deduction_amount: number;
      approved_return_amount: number;
      inspection_image_urls: string[];
    }
  ];
  inspection_notes: string;
  inspected_by: string; // admin user ID
  overall_status: 'approved' | 'partially_approved' | 'rejected';
})
```

**Status Determination**:
- All items `excellent`/`good` → `approved`
- All items `not_received` → `rejected`
- Mixed conditions → `partially_approved`

**Quality Deduction Rates**:
| Condition | Deduction | Refund |
|-----------|-----------|--------|
| Excellent | 0% | 100% |
| Good | 5% | 95% |
| Fair | 15% | 85% |
| Poor | 30% | 70% |
| Damaged | 50% | 50% |
| Not Received | 100% | 0% |

---

## Type Definitions Updated

### Input Types (`src/types/return.types.ts`)

**CreateReturnRequestInput**:
```typescript
{
  order_id: string;
  customer_id: string; // From auth
  request_type: ReturnRequestType;
  return_reason: ReturnReason;
  reason_description: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_address: string; // Return shipping address
  customer_images: string[];
  customer_video_url?: string;
  items: CreateReturnItemInput[];
}
```

**CreateReturnItemInput**:
```typescript
{
  order_item_id: string;
  product_id: string;
  product_name: string;
  product_variant_id?: string;
  variant_size?: string;
  variant_color?: string;
  variant_material?: string;
  product_sku?: string;
  quantity_ordered: number;
  quantity_to_return: number;
  unit_price: number;
  total_price: number;
  customer_notes?: string;
  image_urls?: string[];
}
```

**CompleteInspectionInput**:
```typescript
{
  return_request_id: string;
  inspection_results: InspectionResultInput[];
  inspection_notes?: string;
  inspected_by: string;
  overall_status: 'approved' | 'partially_approved' | 'rejected';
}
```

**InspectionResultInput**:
```typescript
{
  item_id: string;
  item_condition: ItemCondition;
  inspection_notes?: string;
  quality_issue_description?: string;
  deduction_percentage: number;
  deduction_amount: number;
  approved_return_amount: number;
  inspection_image_urls?: string[];
}
```

---

## API Response Patterns

All service methods follow consistent error handling:

```typescript
async someMethod(): Promise<{ 
  data: T | null; 
  error: Error | null;
}> {
  try {
    // Operation
    return { data: result, error: null };
  } catch (error) {
    console.error('Error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}
```

Paginated responses include count:
```typescript
{
  data: T[];
  error: Error | null;
  count: number; // Total count for pagination
}
```

---

## Database Compatibility

Both services are fully compatible with the updated database schema:

✅ Uses `auth.users` for authentication (no custom users table)
✅ Matches `order_items` column names (`product_variant_id`, `product_sku`, `unit_price`)
✅ Supports variant fields (`variant_size`, `variant_color`, `variant_material`)
✅ Uses plain UUID fields for user references (with comments)
✅ Leverages RLS policies (JWT-based role checking)
✅ Utilizes database triggers (return number generation, status history)
✅ Service detection via category settings

---

## Return Workflow States

```
1. pending_shipment → Customer creates return request
2. shipped_by_customer → Customer ships package (with tracking)
3. received → Admin receives package at warehouse
4. under_inspection → Admin inspects items
5. approved/partially_approved/rejected → Inspection complete
6. refund_initiated → Razorpay refund started
7. refund_completed → Money returned to customer
```

Alternative paths:
- `cancelled` - Customer cancels before inspection
- `rejected` - All items failed inspection

---

## Error Handling & Validation

**Eligibility Service**:
- Returns `isEligible: false` with clear `reasons[]`
- Handles missing data gracefully (returns default settings)
- Separates eligible/ineligible items

**CRUD Service**:
- Transaction rollback on multi-step failures
- Authorization checks (customer can only cancel own returns)
- Status validation (can't cancel after received)
- Type-safe error responses

---

## Testing Checklist

### Eligibility Service
- [ ] Test with delivered order within window
- [ ] Test with order outside return window
- [ ] Test with service-only order
- [ ] Test with mixed products + services
- [ ] Test with existing active return
- [ ] Test with non-delivered order
- [ ] Test with unpaid order

### CRUD Service
- [ ] Test createReturnRequest with multiple items
- [ ] Test rollback on item creation failure
- [ ] Test getReturnRequestById with/without history
- [ ] Test pagination in getAllReturnRequests
- [ ] Test filtering by status/date/search
- [ ] Test markAsShipped with tracking info
- [ ] Test completeInspection with all statuses
- [ ] Test cancelReturnRequest authorization
- [ ] Test calculateRefundAmount with different conditions

---

## Configuration Required

Before using services, ensure these settings are configured in database:

```sql
INSERT INTO settings (category, key, value) VALUES
  ('returns', 'return_enabled', 'true'),
  ('returns', 'return_window_days', '2'),
  ('returns', 'min_order_amount', '0'),
  ('returns', 'exclude_services', 'true');

-- Note: Service detection is automatic via variant_size field
-- Set variant_size = 'Service' or 'Custom' for service items in order_items table
```

---

## Next Steps

### Immediate (Phase 3)
1. ✅ Return Eligibility Service - COMPLETED
2. ✅ Return CRUD Service - COMPLETED
3. ⏳ Image Upload Service - Create Supabase Storage service
4. ⏳ Razorpay Refund Service - Integrate Razorpay API

### Upcoming (Phase 4-5)
5. Customer UI Components
6. Admin UI Components
7. Email Notifications
8. Webhook Handlers

---

## File Structure

```
src/
├── services/
│   ├── returnEligibilityService.ts (360 lines) ✅
│   └── returnService.ts (640 lines) ✅
├── types/
│   ├── return.types.ts (635 lines) ✅
│   ├── razorpay-refund.types.ts (170 lines) ✅
│   └── return.index.ts (220 lines) ✅
└── config/
    └── supabase.ts (existing)
```

**Total Lines**: ~2,025 lines of TypeScript code
**Compilation Status**: ✅ Zero errors
**Type Safety**: ✅ Fully typed

---

## Key Features

✅ **Comprehensive Validation** - Multi-level eligibility checking
✅ **Service Detection** - Automatic exclusion of service categories
✅ **Quality-Based Deductions** - Fair refund calculation
✅ **Audit Trail** - Automatic status history logging
✅ **Transaction Safety** - Rollback on failures
✅ **Pagination Support** - Efficient data loading
✅ **Filter & Search** - Admin dashboard ready
✅ **Type Safety** - Full TypeScript coverage
✅ **Error Handling** - Consistent patterns
✅ **Authorization** - Customer/admin separation

---

## Database Dependencies

**Tables Used**:
- `orders` - Order information
- `order_items` - Items in order
- `products` - Product details
- `categories` - Service detection
- `settings` - Configuration
- `return_requests` - Main return table
- `return_items` - Items being returned
- `return_status_history` - Audit trail (auto-populated by trigger)

**Functions Used**:
- `generate_return_number()` - Auto number generation
- Trigger: `log_return_status_change` - Status history

**RLS Policies**:
- Customer can view own returns
- Admin can view all returns
- JWT-based role checking

---

**Last Updated**: 2025-01-23
**Status**: Services layer complete - Ready for Image Upload & Razorpay integration
**Lines of Code**: 2,025+ lines
**Compilation**: ✅ Zero errors
