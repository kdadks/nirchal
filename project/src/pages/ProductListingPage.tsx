import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Grid, List, SlidersHorizontal } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { products } from '../data/mockData';
import ProductCard from '../components/product/ProductCard';
import ProductFilters from '../components/product/ProductFilters';
import ProductSort from '../components/product/ProductSort';
import { Product } from '../types';

type Filters = {
  priceRange: [number, number];
  categories: string[];
  ratings: number[];
  availability: string[];
};

const ProductListingPage: React.FC = () => {
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isGridView, setIsGridView] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Filters>({
    priceRange: [0, 50000],
    categories: [],
    ratings: [],
    availability: []
  });
  const [sortOption, setSortOption] = useState('featured');

  const ITEMS_PER_PAGE = 12;

  const filterProducts = useCallback((products: Product[]) => {
    return products.filter(product => {
      const priceInRange = product.price >= selectedFilters.priceRange[0] && 
                          product.price <= selectedFilters.priceRange[1];
      
      const categoryMatch = selectedFilters.categories.length === 0 || 
                          selectedFilters.categories.includes(product.category);
      
      const ratingMatch = selectedFilters.ratings.length === 0 || 
                         selectedFilters.ratings.includes(Math.floor(product.rating));
      
      const availabilityMatch = selectedFilters.availability.length === 0 || 
                               selectedFilters.availability.includes(product.stockStatus);

      return priceInRange && categoryMatch && ratingMatch && availabilityMatch;
    });
  }, [selectedFilters]);

  const sortProducts = useCallback((products: Product[]) => {
    const sortedProducts = [...products];
    switch (sortOption) {
      case 'price-low':
        return sortedProducts.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sortedProducts.sort((a, b) => b.price - a.price);
      case 'newest':
        return sortedProducts.sort((a, b) => (a.isNew === b.isNew) ? 0 : a.isNew ? -1 : 1);
      case 'rating':
        return sortedProducts.sort((a, b) => b.rating - a.rating);
      default:
        return sortedProducts.sort((a, b) => (a.isFeatured === b.isFeatured) ? 0 : a.isFeatured ? -1 : 1);
    }
  }, [sortOption]);

  const loadMoreProducts = useCallback(() => {
    const filteredProducts = filterProducts(products);
    const sortedProducts = sortProducts(filteredProducts);
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = page * ITEMS_PER_PAGE;
    const newProducts = sortedProducts.slice(start, end);

    if (page === 1) {
      setDisplayProducts(newProducts);
    } else {
      setDisplayProducts(prev => [...prev, ...newProducts]);
    }

    setHasMore(end < sortedProducts.length);
    setPage(prev => prev + 1);
  }, [filterProducts, sortProducts, page]);

  useEffect(() => {
    setPage(1);
    loadMoreProducts();
  }, [selectedFilters, sortOption, loadMoreProducts]);

  return (
    <div className="min-h-screen pt-24">
      <Helmet>
        <title>All Products - Nirchal</title>
        <meta name="description" content="Browse our complete collection of premium Indian ethnic wear" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2">
              All Products
            </h1>
            <p className="text-gray-600">
              {displayProducts.length} products found
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center space-x-2 text-gray-600"
            >
              <SlidersHorizontal size={20} />
              <span>Filters</span>
            </button>

            <ProductSort value={sortOption} onChange={setSortOption} />

            <div className="hidden md:flex items-center space-x-2 border-l pl-4">
              <button
                onClick={() => setIsGridView(true)}
                className={`p-2 rounded-md ${isGridView ? 'bg-primary-50 text-primary-600' : 'text-gray-400'}`}
                aria-label="Grid view"
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setIsGridView(false)}
                className={`p-2 rounded-md ${!isGridView ? 'bg-primary-50 text-primary-600' : 'text-gray-400'}`}
                aria-label="List view"
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters */}
          <div className={`md:w-64 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <ProductFilters
              filters={selectedFilters}
              onChange={setSelectedFilters}
            />
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <InfiniteScroll
              dataLength={displayProducts.length}
              next={loadMoreProducts}
              hasMore={hasMore}
              loader={<div className="text-center py-4">Loading more products...</div>}
              endMessage={<div className="text-center py-4">No more products to load.</div>}
            >
              <div className={`grid ${
                isGridView 
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                  : 'grid-cols-1'
              } gap-6`}>
                {displayProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;