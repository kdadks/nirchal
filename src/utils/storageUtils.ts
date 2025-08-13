/**
 * Utility functions for handling Supabase storage URLs
 */

/**
 * Generate a public URL for an image stored in the category-images bucket
 * @param imagePath - The path/filename of the image in the storage bucket
 * @returns Full public URL to access the image
 */
export const getCategoryImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error('[Storage Utils] VITE_SUPABASE_URL not found in environment');
    return '';
  }
  
  // Construct the full storage URL for category images
  return `${supabaseUrl}/storage/v1/object/public/category-images/${imagePath}`;
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
    `category_${categorySlug}.jpg`,
    `category-${categorySlug}.jpg`,
    `${categorySlug}_image.jpg`,
    `${categorySlug}-image.jpg`
  ];
  
  return patterns.map(pattern => getCategoryImageUrl(pattern));
};

/**
 * Generate a public URL for an image stored in the product-images bucket
 * @param imagePath - The path/filename of the image in the storage bucket
 * @returns Full public URL to access the image
 */
export const getStorageImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error('[Storage Utils] VITE_SUPABASE_URL not found in environment');
    return '';
  }
  
  // Construct the full storage URL
  return `${supabaseUrl}/storage/v1/object/public/product-images/${imagePath}`;
};

/**
 * Generate multiple possible image URLs for a product based on common naming patterns
 * @param productId - The product ID
 * @param productName - The product name (optional, for category-based naming)
 * @returns Array of possible image URLs to try
 */
export const getProductImageUrls = (productId: string | number, productName?: string): string[] => {
  const basePatterns = [
    `${productId}.jpg`,
    `${productId}.jpeg`,
    `${productId}.png`,
    `${productId}.webp`,
    `product_${productId}.jpg`,
    `product-${productId}.jpg`,
    `img_${productId}.jpg`,
    `image_${productId}.jpg`
  ];
  
  // Add category-specific patterns if product name is provided
  const categoryPatterns: string[] = [];
  if (productName) {
    const name = productName.toLowerCase();
    const category = name.includes('saree') ? 'saree' : 
                    name.includes('lehenga') ? 'lehenga' : 
                    name.includes('kurti') ? 'kurti' : 'product';
    
    categoryPatterns.push(
      `${category}-${productId}.jpg`,
      `${category}_${productId}.jpg`,
      `${category}/${productId}.jpg`
    );
  }
  
  const allPatterns = [...categoryPatterns, ...basePatterns];
  return allPatterns.map(pattern => getStorageImageUrl(pattern));
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
