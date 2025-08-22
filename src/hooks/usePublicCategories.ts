import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

export interface PublicCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

export const usePublicCategories = () => {
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
  if (import.meta.env.DEV) console.debug('[usePublicCategories] fetching categories...');
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (import.meta.env.DEV) {
        console.debug('[usePublicCategories] result:', data);
        console.debug('[usePublicCategories] error:', error);
      }

      if (error) {
        console.error('[usePublicCategories] Supabase error:', error);
        throw error;
      }

      setCategories(data || []);
    } catch (e) {
      console.error('[usePublicCategories] Error:', e);
      setError(e instanceof Error ? e.message : 'Error fetching categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};
