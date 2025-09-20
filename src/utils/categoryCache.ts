import { supabase } from '../config/supabase';
import type { Category } from '../types';

// Global category cache
let categoryCache: Category[] | null = null;
let categoryMapCache: Map<string, Category> | null = null;
let categoryCachePromise: Promise<Category[]> | null = null;

// Cache expiration time (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;
let cacheTimestamp = 0;

// Check if cache is valid
const isCacheValid = (): boolean => {
  return categoryCache !== null && Date.now() - cacheTimestamp < CACHE_DURATION;
};

// Clear cache
export const clearCategoryCache = (): void => {
  categoryCache = null;
  categoryMapCache = null;
  categoryCachePromise = null;
  cacheTimestamp = 0;
};

// Fetch categories from database
const fetchCategoriesFromDB = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('[CategoryCache] Error fetching categories:', error);
    throw error;
  }

  // Transform the data
  const transformedCategories: Category[] = (data || []).map((cat: any) => {
    let imageUrl = '';
    
    // Use the image_url field from database if available
    if (cat.image_url && cat.image_url.trim()) {
      imageUrl = cat.image_url.startsWith('http') 
        ? cat.image_url 
        : `https://raw.githubusercontent.com/kdadks/nirchal-images/main/categories/${cat.image_url}`;
    }

    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
      description: cat.description || '',
      image_url: imageUrl,
      featured: cat.featured || false,
      active: cat.active !== false, // Default to true if not specified
      sort_order: cat.sort_order || 0,
      created_at: cat.created_at,
      updated_at: cat.updated_at
    };
  });

  return transformedCategories;
};

// Get all categories with caching
export const getCachedCategories = async (): Promise<Category[]> => {
  // Return cached data if valid
  if (isCacheValid() && categoryCache) {
    return categoryCache;
  }

  // If there's already a fetch in progress, wait for it
  if (categoryCachePromise) {
    return categoryCachePromise;
  }

  // Start new fetch
  categoryCachePromise = fetchCategoriesFromDB();
  
  try {
    const categories = await categoryCachePromise;
    
    // Update cache
    categoryCache = categories;
    cacheTimestamp = Date.now();
    
    // Build map cache for fast lookups
    categoryMapCache = new Map();
    categories.forEach(cat => {
      if (typeof cat.slug === 'string') {
        categoryMapCache!.set(cat.slug, cat);
      }
      if (typeof cat.name === 'string') {
        categoryMapCache!.set(cat.name, cat);
      }
      if (typeof cat.id === 'string') {
        categoryMapCache!.set(cat.id, cat);
      }
    });
    
    return categories;
  } catch (error) {
    // Clear the promise so next call can retry
    categoryCachePromise = null;
    throw error;
  }
};

// Get category by slug, name, or ID with caching
export const getCachedCategory = async (identifier: string): Promise<Category | null> => {
  // Ensure categories are loaded
  await getCachedCategories();
  
  // Return from map cache
  return categoryMapCache?.get(identifier) || null;
};

// Get category ID by slug or name with caching
export const getCachedCategoryId = async (slugOrName: string): Promise<string | null> => {
  const category = await getCachedCategory(slugOrName);
  return category?.id || null;
};

// Preload categories (can be called on app startup)
export const preloadCategories = (): Promise<Category[]> => {
  return getCachedCategories();
};