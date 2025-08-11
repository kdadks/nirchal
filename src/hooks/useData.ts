import { useMemo } from 'react';
import { categories } from '../data/mockData';
import type { Category, Product } from '../types/admin';

// In a real app, this would fetch from Supabase or API
export const useProducts = (): Product[] => {
  return useMemo(() => [], []);
};

export const useCategories = (): Category[] => {
  // In a real app, this would be a data fetching hook
  // For now, we'll just return the mock data
  return useMemo(() => categories, []);
};