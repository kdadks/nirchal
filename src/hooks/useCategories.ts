import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { getCategoryStorageUrl, findCategoryImageUrl } from '../utils/storageUtils';
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
        
        // Handle JWT expiration
        const errorMsg = (error.message || '').toLowerCase();
        if (errorMsg.includes('jwt') && errorMsg.includes('expired')) {
          // Try to refresh the session
          try {
            await supabase.auth.refreshSession();
            // Retry the request after refresh
            const { data: retryData, error: retryError } = await supabase
              .from('categories')
              .select('*')
              .order('name', { ascending: true });
            
            if (retryError) {
              throw retryError;
            }
            
            // Process the retry data
            const transformedCategories: Category[] = (retryData || []).map((cat: any) => {
              let imageUrl = '';
              
              // Use the image_url field from database if available
              if (cat.image_url && cat.image_url.trim()) {
                imageUrl = getCategoryStorageUrl(cat.image_url);
                if (import.meta.env.DEV) console.debug(`[useCategories] category ${cat.name} using DB image_url: ${cat.image_url}, full URL: ${imageUrl}`);
              } else {
                // If no image_url in database, try to find image by category name/slug pattern
                imageUrl = findCategoryImageUrl(cat.name, cat.slug);
                
                if (import.meta.env.DEV) {
                  console.debug(`[useCategories] category ${cat.name} (${cat.slug}) has no image_url in DB`);
                  console.debug(`[useCategories] using pattern-based image: ${imageUrl}`);
                }
              }

              return {
                id: String(cat.id),
                name: String(cat.name),
                image_url: imageUrl || '', // Use correct property name
                description: cat.description,
                featured: cat.featured || false,
                slug: cat.slug
              };
            });

            setCategories(transformedCategories);
            return; // Exit early on successful retry
          } catch (refreshError) {
            console.error('[useCategories] Token refresh failed:', refreshError);
            setError('Authentication session expired. Please refresh the page.');
            return;
          }
        }
        
        throw error;
      }

      const transformedCategories: Category[] = (data || []).map((cat: any) => {
        let imageUrl = '';
        
        // Use the image_url field from database if available
        if (cat.image_url && cat.image_url.trim()) {
          imageUrl = getCategoryStorageUrl(cat.image_url);
          if (import.meta.env.DEV) console.debug(`[useCategories] category ${cat.name} using DB image_url: ${cat.image_url}, full URL: ${imageUrl}`);
        } else {
          // If no image_url in database, try to find image by category name/slug pattern
          imageUrl = findCategoryImageUrl(cat.name, cat.slug);
          
          if (import.meta.env.DEV) {
            console.debug(`[useCategories] category ${cat.name} (${cat.slug}) has no image_url in DB`);
            console.debug(`[useCategories] using pattern-based image: ${imageUrl}`);
          }
        }

        return {
          id: String(cat.id),
          name: String(cat.name),
          image_url: imageUrl || '', // Use correct property name
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
