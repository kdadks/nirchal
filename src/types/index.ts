/* global File */
// Product Types
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
  sizes: string[];
  description: string;
  isFeatured?: boolean;
  isNew?: boolean;
  rating: number;
  reviewCount: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Pre-Order';
  specifications?: {
    [key: string]: string;
  };
  reviews: Review[];
  variants?: any[];
}

export interface Category {
  id: string;
  name: string;
  image: string;
  description?: string;
  featured?: boolean;
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