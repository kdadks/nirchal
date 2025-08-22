import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { getCategoryImageUrl } from '../utils/storageUtils';
import type { Category } from '../types';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('[useCategories] Error:', error);
        throw error;
      }

      const transformedCategories: Category[] = (data || []).map((cat: any) => {
        let imageUrl = '';
        
        // Use the image_url field from database (same as products)
        if (cat.image_url) {
          imageUrl = getCategoryImageUrl(cat.image_url);
          if (import.meta.env.DEV) console.debug(`[useCategories] category ${cat.name} image_url: ${cat.image_url}, full URL: ${imageUrl}`);
        } else {
          if (import.meta.env.DEV) console.debug(`[useCategories] category ${cat.name} (${cat.slug}) has no image_url`);
        }

        return {
          id: String(cat.id),
          name: String(cat.name),
          image: imageUrl || '', // Return empty string if no image found, let CategoryCard handle fallback
          description: cat.description,
          featured: cat.featured || false,
          slug: cat.slug
        };
      });

      setCategories(transformedCategories);
    } catch (err) {
      console.error('[useCategories] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};
