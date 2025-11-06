/**
 * Google Product Taxonomy Service
 * Handles interactions with Google Product Categories
 */

import { supabase } from '../config/supabase';
import type { GoogleProductCategory, GoogleCategorySearchResult } from '../types/google-taxonomy';

export class GoogleTaxonomyService {
  /**
   * Search for Google product categories
   */
  static async searchCategories(searchTerm: string): Promise<GoogleCategorySearchResult[]> {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return [];
      }

      console.log('[GoogleTaxonomyService] Searching for:', searchTerm);
      
      // Try using the RPC function first
      const { data, error } = await supabase
        .rpc('search_google_categories', { search_term: searchTerm });

      if (error) {
        console.warn('[GoogleTaxonomyService] RPC function not available, using fallback search:', error.message);
        
        // Fallback: Direct table query with ILIKE
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('google_product_categories')
          .select('id, category_name, full_path, level, parent_id')
          .or(`category_name.ilike.%${searchTerm}%,full_path.ilike.%${searchTerm}%`)
          .order('level', { ascending: true })
          .limit(50);

        if (fallbackError) {
          console.error('[GoogleTaxonomyService] Fallback search error:', fallbackError);
          return [];
        }

        console.log('[GoogleTaxonomyService] Fallback search results:', fallbackData?.length || 0, 'categories');
        return (fallbackData as unknown as GoogleCategorySearchResult[]) || [];
      }
      
      console.log('[GoogleTaxonomyService] Search results:', Array.isArray(data) ? data.length : 0, 'categories');
      return (data as unknown as GoogleCategorySearchResult[]) || [];
    } catch (error) {
      console.error('[GoogleTaxonomyService] Error searching Google categories:', error);
      return [];
    }
  }

  /**
   * Get a specific category by ID
   */
  static async getCategoryById(id: number): Promise<GoogleProductCategory | null> {
    try {
      const { data, error } = await supabase
        .from('google_product_categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as GoogleProductCategory;
    } catch (error) {
      console.error('Error fetching Google category:', error);
      return null;
    }
  }

  /**
   * Get top-level categories
   */
  static async getTopLevelCategories(): Promise<GoogleProductCategory[]> {
    try {
      const { data, error } = await supabase
        .from('google_product_categories')
        .select('*')
        .eq('level', 1)
        .order('category_name');

      if (error) throw error;
      return (data as unknown as GoogleProductCategory[]) || [];
    } catch (error) {
      console.error('Error fetching top-level categories:', error);
      return [];
    }
  }

  /**
   * Get child categories for a parent category
   */
  static async getChildCategories(parentId: number): Promise<GoogleProductCategory[]> {
    try {
      const { data, error } = await supabase
        .from('google_product_categories')
        .select('*')
        .eq('parent_id', parentId)
        .order('category_name');

      if (error) throw error;
      return (data as unknown as GoogleProductCategory[]) || [];
    } catch (error) {
      console.error('Error fetching child categories:', error);
      return [];
    }
  }

  /**
   * Get category breadcrumb (full path)
   */
  static async getCategoryBreadcrumb(categoryId: number): Promise<string> {
    try {
      const { data, error } = await supabase
        .rpc('get_category_breadcrumb', { category_id: categoryId });

      if (error) throw error;
      return (data as string) || '';
    } catch (error) {
      console.error('Error fetching category breadcrumb:', error);
      return '';
    }
  }

  /**
   * Get category hierarchy (breadcrumb as array)
   */
  static parseBreadcrumb(fullPath: string): string[] {
    return fullPath.split('>').map(part => part.trim());
  }
}
