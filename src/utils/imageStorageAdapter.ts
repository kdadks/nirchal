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
 * Falls back to old GitHub upload method in development
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

    // Try R2 upload first (production)
    try {
      const response = await fetch('/.netlify/functions/upload-image-r2', {
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

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          console.log(`[Image Storage] Successfully uploaded to R2: ${result.url}`);
          return {
            success: true,
            url: result.url
          };
        }
      }
    } catch (r2Error) {
      console.warn('[Image Storage] R2 upload failed, falling back to GitHub upload:', r2Error);
    }

    // Fallback to old GitHub upload method (for local development)
    console.log('[Image Storage] Using fallback GitHub upload...');
    const fallbackResponse = await fetch('/.netlify/functions/upload-image', {
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

    const fallbackResult = await fallbackResponse.json();
    
    if (!fallbackResponse.ok || !fallbackResult.success) {
      throw new Error(fallbackResult.error || 'Upload failed');
    }

    console.log(`[Image Storage] Successfully uploaded via fallback: ${fallbackResult.githubUrl || fallbackResult.publicUrl}`);
    
    return {
      success: true,
      url: fallbackResult.githubUrl || fallbackResult.publicUrl || fallbackResult.filePath
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
 * Falls back to old GitHub delete method in development
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
    
    console.log(`[Image Storage] Deleting ${fileName} from storage (${folder})...`);
    
    // Only delete if it's an R2 URL
    if (isR2Url(imageUrl)) {
      // Try R2 delete first (production)
      try {
        const response = await fetch('/.netlify/functions/delete-image-r2', {
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
      } catch (r2Error) {
        console.warn('[Image Storage] R2 delete failed, treating as success:', r2Error);
        return { success: true }; // Treat R2 delete errors as success in dev
      }
    } else if (isGitHubUrl(imageUrl)) {
      // Try GitHub delete fallback (for local development)
      try {
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

        if (response.ok) {
          console.log(`[Image Storage] Successfully deleted via fallback: ${fileName}`);
          return { success: true };
        }
      } catch (fallbackError) {
        console.warn('[Image Storage] Fallback delete failed, treating as success:', fallbackError);
      }
    }
    
    // If we get here, treat as success (file might not exist)
    console.log(`[Image Storage] Delete completed (or file not found): ${fileName}`);
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
