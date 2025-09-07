import React from 'react';
import { useOptimizedProducts } from '../../hooks/useOptimizedProducts';
import { useOptimizedInventory } from '../../hooks/useOptimizedInventory';
import { useOptimizedCategories } from '../../hooks/useOptimizedCategories';

const OptimizedAdminTest: React.FC = () => {
  const { products, loading: productsLoading, error: productsError } = useOptimizedProducts();
  const { inventory, loading: inventoryLoading, error: inventoryError } = useOptimizedInventory();
  const { categories, loading: categoriesLoading, error: categoriesError } = useOptimizedCategories();

  const totalLoading = productsLoading || inventoryLoading || categoriesLoading;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Optimized Admin Performance Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Products</h3>
          {productsLoading ? (
            <div className="text-blue-600">Loading...</div>
          ) : productsError ? (
            <div className="text-red-600">Error: {productsError}</div>
          ) : (
            <div className="text-green-600">
              ✓ Loaded {products.length} products
            </div>
          )}
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Inventory</h3>
          {inventoryLoading ? (
            <div className="text-green-600">Loading...</div>
          ) : inventoryError ? (
            <div className="text-red-600">Error: {inventoryError}</div>
          ) : (
            <div className="text-green-600">
              ✓ Loaded {inventory.length} inventory items
            </div>
          )}
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800 mb-2">Categories</h3>
          {categoriesLoading ? (
            <div className="text-purple-600">Loading...</div>
          ) : categoriesError ? (
            <div className="text-red-600">Error: {categoriesError}</div>
          ) : (
            <div className="text-green-600">
              ✓ Loaded {categories.length} categories
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Performance Status:</h4>
        {totalLoading ? (
          <div className="text-yellow-600">⏳ Loading data...</div>
        ) : (
          <div className="text-green-600">
            ✅ All data loaded successfully! 
            <div className="text-sm text-gray-600 mt-1">
              Check the browser console for performance timings.
            </div>
          </div>
        )}
      </div>

      {!totalLoading && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Sample Data:</h4>
          <div className="text-sm space-y-1">
            <div>First Product: {products[0]?.name || 'None'}</div>
            <div>First Inventory: {inventory[0]?.product_name || 'None'}</div>
            <div>First Category: {categories[0]?.name || 'None'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedAdminTest;
