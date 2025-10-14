import { useState } from 'react';
import { supabase } from '../config/supabase';
import { deleteImageFromPublicFolder } from '../utils/imageStorageAdapter';

/**
 * Hook for handling product deletion with automatic image cleanup
 */
export const useProductDeletion = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Delete a product and all its associated images
   * @param productId - The ID of the product to delete
   * @returns Promise with success status and any errors
   */
  const deleteProductWithImages = async (productId: string): Promise<{
    success: boolean;
    error?: string;
    imageCleanupResults?: Array<{ fileName: string; success: boolean; error?: string }>;
  }> => {
    setIsDeleting(true);
    
    try {
      // First, get the product data to find associated images
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('images')
        .eq('id', productId)
        .single();

      if (productError) {
        throw new Error(`Failed to fetch product: ${productError.message}`);
      }

      if (!product) {
        throw new Error('Product not found');
      }

      const imageCleanupResults: Array<{ fileName: string; success: boolean; error?: string }> = [];

      // Delete associated images from GitHub repository
      if (product.images && Array.isArray(product.images)) {
        console.log(`[Product Deletion] Found ${product.images.length} images to delete`);
        
        for (const imageUrl of product.images) {
          try {
            // Extract filename from URL
            let fileName = '';
            
            if (typeof imageUrl === 'string') {
              // Handle different URL formats
              if (imageUrl.includes('githubusercontent.com')) {
                // GitHub raw URL: extract filename from path
                const urlParts = imageUrl.split('/');
                fileName = urlParts[urlParts.length - 1];
              } else if (imageUrl.startsWith('/images/products/')) {
                // Local URL: extract filename
                fileName = imageUrl.split('/').pop() || '';
              } else if (imageUrl.includes('blob.githubusercontent.com')) {
                // GitHub blob URL: extract filename
                const urlParts = imageUrl.split('/');
                fileName = urlParts[urlParts.length - 1];
              } else {
                // Try to extract filename from any URL
                const urlParts = imageUrl.split('/');
                fileName = urlParts[urlParts.length - 1];
              }

              if (fileName) {
                console.log(`[Product Deletion] Deleting image: ${fileName}`);
                
                const deleteResult = await deleteImageFromPublicFolder(fileName, 'products');
                
                imageCleanupResults.push({
                  fileName,
                  success: deleteResult.success,
                  error: deleteResult.error
                });

                if (!deleteResult.success) {
                  console.warn(`[Product Deletion] Failed to delete image ${fileName}: ${deleteResult.error}`);
                }
              } else {
                console.warn(`[Product Deletion] Could not extract filename from URL: ${imageUrl}`);
                imageCleanupResults.push({
                  fileName: imageUrl,
                  success: false,
                  error: 'Could not extract filename from URL'
                });
              }
            }
          } catch (imageError) {
            console.error(`[Product Deletion] Error deleting image ${imageUrl}:`, imageError);
            imageCleanupResults.push({
              fileName: String(imageUrl),
              success: false,
              error: imageError instanceof Error ? imageError.message : 'Unknown error'
            });
          }
        }
      }

      // Delete the product from database
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (deleteError) {
        throw new Error(`Failed to delete product: ${deleteError.message}`);
      }

      console.log(`[Product Deletion] Successfully deleted product ${productId}`);

      const successfulImageDeletions = imageCleanupResults.filter(r => r.success).length;
      const failedImageDeletions = imageCleanupResults.length - successfulImageDeletions;

      if (failedImageDeletions > 0) {
        console.warn(`[Product Deletion] ${failedImageDeletions} image(s) could not be deleted`);
      }

      return {
        success: true,
        imageCleanupResults
      };

    } catch (error) {
      console.error('[Product Deletion] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        imageCleanupResults: []
      };
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Delete multiple products and their images
   * @param productIds - Array of product IDs to delete
   */
  const deleteMultipleProductsWithImages = async (productIds: string[]): Promise<{
    success: boolean;
    successCount: number;
    failCount: number;
    results: Array<{ productId: string; success: boolean; error?: string }>;
  }> => {
    setIsDeleting(true);
    
    const results: Array<{ productId: string; success: boolean; error?: string }> = [];
    
    try {
      for (const productId of productIds) {
        const deleteResult = await deleteProductWithImages(productId);
        results.push({
          productId,
          success: deleteResult.success,
          error: deleteResult.error
        });
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      return {
        success: failCount === 0,
        successCount,
        failCount,
        results
      };

    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteProductWithImages,
    deleteMultipleProductsWithImages,
    isDeleting
  };
};
