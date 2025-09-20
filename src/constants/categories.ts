// Category mappings for SEO-friendly URLs
export interface CategoryMapping {
  name: string;
  slug: string;
  displayName: string;
  description?: string;
}

export const CATEGORY_MAPPINGS: CategoryMapping[] = [
  // Men's categories
  {
    name: "Mens Kurta Sets",
    slug: "mens-kurta-sets", 
    displayName: "Mens Kurta Sets",
    description: "Traditional and contemporary kurta sets for men"
  },
  
  // Women's categories - Using exact database names and slugs
  {
    name: "Women Accessories",
    slug: "women-accessories",
    displayName: "Accessories",
    description: "Beautiful accessories to complement your outfit"
  },
  {
    name: "Blouses", 
    slug: "blouses",
    displayName: "Blouses",
    description: "Elegant blouses for every occasion"
  },
  {
    name: "Dupatta",
    slug: "dupatta", 
    displayName: "Dupatta",
    description: "Traditional and designer dupattas"
  },
  {
    name: "Dress Material",
    slug: "dress-material",
    displayName: "Dress Materials", 
    description: "Unstitched dress materials and fabrics"
  },
  {
    name: "Womens Kurtis",
    slug: "womens-kurtis",
    displayName: "Kurtis",
    description: "Comfortable and stylish kurtis"
  },
  {
    name: "Womens Kurta Sets", 
    slug: "womens-kurta-sets",
    displayName: "Kurta Sets",
    description: "Complete kurta sets for women"
  },
  {
    name: "Womens Lehenga Choli",
    slug: "womens-lehenga-choli", 
    displayName: "Lehenga Choli",
    description: "Beautiful lehenga choli for special occasions"
  },
  {
    name: "Womens Gown",
    slug: "womens-gown",
    displayName: "Gowns",
    description: "Elegant gowns for special occasions"
  },
  {
    name: "Womens Skirts",
    slug: "womens-skirts",
    displayName: "Skirts", 
    description: "Traditional and modern skirts"
  },
  {
    name: "Womens Sarees",
    slug: "womens-sarees",
    displayName: "Sarees",
    description: "Elegant sarees for every celebration"
  },
  
  // Kids categories
  {
    name: "Kidswear",
    slug: "kidswear",
    displayName: "Kids",
    description: "Adorable ethnic wear for children"
  }
];

// Helper functions
export const getCategoryBySlug = (slug: string): CategoryMapping | undefined => {
  return CATEGORY_MAPPINGS.find(cat => cat.slug === slug);
};

export const getCategoryByName = (name: string): CategoryMapping | undefined => {
  return CATEGORY_MAPPINGS.find(cat => cat.name === name);
};

export const getSlugByName = (name: string): string | undefined => {
  const category = getCategoryByName(name);
  return category?.slug;
};

export const getNameBySlug = (slug: string): string | undefined => {
  const category = getCategoryBySlug(slug);
  return category?.name;
};

// Menu structure for header component - using exact database names and slugs
export const MENU_CATEGORIES = {
  men: [
    {
      name: "Mens Kurta Sets",
      slug: "mens-kurta-sets",
      displayName: "Mens Kurta Sets"
    }
  ],
  women: [
    {
      name: "Women Accessories",
      slug: "women-accessories",
      displayName: "Accessories"
    },
    {
      name: "Blouses",
      slug: "blouses",
      displayName: "Blouses"
    },
    {
      name: "Dupatta",
      slug: "dupatta",
      displayName: "Dupatta"
    },
    {
      name: "Dress Material",
      slug: "dress-material",
      displayName: "Dress Materials"
    },
    {
      name: "Womens Kurtis",
      slug: "womens-kurtis", 
      displayName: "Kurtis"
    },
    {
      name: "Womens Kurta Sets",
      slug: "womens-kurta-sets",
      displayName: "Kurta Sets" 
    },
    {
      name: "Womens Lehenga Choli",
      slug: "womens-lehenga-choli",
      displayName: "Lehenga Choli"
    },
    {
      name: "Womens Gown",
      slug: "womens-gown",
      displayName: "Gowns"
    },
    {
      name: "Womens Skirts",
      slug: "womens-skirts",
      displayName: "Skirts"
    },
    {
      name: "Womens Sarees",
      slug: "womens-sarees",
      displayName: "Sarees"
    }
  ],
  kids: [
    {
      name: "Kidswear",
      slug: "kidswear", 
      displayName: "Kids"
    }
  ]
};