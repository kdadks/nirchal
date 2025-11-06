/**
 * Google Product Taxonomy Types
 */

export interface GoogleProductCategory {
  id: number;
  category_name: string;
  full_path: string;
  level: number;
  parent_id: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface GoogleCategorySearchResult extends GoogleProductCategory {
  relevance_score?: number;
}
