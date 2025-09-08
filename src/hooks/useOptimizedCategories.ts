import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

interface OptimizedCategoriesHook {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useOptimizedCategories = (): OptimizedCategoriesHook => {
  const { supabase } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    if (!supabase) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Simple, fast query
      const { data, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;

      setCategories(data || []);
    } catch (e) {
      console.error('[OptimizedCategories] Error:', e);
      setError(e instanceof Error ? e.message : 'Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!supabase) return;
    fetchCategories();
  }, [supabase]);

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories
  };
};
