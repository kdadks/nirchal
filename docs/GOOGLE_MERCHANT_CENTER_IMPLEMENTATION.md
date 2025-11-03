# Google Merchant Center Implementation Guide

## Overview

This document describes the implementation of Google Merchant Center (GMC) tracking and structured data for the Nirchal e-commerce store. The implementation follows Google's best practices for product structured data and includes all required and recommended attributes for apparel products.

## Implementation Summary

### 1. Schema.org Product Structured Data

All product detail pages now include comprehensive Schema.org Product markup with the following attributes:

#### Required Attributes (All Present)
- `@type`: "Product"
- `name`: Product title
- `description`: Product description
- `image`: Array of product images (up to 10)
- `sku`: Product SKU or ID
- `brand`: "Nirchal"
- `offers`: Object containing:
  - `@type`: "Offer"
  - `url`: Product page URL
  - `price`: Product price
  - `priceCurrency`: "INR"
  - `availability`: Stock status (InStock/OutOfStock)
  - `priceValidUntil`: 30 days from current date

#### Product Identifiers (Recommended)
- `gtin`: Global Trade Item Number (UPC/EAN/ISBN) - **Strongly recommended by Google**
- `mpn`: Manufacturer Part Number
- `itemCondition`: "NewCondition" (default for all products)

#### Apparel-Specific Attributes (Required for Major Markets)
- `color`: Product color
- `material`: Fabric/material type
- `category`: Product category
- `audience`: Object containing:
  - `suggestedGender`: Female/Male/Unisex
  - `suggestedMinAge`: Based on age_group
  - `suggestedMaxAge`: Based on age_group

#### Additional Enhancements
- `aggregateRating`: Star rating and review count (if reviews exist)
- Multiple images support (primary + additional images)

### 2. Database Schema Updates

Created migration `20250124000007_add_gmc_product_fields.sql` to add:

```sql
-- New columns added to products table:
gtin VARCHAR(50)                    -- Global Trade Item Number
mpn VARCHAR(100)                    -- Manufacturer Part Number
gender VARCHAR(20)                  -- Female, Male, Unisex
age_group VARCHAR(20)               -- Adult, Kids, Infant, Toddler, Newborn
google_product_category VARCHAR(255) -- Google Product Category taxonomy

-- Indexes for performance:
idx_products_gtin                   -- Index on GTIN for lookups
idx_products_mpn                    -- Index on MPN for lookups
```

### 3. TypeScript Type Updates

Updated type definitions in:
- `src/types/index.ts`: Added GMC fields to Product interface
- `src/types/admin.ts`: Added GMC fields to admin Product interface
- `src/utils/structuredData.ts`: Enhanced Product interface and schema generation

### 4. Code Changes

#### Files Modified:
1. **src/utils/structuredData.ts**
   - Enhanced `generateProductSchema()` function
   - Added support for multiple images
   - Added GTIN, MPN, condition fields
   - Added apparel-specific attributes (color, material, gender, age_group)
   - Enhanced audience targeting based on gender and age group

2. **src/pages/ProductDetailPage.tsx**
   - Updated product schema generation to include all GMC fields
   - Maps database fields to structured data
   - Uses product-specific values or defaults

3. **src/types/index.ts** & **src/types/admin.ts**
   - Added GMC field types to Product interfaces

## Google Merchant Center Setup

### Step 1: Verify Structured Data

1. **Test with Google Rich Results Test**
   - Visit: https://search.google.com/test/rich-results
   - Enter a product URL from your site
   - Verify all required fields are present
   - Check for warnings or errors

2. **Validate in Google Search Console**
   - Go to Search Console → Enhancements → Products
   - Monitor for any issues or warnings
   - Check product coverage

### Step 2: Product Identifiers (Critical)

Google **strongly recommends** adding product identifiers:

1. **GTIN (Highest Priority)**
   - UPC (North America): 12-digit number
   - EAN (Europe): 13-digit number
   - JAN (Japan): 8 or 13-digit number
   - ISBN (Books): 10 or 13-digit number
   
   **Action Required**: Add GTIN values to products in admin panel

2. **MPN (Manufacturer Part Number)**
   - Required if GTIN not available
   - Unique identifier from manufacturer
   
   **Action Required**: Add MPN values if GTIN not available

3. **Brand** (Always Required)
   - Currently set to "Nirchal" for all products
   - ✅ Already implemented

### Step 3: Apparel-Specific Requirements

For apparel products (required in Brazil, France, Germany, Japan, UK, US):

1. **Gender** (Required)
   - Values: Female, Male, Unisex
   - Currently defaulting to "Female" for all products
   
   **Action Required**: Set gender for each product in admin panel

2. **Age Group** (Required)
   - Values: Adult, Kids, Infant, Toddler, Newborn
   - Currently defaulting to "Adult" for all products
   
   **Action Required**: Set age_group for each product if applicable

3. **Color** (Required)
   - ✅ Already captured in database
   - Automatically included in structured data

4. **Size** (Required)
   - ✅ Already captured via variants
   - Consider adding to main product structured data

