/* global File */
export interface Category {
  id: string; // UUID
  name: string;
  description: string | null;
  slug: string;
  parent_id: string | null; // UUID
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string; // UUID
  name: string;
  slug: string;
  description: string | null;
  category_id: string; // UUID
  price: number;
  sale_price: number | null;
  sku: string | null;
  is_active: boolean;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface ProductImage {
  id: string; // UUID
  product_id: string; // UUID
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface ProductVariant {
  id: string; // UUID
  product_id: string; // UUID
  sku: string | null;
  size: string | null;
  color: string | null;
  price_adjustment: number;
  created_at: string;
  updated_at: string;
}

export interface Inventory {
  id: string; // UUID  
  product_id: string; // UUID
  variant_id: string | null; // UUID
  quantity: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryHistory {
  id: number;
  inventory_id: number;
  previous_quantity: number;
  new_quantity: number;
  change_type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';
  reason: string | null;
  created_by: string;
  created_at: string;
}

export interface ProductAuditLog {
  id: number;
  product_id: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  changes: {
    old_data?: Product;
    new_data?: Product;
    data?: Product;
  };
  created_by: string;
  created_at: string;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

export interface ProductWithDetails extends Product {
  category: Category | null;
  images: ProductImage[];
  variants: ProductVariant[];
  inventory: Inventory[]; // now always an array
}

export interface ProductFormImage {
  id?: string; // UUID for existing images
  product_id?: string; // UUID
  image_url?: string; // present for existing images
  url?: string; // for previewing new uploads
  alt_text?: string | null;
  is_primary?: boolean;
  file?: File; // for new uploads
  existing?: boolean; // true if from DB
  toDelete?: boolean; // true if marked for deletion
}

export interface ProductFormVariant {
  id?: string; // UUID
  sku: string | null;
  size: string | null;
  color: string | null;
  price_adjustment: number;
  quantity?: number;
  low_stock_threshold?: number;
}

export interface ProductFormInventory {
  quantity: number;
  low_stock_threshold: number;
}

export type ProductFormData = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'> & {
  images: ProductFormImage[];
  variants: ProductFormVariant[];
  inventory: ProductFormInventory;
};

// For update, allow variantsToDelete
export type ProductFormDataWithDelete = ProductFormData & { variantsToDelete?: string[] };

export type CategoryFormData = Omit<Category, 'id' | 'created_at' | 'updated_at'>;