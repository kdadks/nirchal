/**
 * Utility functions for handling local file storage (public folder)
 */

/**
 * Generate a unique filename for a product image
 * @param productName - Name of the product
 * @param originalFileName - Original filename of the uploaded image
 * @param imageIndex - Index of the image (for multiple images per product)
 * @returns Unique filename for the product image
 */
export const generateProductImageFileName = (
  productName: string, 
  originalFileName: string, 
  imageIndex?: number
): string => {
  const timestamp = Date.now();
  const extension = originalFileName.split('.').pop() || 'jpg';
  const sanitizedProductName = productName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const index = imageIndex !== undefined ? `-${imageIndex}` : '';
  
  return `${sanitizedProductName}-${timestamp}${index}.${extension}`;
};

/**
 * Generate a unique filename for a category image
 * @param categoryName - Name of the category
 * @param originalFileName - Original filename of the uploaded image
 * @returns Unique filename for the category image
 */
export const generateCategoryImageFileName = (
  categoryName: string, 
  originalFileName: string
): string => {
  const timestamp = Date.now();
  const extension = originalFileName.split('.').pop() || 'jpg';
  const sanitizedCategoryName = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  return `${sanitizedCategoryName}-${timestamp}.${extension}`;
};

/**
 * Generate a public URL for a product image stored in the local public folder
 * @param fileName - The filename of the image
 * @returns Full URL to access the image from the public folder
 */
export const getProductImageUrl = (fileName: string): string => {
  if (!fileName) return '';
  
  // If already a full URL, return as is
  if (fileName.startsWith('http') || fileName.startsWith('/')) {
    return fileName;
  }
  
  // Return the public path for the image
  return `/images/products/${fileName}`;
};

/**
 * Generate a public URL for a category image stored in the local public folder
 * @param fileName - The filename of the image
 * @returns Full URL to access the image from the public folder
 */
export const getCategoryImageUrl = (fileName: string): string => {
  if (!fileName) return '';
  
  // If already a full URL, return as is
  if (fileName.startsWith('http') || fileName.startsWith('/')) {
    return fileName;
  }
  
  // Return the public path for the image
  return `/images/categories/${fileName}`;
};

/**
 * Extract filename from any image URL or path
 * @param imageUrl - Full URL, relative path, or filename
 * @returns Just the filename part
 */
export const extractFileName = (imageUrl: string): string | null => {
  if (!imageUrl) return null;
  
  // If it's already just a filename (no path separators), return as is
  if (!imageUrl.includes('/') && !imageUrl.includes('\\')) {
    return imageUrl;
  }
  
  // Extract filename from any URL or path
  const urlParts = imageUrl.split(/[/\\]/);
  const filename = urlParts[urlParts.length - 1];
  
  // Additional validation - make sure it looks like a valid filename
  if (filename && filename.includes('.')) {
    return filename;
  }
  
  return null;
};

/**
 * Save a file blob to the local public folder structure
 * This is used primarily during import operations
 * @param blob - The file blob to save
 * @param fileName - The target filename
 * @param folder - 'products' or 'categories'
 * @returns Promise with success status and file path
 */
export const saveImageToPublicFolder = async (
  blob: Blob, 
  fileName: string, 
  folder: 'products' | 'categories'
): Promise<{ success: boolean; filePath?: string; error?: string }> => {
  try {
    // Convert blob to base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Make request to upload endpoint
    const response = await fetch('/.netlify/functions/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        folder,
        imageData: base64Data,
        contentType: blob.type
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    console.log(`[Local Storage] Successfully saved: ${result.publicUrl}`);
    
    return {
      success: true,
      filePath: result.publicUrl
    };
    
  } catch (error) {
    console.error('[Local Storage] Error saving image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Delete an image file from the local public folder
 * @param fileName - The filename to delete
 * @param folder - 'products' or 'categories'
 * @returns Promise with success status
 */
export const deleteImageFromPublicFolder = async (
  fileName: string, 
  folder: 'products' | 'categories'
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Make request to delete endpoint
    const response = await fetch('/.netlify/functions/delete-image', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        folder
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Delete failed');
    }

    console.log(`[Local Storage] Successfully deleted: ${result.deletedFile}`);
    
    return { success: true };
    
  } catch (error) {
    console.error('[Local Storage] Error deleting image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Convert a Supabase storage URL to a local public folder URL
 * Used for migration from Supabase storage to local storage
 * @param supabaseUrl - The Supabase storage URL
 * @returns Local public folder URL
 */
export const convertSupabaseUrlToLocal = (supabaseUrl: string): string => {
  if (!supabaseUrl) return '';
  
  // If it's already a local URL, return as is
  if (supabaseUrl.startsWith('/images/')) {
    return supabaseUrl;
  }
  
  // Extract filename from Supabase URL
  const fileName = extractFileName(supabaseUrl);
  if (!fileName) return '';
  
  // Determine if it's a product or category image based on the URL
  if (supabaseUrl.includes('product-images') || supabaseUrl.includes('/products/')) {
    return getProductImageUrl(fileName);
  } else if (supabaseUrl.includes('category-images') || supabaseUrl.includes('/categories/')) {
    return getCategoryImageUrl(fileName);
  }
  
  // Default to product images
  return getProductImageUrl(fileName);
};

/**
 * Generate multiple possible local image URLs for a product based on naming patterns
 * @param productId - The product ID
 * @param productName - The product name (optional)
 * @returns Array of possible image URLs to try
 */
export const getProductImageUrls = (productId: number, productName?: string): string[] => {
  const patterns = [];
  
  if (productName) {
    const sanitizedName = productName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    patterns.push(
      `${sanitizedName}.jpg`,
      `${sanitizedName}.jpeg`,
      `${sanitizedName}.png`,
      `${sanitizedName}.webp`,
      `product-${sanitizedName}.jpg`,
      `${sanitizedName}-1.jpg`
    );
  }
  
  patterns.push(
    `product-${productId}.jpg`,
    `product-${productId}.jpeg`,
    `product-${productId}.png`,
    `product-${productId}.webp`,
    `${productId}.jpg`
  );
  
  return patterns.map(pattern => getProductImageUrl(pattern));
};

/**
 * Generate multiple possible local image URLs for a category based on naming patterns
 * @param categorySlug - The category slug
 * @returns Array of possible image URLs to try
 */
export const getCategoryImageUrls = (categorySlug: string): string[] => {
  if (!categorySlug) return [];
  
  const patterns = [
    `${categorySlug}.jpg`,
    `${categorySlug}.jpeg`,
    `${categorySlug}.png`,
    `${categorySlug}.webp`,
    `category-${categorySlug}.jpg`,
    `${categorySlug}-image.jpg`
  ];
  
  return patterns.map(pattern => getCategoryImageUrl(pattern));
};
