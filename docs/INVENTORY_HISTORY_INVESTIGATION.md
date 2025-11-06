# Inventory History Investigation Summary

## Issue Reported
User unable to see Inventory History in the inventory management section.

## Investigation Findings

### Database Schema (From Supabase Backup)

The `inventory_history` table exists with the following structure:

```sql
CREATE TABLE public.inventory_history (
    id bigint NOT NULL,
    inventory_id bigint,
    previous_quantity integer NOT NULL,
    new_quantity integer NOT NULL,
    change_type character varying(50) NOT NULL,
    reason text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
```

### Trigger Function

There's an automatic trigger `trg_log_inventory_history` that logs changes:

```sql
CREATE FUNCTION public.log_inventory_history() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Only log if quantity actually changes
  IF NEW.quantity IS DISTINCT FROM OLD.quantity THEN
    INSERT INTO inventory_history (
      inventory_id,
      previous_quantity,
      new_quantity,
      change_type,
      reason,
      created_by,
      created_at
    ) VALUES (
      NEW.id,
      OLD.quantity,
      NEW.quantity,
      CASE WHEN NEW.quantity > OLD.quantity THEN 'STOCK_IN' ELSE 'STOCK_OUT' END,
      'Automatic log (trigger)',
      NULL,
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_inventory_history 
AFTER UPDATE ON public.inventory 
FOR EACH ROW 
EXECUTE FUNCTION public.log_inventory_history();
```

### Frontend Implementation

**Files:**
- `src/components/admin/InventoryHistoryModal.tsx` - Modal component to display history
- `src/hooks/useInventory.ts` - Hook with `getInventoryHistory()` function
- `src/pages/admin/InventoryPage.tsx` - Inventory management page with History button

**Flow:**
1. User clicks History button (clock icon) on an inventory item
2. Opens `InventoryHistoryModal` 
3. Calls `getInventoryHistory()` from `useInventory` hook
4. Queries `inventory_history` table
5. Displays results in modal

### Code Analysis

The frontend code is correctly implemented:
- ✅ Modal component exists and is properly integrated
- ✅ `getInventoryHistory()` function queries the correct table
- ✅ Column names match the schema (`previous_quantity`, `new_quantity`, `change_type`)
- ✅ Proper filtering and pagination

## Bug Found & Fixed

### Issue in Return Service
The newly added `restoreInventoryForReturn()` function in `src/services/returnService.ts` was using **incorrect column names**:

**BEFORE (Wrong):**
```typescript
await this.db.from('inventory_history').insert({
  inventory_id: inventoryRecord.id,
  change_type: 'adjustment',
  quantity_before: oldQuantity,        // ❌ Wrong column
  quantity_after: newQuantity,         // ❌ Wrong column
  quantity_changed: item.quantity,     // ❌ Wrong column
  reason: `Return ${input.return_request_id}...`,
  notes: inspectionResult.inspection_notes  // ❌ Wrong column
});
```

**AFTER (Correct):**
```typescript
await this.db.from('inventory_history').insert({
  inventory_id: inventoryRecord.id,
  previous_quantity: oldQuantity,      // ✅ Correct
  new_quantity: newQuantity,           // ✅ Correct
  change_type: 'STOCK_IN',            // ✅ Correct
  reason: `Return ${input.return_request_id}...`,
  created_by: input.inspected_by,      // ✅ Correct
  created_at: new Date().toISOString() // ✅ Correct
});
```

## Possible Reasons History Is Empty

### 1. No Inventory Changes Yet
If inventory hasn't been updated since the system was deployed, there won't be any history records.

**How to verify:**
- Check if `inventory_history` table has any data
- Check if the trigger is enabled on the `inventory` table

### 2. Trigger Might Be Disabled
The backup SQL shows commands to disable/enable the trigger during migrations.

**Check in Supabase:**
```sql
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname = 'trg_log_inventory_history';
```

If `tgenabled` is not 'O' (enabled), the trigger is disabled.

**To enable:**
```sql
ALTER TABLE inventory ENABLE TRIGGER trg_log_inventory_history;
```

