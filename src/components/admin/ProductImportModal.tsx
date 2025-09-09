import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Download, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

// Import types and helper functions
interface ImportOptions {
  batchSize: number;
  skipDuplicates: boolean;
  updateExisting: boolean;
  validateOnly: boolean;
  onProgress?: (progress: number, status: string) => void;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    field: string;
    value: string;
    message: string;
  }>;
  warnings: Array<{
    row: number;
    field: string;
    value: string;
    message: string;
  }>;
}

// Helper function to generate URL-friendly slug
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Product import function that uses auth context
const useProductImport = () => {
  const { supabase, user } = useAuth();
  const [importing, setImporting] = useState(false);

  // Function to download image from URL and upload to Supabase storage using server-side proxy
  const downloadAndUploadImage = async (imageUrl: string, productName: string, imageIndex: number): Promise<string | null> => {
    try {
      console.log(`🔄 Downloading image from: ${imageUrl}`);
      
      let imageBlob: Blob;
      let contentType = 'image/jpeg';

      // Try to use server-side function first (for production)
      try {
        const response = await fetch('/.netlify/functions/download-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl }),
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            // Convert base64 back to blob
            const base64Data = result.imageData;
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            imageBlob = new Blob([byteArray], { type: result.contentType });
            contentType = result.contentType;
          } else {
            throw new Error('Server function failed: ' + result.error);
          }
        } else {
          throw new Error('Server function not available');
        }
      } catch (serverError) {
        
        // Fallback to direct download (for development or if server function fails)
        // Note: This may fail due to CSP in production
        try {
          // Add timeout to prevent hanging requests and better error context
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            controller.abort();
            console.log(`⏰ Direct download timeout for: ${imageUrl}`);
          }, 30000); // 30 second timeout
          
          console.log(`🌐 Attempting direct download for: ${imageUrl.substring(0, 80)}...`);
          
          const directResponse = await fetch(imageUrl, {
            mode: 'cors',
            credentials: 'omit',
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!directResponse.ok) {
            throw new Error(`HTTP ${directResponse.status}: ${directResponse.statusText}`);
          }
          
          imageBlob = await directResponse.blob();
          
          // Check if the blob is valid and not too large (max 10MB)
          if (imageBlob.size === 0) {
            throw new Error('Downloaded image is empty');
          }
          if (imageBlob.size > 10 * 1024 * 1024) {
            throw new Error(`Image too large: ${Math.round(imageBlob.size / 1024 / 1024)}MB (max 10MB)`);
          }
          
          contentType = directResponse.headers.get('content-type') || 'image/jpeg';
        } catch (directError) {
          console.error('❌ Both server and direct download failed:', { 
            imageUrl,
            serverError: serverError instanceof Error ? serverError.message : String(serverError), 
            directError: directError instanceof Error ? directError.message : String(directError)
          });
          return null;
        }
      }
      
      // Generate a unique filename
      const urlParts = imageUrl.split('/');
      const originalName = urlParts[urlParts.length - 1];
      const extension = originalName.includes('.') ? originalName.split('.').pop() : 'jpg';
      const sanitizedProductName = productName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const timestamp = Date.now();
      const fileName = `${sanitizedProductName}-${timestamp}-${imageIndex}.${extension}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageBlob, {
          contentType: contentType,
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Failed to upload image to Supabase storage:', {
          fileName,
          imageUrl,
          error: uploadError,
          errorMessage: uploadError.message
        });
        return null;
      }

      return fileName;
    } catch (error) {
      console.error('❌ Error downloading/uploading image:', {
        imageUrl,
        productName,
        imageIndex,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      return null;
    }
  };

  // Function to download and upload category image using server-side proxy
  const downloadAndUploadCategoryImage = async (imageUrl: string, categoryName: string): Promise<string | null> => {
    try {
      console.log(`Downloading category image from: ${imageUrl}`);
      
      let imageBlob: Blob;
      let contentType = 'image/jpeg';

      // Try to use server-side function first (for production)
      try {
        const response = await fetch('/.netlify/functions/download-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl }),
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            // Convert base64 back to blob
            const base64Data = result.imageData;
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            imageBlob = new Blob([byteArray], { type: result.contentType });
            contentType = result.contentType;
          } else {
            throw new Error('Server function failed: ' + result.error);
          }
        } else {
          throw new Error('Server function not available');
        }
      } catch (serverError) {
        
        // Fallback to direct download (for development or if server function fails)
        try {
          const directResponse = await fetch(imageUrl, {
            mode: 'cors',
            credentials: 'omit'
          });
          
          if (!directResponse.ok) {
            throw new Error(`HTTP ${directResponse.status}: ${directResponse.statusText}`);
          }
          
          imageBlob = await directResponse.blob();
          contentType = directResponse.headers.get('content-type') || 'image/jpeg';
        } catch (directError) {
          console.error('❌ Both server and direct download failed for category image:', { serverError, directError });
          return null;
        }
      }
      
      // Generate a unique filename for category
      const urlParts = imageUrl.split('/');
      const originalName = urlParts[urlParts.length - 1];
      const extension = originalName.includes('.') ? originalName.split('.').pop() : 'jpg';
      const sanitizedCategoryName = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const timestamp = Date.now();
      // Generate a unique filename in categories folder
      const fileName = `categories/${sanitizedCategoryName}-${timestamp}.${extension}`;

      // Upload to Supabase storage (using same bucket as products for now)
      // Note: If you have a separate 'category-images' bucket, change 'product-images' to 'category-images'
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageBlob, {
          contentType: contentType,
          upsert: false
        });

      if (uploadError) {
        console.error('Failed to upload category image to storage:', {
          fileName,
          error: uploadError,
          bucket: 'product-images',
          folder: 'categories'
        });
        
        // If upload fails, try without folder structure
        const simpleName = `category-${sanitizedCategoryName}-${timestamp}.${extension}`;
        const { error: retryError } = await supabase.storage
          .from('product-images')
          .upload(simpleName, imageBlob, {
            contentType: contentType,
            upsert: false
          });
          
        if (retryError) {
          console.error('Category image upload retry also failed:', retryError);
          return null;
        }
        
        // Get the public URL for retry upload
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(simpleName);

        return publicUrl;
      }

      // Get the public URL for successful upload
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error downloading/uploading category image:', error);
      return null;
    }
  };

  const importProducts = async (
    csvData: any[], 
    options: ImportOptions
  ): Promise<ImportResult> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    if (!user) throw new Error('User not authenticated');
    
    setImporting(true);
    const { batchSize, skipDuplicates, updateExisting, validateOnly, onProgress } = options;
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      warnings: []
    };

    try {
      // Validate CSV structure
      onProgress?.(5, 'Validating CSV structure...');
      
      // Group CSV rows by product handle (Shopify exports have variants as separate rows)
      const productGroups = new Map<string, any[]>();
      
      csvData.forEach((row, index) => {
        const handle = row.Handle || row.handle || row.sku || `product-${index}`;
        if (!productGroups.has(handle)) {
          productGroups.set(handle, []);
        }
        productGroups.get(handle)!.push(row);
      });

      console.log('Product grouping results:', {
        totalRows: csvData.length,
        uniqueProducts: productGroups.size,
        firstFewHandles: Array.from(productGroups.keys()).slice(0, 5),
        sampleGroupSizes: Array.from(productGroups.values()).slice(0, 5).map(group => group.length)
      });

      onProgress?.(10, `Found ${productGroups.size} unique products with ${csvData.length} variants/rows`);

      // Get categories and vendors for reference
      onProgress?.(15, 'Loading reference data...');
      
      const [categoriesResult, vendorsResult] = await Promise.all([
        supabase.from('categories').select('id, name'),
        supabase.from('vendors').select('id, name')
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      if (vendorsResult.error) throw vendorsResult.error;

      const categoriesMap = new Map(
        categoriesResult.data.map((cat: any) => [cat.name.toLowerCase(), cat.id])
      );
      const vendorsMap = new Map(
        vendorsResult.data.map((vendor: any) => [vendor.name.toLowerCase(), vendor.id])
      );

      // Extract unique categories from CSV data and create missing ones
      onProgress?.(17, 'Processing categories from CSV...');
      
      const csvCategories = new Map<string, { name: string; image?: string }>();
      csvData.forEach(row => {
        const categoryName = (row.category_name || row['Product Type'] || row.Type || row.type || '').trim();
        if (categoryName && categoryName.toLowerCase() !== 'uncategorized') {
          const categoryImage = row.category_image || row['Category Image'] || row['Type Image'] || '';
          if (!csvCategories.has(categoryName.toLowerCase())) {
            csvCategories.set(categoryName.toLowerCase(), { 
              name: categoryName, 
              image: categoryImage 
            });
          }
        }
      });

      // Create missing categories
      for (const [categoryKey, categoryInfo] of csvCategories) {
        if (!categoriesMap.has(categoryKey)) {
          console.log(`Creating new category: ${categoryInfo.name}`);
          
          const generateSlug = (text: string) => {
            return text.toLowerCase()
              .replace(/[^a-z0-9 -]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim();
          };

          // Download and upload category image if provided
          let categoryImageUrl = '';
          if (categoryInfo.image && categoryInfo.image.trim()) {
            const uploadedImageUrl = await downloadAndUploadCategoryImage(categoryInfo.image, categoryInfo.name);
            categoryImageUrl = uploadedImageUrl || '';
            
            if (!uploadedImageUrl) {
              result.warnings.push({
                row: 0,
                field: 'category_image',
                value: categoryInfo.image,
                message: `Failed to download/upload category image: ${categoryInfo.image}`
              });
            }
          }

          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert({ 
              name: categoryInfo.name,
              description: `Category created during product import`,
              slug: generateSlug(categoryInfo.name),
              image_url: categoryImageUrl, // Use correct column name: image_url
              is_active: true 
            })
            .select('id')
            .single();
            
          if (categoryError) {
            console.error(`Failed to create category "${categoryInfo.name}":`, categoryError);
            result.warnings.push({
              row: 0,
              field: 'category',
              value: categoryInfo.name,
              message: `Failed to create category: ${categoryError.message}`
            });
          } else {
            categoriesMap.set(categoryKey, newCategory.id);
          }
        }
      }

      // Ensure we have a default category for products without a valid category
      let defaultCategoryId: string;
      const defaultCategoryName = 'uncategorized';
      
      if (!categoriesMap.has(defaultCategoryName)) {
        // Create default category if it doesn't exist
        const { data: newCategory, error: categoryError } = await supabase
          .from('categories')
          .insert({ 
            name: 'Uncategorized',
            description: 'Default category for imported products',
            slug: 'uncategorized',
            is_active: true 
          })
          .select('id')
          .single();
          
        if (categoryError) {
          console.error('Failed to create default category:', categoryError);
          throw new Error('Failed to create default category for import');
        }
        
        defaultCategoryId = newCategory.id;
        categoriesMap.set(defaultCategoryName, defaultCategoryId);
      } else {
        defaultCategoryId = categoriesMap.get(defaultCategoryName)!;
      }

      // Process products in batches
      const productArray = Array.from(productGroups.values());
      const totalBatches = Math.ceil(productArray.length / batchSize);

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const batch = productArray.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize);
        const batchProgress = 25 + ((batchIndex / totalBatches) * 65);
        
        onProgress?.(Math.round(batchProgress), `Processing batch ${batchIndex + 1} of ${totalBatches} (processing images...)...`);

        for (const variantRows of batch) {
          try {
            // Get the main product data from the first row
            const mainRow = variantRows[0];
            
            // Generate a unique SKU if none provided
            let productSku = mainRow.sku || mainRow['Variant SKU'] || '';
            if (!productSku) {
              const productName = mainRow.name || mainRow.Title || '';
              const handle = mainRow.Handle || generateSlug(productName);
              productSku = handle || `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }
            
            // Check if this product has variants
            const hasVariantData = variantRows.length > 1 || 
              (variantRows.length === 1 && (
                variantRows[0]['Option1 Value'] || 
                variantRows[0]['Option2 Value'] || 
                variantRows[0]['Option3 Value']
              ));
            
            // For products with variants, use the base price from the product, not variants
            // For products without variants, use the variant price (which is the product price)
            let basePrice = 0;
            let salePrice = null;
            
            if (hasVariantData) {
              // Use the lowest variant price as base price, or the first variant's price
              const variantPrices = variantRows
                .map(row => parseFloat(row['Variant Price'] || row.price || '0'))
                .filter(price => price > 0);
              basePrice = variantPrices.length > 0 ? Math.min(...variantPrices) : 0;
              
              // Check for sale prices
              const salePrices = variantRows
                .map(row => parseFloat(row['Variant Compare At Price'] || row.sale_price || '0'))
                .filter(price => price > 0);
              if (salePrices.length > 0) {
                salePrice = Math.min(...salePrices);
              }
            } else {
              // Single variant product - use its price directly
              basePrice = parseFloat(mainRow.price || mainRow['Variant Price'] || '0');
              salePrice = parseFloat(mainRow.sale_price || mainRow['Variant Compare At Price'] || '0') || null;
            }
            
            // Transform the product data
            const productData = {
              name: mainRow.name || mainRow.Title || '',
              description: mainRow.description || mainRow['Body (HTML)'] || '',
              price: basePrice,
              sale_price: salePrice,
              sku: productSku,
              category_id: categoriesMap.get((mainRow.category_name || mainRow['Product Type'] || mainRow.Type || mainRow.type || '').toLowerCase()) || defaultCategoryId,
              vendor_id: vendorsMap.get((mainRow.vendor_name || mainRow.Vendor || '').toLowerCase()) || null,
              is_active: (mainRow.status || mainRow.Status || 'active').toLowerCase() === 'active',
              is_featured: false, // Default to false, can be updated later
              slug: generateSlug(mainRow.name || mainRow.Title || mainRow.Handle || ''),
              meta_title: mainRow.meta_title || mainRow['SEO Title'] || '',
              meta_description: mainRow.meta_description || mainRow['SEO Description'] || '',
              created_by: user.id, // Current user's UUID
              updated_by: user.id  // Current user's UUID
            };

            if (!validateOnly) {
              // Check for duplicates
              if (skipDuplicates && productData.sku) {
                const { data: existingProduct } = await supabase
                  .from('products')
                  .select('id')
                  .eq('sku', productData.sku)
                  .single();

                if (existingProduct) {
                  result.warnings.push({
                    row: variantRows[0]._index || 0,
                    field: 'sku',
                    value: productData.sku,
                    message: 'Product with this SKU already exists - skipped'
                  });
                  continue;
                }
              }

              // Insert or update product
              let productId: string | undefined;
              let attemptCount = 0;
              const maxAttempts = 3;
              
              while (attemptCount < maxAttempts) {
                try {
                  if (updateExisting && productData.sku) {
                    const { data: existingProduct } = await supabase
                      .from('products')
                      .select('id')
                      .eq('sku', productData.sku)
                      .single();

                    if (existingProduct) {
                      const { error: updateError } = await supabase
                        .from('products')
                        .update(productData)
                        .eq('id', existingProduct.id);

                      if (updateError) throw updateError;
                      productId = existingProduct.id;
                    } else {
                      const { data: newProduct, error: insertError } = await supabase
                        .from('products')
                        .insert(productData)
                        .select('id')
                        .single();

                      if (insertError) throw insertError;
                      productId = newProduct.id;
                    }
                  } else {
                    const { data: newProduct, error: insertError } = await supabase
                      .from('products')
                      .insert(productData)
                      .select('id')
                      .single();

                    if (insertError) throw insertError;
                    productId = newProduct.id;
                  }
                  
                  // If we get here, the insert/update was successful
                  break;
                  
                } catch (dbError: any) {
                  // Check if it's a duplicate SKU error
                  if (dbError.code === '23505' && dbError.message.includes('products_sku_key')) {
                    attemptCount++;
                    if (attemptCount >= maxAttempts) {
                      // Final attempt failed, skip this product
                      result.warnings.push({
                        row: variantRows[0]._index || 0,
                        field: 'sku',
                        value: productData.sku,
                        message: `SKU conflict could not be resolved after ${maxAttempts} attempts`
                      });
                      break;
                    }
                    
                    // Generate a new unique SKU for retry
                    const timestamp = Date.now();
                    const random = Math.random().toString(36).substr(2, 5);
                    productData.sku = `${productSku}-${timestamp}-${random}`;
                    
                    console.log(`SKU conflict detected, retrying with new SKU: ${productData.sku}`);
                    continue;
                  } else {
                    // Different error, re-throw
                    throw dbError;
                  }
                }
              }
              
              // Skip to next product if we couldn't create the product
              if (!productId) {
                continue;
              }

              // Process variants if there are multiple rows or variant data
              const createdVariants = [];
              
              // Collect all unique variants from all rows
              const uniqueVariants = new Map();
              const hasVariantData = variantRows.some(row => 
                row['Option1 Value'] || row['Option2 Value'] || row['Option3 Value']
              );

              if (hasVariantData) {
                for (const variantRow of variantRows) {
                  // Smart mapping: detect if Option1/Option2 are size/color based on names
                  const option1Name = variantRow['Option1 Name'] || '';
                  const option2Name = variantRow['Option2 Name'] || '';
                  const option3Name = variantRow['Option3 Name'] || '';
                  
                  let size = '';
                  let color = '';
                  let hasSize = false;
                  let hasColor = false;
                  
                  // Check Option1
                  if (option1Name.toLowerCase().includes('size') || 
                      option1Name.toLowerCase().includes('dimension')) {
                    size = variantRow['Option1 Value'] || '';
                    hasSize = !!size;
                  } else if (option1Name.toLowerCase().includes('color') || 
                             option1Name.toLowerCase().includes('colour')) {
                    color = variantRow['Option1 Value'] || '';
                    hasColor = !!color;
                  } else if (variantRow['Option1 Value']) {
                    // Try to guess based on value patterns
                    const value = variantRow['Option1 Value'].toLowerCase();
                    if (value.includes('size') || /^(xs|s|m|l|xl|xxl|\d+|\d+cm|\d+mm|\d+inch)$/i.test(value)) {
                      size = variantRow['Option1 Value'];
                      hasSize = true;
                    } else {
                      color = variantRow['Option1 Value'];
                      hasColor = true;
                    }
                  }
                  
                  // Check Option2
                  if (option2Name.toLowerCase().includes('color') || 
                      option2Name.toLowerCase().includes('colour')) {
                    color = variantRow['Option2 Value'] || '';
                    hasColor = !!color;
                  } else if (option2Name.toLowerCase().includes('size') || 
                             option2Name.toLowerCase().includes('dimension')) {
                    size = variantRow['Option2 Value'] || '';
                    hasSize = !!size;
                  } else if (variantRow['Option2 Value'] && !hasColor && !hasSize) {
                    // If Option1 was size, Option2 is likely color
                    if (hasSize) {
                      color = variantRow['Option2 Value'];
                      hasColor = true;
                    } else if (hasColor) {
                      size = variantRow['Option2 Value'];
                      hasSize = true;
                    } else {
                      // Guess based on value
                      const value = variantRow['Option2 Value'].toLowerCase();
                      if (value.includes('size') || /^(xs|s|m|l|xl|xxl|\d+|\d+cm|\d+mm|\d+inch)$/i.test(value)) {
                        size = variantRow['Option2 Value'];
                        hasSize = true;
                      } else {
                        color = variantRow['Option2 Value'];
                        hasColor = true;
                      }
                    }
                  }
                  
                  // Check Option3 if present
                  if (option3Name && variantRow['Option3 Value']) {
                    if (option3Name.toLowerCase().includes('color') && !hasColor) {
                      color = variantRow['Option3 Value'];
                      hasColor = true;
                    } else if (option3Name.toLowerCase().includes('size') && !hasSize) {
                      size = variantRow['Option3 Value'];
                      hasSize = true;
                    }
                  }
                  
                  // Only set defaults if we have actual variant options
                  // Don't create size variants if no size is actually specified
                  if (!hasSize && !hasColor) {
                    // No variants detected, skip this variant creation
                    continue;
                  } else if (!hasSize && hasColor) {
                    size = ''; // Don't set "One Size" - leave empty for color-only variants
                  } else if (hasSize && !hasColor) {
                    color = ''; // Don't set "Default" - leave empty for size-only variants
                  }
                  
                  // Handle variant pricing - calculate price adjustment from base price
                  const variantPrice = parseFloat(variantRow['Variant Price'] || '0');
                  const basePrice = productData.price;
                  const priceAdjustment = variantPrice > 0 ? variantPrice - basePrice : 0;
                  
                  // Create unique variant key
                  const variantKey = `${size}-${color}`;
                  
                  if (!uniqueVariants.has(variantKey)) {
                    const variantData = {
                      product_id: productId,
                      size: size || null,
                      color: color || null,
                      color_hex: variantRow.color_hex || '',
                      sku: variantRow['Variant SKU'] || variantRow.sku || `${productData.sku}-${size || 'nosize'}-${color || 'nocolor'}`.replace(/[^a-zA-Z0-9-]/g, ''),
                      price_adjustment: priceAdjustment,
                    };
                    
                    uniqueVariants.set(variantKey, {
                      ...variantData,
                      quantity: parseInt(variantRow['Variant Inventory Qty'] || variantRow.stock_quantity || '0'),
                      low_stock_threshold: parseInt(variantRow.low_stock_threshold || '5')
                    });
                  }
                }

                // Insert unique variants only if we have valid variants
                if (uniqueVariants.size > 0) {
                  for (const variantInfo of uniqueVariants.values()) {
                    const { quantity, low_stock_threshold, ...variantData } = variantInfo;
                    
                    const { data: newVariant, error: variantError } = await supabase
                      .from('product_variants')
                      .insert(variantData)
                      .select()
                      .single();

                    if (variantError) {
                      console.error('Variant insert error:', variantError);
                      result.warnings.push({
                        row: variantRows[0]._index || 0,
                        field: 'variant',
                        value: variantData.sku,
                        message: `Failed to create variant: ${variantError.message}`
                      });
                    } else {
                      createdVariants.push({
                        ...newVariant,
                        quantity,
                        low_stock_threshold
                      });
                    }
                  }
                }
              } else {
                // Only create a default variant if there are no actual variants detected
                // but we still have product data that needs a variant
                const defaultVariantData = {
                  product_id: productId,
                  size: null, // No size for default variants
                  color: null, // No color for default variants
                  color_hex: '',
                  sku: productData.sku || `${productId}-default`,
                  price_adjustment: 0, // No price adjustment for default variants
                };

                const { data: newVariant, error: variantError } = await supabase
                  .from('product_variants')
                  .insert(defaultVariantData)
                  .select()
                  .single();

                if (variantError) {
                  console.error('Default variant insert error:', variantError);
                  result.warnings.push({
                    row: variantRows[0]._index || 0,
                    field: 'variant',
                    value: defaultVariantData.sku,
                    message: `Failed to create default variant: ${variantError.message}`
                  });
                } else {
                  createdVariants.push({
                    ...newVariant,
                    quantity: parseInt(variantRows[0]['Variant Inventory Qty'] || variantRows[0].stock_quantity || '0'),
                    low_stock_threshold: parseInt(variantRows[0].low_stock_threshold || '5')
                  });
                }
              }

              // Process images - collect all unique images from all variant rows
              const uniqueImages = new Map();
              let imagePosition = 1;
              
              for (const variantRow of variantRows) {
                const imageUrl = variantRow['Image Src'] || variantRow.featured_image || variantRow.image_url;
                if (imageUrl && !uniqueImages.has(imageUrl)) {
                  uniqueImages.set(imageUrl, {
                    url: imageUrl,
                    alt_text: variantRow['Image Alt Text'] || productData.name,
                    is_primary: imagePosition === 1, // First image is primary
                    display_order: imagePosition
                  });
                  imagePosition++;
                }
              }

              // Download and upload all unique images (sequential processing for better reliability)
              if (uniqueImages.size > 0) {
                const imageInserts = [];
                let processedImages = 0;
                
                for (const [originalUrl, imageInfo] of uniqueImages) {
                  try {
                    
                    // Download and upload image to Supabase storage
                    const uploadedFileName = await downloadAndUploadImage(originalUrl, productData.name, imageInfo.display_order);
                    
                    if (uploadedFileName) {
                      imageInserts.push({
                        product_id: productId,
                        image_url: uploadedFileName, // Store the uploaded filename, not the original URL
                        alt_text: imageInfo.alt_text,
                        is_primary: imageInfo.is_primary,
                        display_order: imageInfo.display_order
                      });
                      processedImages++;
                    } else {
                      // Failed to download/upload, add warning with more detail
                      console.warn(`⚠️ Image download failed for ${originalUrl} - Product: ${productData.name}`);
                      result.warnings.push({
                        row: variantRows[0]._index || 0,
                        field: 'image',
                        value: originalUrl,
                        message: `Failed to download/upload image: ${originalUrl} (Check console for detailed error)`
                      });
                    }
                    
                    // Add a small delay between image downloads to prevent overwhelming the browser/network
                    if (imageInfo.display_order < uniqueImages.size) {
                      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between images
                    }
                  } catch (error) {
                    console.error(`❌ Error processing image ${originalUrl}:`, error);
                    result.warnings.push({
                      row: variantRows[0]._index || 0,
                      field: 'image',
                      value: originalUrl,
                      message: `Error processing image: ${error instanceof Error ? error.message : 'Unknown error'}`
                    });
                  }
                }

                // Insert successfully processed images
                if (imageInserts.length > 0) {
                  const { error: imageError } = await supabase
                    .from('product_images')
                    .insert(imageInserts);

                  if (imageError) {
                    result.warnings.push({
                      row: variantRows[0]._index || 0,
                      field: 'images',
                      value: `${imageInserts.length} images`,
                      message: `Failed to save image records: ${imageError.message}`
                    });
                  }
                }
              }

              // Add inventory records for each created variant
              if (createdVariants.length > 0) {
                const inventoryRows = createdVariants.map((variant) => ({
                  product_id: productId,
                  variant_id: variant.id,
                  quantity: variant.quantity,
                  low_stock_threshold: variant.low_stock_threshold
                }));

                const { error: inventoryError } = await supabase
                  .from('inventory')
                  .insert(inventoryRows);

                if (inventoryError) {
                  result.warnings.push({
                    row: variantRows[0]._index || 0,
                    field: 'inventory',
                    value: inventoryRows.length.toString(),
                    message: `Failed to create inventory records: ${inventoryError.message}`
                  });
                }
              }
            }

            result.success++;
          } catch (error) {
            console.error('Product import error:', error);
            result.failed++;
            result.errors.push({
              row: variantRows[0]._index || 0,
              field: 'Unknown',
              value: variantRows[0].name || variantRows[0].Title || 'Unknown',
              message: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      }

      onProgress?.(100, validateOnly ? 'Validation completed' : 'Import completed');
      return result;
    } catch (error) {
      console.error('Import process error:', error);
      throw error;
    } finally {
      setImporting(false);
    }
  };

  return { importProducts, importing };
};

type ImportStep = 'upload' | 'mapping' | 'import' | 'results';

interface CSVPreview {
  headers: string[];
  rows: string[][];
}

interface FieldMapping {
  [csvField: string]: string;
}

interface ProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

const ProductImportModal: React.FC<ProductImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<CSVPreview | null>(null);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    batchSize: 10,
    skipDuplicates: true,
    updateExisting: false,
    validateOnly: false
  });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importProducts } = useProductImport();

  // Smart field mapping suggestions
  const getFieldSuggestion = (csvField: string): string => {
    const field = csvField.toLowerCase();
    
    // Shopify field mappings
    if (field === 'title') return 'name';
    if (field === 'body (html)') return 'description';
    if (field === 'cost per item') return 'price';
    if (field === 'variant price') return 'price_adjustment';
    if (field === 'variant sku') return 'sku';
    if (field === 'product type' || field === 'type') return 'category_name';
    if (field === 'vendor') return 'vendor_name';
    if (field === 'variant weight') return 'weight';
    if (field === 'status') return 'status';
    if (field === 'seo title') return 'meta_title';
    if (field === 'seo description') return 'meta_description';
    if (field === 'handle') return 'slug';
    if (field === 'tags') return 'tags';
    if (field === 'image src') return 'featured_image';
    if (field === 'variant inventory qty') return 'stock_quantity';
    if (field === 'option1 value') return 'variant_sizes';
    if (field === 'option2 value') return 'variant_colors';
    
    // Generic field mappings
    if (field.includes('name') || field.includes('title')) return 'name';
    if (field.includes('description') || field.includes('body')) return 'description';
    if (field.includes('price')) return 'price';
    if (field.includes('sku')) return 'sku';
    if (field.includes('category')) {
      if (field.includes('image') || field.includes('photo')) return 'category_image';
      return 'category_name';
    }
    if (field.includes('vendor') || field.includes('brand')) return 'vendor_name';
    if (field.includes('weight')) return 'weight';
    if (field.includes('status')) return 'status';
    if (field.includes('image') || field.includes('photo')) return 'featured_image';
    if (field.includes('stock') || field.includes('quantity')) return 'stock_quantity';
    if (field.includes('size')) return 'variant_sizes';
    if (field.includes('color')) return 'variant_colors';
    if (field.includes('tag')) return 'tags';
    
    return '';
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    setImportFile(file);
    parseCSV(file);
  };

  // Advanced CSV parsing that handles multi-line fields
  const parseCSVContent = (text: string): { headers: string[], rows: string[][] } => {
    // Handle different line endings and normalize
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    const allRows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;
    let i = 0;

    while (i < cleanText.length) {
      const char = cleanText[i];
      
      if (char === '"') {
        if (inQuotes && cleanText[i + 1] === '"') {
          // Handle escaped quotes ("")
          currentField += '"';
          i += 2;
          continue;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator found outside quotes
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n' && !inQuotes) {
        // Row separator found outside quotes
        currentRow.push(currentField.trim());
        if (currentRow.some(field => field.length > 0)) {
          allRows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
      i++;
    }
    
    // Don't forget the last field and row
    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.some(field => field.length > 0)) {
        allRows.push(currentRow);
      }
    }

    if (allRows.length === 0) {
      return { headers: [], rows: [] };
    }

    const headers = allRows[0];
    const rows = allRows.slice(1);
    
    // Ensure all rows have the same number of columns as headers
    const normalizedRows = rows.map(row => {
      const normalized = [...row];
      while (normalized.length < headers.length) {
        normalized.push('');
      }
      return normalized.slice(0, headers.length);
    });

    return { headers, rows: normalizedRows };
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      
      if (!text || text.trim().length === 0) {
        toast.error('CSV file appears to be empty');
        return;
      }

      try {
        const { headers, rows } = parseCSVContent(text);
        
        if (headers.length === 0) {
          toast.error('No headers found in CSV file');
          return;
        }

        // Take only first 5 rows for preview
        const previewRows = rows.slice(0, 5);
        
        const preview: CSVPreview = { headers, rows: previewRows };
        setCsvPreview(preview);
        
        // Auto-suggest field mappings
        const suggestions: FieldMapping = {};
        headers.forEach(header => {
          const suggestion = getFieldSuggestion(header);
          if (suggestion) {
            suggestions[header] = suggestion;
          }
        });
        setFieldMapping(suggestions);
        
        setCurrentStep('mapping');
        toast.success(`CSV file loaded successfully. Found ${headers.length} columns and ${rows.length} data rows.`);
      } catch (error) {
        console.error('CSV parsing error:', error);
        toast.error('Error parsing CSV file. Please check the file format.');
      }
    };
    
    reader.onerror = () => {
      toast.error('Error reading CSV file. Please try again.');
    };
    
    // Use UTF-8 encoding to handle special characters
    reader.readAsText(file, 'UTF-8');
  };

  const downloadSampleCSV = () => {
    // Download the actual Shopify CSV file from public directory
    const link = document.createElement('a');
    link.href = '/shopify_products_export.csv';
    link.download = 'shopify_products_export.csv';
    link.click();
  };

  const validateAndImportProducts = async () => {
    if (!importFile || !csvPreview) {
      toast.error('No file selected');
      return;
    }

    // Validate required field mappings
    const hasRequiredFields = Object.values(fieldMapping).some(value => value === 'name' || value === 'price');
    if (!hasRequiredFields) {
      toast.error('Please map at least Product Name and Price fields');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportStatus('Preparing import...');
    console.log('[Import] Starting import process, isImporting set to true');

    try {
      // Parse the entire CSV file
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        
        if (!text || text.trim().length === 0) {
          toast.error('CSV file appears to be empty');
          setIsImporting(false);
          return;
        }

        try {
          const { headers, rows } = parseCSVContent(text);
          
          if (headers.length === 0) {
            toast.error('No headers found in CSV file');
            setIsImporting(false);
            return;
          }

          // Create CSV data for import
          const csvData = [];
          for (let i = 0; i < rows.length; i++) {
            const rowData = rows[i];
            
            // Create row object
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = rowData[index] || '';
            });
            
            // Add row index for error reporting
            row._index = i + 1;
            
            // Transform fields according to mapping
            const transformedRow: any = {};
            Object.entries(fieldMapping).forEach(([csvField, dbField]) => {
              if (dbField && row[csvField] !== undefined) {
                transformedRow[dbField] = row[csvField];
              }
            });
            
            // Preserve original fields for fallback
            Object.assign(transformedRow, row);
            
            if (Object.keys(transformedRow).length > 1) { // Skip empty rows
              csvData.push(transformedRow);
            }
          }

          console.log('Parsed CSV data:', {
            totalRows: csvData.length,
            firstRow: csvData[0],
            fieldMapping
          });

          const options: ImportOptions = {
            ...importOptions,
            onProgress: (progress: number, status: string) => {
              console.log(`[Import Progress] ${progress}% - ${status}`);
              // Use setTimeout to ensure state updates are properly scheduled
              setTimeout(() => {
                setImportProgress(Math.round(progress));
                setImportStatus(status);
              }, 0);
            }
          };

          const result = await importProducts(csvData, options);
          setImportResult(result);
          setCurrentStep('results');

          if (result.success > 0) {
            toast.success(`Successfully ${importOptions.validateOnly ? 'validated' : 'imported'} ${result.success} products`);
          }
          if (result.failed > 0) {
            toast.error(`${result.failed} products failed to ${importOptions.validateOnly ? 'validate' : 'import'}`);
          }
        } catch (parseError) {
          console.error('CSV parsing error:', parseError);
          toast.error('Error parsing CSV file. Please check the file format.');
          setImportStatus('Parse failed');
        }
      };
      
      reader.readAsText(importFile, 'UTF-8');
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setImportStatus('Import failed');
    } finally {
      console.log('[Import] Finishing import process, setting isImporting to false');
      setTimeout(() => setIsImporting(false), 100); // Small delay to ensure progress is visible
    }
  };

  if (!isOpen) return null;

  const modal = (
    <div className="admin-modal-overlay">
      <div className="admin-modal modal-xl">
        {/* Header */}
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">
            Import Products
          </h3>
          <div className="admin-modal-subtitle">
            <div className="flex items-center space-x-4">
              {(['upload', 'mapping', 'import', 'results'] as ImportStep[]).map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    currentStep === step 
                      ? 'bg-blue-600 text-white' 
                      : index < (['upload', 'mapping', 'import', 'results'] as ImportStep[]).indexOf(currentStep)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep === step ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </span>
                  {index < 3 && (
                    <div className="ml-4 w-8 h-0.5 bg-gray-300"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="admin-modal-close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="admin-modal-body">
          {currentStep === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Upload a CSV file with your product data. We'll help you map the fields to our database structure.
                  </p>
                </div>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Drop your CSV file here, or{' '}
                        <span className="text-blue-600 hover:text-blue-500">browse</span>
                      </span>
                    </label>
                    <input
                      ref={fileInputRef}
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    CSV files only, up to 10MB
                  </p>
                </div>
              </div>

              {/* Sample CSV Download */}
              <div className="flex justify-center">
                <button
                  onClick={downloadSampleCSV}
                  className="admin-btn admin-btn-secondary"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Sample CSV Template
                </button>
              </div>
            </div>
          )}

          {currentStep === 'mapping' && csvPreview && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Map CSV Fields</h4>
                <p className="text-sm text-gray-600 mb-6">
                  Map your CSV columns to our database fields. We've suggested mappings based on your column names.
                </p>
              </div>

              {/* CSV Preview */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h5 className="admin-card-title">CSV Preview (First 5 rows)</h5>
                </div>
                <div className="admin-card-content">
                  <div className="overflow-x-auto max-h-96">
                    <table className="admin-table">
                      <thead className="sticky top-0 bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-8">
                            #
                          </th>
                          {csvPreview.headers.map((header, index) => (
                            <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">
                              <div className="truncate" title={header}>
                                {header.length > 20 ? header.substring(0, 20) + '...' : header}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.rows.map((row, rowIndex) => (
                          <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-3 py-2 text-xs text-gray-500 font-mono">
                              {rowIndex + 1}
                            </td>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-3 py-2 text-xs text-gray-900 max-w-32">
                                <div className="truncate" title={cell}>
                                  {cell && cell.length > 0 ? (
                                    cell.length > 40 ? cell.substring(0, 40) + '...' : cell
                                  ) : (
                                    <span className="text-gray-400 italic">empty</span>
                                  )}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Showing first {csvPreview.rows.length} rows. Hover over cells to see full content.
                  </div>
                </div>
              </div>

              {/* Field Mapping */}
              <div className="space-y-4">
                <h5 className="text-sm font-medium text-gray-900">Field Mapping</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {csvPreview.headers.map((header, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700">
                          CSV Column: <span className="font-bold">{header}</span>
                        </label>
                      </div>
                      <div className="flex-1">
                        <select
                          value={fieldMapping[header] || ''}
                          onChange={(e) => setFieldMapping(prev => ({
                            ...prev,
                            [header]: e.target.value
                          }))}
                          className="admin-input admin-input-sm"
                        >
                          <option value="">-- Skip this field --</option>
                          <optgroup label="Required Fields">
                            <option value="name">Product Name (required)</option>
                            <option value="price">Price (required)</option>
                          </optgroup>
                          <optgroup label="Basic Fields">
                            <option value="description">Description</option>
                            <option value="sku">SKU</option>
                            <option value="category_name">Category Name</option>
                            <option value="category_image">Category Image URL</option>
                            <option value="vendor_name">Vendor Name</option>
                            <option value="weight">Weight</option>
                            <option value="status">Status</option>
                          </optgroup>
                          <optgroup label="Variants">
                            <option value="variant_sizes">Variant Sizes (pipe-separated)</option>
                            <option value="variant_colors">Variant Colors (pipe-separated)</option>
                            <option value="variant_color_hex">Variant Color Hex Codes (pipe-separated)</option>
                            <option value="variant_skus">Variant SKUs (pipe-separated)</option>
                            <option value="variant_prices">Variant Prices (pipe-separated)</option>
                            <option value="variant_stock_quantities">Variant Stock Quantities (pipe-separated)</option>
                          </optgroup>
                          <optgroup label="Images">
                            <option value="image_urls">Image URLs (pipe-separated)</option>
                            <option value="featured_image">Featured Image URL</option>
                          </optgroup>
                          <optgroup label="SEO">
                            <option value="meta_title">Meta Title</option>
                            <option value="meta_description">Meta Description</option>
                            <option value="slug">URL Slug</option>
                          </optgroup>
                          <optgroup label="Additional">
                            <option value="tags">Tags (pipe-separated)</option>
                            <option value="stock_quantity">Stock Quantity</option>
                            <option value="low_stock_threshold">Low Stock Threshold</option>
                            <option value="cost_price">Cost Price</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep('upload')}
                  className="admin-btn admin-btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep('import')}
                  disabled={!Object.values(fieldMapping).some(value => value === 'name' || value === 'price')}
                  className="admin-btn admin-btn-primary"
                >
                  Continue to Import
                </button>
              </div>
            </div>
          )}

          {currentStep === 'import' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Import Settings</h4>
                <p className="text-sm text-gray-600 mb-6">
                  Configure your import settings before starting the process.
                </p>
              </div>

              {/* Import Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch Size
                  </label>
                  <select
                    value={importOptions.batchSize}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                    className="admin-input"
                  >
                    <option value={5}>5 products per batch (slower, safer)</option>
                    <option value={10}>10 products per batch (recommended)</option>
                    <option value={25}>25 products per batch (faster)</option>
                    <option value={50}>50 products per batch (fastest, higher risk)</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="admin-checkbox-group">
                    <input
                      type="checkbox"
                      checked={importOptions.skipDuplicates}
                      onChange={(e) => setImportOptions(prev => ({ ...prev, skipDuplicates: e.target.checked }))}
                      className="admin-checkbox"
                    />
                    <span className="admin-checkbox-label">Skip duplicate products (based on SKU)</span>
                  </label>

                  <label className="admin-checkbox-group">
                    <input
                      type="checkbox"
                      checked={importOptions.updateExisting}
                      onChange={(e) => setImportOptions(prev => ({ ...prev, updateExisting: e.target.checked }))}
                      className="admin-checkbox"
                    />
                    <span className="admin-checkbox-label">Update existing products</span>
                  </label>

                  <label className="admin-checkbox-group">
                    <input
                      type="checkbox"
                      checked={importOptions.validateOnly}
                      onChange={(e) => setImportOptions(prev => ({ ...prev, validateOnly: e.target.checked }))}
                      className="admin-checkbox"
                    />
                    <span className="admin-checkbox-label">Validate only (don't import)</span>
                  </label>
                </div>
              </div>

              {/* Progress */}
              {isImporting && (
                <div key={`progress-${importProgress}-${Date.now()}`} className="admin-card bg-blue-50 border-blue-200">
                  <div className="admin-card-content">
                    <div className="flex items-center mb-3">
                      <Loader2 className="h-5 w-5 text-blue-600 animate-spin mr-3" />
                      <span className="text-sm font-medium text-blue-900">
                        {importStatus || 'Processing...'}
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                        style={{ 
                          width: `${Math.max(1, Math.min(100, importProgress || 0))}%`,
                          minWidth: importProgress > 0 ? '8px' : '0px'
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-blue-700 mt-2 font-medium">
                      {Math.round(importProgress || 0)}% complete
                    </div>
                    {/* Debug info in development */}
                    {import.meta.env.DEV && (
                      <div className="text-xs text-gray-500 mt-1">
                        Debug: isImporting={String(isImporting)}, progress={importProgress}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep('mapping')}
                  disabled={isImporting}
                  className="admin-btn admin-btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={validateAndImportProducts}
                  disabled={isImporting}
                  className="admin-btn admin-btn-primary"
                >
                  {isImporting ? 'Processing...' : importOptions.validateOnly ? 'Validate Products' : 'Start Import'}
                </button>
              </div>
            </div>
          )}

          {currentStep === 'results' && importResult && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Import Results</h4>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="admin-card" style={{borderColor: '#10b981', backgroundColor: '#f0fdf4'}}>
                  <div className="admin-card-content">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="ml-2 text-sm font-medium text-green-900">
                        {importResult.success} products imported successfully
                      </span>
                    </div>
                  </div>
                </div>

                {importResult.failed > 0 && (
                  <div className="admin-card" style={{borderColor: '#ef4444', backgroundColor: '#fef2f2'}}>
                    <div className="admin-card-content">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <span className="ml-2 text-sm font-medium text-red-900">
                          {importResult.failed} products failed to import
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Errors */}
              {importResult.errors.length > 0 && (
                <div className="admin-card">
                  <div className="admin-card-header">
                    <h5 className="admin-card-title">Errors</h5>
                  </div>
                  <div className="admin-card-content" style={{maxHeight: '240px', overflowY: 'auto'}}>
                    <div className="space-y-2">
                      {importResult.errors.map((error, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium text-red-900">Row {error.row}:</span>
                          <span className="text-red-700 ml-1">
                            {error.field} ({error.value}) - {error.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {importResult.warnings.length > 0 && (
                <div className="admin-card">
                  <div className="admin-card-header">
                    <h5 className="admin-card-title">Warnings</h5>
                  </div>
                  <div className="admin-card-content" style={{maxHeight: '240px', overflowY: 'auto'}}>
                    <div className="space-y-2">
                      {importResult.warnings.map((warning, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium text-yellow-900">Row {warning.row}:</span>
                          <span className="text-yellow-700 ml-1">
                            {warning.field} ({warning.value}) - {warning.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => {
                    setCurrentStep('upload');
                    setImportFile(null);
                    setCsvPreview(null);
                    setFieldMapping({});
                    setImportResult(null);
                    setImportProgress(0);
                    setImportStatus('');
                  }}
                  className="admin-btn admin-btn-secondary"
                >
                  Import Another File
                </button>
                <button
                  onClick={() => {
                    onImportComplete();
                    onClose();
                  }}
                  className="admin-btn admin-btn-primary"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default ProductImportModal;
