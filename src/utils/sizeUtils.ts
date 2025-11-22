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
  
  if (index !== -1) {
    return index; // Standard size found
  }
  
  // Check if it's an age-based size (e.g., "3 yrs", "4 yrs", "12-18 months")
  const ageMatch = normalizedSize.match(/^(\d+)\s*(YRS?|YEARS?|MONTHS?|M)?$/i);
  if (ageMatch) {
    const age = parseInt(ageMatch[1], 10);
    // Return a priority based on age (starting from 100 to avoid conflicts with standard sizes)
    // This ensures age sizes sort numerically
    return 100 + age;
  }
  
  // Check for month-based sizes (e.g., "6-12 months", "12-18 months")
  const monthMatch = normalizedSize.match(/^(\d+)-(\d+)\s*MONTHS?$/i);
  if (monthMatch) {
    const startMonth = parseInt(monthMatch[1], 10);
    // Return a priority based on starting month
    return 50 + startMonth;
  }
  
  // Unknown size - sort alphabetically
  return 999;
};

/**
 * Sort an array of sizes according to the standard sequence: XS, S, M, L, XL, 2XL, 3XL, etc.
 * Also handles age-based sizes (3 yrs, 4 yrs, etc.) in numeric order
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