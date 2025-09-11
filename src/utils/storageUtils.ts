/**
 * Utility functions for handling image storage URLs
 * This file now redirects to localStorageUtils for local file storage
 */

import { 
  getProductImageUrl, 
  getCategoryImageUrl as getLocalCategoryImageUrl, 
  extractFileName as extractLocalFileName,
  convertSupabaseUrlToLocal 
} from './localStorageUtils';

/**
 * Extract filename from a storage URL or return the path if it's already a filename
 * @param imageUrl - Full URL or filename
 * @returns Just the filename part for storage operations
 */
export const extractStorageFileName = (imageUrl: string): string | null => {
  return extractLocalFileName(imageUrl);
};

/**
 * Generate a public URL for an image stored in the category folder
 * @param imagePath - The path/filename of the image
 * @returns Full public URL to access the image
 */
export const getCategoryImageUrl = (imagePath: string): string => {
  return getLocalCategoryImageUrl(imagePath);
};

/**
 * Generate multiple possible image URLs for a category based on common naming patterns
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

/**
 * Generate a public URL for an image stored in the product folder
 * @param imagePath - The path/filename of the image
 * @returns Full public URL to access the image
 */
export const getStorageImageUrl = (imagePath: string): string => {
  if (!imagePath || !imagePath.trim()) return '';
  
  // If it's already a GitHub raw URL, return as is
  if (imagePath.startsWith('https://raw.githubusercontent.com')) {
    return imagePath;
  }
  
  // If it's a GitHub blob URL, convert to raw URL
  if (imagePath.startsWith('https://github.com') && imagePath.includes('/blob/')) {
    return imagePath.replace('https://github.com', 'https://raw.githubusercontent.com').replace('/blob/', '/');
  }
  
  // If it's a full Supabase URL, convert to local
  if (imagePath.startsWith('http') && imagePath.includes('supabase')) {
    return convertSupabaseUrlToLocal(imagePath);
  }
  
  return getProductImageUrl(imagePath);
};

/**
 * Generate a public URL for an image stored in the category folder
 * @param imagePath - The path/filename of the image
 * @returns Full public URL to access the image
 */
export const getCategoryStorageUrl = (imagePath: string): string => {
  if (!imagePath || !imagePath.trim()) return '';
  
  // If it's already a GitHub raw URL, return as is
  if (imagePath.startsWith('https://raw.githubusercontent.com')) {
    return imagePath;
  }
  
  // If it's a GitHub blob URL, convert to raw URL
  if (imagePath.startsWith('https://github.com') && imagePath.includes('/blob/')) {
    return imagePath.replace('https://github.com', 'https://raw.githubusercontent.com').replace('/blob/', '/');
  }
  
  // If it's a full Supabase URL, convert to local
  if (imagePath.startsWith('http') && imagePath.includes('supabase')) {
    return convertSupabaseUrlToLocal(imagePath);
  }
  
  // For any other case (filename, local path, etc.), use the GitHub URL generation
  return getLocalCategoryImageUrl(imagePath);
};

/**
 * Generate multiple possible image URLs for a product based on common naming patterns
 * @param productId - The product ID
 * @param productName - The product name (optional, for category-based naming)
 * @returns Array of possible image URLs to try
 */
export const getProductImageUrls = (productId: string | number, productName?: string): string[] => {
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
 * Check if an image URL is accessible
 * @param imageUrl - The image URL to check
 * @returns Promise that resolves to true if image loads, false otherwise
 */
export const isImageAccessible = (imageUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new (globalThis as any).Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imageUrl;
  });
};

/**
 * Find the first accessible image from an array of URLs
 * @param imageUrls - Array of image URLs to test
 * @returns Promise that resolves to the first accessible URL or null
 */
export const findAccessibleImage = async (imageUrls: string[]): Promise<string | null> => {
  for (const url of imageUrls) {
    const isAccessible = await isImageAccessible(url);
    if (isAccessible) {
      return url;
    }
  }
  return null;
};
