import React from 'react';

const ProductDetailAdminPage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Product Details & Edit</h1>
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Variants</h2>
        <div className="text-gray-500">(Variants management placeholder)</div>
      </div>
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Images</h2>
        <div className="text-gray-500">(Image upload/management placeholder)</div>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">SEO</h2>
        <div className="text-gray-500">(SEO fields placeholder)</div>
      </div>
    </div>
  );
};

export default ProductDetailAdminPage;
