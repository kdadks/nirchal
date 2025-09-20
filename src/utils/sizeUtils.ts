/**
 * Utility functions for handling product size ordering and display
 */

// Define the standard size ordering sequence
const SIZE_ORDER = [
  'XS', 'S', 'M', 'L', 'XL', 
  '2XL', '3XL', '4XL', '5XL', '6XL', '7XL', '8XL'
];

/**
 * Get the order priority for a size
 * @param size - The size string to get priority for
 * @returns The priority number (lower = higher priority) or 999 for unknown sizes
 */
const getSizeOrderPriority = (size: string): number => {
  const normalizedSize = size.trim().toUpperCase();
  const index = SIZE_ORDER.indexOf(normalizedSize);
  return index === -1 ? 999 : index;
};

/**
 * Sort an array of sizes according to the standard sequence: XS, S, M, L, XL, 2XL, 3XL, etc.
 * @param sizes - Array of size strings to sort
 * @returns Sorted array of sizes in the correct sequence
 */
export const sortSizesByOrder = (sizes: string[]): string[] => {
  return [...sizes].sort((a, b) => {
    const priorityA = getSizeOrderPriority(a);
    const priorityB = getSizeOrderPriority(b);
    
    // If priorities are different, sort by priority
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // If both sizes have the same priority (both unknown), sort alphabetically
    return a.localeCompare(b);
  });
};

/**
 * Sort available sizes for a product in the correct display order
 * @param product - Product object with sizes array
 * @param filterEmptySizes - Whether to filter out empty/invalid sizes (default: true)
 * @returns Sorted array of valid sizes
 */
export const getSortedProductSizes = (
  product: { sizes?: string[] }, 
  filterEmptySizes: boolean = true
): string[] => {
  if (!product.sizes) return [];
  
  let sizes = product.sizes;
  
  if (filterEmptySizes) {
    sizes = sizes.filter(size => 
      size && 
      size.trim() !== '' && 
      size.toLowerCase() !== 'free size'
    );
  }
  
  return sortSizesByOrder(sizes);
};