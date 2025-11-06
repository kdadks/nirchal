# Google Category Selector Integration Guide

## Adding to ProductForm.tsx

This guide shows how to integrate the Google Category Selector into your existing ProductForm component.

### Step 1: Import the Component

Add this import at the top of `ProductForm.tsx`:

```tsx
import { GoogleCategorySelector } from './GoogleCategorySelector';
```

### Step 2: Add State (if needed)

The `formData` state already includes `google_product_category`. Ensure it's in the initial state:

```tsx
const [formData, setFormData] = useState<ProductFormData>({
  // ... existing fields
  google_product_category: initialData?.google_product_category || null,
  // ... other fields
});
```

### Step 3: Add to Form UI

Insert the GoogleCategorySelector in the appropriate section of your form. Typically after basic product information:

```tsx
{/* Google Product Category - SEO */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Google Product Category
    <span className="ml-1 text-xs text-gray-500">(Improves SEO)</span>
  </label>
  <GoogleCategorySelector
    value={formData.google_category_id || null}
    onChange={(categoryId, category) => {
      setFormData(prev => ({
        ...prev,
        google_category_id: categoryId,
        google_product_category: category?.full_path || null
      }));
    }}
    placeholder="Search for a Google product category..."
    error={errors.google_category_id}
  />
</div>
```

### Step 4: Update TypeScript Types

Ensure your `ProductFormData` type includes the Google category fields:

```typescript
// In src/types/admin.ts or relevant type file
export interface ProductFormData {
  // ... existing fields
  google_category_id?: number | null;
  google_product_category?: string | null;
  // ... other fields
}
```

### Step 5: Update Database Schema

Make sure the `products` table has the column:

```sql
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS google_category_id INTEGER REFERENCES google_product_categories(id);
```

## Complete Example

Here's a complete example of where to place it in the form:

```tsx
{/* Basic Information Section */}
<div className="space-y-6">
  {/* Product Name */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Product Name *
    </label>
    <input
      type="text"
      value={formData.name}
      onChange={(e) => {
        const newName = e.target.value;
        setFormData(prev => ({
          ...prev,
          name: newName,
          slug: slugManuallyEdited ? prev.slug : generateSlug(newName)
        }));
      }}
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
      required
    />
  </div>

  {/* Description */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Description *
    </label>
    <ReactQuill
      value={formData.description}
      onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
      modules={quillModules}
      formats={quillFormats}
    />
  </div>

  {/* Category */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Category *
    </label>
    <select
      value={formData.category_id}
      onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
      required
    >
      <option value="">Select a category</option>
      {categories.map(cat => (
        <option key={cat.id} value={cat.id}>{cat.name}</option>
      ))}
    </select>
  </div>

  {/* ========== ADD GOOGLE CATEGORY HERE ========== */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Google Product Category
      <span className="ml-1 text-xs text-gray-500">(For SEO & Google Shopping)</span>
    </label>
    <GoogleCategorySelector
      value={formData.google_category_id || null}
      onChange={(categoryId, category) => {
        setFormData(prev => ({
          ...prev,
          google_category_id: categoryId,
          google_product_category: category?.full_path || null
        }));
      }}
      placeholder="Search for a Google product category..."
    />
    <p className="mt-1 text-xs text-gray-500">
      This helps Google understand your product for better search rankings and shopping results
    </p>
  </div>
  {/* ========== END GOOGLE CATEGORY ========== */}

  {/* Rest of the form... */}
</div>
```

## Styling Adjustments

The GoogleCategorySelector uses Tailwind CSS classes consistent with your existing form. No additional styling should be needed, but you can customize:

```tsx
<GoogleCategorySelector
  value={formData.google_category_id || null}
  onChange={(categoryId, category) => {
    setFormData(prev => ({
      ...prev,
      google_category_id: categoryId,
      google_product_category: category?.full_path || null
    }));
  }}
  placeholder="Search for a Google product category..."
  className="custom-class"  // Add custom classes if needed
/>
```

## Validation

Add validation in your form submit handler:

```tsx
const validateForm = () => {
  const newErrors: Record<string, string> = {};
  
  // Existing validations...
  
  // Google category is optional but recommended for SEO
  if (!formData.google_category_id) {
    console.warn('Google Product Category not selected - SEO may be impacted');
  }
  
  return newErrors;
};
```

## API Integration

When submitting the form, the `google_category_id` will be included in the `formData`. Ensure your API endpoint handles it:

```typescript
// In your product service
export const createProduct = async (data: ProductFormData) => {
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name: data.name,
      description: data.description,
      category_id: data.category_id,
      google_category_id: data.google_category_id,  // Include this
      // ... other fields
    })
    .select()
    .single();
    
  if (error) throw error;
  return product;
};
```

## Display in Product List

Show the Google category in your product listings:

```tsx
{product.google_product_category && (
  <div className="text-xs text-gray-500 mt-1">
    <span className="font-medium">Google Category:</span> {product.google_product_category}
  </div>
)}
```

## Testing Checklist

- [ ] Component renders without errors
- [ ] Search functionality works (type at least 2 characters)
- [ ] Categories are displayed with full breadcrumb
- [ ] Selecting a category updates the form state
- [ ] Clear button removes the selection
- [ ] Form submission includes `google_category_id`
- [ ] Database stores the category ID correctly
- [ ] Product can be edited and category updated
- [ ] Product can be saved without a Google category (optional field)

## Troubleshooting

### Component Not Rendering
- Check that all migrations have been run
- Verify the service file imports are correct
- Check browser console for errors

### No Search Results
- Ensure the database has taxonomy data loaded
- Verify the `search_google_categories` function exists
- Check Supabase connection and authentication

### TypeScript Errors
- Update your type definitions to include the new fields
- Run `npm run type-check` to find any type issues

## Next Steps

After integrating the selector:
1. Test with various product types
2. Load the full taxonomy data (5000+ categories)
3. Add Google category to product export feeds
4. Update SEO structured data to include categories
