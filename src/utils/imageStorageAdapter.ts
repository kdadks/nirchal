/**
 * Image Storage Adapter
 * 
 * Unified interface for image CRUD operations that uses R2 storage
 * This replaces the old localStorageUtils GitHub-based storage
 */

import {
  getR2ImageUrl,
  extractImageFileName,
  isR2Url,
  isGitHubUrl
} from './r2StorageUtils';

/**
 * Upload an image to R2 storage via server-side function
 * @param blob - The file blob to upload
 * @param fileName - The target filename
 * @param folder - 'products' or 'categories'
 * @returns Promise with success status and R2 URL
 */
export const uploadImage = async (
  blob: Blob,
  fileName: string,
  folder: 'products' | 'categories'
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    console.log(`[Image Storage] Uploading ${fileName} to R2 via server function (${folder})...`);
    
    // Convert blob to base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Upload to R2 via Cloudflare Function
    const response = await fetch('/upload-image-r2', {
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

    if (!response.ok) {
      // If function doesn't exist (local dev), show helpful message
      if (response.status === 404) {
        throw new Error(
          'Upload function not available in local dev. ' +
          'Test uploads on deployed environment: https://nirchal.pages.dev/ ' +
          'Or use: wrangler pages dev dist --r2 PRODUCT_IMAGES=product-images'
        );
      }
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    console.log(`[Image Storage] Successfully uploaded to R2: ${result.url}`);
    
    return {
      success: true,
      url: result.url
    };
  } catch (error) {
    console.error('[Image Storage] Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error'
    };
  }
};

/**
 * Delete an image from R2 storage via server-side function
 * @param imageUrl - The full image URL or just the filename
 * @param folder - 'products' or 'categories'
 * @returns Promise with success status
 */
export const deleteImage = async (
  imageUrl: string,
  folder: 'products' | 'categories'
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Extract filename from URL
    const fileName = extractImageFileName(imageUrl);
    
    if (!fileName) {
      console.warn(`[Image Storage] Could not extract filename from: ${imageUrl}`);
      return { success: true }; // Treat as success if no valid filename
    }
    
    // Skip deletion for non-R2 URLs (legacy GitHub images - already migrated, don't exist anymore)
    if (!isR2Url(imageUrl)) {
      console.log(`[Image Storage] Skipping delete for non-R2 URL: ${imageUrl}`);
      return { success: true };
    }
    
    console.log(`[Image Storage] Deleting ${fileName} from R2 (${folder})...`);
    
    // Delete from R2 via Cloudflare Function
    try {
      const response = await fetch('/delete-image-r2', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName,
          folder
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log(`[Image Storage] Successfully deleted from R2: ${fileName}`);
          return { success: true };
        }
      }
      
      // If function doesn't exist (local dev), treat as success
      if (response.status === 404) {
        console.warn('[Image Storage] Delete function not available (local dev), treating as success');
        return { success: true };
      }
    } catch (error) {
      console.warn('[Image Storage] Delete error, treating as success:', error);
      return { success: true }; // Don't fail deletions - file might not exist
    }
    
    return { success: true };
  } catch (error) {
    console.error('[Image Storage] Delete error:', error);
    // Don't fail on delete errors - treat as success
    return { success: true };
  }
};

/**
 * Get the public URL for an image
 * @param fileName - The filename
 * @param folder - 'products' or 'categories'
 * @returns The public R2 URL
 */
export const getImageUrl = (fileName: string, folder: 'products' | 'categories'): string => {
  if (!fileName) return '';
  
  // If it's already a full URL (R2 or GitHub), return as is
  if (isR2Url(fileName) || isGitHubUrl(fileName)) {
    return fileName;
  }
  
  // Generate R2 URL for the filename
  return getR2ImageUrl(fileName, folder);
};

/**
 * Generate a unique filename for a product image
 * @param productName - Name of the product
 * @param originalFileName - Original filename
 * @param imageIndex - Optional index for multiple images
 * @returns Unique filename
 */
export const generateProductImageFileName = (
  productName: string,
  originalFileName: string,
  imageIndex?: number
): string => {
  const timestamp = Date.now();
  
  // Clean the filename
  const cleanFileName = originalFileName.split('?')[0];
  const filenameParts = cleanFileName.split('/');
  const actualFilename = filenameParts[filenameParts.length - 1];
  
  const extension = actualFilename.split('.').pop() || 'jpg';
  const sanitizedProductName = productName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const index = imageIndex !== undefined ? `-${imageIndex}` : '';
  
  return `${sanitizedProductName}-${timestamp}${index}.${extension}`;
};

/**
 * Generate a unique filename for a category image
 * @param categoryName - Name of the category
 * @param originalFileName - Original filename
 * @returns Unique filename
 */
export const generateCategoryImageFileName = (
  categoryName: string,
  originalFileName: string
): string => {
  const timestamp = Date.now();
  
  // Clean the filename
  const cleanFileName = originalFileName.split('?')[0];
  const filenameParts = cleanFileName.split('/');
  const actualFilename = filenameParts[filenameParts.length - 1];
  
  const extension = actualFilename.split('.').pop() || 'jpg';
  const sanitizedCategoryName = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  return `${sanitizedCategoryName}-${timestamp}.${extension}`;
};

/**
 * Extract filename from a URL or path
 * @param url - Full URL or filename
 * @returns Just the filename
 */
export const extractFileName = (url: string): string | null => {
  return extractImageFileName(url);
};

/**
 * Backward compatibility exports
 * These maintain the same API as localStorageUtils for existing code
 */
export const saveImageToPublicFolder = uploadImage;
export const deleteImageFromPublicFolder = deleteImage;
export const getProductImageUrl = (fileName: string) => getImageUrl(fileName, 'products');
export const getCategoryImageUrl = (fileName: string) => getImageUrl(fileName, 'categories');