5. **Material** (Recommended)
   - ✅ Already captured as "fabric"
   - Automatically mapped to material in structured data

### Step 4: Google Product Category

Add appropriate Google Product Category taxonomy value:

**For Indian Ethnic Wear:**
- Main: "Apparel & Accessories > Clothing"
- Specific examples:
  - Sarees: "Apparel & Accessories > Clothing > Dresses"
  - Salwar Kameez: "Apparel & Accessories > Clothing > Dresses"
  - Lehengas: "Apparel & Accessories > Clothing > Outerwear > Traditional Wear"
  - Kurtas: "Apparel & Accessories > Clothing > Tops > Blouses & Shirts"

**Action Required**: Set google_product_category for products in admin panel

**Reference**: https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt

### Step 5: Product Variants (Advanced)

For products with multiple variants (color, size combinations):

1. Use `item_group_id` to group variants
2. Each variant needs unique GTIN
3. All variants share same base product information

**Future Enhancement**: Consider implementing variant-specific structured data

## Admin Panel Integration

### Required Changes for Admin Panel

To enable admin users to manage GMC fields, add form fields for:

1. **Product Identifiers Tab/Section:**
   - GTIN (text input, 8-14 digits)
   - MPN (text input)
   - Validation: At least one required (GTIN preferred)

2. **Product Attributes Tab/Section:**
   - Gender (dropdown: Female, Male, Unisex)
   - Age Group (dropdown: Adult, Kids, Infant, Toddler, Newborn)
   - Google Product Category (text input or autocomplete)

3. **Validation Rules:**
   - GTIN format validation (check digit validation)
   - At least one identifier (GTIN or MPN) recommended
   - Gender and Age Group required for apparel
   - Category required for all products

## Testing Checklist

- [ ] Run database migration `20250124000007_add_gmc_product_fields.sql`
- [ ] Verify structured data appears on product pages (view page source)
- [ ] Test with Google Rich Results Test tool
- [ ] Validate no errors in Google Search Console
- [ ] Add GTIN values to at least 10 sample products
- [ ] Set gender and age_group for all products
- [ ] Add Google Product Category to all products
- [ ] Monitor GMC dashboard for issues
- [ ] Check product appearances in Google Shopping results

## Benefits of Implementation

1. **Enhanced Search Visibility**
   - Products eligible for rich results in Google Search
   - Product snippets with images, ratings, price
   - Shopping knowledge panel appearances

2. **Google Shopping Integration**
   - Products can appear in Google Shopping tab
   - Google Images shopping features
   - Price comparison features

3. **Better Product Discovery**
   - Improved CTR from search results
   - More qualified traffic
   - Better mobile shopping experience

4. **Future-Proof**
   - Ready for Google Shopping Actions
   - Compatible with Google Merchant Center feeds
   - Structured for voice search optimization

## Common Issues & Solutions

### Issue 1: Missing GTIN
**Problem**: Products without GTIN may have limited Shopping features

**Solution**: 
- Add GTINs to all products (highest priority)
- If GTINs unavailable, add MPNs
- Use manufacturer documentation or product packaging

### Issue 2: Invalid Structured Data
**Problem**: Syntax errors in JSON-LD

**Solution**:
- Test with Rich Results Test before deploying
- Validate JSON syntax
- Check all required fields present

### Issue 3: Incorrect Category
**Problem**: Products appear in wrong Google Shopping category

**Solution**:
- Use official Google Product Taxonomy
- Be as specific as possible
- Test different categories in GMC

### Issue 4: Out of Stock Products
**Problem**: Out of stock products not handled correctly

**Solution**:
- ✅ Already handled via availability field
- Updates automatically based on inventory
- Consider PreOrder status for upcoming products

## Next Steps

1. **Immediate (High Priority)**
   - [ ] Run database migration
   - [ ] Add GTIN values to products
   - [ ] Set gender/age_group defaults
   - [ ] Test structured data validation

2. **Short Term (1-2 weeks)**
   - [ ] Update admin panel with GMC fields
   - [ ] Add Google Product Categories
   - [ ] Create product feed generator (optional)
   - [ ] Submit products to Google Merchant Center

3. **Long Term (1-2 months)**
   - [ ] Monitor GMC dashboard regularly
   - [ ] Optimize based on performance data
   - [ ] Implement variant-specific structured data
   - [ ] Add shipping and return policy structured data

## Resources

- **Google Merchant Center Help**: https://support.google.com/merchants
- **Product Data Specification**: https://support.google.com/merchants/answer/7052112
- **Schema.org Product**: https://schema.org/Product
- **Rich Results Test**: https://search.google.com/test/rich-results
- **Google Product Taxonomy**: https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt
- **Structured Data Guidelines**: https://developers.google.com/search/docs/appearance/structured-data/product

## Support

For questions or issues with GMC implementation:
1. Check Google Search Console for validation errors
2. Use Rich Results Test tool for debugging
3. Review GMC dashboard for product-specific issues
4. Refer to Google's troubleshooting guide
