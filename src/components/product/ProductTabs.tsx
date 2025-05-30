import React, { useState } from 'react';
import type { Product, ReviewFormData } from '../../types';
import ProductSpecifications from './ProductSpecifications';
import ProductReviews from './ProductReviews';

interface ProductTabsProps {
  product: Product;
  onAddReview: (formData: ReviewFormData) => void;
}

const ProductTabs: React.FC<ProductTabsProps> = ({ product, onAddReview }) => {
  const [activeTab, setActiveTab] = useState<'specifications' | 'reviews'>('specifications');

  const tabClasses = (isActive: boolean) =>
    `px-4 py-2 font-medium text-sm ${
      isActive
        ? 'text-primary-600 border-b-2 border-primary-600'
        : 'text-gray-500 hover:text-gray-700'
    }`;

  return (
    <div className="mt-8">
      <div className="border-b mb-4">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('specifications')}
            className={tabClasses(activeTab === 'specifications')}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={tabClasses(activeTab === 'reviews')}
          >
            Reviews ({product.reviews.length})
          </button>
        </div>
      </div>

      <div className="py-4">
        {activeTab === 'specifications' && product.specifications && (
          <ProductSpecifications specifications={product.specifications} />
        )}
        {activeTab === 'reviews' && (
          <ProductReviews 
            reviews={product.reviews} 
            onAddReview={onAddReview}
          />
        )}
      </div>
    </div>
  );
};

export default ProductTabs;