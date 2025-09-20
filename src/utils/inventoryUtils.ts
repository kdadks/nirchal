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
  // Use the pre-calculated stock status from the product data
  const stockStatus = product.stockStatus === 'Pre-Order' ? 'Out of Stock' : product.stockStatus;
  const quantity = product.stockQuantity || 0;
  const isAvailable = stockStatus !== 'Out of Stock';
  
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
 * Get available sizes for a product (only sizes with stock)
 */
export const getAvailableSizes = (product: Product, selectedColor?: string): string[] => {
  if (!product.variants || product.variants.length === 0) {
    const stockInfo = getProductStockInfo(product);
    return stockInfo.isAvailable ? sortSizesByOrder(product.sizes || ['Free Size']) : [];
  }
  
  const availableSizes = new Set<string>();
  
  product.variants.forEach(variant => {
    // Filter by color if specified
    if (selectedColor && variant.color !== selectedColor) {
      return;
    }
    
    const stockInfo = getVariantStockInfo(variant);
    if (stockInfo.isAvailable && variant.size) {
      availableSizes.add(variant.size);
    }
  });
  
  return sortSizesByOrder(Array.from(availableSizes));
};

/**
 * Get available colors for a product (only colors with stock)
 */
export const getAvailableColors = (product: Product, selectedSize?: string): string[] => {
  if (!product.variants || product.variants.length === 0) {
    const stockInfo = getProductStockInfo(product);
    return stockInfo.isAvailable ? (product.colors || []) : [];
  }
  
  const availableColors = new Set<string>();
  
  product.variants.forEach(variant => {
    // Filter by size if specified
    if (selectedSize && variant.size !== selectedSize && selectedSize !== 'Free Size') {
      return;
    }
    
    const stockInfo = getVariantStockInfo(variant);
    if (stockInfo.isAvailable && variant.color) {
      availableColors.add(variant.color);
    }
  });
  
  return Array.from(availableColors);
};

/**
 * Check if a specific size is available for a product
 */
export const isSizeAvailable = (product: Product, size: string, selectedColor?: string): boolean => {
  const availableSizes = getAvailableSizes(product, selectedColor);
  return availableSizes.includes(size);
};

/**
 * Check if a specific color is available for a product
 */
export const isColorAvailable = (product: Product, color: string, selectedSize?: string): boolean => {
  const availableColors = getAvailableColors(product, selectedSize);
  return availableColors.includes(color);
};

/**
 * Get the maximum quantity that can be added to cart for current selection
 */
export const getMaxQuantity = (product: Product, selectedSize?: string, selectedColor?: string): number => {
  const stockInfo = getSelectedProductStockInfo(product, selectedSize, selectedColor);
  return Math.max(0, stockInfo.quantity);
};
