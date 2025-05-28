import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/product/ProductCard';
import ProductFilters from '../components/product/ProductFilters';
import ProductSort from '../components/product/ProductSort';

const CategoryPage = () => {
  const { categoryId } = useParams();

  return (
    <>
      <Helmet>
        <title>{`Category: ${categoryId} | Your Store Name`}</title>
        <meta name="description" content={`Browse our ${categoryId} collection`} />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 capitalize">{categoryId?.replace('-', ' ')}</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-1/4">
            <ProductFilters />
          </div>
          
          {/* Product Grid */}
          <div className="w-full lg:w-3/4">
            <div className="mb-6">
              <ProductSort />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Product cards will be rendered here */}
              {/* This is a placeholder that would normally be populated with filtered products */}
              <ProductCard />
              <ProductCard />
              <ProductCard />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryPage;