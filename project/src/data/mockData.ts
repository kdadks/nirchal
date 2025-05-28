import { Product, Category } from '../types';

export const categories: Category[] = [
  {
    id: 'sarees',
    name: 'Sarees',
    image: 'https://images.pexels.com/photos/8396886/pexels-photo-8396886.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Elegant sarees for every occasion',
    featured: true
  },
  {
    id: 'lehengas',
    name: 'Lehengas',
    image: 'https://images.pexels.com/photos/2064507/pexels-photo-2064507.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Stunning lehengas for celebrations',
    featured: true
  },
  {
    id: 'suits',
    name: 'Salwar Suits',
    image: 'https://images.pexels.com/photos/13009871/pexels-photo-13009871.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Comfortable and stylish suits',
    featured: true
  },
  {
    id: 'kurtis',
    name: 'Kurtis',
    image: 'https://images.pexels.com/photos/14622875/pexels-photo-14622875.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Modern kurtis for everyday wear',
    featured: true
  },
  {
    id: 'gowns',
    name: 'Gowns',
    image: 'https://images.pexels.com/photos/973401/pexels-photo-973401.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Elegant gowns for special occasions',
    featured: false
  },
  {
    id: 'accessories',
    name: 'Accessories',
    image: 'https://images.pexels.com/photos/230290/pexels-photo-230290.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
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
    stockStatus: 'In Stock'
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
    stockStatus: 'In Stock'
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
    stockStatus: 'Low Stock'
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
    stockStatus: 'In Stock'
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
    stockStatus: 'In Stock'
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
    fabric: null,
    color: 'Gold',
    sizes: ['Free Size'],
    description: 'Exquisite Kundan jewelry set including necklace, earrings, and maang tikka. Adorned with pearls and colored stones for a traditional yet contemporary look.',
    isFeatured: true,
    isNew: false,
    rating: 4.8,
    reviewCount: 92,
    stockStatus: 'In Stock'
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
    stockStatus: 'Low Stock'
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
    stockStatus: 'In Stock'
  }
];

export const heroSlides = [
  {
    id: 1,
    title: 'Wedding Collection 2025',
    subtitle: 'Exquisite bridal wear for your special day',
    image: 'https://images.pexels.com/photos/2064507/pexels-photo-2064507.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    cta: 'Explore Collection',
    link: '/category/lehengas'
  },
  {
    id: 2,
    title: 'Festive Season Sale',
    subtitle: 'Up to 30% off on select ethnic wear',
    image: 'https://images.pexels.com/photos/8369048/pexels-photo-8369048.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    cta: 'Shop Now',
    link: '/sale'
  },
  {
    id: 3,
    title: 'New Arrivals',
    subtitle: 'Discover the latest trends in Indian fashion',
    image: 'https://images.pexels.com/photos/973401/pexels-photo-973401.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    cta: 'View Collection',
    link: '/new-arrivals'
  }
];