/* global File */
// Product Types
export interface ProductVariant {
  id: string;
  sku?: string;
  size?: string;
  color?: string;
  // Optional hex color value (e.g., #RRGGBB) for swatch fallback when no image
  colorHex?: string;
  material?: string;
  style?: string;
  priceAdjustment: number;
  quantity: number;
  variantType?: 'size' | 'color';
  swatchImageId?: string;
  swatchImage?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  images: string[];
  category: string;
  subcategory?: string;
  occasion?: string[];
  fabric?: string;
  color: string;
  colors: string[];
  sizes: string[];
  description: string;
  isNew?: boolean;
  rating: number;
  reviewCount: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Pre-Order';
  stockQuantity?: number;
  specifications?: {
    [key: string]: string;
  };
  reviews: Review[];
  variants?: ProductVariant[];
  meta_title?: string | null;
  meta_description?: string | null;
  // Google Merchant Center fields
  gtin?: string | null; // Global Trade Item Number (UPC, EAN, ISBN)
  mpn?: string | null; // Manufacturer Part Number
  gender?: 'Female' | 'Male' | 'Unisex' | null;
  age_group?: 'Adult' | 'Kids' | 'Infant' | 'Toddler' | 'Newborn' | null;
  google_product_category?: string | null;
}

export interface Category {
  id: string;
  name: string;
  image_url?: string; // Made optional to match database schema
  description?: string;
  featured?: boolean;
  slug?: string;
  is_special_occasion?: boolean;
  occasion_slug?: string;
  occasion_start_date?: string;
  occasion_end_date?: string;
  occasion_banner_image?: string;
  occasion_banner_color?: string;
  occasion_text_color?: string;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  wishlist: string[];
  orders: Order[];
}

export interface Order {
  id: string;
  products: CartItem[];
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
  date: string;
  total: number;
  shippingAddress: string;
  cod_amount?: number; // Amount to be collected on delivery
  cod_collected?: boolean; // Whether COD has been collected
  online_amount?: number; // Amount paid online
  payment_split?: boolean; // Whether order used split payment
}

// Filter and Search Types
export interface FilterOptions {
  categories: string[];
  priceRange: [number, number];
  colors: string[];
  fabrics: string[];
  occasions: string[];
  sizes: string[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
  images?: string[];
}

export interface ReviewFormData {
  rating: number;
  comment: string;
  images?: File[];
}