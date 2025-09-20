import { useMemo } from 'react';
import { usePublicProducts } from './usePublicProducts';
import type { Product } from '../types';

interface UseProductSuggestionsProps {
  currentProduct: Product | null;
  maxSuggestions?: number;
}

export const useProductSuggestions = ({ 
  currentProduct, 
  maxSuggestions = 4 
}: UseProductSuggestionsProps) => {
  const { products } = usePublicProducts();

  const suggestions = useMemo(() => {
    if (!currentProduct || !products.length) {
      return [];
    }

    // Get the current product's category
    const currentCategory = currentProduct.category;
    
    // Define related categories based on the current category
    const getRelatedCategories = (category: string): string[] => {
      const categoryMap: Record<string, string[]> = {
        // Sarees and related items
        'sarees': ['sarees', 'blouses', 'jewelry', 'accessories'],
        'blouses': ['blouses', 'sarees', 'jewelry', 'accessories'],
        
        // Kurtis and related items  
        'womens-kurtis': ['womens-kurtis', 'palazzos', 'leggings', 'dupatta', 'jewelry'],
        'kurtis': ['kurtis', 'palazzos', 'leggings', 'dupatta', 'jewelry'],
        
        // Kids wear
        'kidswear': ['kidswear', 'kids-accessories'],
        'kids-accessories': ['kids-accessories', 'kidswear'],
        
        // Bottom wear
        'palazzos': ['palazzos', 'womens-kurtis', 'kurtis', 'leggings'],
        'leggings': ['leggings', 'womens-kurtis', 'kurtis', 'palazzos'],
        
        // Accessories
        'jewelry': ['jewelry', 'accessories', 'sarees', 'womens-kurtis'],
        'accessories': ['accessories', 'jewelry', 'sarees', 'womens-kurtis'],
        'dupatta': ['dupatta', 'womens-kurtis', 'kurtis', 'jewelry'],
        
        // Men's wear (if applicable)
        'mens-wear': ['mens-wear', 'mens-accessories'],
        'mens-accessories': ['mens-accessories', 'mens-wear'],
      };

      // Return related categories or fallback to same category
      return categoryMap[category.toLowerCase()] || [category];
    };

    const relatedCategories = getRelatedCategories(currentCategory);

    // Filter products that match related categories and exclude current product
    const relatedProducts = products.filter(product => 
      product.id !== currentProduct.id && 
      relatedCategories.some(cat => 
        product.category.toLowerCase() === cat.toLowerCase()
      )
    );

    // Shuffle function for randomization
    const shuffleArray = <T>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Separate exact matches and related products
    const exactMatches = relatedProducts.filter(product => 
      product.category.toLowerCase() === currentCategory.toLowerCase()
    );
    const relatedMatches = relatedProducts.filter(product => 
      product.category.toLowerCase() !== currentCategory.toLowerCase()
    );

    // Shuffle both groups separately
    const shuffledExactMatches = shuffleArray(exactMatches);
    const shuffledRelatedMatches = shuffleArray(relatedMatches);

    // Combine with exact matches first, then related
    const combinedProducts = [...shuffledExactMatches, ...shuffledRelatedMatches];

    // Return only the requested number of suggestions
    return combinedProducts.slice(0, maxSuggestions);
  }, [currentProduct, products, maxSuggestions]);

  return { suggestions };
};