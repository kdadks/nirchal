import React from 'react';

interface ProductSpecificationsProps {
  specifications: { [key: string]: string };
}

const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({ specifications }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Specifications</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(specifications).map(([key, value]) => (
          <div key={key} className="flex border-b pb-2">
            <span className="font-medium w-1/2 text-gray-600">{key}</span>
            <span className="w-1/2">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSpecifications;