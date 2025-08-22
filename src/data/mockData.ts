
import type { Category } from '../types/admin';
import type { Product } from '../types';

export const categories: Category[] = [
  {
    id: '1',
    name: 'Sarees',
    slug: 'sarees',
    description: 'Elegant sarees for every occasion',
    parent_id: null,
    image_url: 'https://images.pexels.com/photos/8369048/pexels-photo-8369048.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    is_active: true,
    created_at: '',
    updated_at: ''
  },
  {
    id: '2',
    name: 'Lehengas',
    slug: 'lehengas',
    description: 'Stunning lehengas for celebrations',
    parent_id: null,
    image_url: 'https://images.pexels.com/photos/2836486/pexels-photo-2836486.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    is_active: true,
    created_at: '',
    updated_at: ''
  },
  {
    id: '3',
    name: 'Suits',
    slug: 'suits',
    description: 'Comfortable and stylish suits',
    parent_id: null,
    image_url: 'https://images.pexels.com/photos/4124201/pexels-photo-4124201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    is_active: true,
    created_at: '',
    updated_at: ''
  },
  {
    id: '4',
    name: 'Kurtis',
    slug: 'kurtis',
    description: 'Modern kurtis for everyday wear',
    parent_id: null,
    image_url: 'https://images.pexels.com/photos/8396651/pexels-photo-8396651.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    is_active: true,
    created_at: '',
    updated_at: ''
  },
  {
    id: '5',
    name: 'Gowns',
    slug: 'gowns',
    description: 'Elegant gowns for special occasions',
    parent_id: null,
    image_url: 'https://images.pexels.com/photos/2916814/pexels-photo-2916814.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    is_active: true,
    created_at: '',
    updated_at: ''
  },
  {
    id: '6',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Accessories for every look',
    parent_id: null,
    image_url: '',
    is_active: true,
    created_at: '',
    updated_at: ''
  }
];

