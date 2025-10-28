# SEO Metadata Generator Utility

## Overview

The SEO metadata generator automatically creates optimized meta titles and descriptions for products based on their names and descriptions. This ensures all products have search engine-friendly metadata that follows SEO best practices.

## Features

- ✅ **Smart Title Generation**: Creates concise, branded meta titles (max 60 characters)
- ✅ **Description Optimization**: Extracts and formats descriptions (max 160 characters)
- ✅ **HTML Stripping**: Removes HTML tags from rich text descriptions
- ✅ **Intelligent Truncation**: Cuts at word/sentence boundaries for readability
- ✅ **Sentence Case**: Converts text to proper sentence case for consistency
- ✅ **Batch Processing**: Updates products in batches for efficiency
- ✅ **Dry Run Mode**: Preview changes before applying them
- ✅ **Selective Updates**: Only update products with missing metadata

## SEO Guidelines

### Meta Title
- **Maximum Length**: 60 characters
- **Format**: `{Product Name} - Nirchal`
- **Case**: Sentence case (capitalize first letter only)
- **Truncation**: Intelligently cuts at word boundaries if too long

**Example**:
- Input: "PREMIUM DESIGNER READYMADE GOWN WITH DUPATTA"
- Output: "Premium designer readymade gown with dupatta - Nirchal" (59/60 chars)

### Meta Description
- **Maximum Length**: 160 characters
- **Format**: Plain text extracted from product description
- **Case**: Sentence case
- **Truncation**: Ends at sentence/word boundaries with proper punctuation
- **Fallback**: If no description exists, generates one from product name

**Example**:
- Input: `<p>Step into <strong>timeless elegance</strong> with our luxurious chinon embroidered gown, a perfect blend of traditional charm and contemporary grace.</p>`
- Output: "Step into timeless elegance with our luxurious chinon embroidered gown, a perfect blend of traditional charm and contemporary grace." (132/160 chars)

## Usage

### Basic Commands

```bash
# Update all products with empty metadata
node generate-seo-metadata.js --only-empty

# Preview changes without updating (dry run)
node generate-seo-metadata.js --dry-run

# Update all products (including those with existing metadata)
node generate-seo-metadata.js

# Update a specific product by ID
node generate-seo-metadata.js --product-id=abc-123-def-456

# Combine flags
node generate-seo-metadata.js --dry-run --only-empty
```

### Command Line Options

| Option | Description |
|--------|-------------|
| `--dry-run` | Preview changes without updating the database |
| `--only-empty` | Only update products with missing meta_title or meta_description |
| `--product-id=<id>` | Update only a specific product by ID |
| `--help`, `-h` | Show help message |

## How It Works

### 1. Fetch Products
The script queries all active products from the database, optionally filtering by:
- Product ID (if specified)
- Missing metadata (if `--only-empty` flag is used)

### 2. Generate Metadata

**Meta Title**:
1. Takes product name
2. Reserves 10 characters for " - Nirchal" suffix
3. Truncates name if necessary at word boundary
4. Converts to sentence case
5. Adds brand suffix

**Meta Description**:
1. Strips HTML tags from description
2. Falls back to "Shop {product name} at Nirchal..." if description is too short
3. Truncates at 160 characters
4. Tries to end at sentence boundary (preferred) or word boundary
5. Adds proper punctuation (period or ellipsis)
6. Converts to sentence case

### 3. Update Database
- Updates in batches of 50 for efficiency
- Uses service role key for admin permissions
- Shows progress and error count

## Example Output

```
🚀 Starting SEO Metadata Generator

📋 ONLY EMPTY MODE - Only updating products with missing metadata

🔍 Fetching products from database...

📦 Found 229 products

📋 229 products need SEO metadata

📋 SEO Metadata Preview (first 5):

📦 Product: Ethereal Elegance Chinon Embroidered Gown Set
   Meta Title (55/60):
   OLD: (empty)
   NEW: Ethereal elegance chinon embroidered gown set - Nirchal
   Meta Description (132/160):
   OLD: (empty)
   NEW: Step into timeless elegance with our luxurious chinon embroidered gown, a perfect blend of traditional charm and contemporary grace.

... and 224 more products

💾 Updating products in database...

   Processing batch 1/5...
   Processing batch 2/5...
   Processing batch 3/5...
   Processing batch 4/5...
   Processing batch 5/5...

✅ Update complete!
   ✓ Successfully updated: 229
```

## Use Cases

### Initial SEO Setup
When you have products without SEO metadata:
```bash
node generate-seo-metadata.js --only-empty
```

### Previewing Changes
Before bulk updates, preview what will change:
```bash
node generate-seo-metadata.js --dry-run --only-empty
```

### Updating Single Product
After editing a product description, regenerate its metadata:
```bash
node generate-seo-metadata.js --product-id=abc-123-def-456
```

### Regular Maintenance
Periodically check for products without metadata:
```bash
node generate-seo-metadata.js --only-empty
```

## Requirements

- Node.js installed
- Environment variables configured (`.env` file):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_SERVICE_ROLE_KEY` (required for updates)
- Database access permissions

## SEO Best Practices

### Why These Limits?

**60 Characters for Title**:
- Google typically displays first 50-60 characters of title tags
- Longer titles get truncated with "..." in search results
- Brand suffix ensures brand visibility in all results

**160 Characters for Description**:
- Google displays approximately 150-160 characters in snippets
- Longer descriptions get cut off in search results
- Proper length ensures full message is displayed

### Search Engine Optimization

✅ **DO**:
- Keep titles concise and descriptive
- Include main keywords naturally in descriptions
- Use sentence case for better readability
- End descriptions with proper punctuation
- Include brand name in title

❌ **DON'T**:
- Stuff keywords unnaturally
- Use all caps or excessive punctuation
- Leave HTML tags in descriptions
- Exceed character limits
- Duplicate content across products

## Troubleshooting

### Permission Denied Error
```
❌ Error updating product: permission denied for table products
```
**Solution**: Ensure `VITE_SUPABASE_SERVICE_ROLE_KEY` is set in `.env` file

### No Products Found
```
⚠️  No products found.
```
**Solution**: Check database connection and ensure products exist with `is_active = true`

### Character Limit Warnings
```
⚠️  WARNING: 1 products exceed character limits
```
**Solution**: The script automatically truncates, but you may want to manually review these products for better optimization

## Future Enhancements

Potential improvements:
- [ ] Keyword extraction from descriptions
- [ ] Category-specific title templates
- [ ] A/B testing metadata variations
- [ ] SEO score calculation
- [ ] Integration with Google Search Console
- [ ] Automated keyword research suggestions

## Related Files

- Script: `generate-seo-metadata.js`
- Database: `products` table with `meta_title` and `meta_description` columns
- Admin UI: Product form includes SEO section for manual editing

---

**Last Updated**: October 17, 2025  
**Version**: 1.0.0
