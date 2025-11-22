import type { Product, ProductVariant } from '../types';
import { sortSizesByOrder } from './sizeUtils';

export interface StockInfo {
  isInStock: boolean;
  quantity: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  isAvailable: boolean; // Can be added to cart
}

/**
 * Get stock information for a standalone product (no variants)
 */
export const getProductStockInfo = (product: Product): StockInfo => {
  const quantity = product.stockQuantity || 0;
  
  // Calculate stock status based on actual quantity (don't trust stored stockStatus)
  let stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  if (quantity === 0) {
    stockStatus = 'Out of Stock';
  } else if (quantity <= 5) {
    stockStatus = 'Low Stock';
  } else {
    stockStatus = 'In Stock';
  }
  
  // isAvailable should be based on actual quantity
  const isAvailable = quantity > 0;
  
  return {
    isInStock: isAvailable,
    quantity,
    stockStatus,
    isAvailable
  };
};

/**
 * Get stock information for a specific variant
 */
export const getVariantStockInfo = (variant: ProductVariant): StockInfo => {
  const quantity = variant.quantity || 0;
  
  let stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  if (quantity === 0) {
    stockStatus = 'Out of Stock';
  } else if (quantity <= 5) { // Consider low stock threshold
    stockStatus = 'Low Stock';
  } else {
    stockStatus = 'In Stock';
  }
  
  return {
    isInStock: quantity > 0,
    quantity,
    stockStatus,
    isAvailable: quantity > 0
  };
};

/**
 * Get stock information for a product with selected variant
 */
export const getSelectedProductStockInfo = (
  product: Product, 
  selectedSize?: string, 
  selectedColor?: string
): StockInfo => {
  // If product has no variants, check product-level stock
  if (!product.variants || product.variants.length === 0) {
    return getProductStockInfo(product);
  }
  
  // If product has variants but none selected, consider it unavailable
  if ((!selectedSize || selectedSize === '') && (!selectedColor || selectedColor === '')) {
    if (import.meta.env?.DEV) {
      console.log('[getSelectedProductStockInfo] No size/color selected, returning out of stock');
    }
    return {
      isInStock: false,
      quantity: 0,
      stockStatus: 'Out of Stock',
      isAvailable: false
    };
  }
  
  // Find the matching variant
  const variant = product.variants.find(v => {
    const sizeMatch = !selectedSize || selectedSize === '' || v.size === selectedSize || selectedSize === 'Free Size';
    const colorMatch = !selectedColor || selectedColor === '' || v.color === selectedColor;
    return sizeMatch && colorMatch;
  });
  
  if (import.meta.env?.DEV) {
    console.log('[getSelectedProductStockInfo] Searching for variant:', {
      selectedSize,
      selectedColor,
      variantCount: product.variants.length,
      foundVariant: !!variant,
      matchedVariant: variant ? {
        size: variant.size,
        color: variant.color,
        quantity: variant.quantity
      } : null
    });
  }
  
  if (!variant) {
    return {
      isInStock: false,
      quantity: 0,
      stockStatus: 'Out of Stock',
      isAvailable: false
    };
  }
  
  return getVariantStockInfo(variant);
};

/**
 * Check if any variant is available for a product
 */
export const hasAnyVariantInStock = (product: Product): boolean => {
  if (!product.variants || product.variants.length === 0) {
    return getProductStockInfo(product).isAvailable;
  }
  
  return product.variants.some(variant => {
    const stockInfo = getVariantStockInfo(variant);
    return stockInfo.isAvailable;
  });
};

/**
 * Get available sizes for a product (shows ALL sizes, regardless of stock)
 */
export const getAvailableSizes = (product: Product, selectedColor?: string): string[] => {
  if (!product.variants || product.variants.length === 0) {
    return sortSizesByOrder(product.sizes || ['Free Size']);
  }
  
  const availableSizes = new Set<string>();
  
  product.variants.forEach(variant => {
    // Filter by color if specified
    if (selectedColor && variant.color !== selectedColor) {
      return;
    }
    
    // Always add the size, regardless of stock status
    if (variant.size) {
      availableSizes.add(variant.size);
    }
  });
  
  return sortSizesByOrder(Array.from(availableSizes));
};

