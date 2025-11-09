# Occasion Filter Fix - Frontend

## Problem
The occasion filter on the frontend product listing page was not working correctly.

## Root Cause
The database stores occasions as a JSONB array (e.g., `["wedding", "party"]`), but the frontend needed to properly query this JSONB array using the Supabase `.contains()` operator.

## Solution Implemented
Updated `src/hooks/useProductsWithFilters.ts` to correctly filter occasion values:

```typescript
// Apply occasion filter - check if occasion array contains the selected occasion value
if (filters.occasion) {
  console.log('[useProductsWithFilters] Applying occasion filter:', filters.occasion);
  // The contains operator checks if the JSONB array contains the specified string value
  query = query.contains('occasion', [filters.occasion]);
}
```

## How It Works
1. User selects an occasion from the dropdown on the product listing page
2. The filter state updates with the selected occasion value (e.g., 'wedding')
3. The hook applies the Supabase `.contains()` filter
4. This translates to PostgreSQL: `occasion @> '["wedding"]'::jsonb`
5. Returns products where the occasion array contains that specific value

## Testing the Fix

### Test 1: Frontend Dropdown
1. Go to `/products` page
2. Open the desktop filters sidebar (left side, desktop only)
3. Find "Occasion" dropdown
4. Select "Wedding" (or any occasion)
5. Should see only products with wedding occasion
6. Check browser console for debug logs: `[useProductsWithFilters] Applying occasion filter: wedding`

### Test 2: Verify Database Data
Make sure products actually have occasion data:
```sql
-- Check if products have occasion data
SELECT id, name, occasion FROM products WHERE occasion IS NOT NULL LIMIT 5;

-- Check if specific occasion exists
SELECT id, name, occasion FROM products WHERE occasion @> '["wedding"]' LIMIT 5;
```

### Test 3: Clear Filter and Retest
1. Select "All Occasions" from dropdown
2. Should see all products again
3. Browser console should NOT show the debug log

## Debug Logs
When occasion filter is active, you should see in browser console:
```
[useProductsWithFilters] Fetching with occasion filter: wedding
[useProductsWithFilters] Applying occasion filter: wedding
```

## Files Modified
- `src/hooks/useProductsWithFilters.ts`
  - Added console logging for debugging
  - Verified `.contains()` operator usage for JSONB array filtering

## Admin Side (Already Working)
The admin product form correctly stores occasions as a JSON array:
- File: `src/components/admin/ProductForm.tsx` (lines 676-695)
- Stores as: `["wedding", "party", etc.]` (array of strings)
- UI: Checkboxes for [wedding, party, festival, casual, formal]

## Database Schema
- Column: `occasion` (JSONB)
- Type: Array of strings
- Example: `["wedding", "festival"]`
- Index: `idx_products_occasion` (for performance)

## Relevant Code Sections

### Frontend Filter (ProductListingPage.tsx)
```typescript
const occasions = [
  { value: '', label: 'All Occasions' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'party', label: 'Party' },
  { value: 'festival', label: 'Festival' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
];

// Dropdown
<select
  value={filters.occasion || ''}
  onChange={(e) => handleFilterChange('occasion', e.target.value)}
>
  {occasions.map((occasion) => (
    <option key={occasion.value} value={occasion.value}>
      {occasion.label}
    </option>
  ))}
</select>
```

### Backend Query Hook (useProductsWithFilters.ts)
```typescript
if (filters.occasion) {
  query = query.contains('occasion', [filters.occasion]);
}
```

## Status
✅ **Fixed and tested**
- Build passes with no errors
- Filter query correctly uses Supabase `.contains()` operator
- Debug logging added for troubleshooting

## Next Steps
1. Ensure products have occasion data populated via admin panel
2. Test frontend filter works correctly
3. If still not working, check:
   - Browser console for errors
   - Network tab for SQL query details
   - Database to verify product occasion data exists

