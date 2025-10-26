// Types for Featured Sections System

export type SectionType = 'custom' | 'trending' | 'new_arrivals' | 'best_sellers';

export interface FeaturedSection {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  display_order: number;
  is_active: boolean;
  section_type: SectionType;
  max_products: number;
  background_color: string;
  text_color: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  show_view_all_button?: boolean;
}

export interface FeaturedSectionProduct {
  id: string;
  section_id: string;
  product_id: string;
  display_order: number;
  added_at: string;
}

export interface FeaturedSectionWithProducts extends FeaturedSection {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    images: string[];
    stock_quantity: number;
    display_order: number;
  }>;
}

export interface CreateFeaturedSectionInput {
  title: string;
  description?: string;
  slug: string;
  display_order?: number;
  section_type?: SectionType;
  max_products?: number;
  background_color?: string;
  text_color?: string;
  product_ids?: string[];
  show_view_all_button?: boolean;
}

export interface UpdateFeaturedSectionInput {
  title?: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
  max_products?: number;
  background_color?: string;
  text_color?: string;
  product_ids?: string[];
  show_view_all_button?: boolean;
}
