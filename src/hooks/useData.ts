import { useMemo } from 'react';
import { products, categories } from '../data/mockData';
import type { Product, Category } from '../types';

export const useProducts = (): Product[] => {
  // In a real app, this would be a data fetching hook
  // For now, we'll just return the mock data
  return useMemo(() => products, []);
};

export const useCategories = (): Category[] => {
  // In a real app, this would be a data fetching hook
  // For now, we'll just return the mock data
  return useMemo(() => categories, []);
};