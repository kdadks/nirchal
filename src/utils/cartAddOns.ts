// Cart Add-ons Configuration and Logic
// Suggests complementary items based on cart contents

export interface AddOnItem {
  id: string;
  title: string;
  description: string;
  type: 'product' | 'service' | 'custom';
  category?: string;
  price?: number;
  priceRange?: { min: number; max: number };
  icon?: string;
}

export interface AddOnSuggestion {
  triggerCategory: string;
  triggerKeywords: string[];
  suggestions: AddOnItem[];
  priority: number;
}

// Define add-on suggestions for different product categories
export const CART_ADDON_RULES: AddOnSuggestion[] = [
  // SAREE Add-ons
  {
    triggerCategory: 'Sarees',
    triggerKeywords: ['saree', 'sari'],
    priority: 1,
    suggestions: [
      {
        id: 'faal-pico',
        title: 'Faal & Pico Service',
        description: 'Professional saree edge finishing with faal and pico work',
        type: 'service',
        price: 250,
        icon: '✂️'
      },
      {
        id: 'ready-blouse',
        title: 'Ready-made Blouse',
        description: 'Choose from our collection of ready-made blouses',
        type: 'product',
        category: 'Blouses',
        priceRange: { min: 499, max: 2999 },
        icon: '👚'
      },
      {
        id: 'custom-blouse',
        title: 'Custom Stitched Blouse',
        description: 'Get a blouse custom stitched to your measurements',
        type: 'custom',
        priceRange: { min: 650, max: 3999 },
        icon: '📏'
      },
      {
        id: 'jewelry',
        title: 'Matching Jewelry',
        description: 'Complete your look with traditional jewelry',
        type: 'product',
        category: 'Jewelry',
        priceRange: { min: 299, max: 9999 },
        icon: '💎'
      },
      {
        id: 'petticoat',
        title: 'Matching Petticoat',
        description: 'Cotton or satin petticoat in matching color',
        type: 'product',
        category: 'Petticoats',
        priceRange: { min: 299, max: 899 },
        icon: '👗'
      }
    ]
  },
  
  // LEHENGA & CHOLI Add-ons
  {
    triggerCategory: 'Lehengas',
    triggerKeywords: ['lehenga', 'choli', 'lehnga'],
    priority: 1,
    suggestions: [
      {
        id: 'custom-blouse',
        title: 'Custom Stitched Choli',
        description: 'Get a choli custom stitched to your measurements',
        type: 'custom',
        priceRange: { min: 799, max: 3999 },
        icon: '📏'
      },
      {
        id: 'lehenga-stitching',
        title: 'Custom Stitching',
        description: 'Get your lehenga stitched to your exact measurements',
        type: 'custom',
        priceRange: { min: 1499, max: 4999 },
        icon: '✂️'
      },
      {
        id: 'jewelry',
        title: 'Traditional Jewelry',
        description: 'Statement jewelry perfect for your lehenga',
        type: 'product',
        category: 'Jewelry',
        priceRange: { min: 499, max: 14999 },
        icon: '💎'
      },
      {
        id: 'dupatta',
        title: 'Designer Dupatta',
        description: 'Complement your lehenga with a beautiful dupatta',
        type: 'product',
        category: 'Dupattas',
        priceRange: { min: 399, max: 3999 },
        icon: '🧣'
      },
      {
        id: 'garba-accessories',
        title: 'Garba Accessories',
        description: 'Dandiya sticks, bangles, and other festive accessories',
        type: 'product',
        category: 'Accessories',
        priceRange: { min: 149, max: 999 },
        icon: '🎊'
      }
    ]
  },
  
  // GOWN Add-ons
  {
    triggerCategory: 'Gowns',
    triggerKeywords: ['gown', 'dress'],
    priority: 1,
    suggestions: [
      {
        id: 'gown-stitching',
        title: 'Custom Stitching & Alterations',
        description: 'Perfect fit with custom stitching service',
        type: 'custom',
        priceRange: { min: 999, max: 3499 },
        icon: '✂️'
      },
      {
        id: 'jewelry',
        title: 'Elegant Jewelry',
        description: 'Contemporary jewelry to match your gown',
        type: 'product',
        category: 'Jewelry',
        priceRange: { min: 399, max: 7999 },
        icon: '💎'
      },
      {
        id: 'clutch',
        title: 'Designer Clutch',
        description: 'Evening clutches and handbags',
        type: 'product',
        category: 'Bags',
        priceRange: { min: 499, max: 2999 },
        icon: '👜'
      }
    ]
  },
  
  // SUIT & SALWAR KAMEEZ Add-ons
  {
    triggerCategory: 'Suits',
    triggerKeywords: ['suit', 'salwar', 'kameez', 'kurti set'],
    priority: 2,
    suggestions: [
      {
        id: 'custom-blouse',
        title: 'Custom Stitched Top',
        description: 'Get the top custom stitched to your measurements',
        type: 'custom',
        priceRange: { min: 599, max: 2499 },
        icon: '📏'
      },
      {
        id: 'suit-stitching',
        title: 'Custom Stitching',
        description: 'Get your suit stitched to perfection',
        type: 'custom',
        priceRange: { min: 599, max: 2499 },
        icon: '✂️'
      },
      {
        id: 'dupatta',
        title: 'Matching Dupatta',
        description: 'Complete your look with a coordinating dupatta',
        type: 'product',
        category: 'Dupattas',
        priceRange: { min: 299, max: 1999 },
        icon: '🧣'
      },
      {
        id: 'jewelry',
        title: 'Everyday Jewelry',
        description: 'Simple and elegant jewelry pieces',
        type: 'product',
        category: 'Jewelry',
        priceRange: { min: 199, max: 3999 },
        icon: '💎'
      }
    ]
  },
  
  // KURTI Add-ons
  {
    triggerCategory: 'Kurtis',
    triggerKeywords: ['kurti', 'kurta'],
    priority: 3,
    suggestions: [
      {
        id: 'bottom-wear',
        title: 'Bottom Wear',
        description: 'Palazzo, pants, or leggings to pair with your kurti',
        type: 'product',
        category: 'Bottom Wear',
        priceRange: { min: 299, max: 1499 },
        icon: '👖'
      },
      {
        id: 'dupatta',
        title: 'Dupatta',
        description: 'Add a dupatta for a complete ethnic look',
        type: 'product',
        category: 'Dupattas',
        priceRange: { min: 199, max: 999 },
        icon: '🧣'
      },
      {
        id: 'jewelry',
        title: 'Casual Jewelry',
        description: 'Lightweight jewelry for everyday wear',
        type: 'product',
        category: 'Jewelry',
        priceRange: { min: 149, max: 1999 },
        icon: '💎'
      }
    ]
  },
  
  // KURTA SETS Add-ons
  {
    triggerCategory: 'Kurta Sets',
    triggerKeywords: ['kurta set', 'kurti set'],
    priority: 3,
    suggestions: [
      {
        id: 'dupatta',
        title: 'Dupatta',
        description: 'Add a dupatta for a complete ethnic look',
        type: 'product',
        category: 'Dupattas',
        priceRange: { min: 199, max: 999 },
        icon: '🧣'
      },
      {
        id: 'jewelry',
        title: 'Elegant Jewelry',
        description: 'Traditional jewelry to complete your look',
        type: 'product',
        category: 'Jewelry',
        priceRange: { min: 199, max: 3999 },
        icon: '💎'
      },
      {
        id: 'matching-accessories',
        title: 'Matching Accessories',
        description: 'Bags, clutches, and other accessories',
        type: 'product',
        category: 'Accessories',
        priceRange: { min: 249, max: 2499 },
        icon: '👜'
      }
    ]
  },
  
  // SKIRTS Add-ons
  {
    triggerCategory: 'Skirts',
    triggerKeywords: ['skirt'],
    priority: 3,
    suggestions: [
      {
        id: 'top-wear',
        title: 'Matching Top',
        description: 'Crop tops, blouses, or kurtis to pair with your skirt',
        type: 'product',
        category: 'Tops',
        priceRange: { min: 399, max: 1999 },
        icon: '👚'
      },
      {
        id: 'jewelry',
        title: 'Fashion Jewelry',
        description: 'Trendy jewelry to complete your outfit',
        type: 'product',
        category: 'Jewelry',
        priceRange: { min: 199, max: 2999 },
        icon: '💎'
      },
      {
        id: 'belt',
        title: 'Designer Belt',
        description: 'Stylish belts to accentuate your look',
        type: 'product',
        category: 'Accessories',
        priceRange: { min: 199, max: 999 },
        icon: '⚡'
      }
    ]
  }
];