/**
 * Get available colors for a product (shows ALL colors, regardless of stock)
 */
export const getAvailableColors = (product: Product, selectedSize?: string): string[] => {
  if (!product.variants || product.variants.length === 0) {
    return product.colors || [];
  }
  
  const availableColors = new Set<string>();
  
  product.variants.forEach(variant => {
    // Filter by size if specified
    if (selectedSize && variant.size !== selectedSize && selectedSize !== 'Free Size') {
      return;
    }
    
    // Always add the color, regardless of stock status
    if (variant.color) {
      availableColors.add(variant.color);
    }
  });
  
  return Array.from(availableColors);
};

/**
 * Check if a color exists for a product (shows all colors, even if out of stock)
 */
export const colorExists = (product: Product, color: string): boolean => {
  const allColors = getAvailableColors(product);
  return allColors.includes(color);
};

/**
 * Check if a specific color has any variant in stock
 */
export const isColorInStock = (product: Product, color: string, selectedSize?: string): boolean => {
  if (!product.variants || product.variants.length === 0) {
    return true; // Product-level products are always considered in stock if they exist
  }
  
  // Check if there's any variant with this color that has stock
  // If selectedSize is provided, only check that size
  const variantsToCheck = product.variants.filter(v => v.color === color);
  
  if (selectedSize) {
    // If size is selected, check if that specific size+color combination has stock
    const variant = variantsToCheck.find(v => v.size === selectedSize);
    if (!variant) return false;
    return variant.quantity > 0;
  }
  
  // If no size specified, check if ANY size variant for this color has stock
  return variantsToCheck.some(v => v.quantity > 0);
};

/**
 * Check if a specific color is available for a product (can click on it)
 */
export const isColorAvailable = (product: Product, color: string, selectedSize?: string): boolean => {
  // First check if the color exists
  if (!colorExists(product, color)) {
    return false;
  }
  
  // Then check if it has stock
  return isColorInStock(product, color, selectedSize);
};

/**
 * Check if a size exists for a product (shows all sizes, even if out of stock)
 */
export const sizeExists = (product: Product, size: string, selectedColor?: string): boolean => {
  const allSizes = getAvailableSizes(product, selectedColor);
  return allSizes.includes(size);
};

/**
 * Check if a specific size has any variant in stock
 */
export const isSizeInStock = (product: Product, size: string, selectedColor?: string): boolean => {
  if (!product.variants || product.variants.length === 0) {
    return true; // Product-level products are always considered in stock if they exist
  }
  
  // Check if there's any variant with this size that has stock
  // If selectedColor is provided, only check that color
  const variantsToCheck = product.variants.filter(v => v.size === size);
  
  if (selectedColor) {
    // If color is selected, check if that specific size+color combination has stock
    const variant = variantsToCheck.find(v => v.color === selectedColor);
    if (!variant) return false;
    return variant.quantity > 0;
  }
  
  // If no color specified, check if ANY color variant for this size has stock
  return variantsToCheck.some(v => v.quantity > 0);
};

/**
 * Check if a specific size is available for a product (can click on it)
 */
export const isSizeAvailable = (product: Product, size: string, selectedColor?: string): boolean => {
  // First check if the size exists
  if (!sizeExists(product, size, selectedColor)) {
    return false;
  }
  
  // Then check if it has stock
  return isSizeInStock(product, size, selectedColor);
};

/**
 * Get the maximum quantity that can be added to cart for current selection
 */
export const getMaxQuantity = (product: Product, selectedSize?: string, selectedColor?: string): number => {
  const stockInfo = getSelectedProductStockInfo(product, selectedSize, selectedColor);
  return Math.max(0, stockInfo.quantity);
};
