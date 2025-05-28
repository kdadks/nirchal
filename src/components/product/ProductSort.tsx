import React from 'react';

interface ProductSortProps {
  value: string;
  onChange: (value: string) => void;
}

const ProductSort: React.FC<ProductSortProps> = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      <option value="featured">Featured</option>
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
      <option value="newest">Newest First</option>
      <option value="rating">Highest Rated</option>
    </select>
  );
};

export default ProductSort;