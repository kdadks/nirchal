
import type { Category } from '../types/admin';

export const categories: Category[] = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
    name: 'Salwar Suits',
    slug: 'suits',
    description: 'Comfortable and stylish suits',
    parent_id: null,
    image_url: 'https://images.pexels.com/photos/4124201/pexels-photo-4124201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    is_active: true,
    created_at: '',
    updated_at: ''
  },
  {
    id: 4,
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
    id: 5,
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
    id: 6,
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