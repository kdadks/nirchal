import { Product, Category } from '../types';

export const categories: Category[] = [
  {
    id: 'sarees',
    name: 'Sarees',
    image: 'https://images.pexels.com/photos/8369048/pexels-photo-8369048.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Elegant sarees for every occasion',
    featured: true
  },
  {
    id: 'lehengas',
    name: 'Lehengas',
    image: 'https://images.pexels.com/photos/2836486/pexels-photo-2836486.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Stunning lehengas for celebrations',
    featured: true
  },
  {
    id: 'suits',
    name: 'Salwar Suits',
    image: 'https://images.pexels.com/photos/4124201/pexels-photo-4124201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Comfortable and stylish suits',
    featured: true
  },
  {
    id: 'kurtis',
    name: 'Kurtis',
    image: 'https://images.pexels.com/photos/8396651/pexels-photo-8396651.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Modern kurtis for everyday wear',
    featured: true
  },
  {
    id: 'gowns',
    name: 'Gowns',
    image: 'https://images.pexels.com/photos/2916814/pexels-photo-2916814.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Elegant gowns for special occasions',
    featured: false
  },
  {
    id: 'accessories',
    name: 'Accessories',
    image: 'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Beautiful accessories to complete your look',
    featured: false
  }
];

export const occasions = [
  'Wedding', 'Festival', 'Casual', 'Party', 'Office', 'Traditional'
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Banarasi Silk Saree',
    price: 12999,
    originalPrice: 15999,
    discountPercentage: 18,
    images: [
      'https://images.pexels.com/photos/8369048/pexels-photo-8369048.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/8396886/pexels-photo-8396886.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'sarees',
    subcategory: 'silk',
    occasion: ['Wedding', 'Festival'],
    fabric: 'Banarasi Silk',
    color: 'Red',
    sizes: ['Free Size'],
    description: 'Handcrafted Banarasi silk saree with intricate gold zari work, perfect for weddings and special occasions. This timeless piece showcases traditional craftsmanship with a modern touch.',
    isFeatured: true,
    isNew: false,
    rating: 4.8,
    reviewCount: 125,
    stockStatus: 'In Stock',
    specifications: {
      'Material': 'Pure Banarasi Silk',
      'Length': '6.3 meters',
      'Width': '45 inches',
      'Weight': '900 grams',
      'Care': 'Dry clean only',
      'Blouse': 'Unstitched blouse piece included'
    },
    reviews: [
      {
        id: '1',
        userId: 'user1',
        userName: 'Priya Singh',
        rating: 5,
        comment: 'Beautiful saree! The quality is excellent and the zari work is stunning.',
        createdAt: '2025-04-15T10:30:00Z',
        helpful: 12,
        images: ['https://example.com/review1.jpg']
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Meera Patel',
        rating: 4,
        comment: 'Very good quality, but slightly heavy to wear for long duration.',
        createdAt: '2025-04-10T15:20:00Z',
        helpful: 8
      }
    ]
  },
  {
    id: '2',
    name: 'Designer Wedding Lehenga',
    price: 28999,
    originalPrice: 34999,
    discountPercentage: 17,
    images: [
      'https://images.pexels.com/photos/2064507/pexels-photo-2064507.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/2836486/pexels-photo-2836486.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'lehengas',
    subcategory: 'bridal',
    occasion: ['Wedding'],
    fabric: 'Velvet',
    color: 'Maroon',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Luxurious velvet lehenga with heavy embroidery and stone work. Comes with a designer blouse and matching dupatta. Perfect for the bride who wants to make a statement.',
    isFeatured: true,
    isNew: true,
    rating: 4.9,
    reviewCount: 87,
    stockStatus: 'In Stock',
    specifications: {
      'Material': 'Velvet with Net Dupatta',
      'Style': 'Semi-stitched',
      'Blouse': 'Included with heavy embroidery',
      'Length': 'Floor length',
      'Weight': '2.5 kg',
      'Care': 'Dry clean only'
    },
    reviews: [
      {
        id: '3',
        userId: 'user3',
        userName: 'Anjali Sharma',
        rating: 5,
        comment: 'Perfect for wedding! Got so many compliments.',
        createdAt: '2025-05-01T09:15:00Z',
        helpful: 15,
        images: ['https://example.com/review3.jpg', 'https://example.com/review4.jpg']
      }
    ]
  },
  {
    id: '3',
    name: 'Embroidered Anarkali Suit',
    price: 7999,
    originalPrice: 9999,
    discountPercentage: 20,
    images: [
      'https://images.pexels.com/photos/13009871/pexels-photo-13009871.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/4124201/pexels-photo-4124201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'suits',
    subcategory: 'anarkali',
    occasion: ['Festival', 'Party'],
    fabric: 'Georgette',
    color: 'Teal',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Stunning floor-length Anarkali suit with intricate embroidery and a flowing silhouette. Includes matching bottom and dupatta. Perfect for festive occasions and celebrations.',
    isFeatured: true,
    isNew: false,
    rating: 4.7,
    reviewCount: 154,
    stockStatus: 'Low Stock',
    specifications: {
      'Material': 'Georgette',
      'Style': 'Floor length',
      'Set Includes': 'Kurta, Bottom, Dupatta',
      'Length': '58 inches',
      'Care': 'Dry clean recommended'
    },
    reviews: [
      {
        id: '4',
        userId: 'user4',
        userName: 'Ritu Kapoor',
        rating: 5,
        comment: 'The embroidery work is exquisite. Perfect fit!',
        createdAt: '2025-04-28T14:20:00Z',
        helpful: 10
      }
    ]
  },
  {
    id: '4',
    name: 'Printed Cotton Kurti',
    price: 1499,
    originalPrice: 1999,
    discountPercentage: 25,
    images: [
      'https://images.pexels.com/photos/14622875/pexels-photo-14622875.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/8396651/pexels-photo-8396651.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'kurtis',
    subcategory: 'casual',
    occasion: ['Casual', 'Office'],
    fabric: 'Cotton',
    color: 'Blue',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description: 'Comfortable cotton kurti with traditional block prints. Perfect for everyday wear and casual outings. Can be paired with jeans, leggings, or palazzos for a versatile look.',
    isFeatured: false,
    isNew: true,
    rating: 4.5,
    reviewCount: 210,
    stockStatus: 'In Stock',
    specifications: {
      'Material': '100% Cotton',
      'Length': '44 inches',
      'Neck Type': 'Round Neck',
      'Sleeve': 'Three-Quarter',
      'Care': 'Machine wash'
    },
    reviews: [
      {
        id: '5',
        userId: 'user5',
        userName: 'Neha Gupta',
        rating: 4,
        comment: 'Comfortable for daily wear. Good quality cotton.',
        createdAt: '2025-05-05T11:30:00Z',
        helpful: 7
      }
    ]
  },
  {
    id: '5',
    name: 'Designer Indo-Western Gown',
    price: 9999,
    originalPrice: 12999,
    discountPercentage: 23,
    images: [
      'https://images.pexels.com/photos/973401/pexels-photo-973401.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/2916814/pexels-photo-2916814.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'gowns',
    subcategory: 'indo-western',
    occasion: ['Party', 'Wedding'],
    fabric: 'Satin',
    color: 'Wine',
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Elegant indo-western gown featuring a fusion of traditional embroidery on a modern silhouette. Perfect for cocktail parties, receptions, and evening events.',
    isFeatured: false,
    isNew: true,
    rating: 4.6,
    reviewCount: 78,
    stockStatus: 'In Stock',
    specifications: {
      'Material': 'Satin with Net',
      'Style': 'A-line',
      'Length': 'Floor length',
      'Sleeves': 'Full sleeves',
      'Care': 'Dry clean only'
    },
    reviews: [
      {
        id: '6',
        userId: 'user6',
        userName: 'Anita Desai',
        rating: 5,
        comment: 'Stunning design! Perfect for cocktail parties.',
        createdAt: '2025-05-10T16:45:00Z',
        helpful: 9
      }
    ]
  },
  {
    id: '6',
    name: 'Kundan Jewelry Set',
    price: 4999,
    originalPrice: 6999,
    discountPercentage: 28,
    images: [
      'https://images.pexels.com/photos/230290/pexels-photo-230290.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'accessories',
    subcategory: 'jewelry',
    occasion: ['Wedding', 'Festival'],
    fabric: undefined,
    color: 'Gold',
    sizes: ['Free Size'],
    description: 'Exquisite Kundan jewelry set including necklace, earrings, and maang tikka. Adorned with pearls and colored stones for a traditional yet contemporary look.',
    isFeatured: true,
    isNew: false,
    rating: 4.8,
    reviewCount: 92,
    stockStatus: 'In Stock',
    specifications: {
      'Material': 'Kundan, Pearls',
      'Set Includes': 'Necklace, Earrings, Maang Tikka',
      'Plating': '22K Gold',
      'Stone Type': 'Artificial Kundan',
      'Care': 'Store in jewelry box'
    },
    reviews: [
      {
        id: '7',
        userId: 'user7',
        userName: 'Pooja Verma',
        rating: 5,
        comment: 'Absolutely gorgeous set! Looks very premium.',
        createdAt: '2025-05-12T13:20:00Z',
        helpful: 11
      }
    ]
  },
  {
    id: '7',
    name: 'Patola Silk Saree',
    price: 19999,
    originalPrice: 24999,
    discountPercentage: 20,
    images: [
      'https://images.pexels.com/photos/7681528/pexels-photo-7681528.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/8396925/pexels-photo-8396925.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'sarees',
    subcategory: 'patola',
    occasion: ['Wedding', 'Traditional'],
    fabric: 'Patola Silk',
    color: 'Green',
    sizes: ['Free Size'],
    description: 'Handwoven Patola silk saree with traditional geometric patterns. This heritage piece showcases the exquisite craftsmanship of Gujarat and is perfect for special occasions.',
    isFeatured: true,
    isNew: false,
    rating: 4.9,
    reviewCount: 65,
    stockStatus: 'Low Stock',
    specifications: {
      'Material': 'Patola Silk',
      'Length': '6.3 meters',
      'Width': '47 inches',
      'Weaving': 'Double Ikat',
      'Care': 'Dry clean only',
      'Blouse': 'Unstitched blouse piece included'
    },
    reviews: [
      {
        id: '8',
        userId: 'user8',
        userName: 'Shalini Mehta',
        rating: 5,
        comment: 'A masterpiece! The craftsmanship is outstanding.',
        createdAt: '2025-05-15T10:10:00Z',
        helpful: 14
      }
    ]
  },
  {
    id: '8',
    name: 'Zari Work Dupatta',
    price: 2999,
    originalPrice: 3999,
    discountPercentage: 25,
    images: [
      'https://images.pexels.com/photos/11650558/pexels-photo-11650558.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/5709665/pexels-photo-5709665.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'accessories',
    subcategory: 'dupatta',
    occasion: ['Festival', 'Party'],
    fabric: 'Chiffon',
    color: 'Turquoise',
    sizes: ['Free Size'],
    description: 'Beautiful chiffon dupatta with intricate zari work on the borders. Perfect to enhance your outfit for any festive or special occasion.',
    isFeatured: false,
    isNew: true,
    rating: 4.6,
    reviewCount: 82,
    stockStatus: 'In Stock',
    specifications: {
      'Material': 'Chiffon',
      'Length': '2.5 meters',
      'Width': '42 inches',
      'Border': 'Zari work',
      'Care': 'Dry clean recommended'
    },
    reviews: [
      {
        id: '9',
        userId: 'user9',
        userName: 'Kavita Reddy',
        rating: 4,
        comment: 'Beautiful dupatta, the zari work is very elegant.',
        createdAt: '2025-05-18T09:30:00Z',
        helpful: 6
      }
    ]
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