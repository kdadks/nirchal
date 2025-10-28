# Invoice Management System - Technical Specification & Implementation Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Documentation](#api-documentation)
5. [User Interface](#user-interface)
6. [Security & Access Control](#security--access-control)
7. [Implementation Timeline](#implementation-timeline)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Guide](#deployment-guide)

---

## 1. System Overview

### Purpose
Comprehensive invoice management system for e-commerce platform that enables:
- Automatic invoice generation for completed orders
- Admin-controlled invoice distribution ("raise" functionality)
- Secure customer invoice downloads
- GST-compliant tax invoicing

### Key Features
✅ **Implemented:**
- Database schema with invoices table
- Invoice generation service with PDF creation
- 18% GST calculation and itemization
- Company & customer information capture
- Row-Level Security (RLS) policies
- Invoice number generation (Financial Year format)
- Base64 PDF storage

🔄 **In Progress:**
- Admin invoice management UI
- Customer download functionality
- React hooks for invoice operations

### Technology Stack
- **Frontend**: React 18 + TypeScript
- **PDF Generation**: jsPDF
- **Database**: Supabase PostgreSQL
- **Storage**: Base64 encoding (in-database)
- **Security**: Supabase RLS policies

---

## 2. Architecture

### System Flow Diagram

```
┌─────────────────┐
│  Admin Portal   │
└────────┬────────┘
         │
         ├──► Generate Invoices (Bulk)
         │    ├─ Select eligible orders
         │    ├─ Fetch order details
         │    ├─ Fetch company settings
         │    ├─ Calculate GST (18%)
         │    ├─ Generate PDF
         │    └─ Save to database (status: 'generated')
         │
         ├──► Preview Invoice
         │    └─ View PDF before raising
         │
         └──► Raise Invoices (Bulk)
              ├─ Update status: 'generated' → 'raised'
              ├─ Set raised_at timestamp
              └─ Make visible to customers

┌─────────────────┐
│ Customer Portal │
└────────┬────────┘
         │
         └──► View Order Details
              ├─ Check invoice status
              ├─ [If status = 'raised']
              │   └─ Show "Download Invoice" button
              └──► Download Invoice
                   ├─ Verify ownership (RLS)
                   ├─ Retrieve PDF (base64)
                   ├─ Update status: 'raised' → 'downloaded'
                   ├─ Set downloaded_at timestamp
                   └─ Trigger browser download
```

### Component Architecture

```
src/
├── services/
│   └── invoiceService.ts
│       ├── generateInvoice(orderId)
│       ├── bulkGenerateInvoices(orderIds[])
│       ├── raiseInvoice(invoiceId)
│       ├── bulkRaiseInvoices(invoiceIds[])
│       ├── downloadInvoice(invoiceId, orderId)
│       └── getInvoiceByOrderId(orderId)
│
├── hooks/
│   └── useInvoices.ts (TO BE CREATED)
│       ├── useGenerateInvoice()
│       ├── useRaiseInvoice()
│       └── useDownloadInvoice()
│
├── components/
│   ├── admin/
│   │   └── InvoiceManagementPanel.tsx (TO BE CREATED)
│   │       ├── Bulk generate UI
│   │       ├── Invoice list with filters
│   │       ├── Preview modal
│   │       └── Raise invoices action
│   │
│   └── account/
│       └── OrderDetailsModal.tsx (TO BE MODIFIED)
│           └── Add "Download Invoice" button
│
└── supabase/
    └── migrations/
        └── create_invoices_table.sql ✅ COMPLETED
```

---

## 3. Database Schema

### 3.1 Invoices Table

**Table Name:** `public.invoices`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique invoice identifier |
| `order_id` | BIGINT | NOT NULL, FK → orders(id), ON DELETE CASCADE | Reference to order |
| `invoice_number` | VARCHAR(50) | NOT NULL, UNIQUE | Format: INV/24-25/1001 |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'draft' | draft/generated/raised/downloaded |
| `generated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When invoice was created |
| `raised_at` | TIMESTAMPTZ | NULL | When admin made it visible |
| `downloaded_at` | TIMESTAMPTZ | NULL | First customer download |
| `pdf_base64` | TEXT | NULL | Base64 encoded PDF data |
| `pdf_url` | TEXT | NULL | Alternative: URL to stored file |
| `subtotal` | NUMERIC(10,2) | NOT NULL | Order subtotal |
| `tax_amount` | NUMERIC(10,2) | DEFAULT 0 | Legacy tax field |
| `gst_rate` | NUMERIC(5,2) | DEFAULT 18.00 | GST percentage |
| `gst_amount` | NUMERIC(10,2) | NOT NULL | Calculated GST amount |
| `shipping_amount` | NUMERIC(10,2) | DEFAULT 0 | Shipping charges |
| `discount_amount` | NUMERIC(10,2) | DEFAULT 0 | Discounts applied |
| `total_amount` | NUMERIC(10,2) | NOT NULL | Final invoice amount |
| `company_name` | VARCHAR(255) | NULL | Snapshot: Company name |
| `company_address` | TEXT | NULL | Snapshot: Company address |
| `company_phone` | VARCHAR(50) | NULL | Snapshot: Company phone |
| `company_email` | VARCHAR(255) | NULL | Snapshot: Company email |
| `company_gst_number` | VARCHAR(50) | NULL | Snapshot: Company GSTIN |
| `customer_name` | VARCHAR(255) | NOT NULL | Snapshot: Customer name |
| `billing_address` | TEXT | NOT NULL | Snapshot: Billing address |
| `shipping_address` | TEXT | NOT NULL | Snapshot: Shipping address |
| `customer_email` | VARCHAR(255) | NULL | Snapshot: Customer email |
| `customer_phone` | VARCHAR(50) | NULL | Snapshot: Customer phone |
| `customer_gst_number` | VARCHAR(50) | NULL | Optional: Customer GSTIN |
| `metadata` | JSONB | NULL | Items, variants, extra data |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Auto-updated on change |

### 3.2 Invoice Status Flow

```
draft
  ↓
generated    (Admin bulk generates invoices)
  ↓
raised       (Admin makes visible to customers)
  ↓
downloaded   (Customer downloads PDF)
```

### 3.3 Indexes

| Index Name | Columns | Purpose |
|------------|---------|---------|
| `idx_invoices_order_id` | order_id | Fast order lookup |
| `idx_invoices_status` | status | Filter by status |
| `idx_invoices_invoice_number` | invoice_number | Invoice search |
| `idx_invoices_generated_at` | generated_at DESC | Date queries |
| `idx_invoices_raised_at` | raised_at DESC | Date queries |
| `idx_invoices_pending_raise` | status, generated_at (WHERE status='generated') | Admin pending list |
| `idx_invoices_raised_available` | order_id, status (WHERE status='raised') | Customer queries |

### 3.4 Invoice Number Format

**Format:** `INV/YY-YY/NNNN`

**Examples:**
- `INV/24-25/1001` (FY 2024-2025, sequence 1001)
- `INV/25-26/2500` (FY 2025-2026, sequence 2500)

**Generation Logic:**
```sql
CREATE SEQUENCE invoice_number_seq START WITH 1000;

-- Financial Year: April to March
-- If current month >= April: Current year to Next year
-- If current month < April: Previous year to Current year
```

### 3.5 Metadata JSON Structure

```json
{
  "items": [
    {
      "description": "Saree - Red (Size: M, Material: Cotton)",
      "sku": "SRE-123",
      "quantity": 2,
      "unitPrice": 1500.00,
      "amount": 3000.00
    }
  ],
  "order_number": "ORD-12345",
  "order_date": "21/10/2025"
}
```

---

## 4. API Documentation

### 4.1 Invoice Service Functions

#### `generateInvoice(orderId: number)`

**Purpose:** Generate invoice PDF for a single order

**Preconditions:**
- Order must exist
- Payment status must be 'completed' or 'paid'
- Invoice doesn't already exist for order

**Process:**
1. Fetch order details with items
2. Fetch company settings from database
3. Generate invoice number (Financial Year format)
4. Calculate GST (18% of subtotal)
5. Format billing and shipping addresses
6. Generate PDF using jsPDF
7. Convert PDF to base64
8. Save to invoices table with status='generated'

**Returns:**
```typescript
{
  success: boolean;
  message: string;
  invoiceId?: string;      // UUID
  invoiceNumber?: string;  // INV/24-25/1001
}
```

**Error Cases:**
- Order not found → `{ success: false, message: 'Order not found' }`
- Payment not completed → `{ success: false, message: 'Invoice can only be generated for completed payments' }`
- Invoice exists → `{ success: true, message: 'Invoice already exists', invoiceId, invoiceNumber }`

---

#### `bulkGenerateInvoices(orderIds: number[])`

**Purpose:** Generate invoices for multiple orders

**Process:**
- Iterates through each order ID
- Calls `generateInvoice()` for each
- Collects results

**Returns:**
```typescript
{
  success: boolean;
  message: string;          // "X of Y invoices generated successfully"
  results?: Array<{
    orderId: number;
    success: boolean;
    invoiceNumber?: string;
    message?: string;
  }>;
}
```

---

#### `raiseInvoice(invoiceId: string)`

**Purpose:** Make a single invoice visible to customer

**Process:**
1. Update invoice status: 'generated' → 'raised'
2. Set raised_at = NOW()

**Returns:**
```typescript
{
  success: boolean;
  message: string;
}
```

---

#### `bulkRaiseInvoices(invoiceIds: string[])`

**Purpose:** Raise multiple invoices at once

**Process:**
- Updates all invoices with matching IDs
- Only updates if current status = 'generated'
- Sets status='raised' and raised_at=NOW()

**Returns:**
```typescript
{
  success: boolean;
  message: string;  // "X invoices raised successfully"
  count?: number;   // Number successfully raised
}
```

---

#### `downloadInvoice(invoiceId: string, orderId?: number)`

**Purpose:** Retrieve invoice PDF for download

**Preconditions:**
- Invoice status must be 'raised'
- Customer must own the order (enforced by RLS)

**Process:**
1. Fetch invoice by ID (with order_id check if provided)
2. Update status: 'raised' → 'downloaded'
3. Set downloaded_at = NOW()
4. Return base64 PDF data

**Returns:**
```typescript
{
  success: boolean;
  message: string;
  pdf?: string;  // Base64 encoded PDF (data:application/pdf;base64,...)
}
```

**Usage Example:**
```typescript
const result = await downloadInvoice(invoiceId, orderId);
if (result.success && result.pdf) {
  // Create download link
  const link = document.createElement('a');
  link.href = result.pdf;
  link.download = `invoice-${invoiceNumber}.pdf`;
  link.click();
}
```

---

#### `getInvoiceByOrderId(orderId: number)`

**Purpose:** Check if an order has a raised invoice

**Returns:**
```typescript
{
  id: string;
  invoice_number: string;
  status: string;
  generated_at: string;
  raised_at: string | null;
} | null
```

**Usage:** Check before showing "Download Invoice" button

---

### 4.2 GST Calculation

#### `calculateGST(subtotal: number, rate: number = 18)`

**Formula:**
```
GST Amount = (Subtotal × GST Rate) / 100
```

**Example:**
```typescript
const subtotal = 10000;  // ₹10,000
const gst = calculateGST(subtotal);  // ₹1,800
const total = subtotal + gst;  // ₹11,800
```

---

## 5. User Interface

### 5.1 Customer View - Order Details Modal

**Component:** `src/components/account/OrderDetailsModal.tsx`

**Modification Required:**

**Location:** After payment status section, before order items

```tsx
{/* Invoice Download Section */}
{orderDetails.status === 'delivered' && invoice && (
  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-blue-600" />
        <div>
          <p className="font-medium text-blue-900">Tax Invoice Available</p>
          <p className="text-sm text-blue-700">
            Invoice No: {invoice.invoice_number}
          </p>
        </div>
      </div>
      <button
        onClick={handleDownloadInvoice}
        disabled={downloadingInvoice}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {downloadingInvoice ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Downloading...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Download Invoice
          </>
        )}
      </button>
    </div>
  </div>
)}
```

**State Management:**
```typescript
const [invoice, setInvoice] = useState<InvoiceInfo | null>(null);
const [downloadingInvoice, setDownloadingInvoice] = useState(false);

// On modal open
useEffect(() => {
  if (orderId && orderDetails?.status === 'delivered') {
    getInvoiceByOrderId(orderId).then(setInvoice);
  }
}, [orderId, orderDetails]);

// Download handler
const handleDownloadInvoice = async () => {
  if (!invoice) return;
  
  setDownloadingInvoice(true);
  try {
    const result = await downloadInvoice(invoice.id, orderId);
    if (result.success && result.pdf) {
      const link = document.createElement('a');
      link.href = result.pdf;
      link.download = `invoice-${invoice.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Invoice downloaded successfully');
    } else {
      toast.error(result.message);
    }
  } catch (error) {
    toast.error('Failed to download invoice');
  } finally {
    setDownloadingInvoice(false);
  }
};
```

---

### 5.2 Admin View - Invoice Management Panel

**Component:** `src/components/admin/InvoiceManagementPanel.tsx` (TO BE CREATED)

**Features:**
1. **Eligible Orders List**
   - Orders with status='delivered' AND payment_status='completed'
   - No existing invoice
   - Bulk select checkbox

2. **Generated Invoices List**
   - Filter by status: generated/raised/downloaded
   - Search by invoice number
   - Search by order number
   - Date range filter

3. **Actions:**
   - Generate Selected (Bulk)
   - Raise Selected (Bulk)
   - Preview Invoice (Individual)
   - Download Invoice (Individual)

**UI Layout:**
```
┌─────────────────────────────────────────────────┐
│  Invoice Management                              │
├─────────────────────────────────────────────────┤
│  [Eligible Orders] [Generated] [Raised]          │
├─────────────────────────────────────────────────┤
│  Search: [___________]  Status: [All ▼]         │
│  Date Range: [From] [To]  [Search]              │
├─────────────────────────────────────────────────┤
│  ☐ Select All    [Generate Selected]            │
│  ────────────────────────────────────────────   │
│  ☐ ORD-12345  |  John Doe  |  ₹11,800  | Oct 21│
│  ☐ ORD-12346  |  Jane Smith|  ₹8,500   | Oct 20│
│  ...                                             │
└─────────────────────────────────────────────────┘
```

---

## 6. Security & Access Control

### 6.1 Row Level Security (RLS) Policies

**Policy 1: Admin Full Access**
```sql
CREATE POLICY "Admins can manage all invoices"
ON public.invoices FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

**Policy 2: Customer Read Access**
```sql
CREATE POLICY "Customers can view their raised invoices"
ON public.invoices FOR SELECT
USING (
  status = 'raised'
  AND EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = invoices.order_id
    AND orders.customer_id = auth.uid()
  )
);
```

**Policy 3: Customer Download Update**
```sql
CREATE POLICY "Customers can mark invoices as downloaded"
ON public.invoices FOR UPDATE
USING (
  status = 'raised'
  AND EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = invoices.order_id
    AND orders.customer_id = auth.uid()
  )
)
WITH CHECK (
  (OLD.status = 'raised' AND NEW.status = 'downloaded')
  OR (NEW.downloaded_at IS NOT NULL)
);
```

### 6.2 Security Considerations

1. **Invoice Access:**
   - Customers can ONLY view/download invoices with status='raised'
   - RLS enforces ownership check via orders.customer_id
   - No direct access to 'generated' or 'draft' invoices

2. **Data Integrity:**
   - Invoice data is snapshotted at generation time
   - Future changes to company settings don't affect existing invoices
   - Financial data is immutable after generation

3. **PDF Security:**
   - Base64 encoding prevents direct URL access
   - PDF retrieved through authenticated API only
   - No public URLs to invoice files

4. **Admin Operations:**
   - All bulk operations require admin role
   - Audit trail via timestamps (generated_at, raised_at, downloaded_at)
   - RLS policies enforce admin-only updates

---

## 7. Implementation Timeline

### Phase 1: Foundation ✅ COMPLETED (Day 1)
- [x] Database schema design
- [x] Create invoices table migration
- [x] Implement RLS policies
- [x] Create invoice number generation function
- [x] Set up indexes

### Phase 2: Core Service ✅ COMPLETED (Day 1)
- [x] Install jsPDF library
- [x] Create invoiceService.ts
- [x] Implement PDF generation
- [x] Implement GST calculation
- [x] Add all CRUD operations
- [x] Test build compilation

### Phase 3: Admin UI 🔄 IN PROGRESS (Day 2)
- [ ] Create InvoiceManagementPanel component
- [ ] Add eligible orders list
- [ ] Implement bulk generate UI
- [ ] Add generated invoices list
- [ ] Implement filters and search
- [ ] Add preview modal
- [ ] Implement raise invoices action

### Phase 4: Customer UI (Day 2-3)
- [ ] Modify OrderDetailsModal
- [ ] Add invoice availability check
- [ ] Implement Download Invoice button
- [ ] Add loading states
- [ ] Test download functionality

### Phase 5: Hooks & Integration (Day 3)
- [ ] Create useInvoices hook
- [ ] Implement error handling
- [ ] Add toast notifications
- [ ] Integrate with existing order flows

### Phase 6: Testing & QA (Day 4)
- [ ] Unit tests for invoiceService
- [ ] Integration tests for RLS policies
- [ ] End-to-end testing
- [ ] PDF generation validation
- [ ] Performance testing (bulk operations)

### Phase 7: Documentation & Deployment (Day 4-5)
- [ ] API documentation
- [ ] User guides (Admin & Customer)
- [ ] Migration guide
- [ ] Deployment checklist
- [ ] Production deployment

---

## 8. Testing Strategy

### 8.1 Unit Tests

**Test File:** `invoiceService.test.ts`

```typescript
describe('Invoice Service', () => {
  test('calculateGST returns correct amount', () => {
    expect(calculateGST(10000)).toBe(1800);
    expect(calculateGST(5000, 12)).toBe(600);
  });
  
  test('generateInvoice rejects invalid payment status', async () => {
    // Mock order with pending payment
    const result = await generateInvoice(orderId);
    expect(result.success).toBe(false);
    expect(result.message).toContain('completed payments');
  });
  
  test('Invoice number follows correct format', () => {
    const invoiceNum = 'INV/24-25/1001';
    expect(invoiceNum).toMatch(/^INV\/\d{2}-\d{2}\/\d{4}$/);
  });
});
```

### 8.2 Integration Tests

**Test RLS Policies:**
```sql
-- Test: Customer can only see their own raised invoices
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "customer-uuid-1"}';

SELECT * FROM invoices WHERE order_id = 123;  -- Should return only customer's invoices

-- Test: Admin can see all invoices
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "admin-uuid"}';

SELECT * FROM invoices;  -- Should return all invoices
```

### 8.3 End-to-End Tests

**Test Scenario 1: Happy Path**
1. Admin logs in
2. Navigate to Invoice Management
3. Select 5 eligible orders
4. Click "Generate Selected"
5. Verify 5 invoices created with status='generated'
6. Select generated invoices
7. Click "Raise Selected"
8. Verify status updated to 'raised'
9. Customer logs in
10. View order details
11. Click "Download Invoice"
12. Verify PDF downloads
13. Verify invoice status = 'downloaded'

**Test Scenario 2: Error Handling**
- Generate invoice for order with pending payment → Should fail
- Generate invoice twice → Should return existing invoice
- Customer tries to download unreleased invoice → Should fail (RLS)
- Customer tries to download another customer's invoice → Should fail (RLS)

### 8.4 Performance Tests

**Bulk Operations:**
- Generate 100 invoices simultaneously
- Measure: Time taken, memory usage, PDF size
- Expected: < 30 seconds for 100 invoices

**Database Queries:**
- Test index performance on large datasets
- 10,000+ invoices in table
- Query by order_id, status, date range
- Expected: < 100ms query time

---

## 9. Deployment Guide

### 9.1 Pre-Deployment Checklist

- [ ] Database migration file created
- [ ] Invoice service implemented
- [ ] Build passes without errors
- [ ] RLS policies defined
- [ ] Company settings configured in database
- [ ] Testing completed

### 9.2 Database Migration

**Step 1: Run Migration**
```bash
# Connect to Supabase
psql -h <supabase-host> -U postgres -d postgres

# Run migration
\i supabase/migrations/create_invoices_table.sql

# Verify
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'invoices';
```

**Step 2: Verify Indexes**
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'invoices';
```

**Step 3: Test RLS**
```sql
-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'invoices';
```

### 9.3 Environment Configuration

**Required Settings in Database:**
```sql
-- Ensure these exist in settings table
SELECT * FROM settings 
WHERE category = 'shop' 
AND key IN ('store_name', 'store_phone', 'store_email', 'store_address');

SELECT * FROM settings 
WHERE category = 'billing' 
AND key = 'gst_number';
```

### 9.4 Deploy Frontend

```bash
# Build production
npm run build

# Deploy to hosting (e.g., Netlify, Vercel)
npm run deploy
```

### 9.5 Post-Deployment Verification

**Test 1: Generate Invoice**
```
1. Login as admin
2. Navigate to Orders
3. Find delivered order with completed payment
4. Generate invoice
5. Verify invoice created in database
```

**Test 2: Customer Download**
```
1. Raise generated invoice (as admin)
2. Login as customer
3. View order details
4. Verify "Download Invoice" button appears
5. Click download
6. Verify PDF downloads correctly
```

**Test 3: Security**
```
1. Login as Customer A
2. Try to access Customer B's invoice → Should fail
3. Try to download non-raised invoice → Should fail
```

### 9.6 Monitoring

**Key Metrics:**
- Invoices generated per day
- Average generation time
- Failed generation attempts
- Download count
- RLS policy violations (should be 0)

**Database Queries:**
```sql
-- Daily invoice generation
SELECT 
  DATE(generated_at) as date,
  COUNT(*) as invoices_generated
FROM invoices
WHERE generated_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(generated_at)
ORDER BY date DESC;

-- Invoice status distribution
SELECT status, COUNT(*) as count
FROM invoices
GROUP BY status;

-- Average invoice value
SELECT 
  AVG(total_amount) as avg_invoice_value,
  SUM(total_amount) as total_revenue,
  SUM(gst_amount) as total_gst
FROM invoices
WHERE status = 'raised';
```

---

## 10. Support & Troubleshooting

### Common Issues

**Issue 1: Invoice generation fails**
- Check payment_status = 'completed' or 'paid'
- Verify company settings exist in database
- Check order has items

**Issue 2: Customer can't see invoice**
- Verify invoice status = 'raised'
- Check order ownership (customer_id)
- Verify RLS policies enabled

**Issue 3: PDF download fails**
- Check pdf_base64 field populated
- Verify browser supports base64 downloads
- Check file size limits

**Issue 4: Invoice number sequence issues**
- Reset sequence if needed: `ALTER SEQUENCE invoice_number_seq RESTART WITH 1000;`
- Verify financial year calculation logic

---

## 📊 System Statistics & Estimates

**Database Storage:**
- Average invoice PDF size: ~50 KB (base64)
- 1000 invoices: ~50 MB
- 10,000 invoices: ~500 MB

**Performance:**
- Single invoice generation: ~500ms
- Bulk 100 invoices: ~25-30 seconds
- PDF download: < 100ms
- Invoice query: < 50ms

**GST Compliance:**
- Tax rate: 18%
- Invoice format: Indian tax invoice standards
- GSTIN display: Yes
- Itemized with HSN/SAC codes: Can be added to metadata

---

## 📝 Next Steps

1. **Complete Admin UI** (Phase 3)
2. **Implement Customer Download** (Phase 4)
3. **Create React Hooks** (Phase 5)
4. **Comprehensive Testing** (Phase 6)
5. **Production Deployment** (Phase 7)

---

**Document Version:** 1.0  
**Last Updated:** October 21, 2025  
**Status:** Foundation Complete, Implementation In Progress  
**Completion:** 60% (Database ✅, Service ✅, UI 🔄)