### 3. Manual Updates Not Creating History
If inventory was updated directly in the database (not through UPDATE queries), the trigger won't fire.

### 4. RLS Policies
Row Level Security policies might be preventing reads from `inventory_history` table.

**Check policies:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'inventory_history';
```

From the backup, these policies should exist:
- `service_role_all_access_inventory_history` - Allows service role full access
- `anon_read_inventory_history` - Allows anonymous reads
- `anon_insert_inventory_history` - Allows anonymous inserts
- `Allow select for anon` - Select for anonymous
- `Allow insert for authenticated` - Insert for authenticated
- `Allow update for authenticated` - Update for authenticated
- `Allow delete for authenticated` - Delete for authenticated

## How to Test Inventory History

### Test 1: Check if table has data
```sql
SELECT COUNT(*) FROM inventory_history;
```

### Test 2: Check recent records
```sql
SELECT * FROM inventory_history 
ORDER BY created_at DESC 
LIMIT 10;
```

### Test 3: Manually trigger a history entry
```sql
-- Update any inventory item's quantity
UPDATE inventory 
SET quantity = quantity + 1 
WHERE id = (SELECT id FROM inventory LIMIT 1);

-- Check if history was created
SELECT * FROM inventory_history 
ORDER BY created_at DESC 
LIMIT 1;
```

### Test 4: Check if trigger is enabled
```sql
SELECT 
  t.tgname AS trigger_name,
  t.tgenabled AS enabled,
  p.proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'trg_log_inventory_history';
```

### Test 5: Test from frontend
1. Go to Admin Dashboard → Inventory Management
2. Click "Adjust" on any item
3. Increase/decrease quantity
4. Save
5. Click the History button (clock icon) on that item
6. History modal should show the adjustment

## Column Name Reference

**Correct Schema Columns:**
- `id` - Primary key (bigint)
- `inventory_id` - FK to inventory table (bigint)
- `previous_quantity` - Old quantity (integer)
- `new_quantity` - New quantity (integer)
- `change_type` - 'STOCK_IN' or 'STOCK_OUT' (varchar)
- `reason` - Description of change (text)
- `created_by` - User UUID (uuid, nullable)
- `created_at` - Timestamp (timestamp with time zone)

**Change Types:**
- `STOCK_IN` - Quantity increased (returns, purchases, adjustments +)
- `STOCK_OUT` - Quantity decreased (orders, damage, adjustments -)

## Files Modified in This Session

1. **src/services/returnService.ts**
   - Fixed inventory_history insert to use correct column names
   - Changed column names from `quantity_before/after/changed` to `previous_quantity/new_quantity`
   - Removed `notes` field (doesn't exist)
   - Added `created_by` and `created_at` fields
   - Changed `change_type` from 'adjustment' to 'STOCK_IN'

## Next Steps for User

1. **Check if history table has data:**
   - Go to Supabase → Table Editor → inventory_history
   - See if any records exist

2. **Test the trigger:**
   - Manually adjust an inventory item via Admin UI
   - Check if history record is created
   - Click History button to see if it shows

3. **Check RLS policies:**
   - Ensure authenticated users can read from inventory_history
   - Check if service role has access

4. **Enable trigger if disabled:**
   - Run SQL: `ALTER TABLE inventory ENABLE TRIGGER trg_log_inventory_history;`

5. **Test the complete flow:**
   - Place an order → Check if inventory decrements and history is created
   - Complete a return → Check if inventory increments and history is created
   - Manual adjustment → Check if history is created

## Expected Behavior

Once everything is working:
1. **Order Placed** → Inventory decrements → History: "Order {id} - Payment Confirmed" (STOCK_OUT)
2. **Return Completed** → Inventory increments → History: "Return {id} - Items Received ({condition})" (STOCK_IN)
3. **Manual Adjustment** → Inventory changes → History: "Automatic log (trigger)" (STOCK_IN/STOCK_OUT)
4. **Bulk Adjustment** → Multiple changes → Multiple history entries

All history entries should be visible in the History modal when clicking the clock icon on any inventory item.