// Helper function to detect product category from cart items
export const detectProductCategory = (productCategory: string | undefined): string | null => {
  if (!productCategory) return null;
  
  const lowerCategory = productCategory.toLowerCase();
  
  // Match with rule trigger categories using flexible matching:
  // - Check if the category contains the rule keyword (e.g., "Womens Sarees" contains "sarees")
  // - Also check singular forms (e.g., "saree")
  for (const rule of CART_ADDON_RULES) {
    const ruleCategoryLower = rule.triggerCategory.toLowerCase();
    const ruleCategorySingular = rule.triggerCategory.slice(0, -1).toLowerCase(); // "Sarees" -> "saree"
    
    // Check if category contains the rule keyword (more flexible matching)
    if (lowerCategory.includes(ruleCategoryLower) || 
        lowerCategory.includes(ruleCategorySingular) ||
        lowerCategory === ruleCategoryLower || 
        lowerCategory === ruleCategorySingular) {
      return rule.triggerCategory;
    }
  }
  
  return null;
};

// Interface for cart items (matches CartContext)
interface CartItemForSuggestions {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantId?: string;
  size?: string;
  color?: string;
  category?: string; // Product category from database
}

// Get add-on suggestions based on cart items
export const getCartAddOnSuggestions = (cartItems: CartItemForSuggestions[]): AddOnSuggestion[] => {
  const detectedCategories = new Set<string>();
  const suggestions: AddOnSuggestion[] = [];
  
  // Detect categories in cart using actual product category from database
  cartItems.forEach(item => {
    const category = detectProductCategory(item.category);
    if (category) {
      detectedCategories.add(category);
    }
  });
  
  // Get suggestions for detected categories
  detectedCategories.forEach(category => {
    const rule = CART_ADDON_RULES.find(r => r.triggerCategory === category);
    if (rule) {
      suggestions.push(rule);
    }
  });
  
  // Sort by priority
  const sortedSuggestions = suggestions.sort((a, b) => a.priority - b.priority);
  
  // Deduplicate suggestions by ID (e.g., multiple jewelry suggestions)
  // Keep track of seen suggestion IDs to avoid duplicates
  const seenIds = new Set<string>();
  const deduplicatedSuggestions = sortedSuggestions.map(suggestion => {
    const uniqueSuggestions = suggestion.suggestions.filter(item => {
      if (seenIds.has(item.id)) {
        return false; // Skip if we've already seen this ID
      }
      seenIds.add(item.id);
      return true;
    });
    
    return {
      ...suggestion,
      suggestions: uniqueSuggestions
    };
  }).filter(suggestion => suggestion.suggestions.length > 0); // Remove empty suggestion groups
  
  return deduplicatedSuggestions;
};

// Format price range display
export const formatPriceRange = (priceRange?: { min: number; max: number }, price?: number): string => {
  if (price) {
    return `₹${price.toLocaleString()}`;
  }
  if (priceRange) {
    return `₹${priceRange.min.toLocaleString()} - ₹${priceRange.max.toLocaleString()}`;
  }
  return 'Price on request';
};