// Mock products for demo
export const mockProducts: Product[] = [
  {
    id: "1",
    slug: "elegant-banarasi-silk-saree-red",
    name: "Elegant Banarasi Silk Saree",
    price: 24999,
    originalPrice: 32999,
    images: ["https://images.pexels.com/photos/8369048/pexels-photo-8369048.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1"],
    category: "Sarees",
    color: "Red",
    colors: ["Red", "Gold", "Maroon"],
    sizes: ["Free Size"],
    fabric: "Silk",
    description: "Handwoven Banarasi silk saree with intricate golden patterns and traditional motifs. Perfect for weddings and special occasions.",
    rating: 4.8,
    reviewCount: 156,
    stockStatus: "In Stock" as const,
    isFeatured: true,
    occasion: ["wedding", "festival"],
    reviews: [],
    variants: [
      {
        id: "1-red",
        color: "Red",
        size: "Free Size",
        priceAdjustment: 0,
        quantity: 10,
        variantType: "color" as const,
        swatchImageId: "red-swatch",
        swatchImage: "https://images.pexels.com/photos/8369048/pexels-photo-8369048.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1"
      },
      {
        id: "1-gold",
        color: "Gold",
        size: "Free Size",
        priceAdjustment: 5000,
        quantity: 8,
        variantType: "color" as const,
        swatchImageId: "gold-swatch",
        swatchImage: "https://images.pexels.com/photos/5308068/pexels-photo-5308068.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1"
      },
      {
        id: "1-maroon",
        color: "Maroon",
        size: "Free Size",
        priceAdjustment: 2000,
        quantity: 5,
        variantType: "color" as const,
        swatchImageId: "maroon-swatch",
        swatchImage: "https://images.pexels.com/photos/8369086/pexels-photo-8369086.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1"
      }
    ]
  },
  {
    id: "2",
    slug: "royal-lehenga-set-pink",
    name: "Royal Pink Lehenga Set",
    price: 45999,
    originalPrice: 58999,
    images: ["https://images.pexels.com/photos/2836486/pexels-photo-2836486.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1"],
    category: "Lehengas",
    color: "Pink",
    colors: ["Pink", "Red", "Maroon"],
    sizes: ["S", "M", "L", "XL"],
    fabric: "Georgette",
    description: "Traditional bridal lehenga with heavy embroidered details and mirror work. Includes blouse and dupatta.",
    rating: 4.9,
    reviewCount: 89,
    stockStatus: "In Stock" as const,
    isFeatured: true,
    occasion: ["wedding", "party"],
    reviews: [],
    variants: [
      {
        id: "2-pink",
        color: "Pink",
        size: "M",
        priceAdjustment: 0,
        quantity: 6,
        variantType: "color" as const,
        swatchImageId: "pink-swatch",
        swatchImage: "https://images.pexels.com/photos/2836486/pexels-photo-2836486.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1"
      },
      {
        id: "2-red",
        color: "Red",
        size: "M",
        priceAdjustment: 3000,
        quantity: 4,
        variantType: "color" as const,
        swatchImageId: "red-lehenga-swatch",
        swatchImage: "https://images.pexels.com/photos/8108016/pexels-photo-8108016.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1"
      },
      {
        id: "2-maroon",
        color: "Maroon",
        size: "M",
        priceAdjustment: 5000,
        quantity: 3,
        variantType: "color" as const,
        swatchImageId: "maroon-lehenga-swatch",
        swatchImage: "https://images.pexels.com/photos/9430748/pexels-photo-9430748.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1"
      }
    ]
  },
  {
    id: "3",
    slug: "designer-anarkali-suit-green",
    name: "Designer Anarkali Suit",
    price: 15999,
    originalPrice: 21999,
    images: ["https://images.pexels.com/photos/4124201/pexels-photo-4124201.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1"],
    category: "Suits",
    color: "Green",
    colors: ["Green", "Blue", "Purple"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    fabric: "Georgette",
    description: "Premium georgette anarkali with mirror work and embroidery. Perfect for festivals and parties.",
    rating: 4.7,
    reviewCount: 234,
    stockStatus: "In Stock" as const,
    occasion: ["festival", "party"],
    reviews: []
  },
  {
    id: "4",
    slug: "embroidered-sharara-set-yellow",
    name: "Embroidered Sharara Set",
    price: 18999,
    originalPrice: 24999,
    images: ["https://images.pexels.com/photos/8396651/pexels-photo-8396651.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1"],
    category: "Suits",
    color: "Yellow",
    colors: ["Yellow", "Orange", "Peach"],
    sizes: ["S", "M", "L", "XL"],
    fabric: "Cotton",
    description: "Contemporary sharara with traditional embroidery. Comfortable and stylish for all occasions.",
    rating: 4.8,
    reviewCount: 98,
    stockStatus: "In Stock" as const,
    occasion: ["casual", "party"],
    reviews: []
  },
  {
    id: "5",
    slug: "silk-kurti-blue",
    name: "Premium Silk Kurti",
    price: 3999,
    originalPrice: 5999,
    images: ["https://images.pexels.com/photos/8369048/pexels-photo-8369048.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1"],
    category: "Kurtis",
    color: "Blue",
    colors: ["Blue", "Navy", "Teal"],
    sizes: ["XS", "S", "M", "L", "XL"],
    fabric: "Silk",
    description: "Elegant silk kurti with subtle prints. Perfect for office wear and casual outings.",
    rating: 4.5,
    reviewCount: 67,
    stockStatus: "In Stock" as const,
    occasion: ["casual", "formal"],
    reviews: []
  },
  {
    id: "6",
    slug: "velvet-lehenga-maroon",
    name: "Velvet Bridal Lehenga",
    price: 65999,
    originalPrice: 89999,
    images: ["https://images.pexels.com/photos/2836486/pexels-photo-2836486.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1"],
    category: "Lehengas",
    color: "Maroon",
    colors: ["Maroon", "Burgundy", "Wine"],
    sizes: ["S", "M", "L", "XL"],
    fabric: "Velvet",
    description: "Luxurious velvet lehenga with heavy zardozi work. Perfect for grand weddings and receptions.",
    rating: 5.0,
    reviewCount: 23,
    stockStatus: "Low Stock" as const,
    isFeatured: true,
    occasion: ["wedding"],
    reviews: []
  },
  {
    id: "7",
    slug: "chiffon-saree-purple",
    name: "Chiffon Party Saree",
    price: 8999,
    originalPrice: 12999,
    images: ["https://images.pexels.com/photos/8369048/pexels-photo-8369048.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1"],
    category: "Sarees",
    color: "Purple",
    colors: ["Purple", "Lavender", "Violet"],
    sizes: ["Free Size"],
    fabric: "Chiffon",
    description: "Lightweight chiffon saree with sequin work. Ideal for cocktail parties and evening events.",
    rating: 4.4,
    reviewCount: 145,
    stockStatus: "In Stock" as const,
    occasion: ["party", "formal"],
    reviews: []
  },
  {
    id: "8",
    slug: "cotton-kurti-white",
    name: "Cotton Block Print Kurti",
    price: 1999,
    originalPrice: 2999,
    images: ["https://images.pexels.com/photos/8396651/pexels-photo-8396651.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1"],
    category: "Kurtis",
    color: "White",
    colors: ["White", "Cream", "Off-White"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    fabric: "Cotton",
    description: "Comfortable cotton kurti with traditional block prints. Perfect for daily wear and casual outings.",
    rating: 4.3,
    reviewCount: 278,
    stockStatus: "In Stock" as const,
    occasion: ["casual"],
    reviews: []
  }
];

export const heroSlides = [
  {
    id: 1,
    title: 'Exquisite Sarees Collection',
    subtitle: 'Handwoven silk sarees with intricate designs',
    image: 'https://images.pexels.com/photos/8369048/pexels-photo-8369048.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
    cta: 'Shop Sarees',
    link: '/products?category=sarees'
  },
  {
    id: 2,
    title: 'Designer Lehengas',
    subtitle: 'Regal lehengas for weddings and celebrations',
    image: 'https://images.pexels.com/photos/2836486/pexels-photo-2836486.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
    cta: 'Explore Lehengas',
    link: '/products?category=lehengas'
  },
  {
    id: 3,
    title: 'Elegant Gowns',
    subtitle: 'Contemporary gowns with traditional touch',
    image: 'https://images.pexels.com/photos/2916814/pexels-photo-2916814.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
    cta: 'View Gowns',
    link: '/products?category=gowns'
  },
  {
    id: 4,
    title: 'Festive Collection',
    subtitle: 'Perfect outfits for every celebration',
    image: 'https://images.pexels.com/photos/4124201/pexels-photo-4124201.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
    cta: 'Shop Festive',
    link: '/products'
  }
];