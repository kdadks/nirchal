import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
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

      const transformedCategories: Category[] = (data || []).map((cat: any) => ({
        id: String(cat.id),
        name: String(cat.name),
        image: cat.image || '',
        description: cat.description,
        featured: cat.featured || false
      }));

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
