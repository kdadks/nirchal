import React from 'react';

type SortOrder = 'featured' | 'price-low' | 'price-high' | 'newest' | 'rating';

interface ProductSortProps {
  value: SortOrder;
  onChange: (value: SortOrder) => void;
}

const ProductSort: React.FC<ProductSortProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm text-gray-600">Sort by:</label>
      <select
        id="sort"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOrder)}
        className="border border-gray-300 rounded-md py-2 px-4 text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors duration-200"
      >
        <option value="featured">Featured</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
        <option value="newest">Newest First</option>
        <option value="rating">Highest Rated</option>
      </select>
    </div>
  );
};

export default ProductSort;