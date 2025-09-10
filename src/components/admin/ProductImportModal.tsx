import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { saveImageToPublicFolder, generateProductImageFileName, generateCategoryImageFileName } from '../../utils/localStorageUtils';

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

// Helper function to extract option value based on type (color or size)
const getOptionValue = (row: any, type: 'color' | 'size', globalOption1Name = '', globalOption2Name = ''): string | null => {
  const option1Name = (row['Option1 Name'] || globalOption1Name || '').toLowerCase().trim();
  const option2Name = (row['Option2 Name'] || globalOption2Name || '').toLowerCase().trim();
  const option1Value = (row['Option1 Value'] || '').trim();
  const option2Value = (row['Option2 Value'] || '').trim();
  
  if (type === 'color') {
    if (option1Name.includes('color') || option1Name.includes('colour')) {
      return option1Value || null;
    }
    if (option2Name.includes('color') || option2Name.includes('colour')) {
      return option2Value || null;
    }
  } else if (type === 'size') {
    if (option1Name.includes('size')) {
      return option1Value ? option1Value.toUpperCase() : null;
    }
    if (option2Name.includes('size')) {
      return option2Value ? option2Value.toUpperCase() : null;
    }
  }
  
  return null;
};

// Product import function that uses auth context
const useProductImport = () => {
  const { supabase, user } = useAuth();
  const [importing, setImporting] = useState(false);

  // Function to download image from URL and upload to local storage using server-side proxy
  const downloadAndUploadImage = async (imageUrl: string, productName: string, imageIndex: number): Promise<string | null> => {
    try {
      console.log(`🔄 Downloading image from: ${imageUrl}`);
      
      let imageBlob: Blob;

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
        } catch (directError) {
          console.error('❌ Both server and direct download failed:', { 
            imageUrl,
            serverError: serverError instanceof Error ? serverError.message : String(serverError), 
            directError: directError instanceof Error ? directError.message : String(directError)
          });
          return null;
        }
      }
      
      // Generate a unique filename for local storage
      const fileName = generateProductImageFileName(productName, imageUrl, imageIndex);

      // Save to local public folder using the upload function
      const uploadResult = await saveImageToPublicFolder(imageBlob, fileName, 'products');

      if (!uploadResult.success) {
        console.error('❌ Failed to save image to local storage:', {
          fileName,
          imageUrl,
          error: uploadResult.error
        });
        return null;
      }

      console.log('✅ Successfully saved image to local storage:', uploadResult.filePath);
      return uploadResult.filePath || null;
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
        } catch (directError) {
          console.error('❌ Both server and direct download failed for category image:', { serverError, directError });
          return null;
        }
      }
      
      // Generate a unique filename for local storage
      const fileName = generateCategoryImageFileName(categoryName, imageUrl);

      // Save to local public folder
      const uploadResult = await saveImageToPublicFolder(imageBlob, fileName, 'categories');

      if (!uploadResult.success) {
        console.error('❌ Failed to save category image to local storage:', {
          fileName,
          imageUrl,
          error: uploadResult.error
        });
        return null;
      }

      console.log('✅ Successfully saved category image to local storage:', uploadResult.filePath);
      return fileName; // Return just the filename, not the full path
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
      
      const { data: categoriesData, error: categoriesError } = await supabase.from('categories').select('id, name');
      const { data: vendorsData, error: vendorsError } = await supabase.from('vendors').select('id, name');

      if (categoriesError) throw categoriesError;
      if (vendorsError) throw vendorsError;

      const categoriesMap = new Map(
        categoriesData?.map((cat: any) => [cat.name.toLowerCase(), cat.id]) || []
      );
      const vendorsMap = new Map(
        vendorsData?.map((vendor: any) => [vendor.name.toLowerCase(), vendor.id]) || []
      );

      console.log('Existing categories in database:', {
        total: categoriesData?.length || 0,
        categories: categoriesData?.map((cat: any) => ({ name: cat.name, id: cat.id })) || [],
        hasUncategorized: categoriesMap.has('uncategorized')
      });

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
      
      // Check if uncategorized already exists in our categories map
      if (categoriesMap.has(defaultCategoryName)) {
        defaultCategoryId = categoriesMap.get(defaultCategoryName)!;
        console.log('Using existing uncategorized category:', defaultCategoryId);
      } else {
        // Check if uncategorized exists in database but wasn't loaded
        const { data: existingCategory, error: checkError } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', 'uncategorized')
          .single();
          
        if (existingCategory) {
          // Use existing uncategorized category
          defaultCategoryId = existingCategory.id;
          categoriesMap.set(defaultCategoryName, defaultCategoryId);
          console.log('Found existing uncategorized category in database:', defaultCategoryId);
        } else if (checkError?.code === 'PGRST116') {
          // Category doesn't exist, create it
          console.log('Creating new uncategorized category...');
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
          console.log('Created new uncategorized category:', defaultCategoryId);
        } else {
          console.error('Error checking for uncategorized category:', checkError);
          throw new Error('Failed to check for default category');
        }
      }

      // Process products in batches
      const productArray = Array.from(productGroups.values());
      const totalBatches = Math.ceil(productArray.length / batchSize);

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const batch = productArray.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize);
        const batchBaseProgress = 25 + ((batchIndex / totalBatches) * 65);
        
        console.log(`[Progress] Starting batch ${batchIndex + 1}/${totalBatches}, Base Progress: ${Math.round(batchBaseProgress)}%`);
        onProgress?.(Math.round(batchBaseProgress), `Processing batch ${batchIndex + 1} of ${totalBatches}...`);

        for (let productIndex = 0; productIndex < batch.length; productIndex++) {
          const variantRows = batch[productIndex];
          
          // Update progress within the batch
          const productProgress = batchBaseProgress + ((productIndex / batch.length) * (65 / totalBatches));
          const progressMessage = `Processing product ${productIndex + 1}/${batch.length} in batch ${batchIndex + 1}/${totalBatches}`;
          
          console.log(`[Progress] ${progressMessage}, Progress: ${Math.round(productProgress)}%`);
          onProgress?.(Math.round(productProgress), progressMessage);
          
          try {
            // Find the main product data from the row with the most complete information
            // In Shopify CSV exports, usually the first row has full product details
            // while subsequent rows only have variant-specific data
            const mainRow = variantRows.find(row => 
              row.Title && row.Title.trim() !== ''
            ) || variantRows[0]; // Fallback to first row if no row has Title
            
            console.log('Selected main row for product:', {
              handle: mainRow.Handle,
              hasTitle: !!mainRow.Title,
              hasBody: !!(mainRow['Body (HTML)'] || mainRow.description),
              hasVendor: !!mainRow.Vendor,
              totalVariantRows: variantRows.length,
              variantRowsWithTitle: variantRows.filter(row => row.Title && row.Title.trim() !== '').length
            });
            
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
            
            // For products with variants, use the base price from "Cost per Item"
            // For products without variants, use the variant price (which is the product price)
            let basePrice = 0;
            let salePrice = null;
            
            // Try to get base price from "Cost per Item" first, then fallbacks
            const costPerItem = parseFloat(mainRow['Cost per Item'] || mainRow.price || '0');
            
            if (hasVariantData) {
              // Use "Cost per Item" as base price for multi-variant products
              basePrice = costPerItem > 0 ? costPerItem : 0;
              
              // If no "Cost per Item", fall back to minimum variant price
              if (basePrice === 0) {
                const variantPrices = variantRows
                  .map(row => parseFloat(row['Variant Price'] || row.price_adjustment || '0'))
                  .filter(price => price > 0);
                basePrice = variantPrices.length > 0 ? Math.min(...variantPrices) : 0;
              }
              
              // Check for sale prices
              const salePrices = variantRows
                .map(row => parseFloat(row['Variant Compare At Price'] || row.sale_price || '0'))
                .filter(price => price > 0);
              if (salePrices.length > 0) {
                salePrice = Math.min(...salePrices);
              }
            } else {
              // Single variant product - use "Cost per Item" or price field
              basePrice = costPerItem > 0 ? costPerItem : parseFloat(mainRow['Variant Price'] || mainRow.price_adjustment || '0');
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
              
              // Check if we have valid Option1/Option2 Names and Values for variant processing
              // In Shopify CSV, Option Names are usually only in the first row, but Values are in all rows
              let globalOption1Name = '';
              let globalOption2Name = '';
              
              // Find Option Names from any row that has them (usually the first row)
              for (const row of variantRows) {
                if ((row['Option1 Name'] || '').trim()) {
                  globalOption1Name = (row['Option1 Name'] || '').trim();
                }
                if ((row['Option2 Name'] || '').trim()) {
                  globalOption2Name = (row['Option2 Name'] || '').trim();
                }
                if (globalOption1Name && globalOption2Name) {
                  break; // Found both, no need to check more rows
                }
              }
              
              // Check if we have valid Option Values (even if Names are missing in some rows)
              const hasValidOptionData = variantRows.some(row => {
                const option1Value = (row['Option1 Value'] || '').trim();
                const option2Value = (row['Option2 Value'] || '').trim();
                
                return option1Value || option2Value;
              });

              console.log('Checking for Option-based variants:', {
                productName: mainRow.Title || mainRow.name,
                hasValidOptionData,
                totalRows: variantRows.length,
                globalOption1Name,
                globalOption2Name,
                sampleRows: variantRows.slice(0, 3).map((row, idx) => ({
                  rowIndex: idx,
                  option1Name: row['Option1 Name'],
                  option1Value: row['Option1 Value'],
                  option2Name: row['Option2 Name'],
                  option2Value: row['Option2 Value']
                }))
              });
              
              if (hasValidOptionData) {
                // Process variants based on Option1/Option2 Names and Values
                console.log('Processing variants from Option1/Option2 Names and Values');
                
                // Directly process each row as a variant (Shopify CSV approach)
                // Each row represents a specific variant combination
                for (const variantRow of variantRows) {
                  const color = getOptionValue(variantRow, 'color', globalOption1Name, globalOption2Name);
                  const size = getOptionValue(variantRow, 'size', globalOption1Name, globalOption2Name);
                  
                  console.log(`Processing variant row:`, {
                    rowData: {
                      option1Name: variantRow['Option1 Name'] || globalOption1Name,
                      option1Value: variantRow['Option1 Value'],
                      option2Name: variantRow['Option2 Name'] || globalOption2Name,
                      option2Value: variantRow['Option2 Value']
                    },
                    extractedValues: { color, size }
                  });
                  
                  // Skip rows without any valid options
                  if (!color && !size) {
                    console.log('Skipping row: no color or size found');
                    continue;
                  }
                  
                  // Create a unique key for this variant combination
                  const variantKey = `${color || 'nocolor'}-${size || 'nosize'}`;
                  
                  // Only create if this combination doesn't already exist
                  if (!uniqueVariants.has(variantKey)) {
                    const rawVariantPrice = parseFloat(variantRow['Variant Price'] || variantRow.price_adjustment || '0');
                    
                    const variantData = {
                      product_id: productId,
                      size: size,
                      color: color,
                      color_hex: variantRow.color_hex || '',
                      sku: variantRow['Variant SKU'] || variantRow.sku || `${productData.sku}-${variantKey}`.replace(/[^a-zA-Z0-9-]/g, ''),
                      price_adjustment: rawVariantPrice,
                    };
                    
                    uniqueVariants.set(variantKey, {
                      ...variantData,
                      quantity: parseInt(variantRow['Variant Inventory Qty'] || variantRow.stock_quantity || '0'),
                      low_stock_threshold: parseInt(variantRow.low_stock_threshold || '2')
                    });
                    
                    console.log(`Created variant: ${variantKey}`, {
                      color,
                      size,
                      sku: variantData.sku,
                      price_adjustment: rawVariantPrice
                    });
                  } else {
                    console.log(`Skipping duplicate variant: ${variantKey}`);
                  }
                }
                
                console.log(`Total unique variants created: ${uniqueVariants.size} from ${variantRows.length} rows`);
              } else {
                // No valid Option data found - this is a product without variants
                console.log('No valid Option1/Option2 Names and Values found - treating as single product without variants');
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
                
                console.log(`Processing ${uniqueImages.size} images for product: ${productData.name}`);
                
                for (const [originalUrl, imageInfo] of uniqueImages) {
                  try {
                    // Update progress for image processing
                    const imageProgress = productProgress + ((processedImages / uniqueImages.size) * 2); // Small boost for image progress
                    onProgress?.(Math.round(imageProgress), `Downloading image ${processedImages + 1}/${uniqueImages.size} for ${productData.name}`);
                    
                    // Download and upload image to local storage
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
                      console.log(`✅ Successfully processed image ${processedImages}/${uniqueImages.size}: ${uploadedFileName}`);
                    } else {
                      // Failed to download/upload, add warning with more detail
                      console.warn(`⚠️ Image download failed for ${originalUrl} - Product: ${productData.name}`);
                      result.warnings.push({
                        row: variantRows[0]._index || 0,
                        field: 'image',
                        value: originalUrl,
                        message: `Failed to download/upload image: ${originalUrl} (Check console for detailed error)`
                      });
                      processedImages++;
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
                  } else {
                    // Assign swatch images to color variants
                    if (createdVariants.length > 0 && imageInserts.length > 0) {
                      console.log('Assigning swatch images to variants...');
                      
                      // Get the inserted images with their IDs
                      const { data: insertedImages, error: fetchError } = await supabase
                        .from('product_images')
                        .select('id, image_url, is_primary, display_order')
                        .eq('product_id', productId)
                        .order('display_order');
                      
                      if (!fetchError && insertedImages && insertedImages.length > 0) {
                        // Find primary image or first image as default swatch
                        const primaryImage = insertedImages.find(img => img.is_primary) || insertedImages[0];
                        
                        // Update variants with swatch image references
                        const variantUpdates = [];
                        for (const variant of createdVariants) {
                          if (variant.color) {
                            // For color variants, assign the primary image as swatch
                            variantUpdates.push({
                              id: variant.id,
                              swatch_image_id: primaryImage.id
                            });
                          }
                        }
                        
                        if (variantUpdates.length > 0) {
                          console.log(`Updating ${variantUpdates.length} variants with swatch images`);
                          
                          for (const update of variantUpdates) {
                            const { error: swatchError } = await supabase
                              .from('product_variants')
                              .update({ swatch_image_id: update.swatch_image_id })
                              .eq('id', update.id);
                              
                            if (swatchError) {
                              console.warn('Failed to assign swatch image to variant:', swatchError);
                            }
                          }
                        }
                      }
                    }
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
            console.log(`✅ Successfully processed product: ${productData.name}`);
            
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
        
        // Update progress at end of batch
        const endBatchProgress = 25 + (((batchIndex + 1) / totalBatches) * 65);
        console.log(`[Progress] Completed batch ${batchIndex + 1}/${totalBatches}, Progress: ${Math.round(endBatchProgress)}%`);
        onProgress?.(Math.round(endBatchProgress), `Completed batch ${batchIndex + 1} of ${totalBatches}`);
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

type ImportStep = 'upload' | 'import' | 'results';

interface CSVPreview {
  headers: string[];
  rows: string[][];
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

  // Progress handler with useCallback for better performance
  const handleProgress = React.useCallback((progress: number, status: string) => {
    console.log(`[Import Progress] ${progress}% - ${status}`);
    setImportProgress(Math.round(progress));
    setImportStatus(status);
  }, []);

  // Force progress bar to show for debugging
  React.useEffect(() => {
    if (isImporting) {
      console.log('[Progress Bar] Import started, isImporting=true');
    }
  }, [isImporting]);

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
        
        setCurrentStep('import');
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

  const validateAndImportProducts = async () => {
    if (!importFile || !csvPreview) {
      toast.error('No file selected');
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
            
            if (Object.keys(row).length > 1) { // Skip empty rows
              csvData.push(row);
            }
          }

          console.log('Parsed CSV data:', {
            totalRows: csvData.length,
            firstRow: csvData[0]
          });

          const options: ImportOptions = {
            ...importOptions,
            onProgress: handleProgress
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
              {(['upload', 'import', 'results'] as ImportStep[]).map((step, index) => {
                const currentStepIndex = (['upload', 'import', 'results'] as ImportStep[]).indexOf(currentStep);
                const isCurrentStep = currentStep === step;
                const isPreviousStep = index < currentStepIndex;
                
                return (
                  <div key={step} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      isCurrentStep 
                        ? 'bg-blue-600 text-white' 
                        : isPreviousStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      isCurrentStep ? 'text-blue-600' : isPreviousStep ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                    </span>
                    {index < 2 && (
                      <div className="ml-4 w-8 h-0.5 bg-gray-300"></div>
                    )}
                  </div>
                );
              })}
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

              {/* Progress - Force show with better debugging */}
              {(isImporting || importProgress > 0) && (
                <div key={`progress-${importProgress}-${Date.now()}`} className="admin-card bg-blue-50 border-blue-200 border-2">
                  <div className="admin-card-content">
                    <div className="flex items-center mb-3">
                      <Loader2 className="h-5 w-5 text-blue-600 animate-spin mr-3" />
                      <span className="text-sm font-medium text-blue-900">
                        {importStatus || 'Processing...'}
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-4 overflow-hidden shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-blue-500 h-4 rounded-full transition-all duration-300 ease-out shadow-sm"
                        style={{ 
                          width: `${Math.max(5, Math.min(100, importProgress || 0))}%`,
                          minWidth: '20px'
                        }}
                      ></div>
                    </div>
                    <div className="text-sm text-blue-700 mt-2 font-medium">
                      {Math.round(importProgress || 0)}% complete
                    </div>
                    {/* Always show debug info to help troubleshoot */}
                    <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-100 rounded">
                      Debug: isImporting={String(isImporting)}, progress={importProgress}, status="{importStatus}"
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep('upload')}
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
                  {isImporting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isImporting ? 'Processing...' : importOptions.validateOnly ? 'Validate Products' : 'Start Import'}
                </button>
              </div>
            </div>
          )}

          {currentStep === 'results' && importResult && (
            <div className="space-y-6">
              <div className="text-center">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Import Complete!</h4>
                <p className="text-sm text-gray-600">Here's a summary of your import operation</p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="admin-card border-2 border-green-200 bg-green-50">
                  <div className="admin-card-content text-center py-6">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-green-900 mb-1">
                      {importResult.success || 0}
                    </div>
                    <div className="text-sm font-medium text-green-700">
                      Products Imported
                    </div>
                  </div>
                </div>

                {(importResult.failed || 0) > 0 && (
                  <div className="admin-card border-2 border-red-200 bg-red-50">
                    <div className="admin-card-content text-center py-6">
                      <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-red-900 mb-1">
                        {importResult.failed || 0}
                      </div>
                      <div className="text-sm font-medium text-red-700">
                        Failed Imports
                      </div>
                    </div>
                  </div>
                )}

                <div className="admin-card border-2 border-blue-200 bg-blue-50">
                  <div className="admin-card-content text-center py-6">
                    <div className="h-8 w-8 mx-auto mb-3 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {(() => {
                          const success = importResult.success || 0;
                          const failed = importResult.failed || 0;
                          const total = success + failed;
                          const percentage = total > 0 ? Math.round((success / total) * 100) : 0;
                          return `${percentage}%`;
                        })()}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900 mb-1">
                      {(importResult.success || 0) + (importResult.failed || 0)}
                    </div>
                    <div className="text-sm font-medium text-blue-700">
                      Total Processed
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
              {((importResult.errors?.length || 0) > 0 || (importResult.warnings?.length || 0) > 0) && (
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-900">Detailed Results</h5>
                  
                  {/* Errors */}
                  {(importResult.errors?.length || 0) > 0 && (
                    <div className="admin-card border-l-4 border-red-500">
                      <div className="admin-card-header bg-red-50">
                        <h6 className="admin-card-title text-red-900 flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          Errors ({importResult.errors?.length || 0})
                        </h6>
                      </div>
                      <div className="admin-card-content max-h-48 overflow-y-auto">
                        <div className="space-y-3">
                          {(importResult.errors || []).map((error, index) => (
                            <div key={index} className="border-l-2 border-red-300 pl-3 py-2 bg-red-50 rounded-r">
                              <div className="text-sm">
                                <span className="font-semibold text-red-900">Row {error.row}:</span>
                                <div className="text-red-700 mt-1">
                                  <span className="font-medium">{error.field}</span> 
                                  {error.value && (
                                    <span className="text-red-600"> (value: "{error.value}")</span>
                                  )}
                                </div>
                                <div className="text-red-800 text-xs mt-1 italic">
                                  {error.message}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {(importResult.warnings?.length || 0) > 0 && (
                    <div className="admin-card border-l-4 border-yellow-500">
                      <div className="admin-card-header bg-yellow-50">
                        <h6 className="admin-card-title text-yellow-900 flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          Warnings ({importResult.warnings?.length || 0})
                        </h6>
                      </div>
                      <div className="admin-card-content max-h-48 overflow-y-auto">
                        <div className="space-y-3">
                          {(importResult.warnings || []).map((warning, index) => (
                            <div key={index} className="border-l-2 border-yellow-300 pl-3 py-2 bg-yellow-50 rounded-r">
                              <div className="text-sm">
                                <span className="font-semibold text-yellow-900">Row {warning.row}:</span>
                                <div className="text-yellow-700 mt-1">
                                  <span className="font-medium">{warning.field}</span>
                                  {warning.value && (
                                    <span className="text-yellow-600"> (value: "{warning.value}")</span>
                                  )}
                                </div>
                                <div className="text-yellow-800 text-xs mt-1 italic">
                                  {warning.message}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Success Message for Clean Import */}
              {(importResult.errors?.length || 0) === 0 && (importResult.warnings?.length || 0) === 0 && (importResult.success || 0) > 0 && (
                <div className="admin-card border-2 border-green-200 bg-green-50">
                  <div className="admin-card-content text-center py-6">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h5 className="text-lg font-semibold text-green-900 mb-2">
                      Perfect Import!
                    </h5>
                    <p className="text-green-700">
                      All {importResult.success || 0} products were imported successfully without any errors or warnings.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6 border-t">
                <button
                  onClick={() => {
                    setCurrentStep('upload');
                    setImportFile(null);
                    setCsvPreview(null);
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
