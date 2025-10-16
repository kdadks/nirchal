import React, { useState, useEffect } from 'react';
import { Sparkles, X, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { getCartAddOnSuggestions, formatPriceRange, AddOnItem, AddOnSuggestion } from '../utils/cartAddOns';
import { useCart } from '../contexts/CartContext';
import { usePublicProducts } from '../hooks/usePublicProducts';
import toast from 'react-hot-toast';
import type { Product } from '../types';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantId?: string;
  size?: string;
  color?: string;
  category?: string;
}

interface CartAddOnsProps {
  cartItems: CartItem[];
}

const CartAddOns: React.FC<CartAddOnsProps> = ({ cartItems }) => {
  const [suggestions, setSuggestions] = useState<AddOnSuggestion[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedService, setSelectedService] = useState<AddOnItem | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const addOnSuggestions = getCartAddOnSuggestions(cartItems);
    setSuggestions(addOnSuggestions);
    
    // Auto-expand if there are suggestions
    if (addOnSuggestions.length > 0) {
      setIsExpanded(true);
    }
  }, [cartItems]);

  if (suggestions.length === 0) {
    return null;
  }

  const handleServiceClick = (item: AddOnItem) => {
    // For Faal & Pico service with only 1 relevant item, add directly without modal
    if (item.id === 'faal-pico') {
      const triggerCategory = suggestions.find(s => s.suggestions.some(sug => sug.id === 'faal-pico'))?.triggerCategory || 'Sarees';
      const relevantItems = cartItems.filter(cartItem => {
        if (!cartItem.category) return false;
        const itemCategoryLower = cartItem.category.toLowerCase();
        const triggerLower = triggerCategory.toLowerCase();
        const triggerSingular = triggerCategory.slice(0, -1).toLowerCase();
        
        return itemCategoryLower.includes(triggerLower) || 
               itemCategoryLower.includes(triggerSingular) ||
               itemCategoryLower === triggerLower ||
               itemCategoryLower === triggerSingular;
      });

      if (relevantItems.length === 1) {
        const selectedItem = relevantItems[0];
        addToCart({
          id: `faal-pico-${selectedItem.id}-${Date.now()}`,
          name: 'Faal & Pico Service',
          price: 150,
          image: selectedItem.image,
          size: 'Service',
          color: 'Standard finishing'
        });
        toast.success('Faal & Pico service added to cart!');
        return;
      }
    }

    setSelectedService(item);
  };

  const closeServiceModal = () => {
    setSelectedService(null);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-purple-100/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-semibold text-gray-900">Complete Your Look</h3>
            <span className="px-1.5 py-0.5 bg-purple-600 text-white text-xs rounded-full">
              {suggestions.reduce((acc, s) => acc + s.suggestions.length, 0)}
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="p-2.5 pt-0 space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {suggestion.suggestions.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg border border-gray-200 p-2.5 hover:shadow-md hover:border-purple-300 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <span className="text-xl">{item.icon}</span>
                        {item.type === 'service' && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Service
                          </span>
                        )}
                        {item.type === 'custom' && (
                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                            Custom
                          </span>
                        )}
                      </div>

                      <h4 className="font-semibold text-gray-900 mb-0.5 text-xs">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-purple-600">
                          {formatPriceRange(item.priceRange, item.price)}
                        </span>

                        <button
                          onClick={() => handleServiceClick(item)}
                          className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          {item.type === 'product' ? 'Browse' : 'Add'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="text-center text-xs text-gray-500 pt-1">
              💡 Add complementary items to save on styling time
            </div>
          </div>
        )}
      </div>

      {/* Service/Product Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[10010] flex items-center justify-center p-4">
          <div className={`bg-white rounded-lg w-full max-h-[90vh] overflow-y-auto relative z-[10011] ${
            selectedService.id === 'faal-pico' ? 'max-w-lg' : 'max-w-3xl'
          }`}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-3 flex items-center justify-between z-[10012]">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedService.icon}</span>
                <h3 className="text-sm font-semibold text-gray-900">{selectedService.title}</h3>
              </div>
              <button
                onClick={closeServiceModal}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-600 mb-3">{selectedService.description}</p>

              {/* Faal & Pico - Auto-add service */}
              {selectedService.type === 'service' && selectedService.id === 'faal-pico' && (
                <FaalPicoService 
                  cartItems={cartItems}
                  triggerCategory={suggestions.find(s => s.suggestions.some(item => item.id === 'faal-pico'))?.triggerCategory || 'Sarees'}
                  onClose={closeServiceModal}
                  addToCart={addToCart}
                />
              )}

              {/* Ready-made Blouse - Product Selection Modal */}
              {selectedService.id === 'ready-blouse' && (
                <ProductSelectionModal
                  category="Blouses"
                  onClose={closeServiceModal}
                  addToCart={addToCart}
                />
              )}

              {/* Custom Blouse - Measurement Form */}
              {selectedService.id === 'custom-blouse' && (
                <CustomBlouseForm 
                  cartItems={cartItems}
                  triggerCategory={suggestions.find(s => s.suggestions.some(item => item.id === 'custom-blouse'))?.triggerCategory || 'Sarees'}
                  onClose={closeServiceModal}
                  addToCart={addToCart}
                />
              )}

              {/* Jewelry - Product Selection */}
              {selectedService.id === 'jewelry' && (
                <ProductSelectionModal
                  category="Jewelry"
                  onClose={closeServiceModal}
                  addToCart={addToCart}
                />
              )}

              {/* Petticoat - Product Selection */}
              {selectedService.id === 'petticoat' && (
                <ProductSelectionModal
                  category="Petticoats"
                  onClose={closeServiceModal}
                  addToCart={addToCart}
                />
              )}

              {/* Dupatta - Product Selection */}
              {selectedService.id === 'dupatta' && (
                <ProductSelectionModal
                  category="Dupattas"
                  onClose={closeServiceModal}
                  addToCart={addToCart}
                />
              )}

              {/* Custom Stitching */}
              {selectedService.type === 'custom' && selectedService.id.includes('stitching') && (
                <CustomStitchingForm
                  cartItems={cartItems}
                  onClose={closeServiceModal}
                  addToCart={addToCart}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Faal & Pico Auto-Add Service
const FaalPicoService: React.FC<{ 
  cartItems: CartItem[];
  triggerCategory: string;
  onClose: () => void;
  addToCart: (item: any) => void;
}> = ({ cartItems, triggerCategory, onClose, addToCart }) => {
  const [notes, setNotes] = useState('');

  // Get all relevant items based on trigger category - using actual product category from database
  // Use flexible matching to handle categories like "Womens Sarees", "Designer Sarees", etc.
  const relevantItems = cartItems.filter(item => {
    if (!item.category) return false;
    const itemCategoryLower = item.category.toLowerCase();
    const triggerLower = triggerCategory.toLowerCase();
    const triggerSingular = triggerCategory.slice(0, -1).toLowerCase();
    
    return itemCategoryLower.includes(triggerLower) || 
           itemCategoryLower.includes(triggerSingular) ||
           itemCategoryLower === triggerLower ||
           itemCategoryLower === triggerSingular;
  });

  // For dropdown selection when multiple items
  const [selectedItemId, setSelectedItemId] = useState<string>(relevantItems[0]?.id || '');
  const selectedItem = relevantItems.find(item => item.id === selectedItemId) || relevantItems[0];

  const itemTypeName = triggerCategory.slice(0, -1).toLowerCase(); // "Sarees" -> "saree"

  const handleAdd = () => {
    if (!selectedItem) {
      toast.error(`Please add a ${itemTypeName} to your cart first`);
      onClose();
      return;
    }

    addToCart({
      id: `faal-pico-${selectedItem.id}-${Date.now()}`,
      name: 'Faal & Pico Service',
      price: 150,
      image: selectedItem.image,
      size: 'Service',
      color: notes || 'Standard finishing'
    });

    toast.success('Faal & Pico service added to cart!');
    onClose();
  };

  if (!selectedItem) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-600 mb-3">No {itemTypeName} found in cart. Please add a {itemTypeName} first.</p>
        <button
          onClick={onClose}
          className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Show dropdown if multiple items, otherwise show auto-selected item */}
      {relevantItems.length > 1 ? (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Select {triggerCategory.slice(0, -1)} for Service
          </label>
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {relevantItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5">
          <h4 className="text-xs font-semibold text-gray-900 mb-1.5">Selected {triggerCategory.slice(0, -1)}</h4>
          <div className="flex items-center gap-2">
            <img src={selectedItem.image} alt={selectedItem.name} className="w-12 h-12 object-cover rounded flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 break-words">{selectedItem.name}</p>
              <p className="text-xs text-gray-600">Auto-selected from cart</p>
            </div>
          </div>
        </div>
      )}

      {/* Show selected item preview */}
      {relevantItems.length > 1 && selectedItem && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5">
          <h4 className="text-xs font-semibold text-gray-900 mb-1.5">Service Preview</h4>
          <div className="flex items-center gap-2">
            <img src={selectedItem.image} alt={selectedItem.name} className="w-12 h-12 object-cover rounded flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 break-words">{selectedItem.name}</p>
              <p className="text-xs text-gray-600">Faal & Pico Service - ₹150</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Special Instructions (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any specific requirements for finishing..."
          rows={2}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-md p-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-700">Service Charge:</span>
          <span className="font-semibold text-green-600">₹150</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleAdd}
          className="flex-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

// Product Selection Modal
const ProductSelectionModal: React.FC<{
  category: string;
  onClose: () => void;
  addToCart: (item: any) => void;
}> = ({ category, onClose, addToCart }) => {
  const { products, loading } = usePublicProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const filteredProducts = products.filter(p => 
    p.category?.toLowerCase() === category.toLowerCase()
  );

  const handleAddToCart = () => {
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    addToCart({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image: selectedProduct.images?.[0] || '',
      size: selectedSize || selectedProduct.sizes?.[0] || 'One Size',
      color: selectedColor || selectedProduct.colors?.[0] || 'Default'
    });

    toast.success(`${selectedProduct.name} added to cart!`);
    onClose();
  };

  if (loading) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-sm text-gray-600 mt-3">Loading {category}...</p>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-600 mb-3">No {category} available at the moment.</p>
        <button
          onClick={onClose}
          className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-80 overflow-y-auto p-0.5">
        {filteredProducts.slice(0, 12).map((product) => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            className={`border-2 rounded-lg p-2 cursor-pointer transition-all ${
              selectedProduct?.id === product.id
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <img
              src={product.images?.[0] || ''}
              alt={product.name}
              className="w-full h-24 object-cover rounded mb-1.5"
            />
            <h4 className="font-semibold text-xs text-gray-900 line-clamp-2 mb-0.5">
              {product.name}
            </h4>
            <p className="text-purple-600 text-xs font-bold">₹{product.price.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="border-t pt-2.5 space-y-2.5">
          <h4 className="text-sm font-semibold text-gray-900">Selected: {selectedProduct.name}</h4>
          
          {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Size</label>
              <div className="flex flex-wrap gap-1.5">
                {selectedProduct.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-2.5 py-1 border rounded text-xs ${
                      selectedSize === size
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedProduct.variants && selectedProduct.variants.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Color</label>
              <div className="flex flex-wrap gap-1.5">
                {selectedProduct.variants
                  .filter((variant, index, self) => 
                    variant.color && self.findIndex(v => v.color === variant.color) === index
                  )
                  .map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedColor(variant.color || '')}
                      className={`relative border-2 rounded overflow-hidden transition-all ${
                        selectedColor === variant.color
                          ? 'border-purple-600 ring-2 ring-purple-300'
                          : 'border-gray-300 hover:border-purple-400'
                      }`}
                      title={variant.color}
                    >
                      {variant.swatchImage ? (
                        <img
                          src={variant.swatchImage}
                          alt={variant.color}
                          className="w-10 h-10 object-cover"
                        />
                      ) : variant.colorHex ? (
                        <div
                          className="w-10 h-10"
                          style={{ backgroundColor: variant.colorHex }}
                        />
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center bg-gray-100 text-xs text-gray-600 p-1 text-center">
                          {variant.color}
                        </div>
                      )}
                      {selectedColor === variant.color && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-2.5 border-t">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!selectedProduct}
          className="flex-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

// Custom Stitching Form
const CustomStitchingForm: React.FC<{
  cartItems: CartItem[];
  onClose: () => void;
  addToCart: (item: any) => void;
}> = ({ cartItems, onClose, addToCart }) => {
  const [selectedItem, setSelectedItem] = useState('');
  const [measurements, setMeasurements] = useState({
    bust: '',
    waist: '',
    hips: '',
    length: '',
  });
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const item = cartItems.find(i => i.id === selectedItem);
    if (!item) return;

    const measurementText = `Bust: ${measurements.bust}", Waist: ${measurements.waist}", Hips: ${measurements.hips}", Length: ${measurements.length}"`;
    
    addToCart({
      id: `stitching-${item.id}-${Date.now()}`,
      name: 'Custom Stitching Service',
      price: 1499,
      image: item.image,
      size: 'Custom',
      color: measurementText + (notes ? ` | Notes: ${notes}` : '')
    });

    toast.success('Custom stitching service added to cart!');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Select Item from Cart
        </label>
        <select
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        >
          <option value="">Choose an item...</option>
          {cartItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Bust (inches)</label>
          <input
            type="number"
            step="0.5"
            value={measurements.bust}
            onChange={(e) => setMeasurements({ ...measurements, bust: e.target.value })}
            placeholder="36"
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Waist (inches)</label>
          <input
            type="number"
            step="0.5"
            value={measurements.waist}
            onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
            placeholder="30"
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Hips (inches)</label>
          <input
            type="number"
            step="0.5"
            value={measurements.hips}
            onChange={(e) => setMeasurements({ ...measurements, hips: e.target.value })}
            placeholder="38"
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Length (inches)</label>
          <input
            type="number"
            step="0.5"
            value={measurements.length}
            onChange={(e) => setMeasurements({ ...measurements, length: e.target.value })}
            placeholder="42"
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Design Preferences</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe your design preferences..."
          rows={2}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-md p-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-700">Stitching Charges:</span>
          <span className="font-semibold text-purple-600">₹1,499</span>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </form>
  );
};

// Custom Blouse Form
const CustomBlouseForm: React.FC<{
  cartItems: CartItem[];
  triggerCategory: string;
  onClose: () => void;
  addToCart: (item: any) => void;
}> = ({ cartItems, triggerCategory, onClose, addToCart }) => {
  const [blouseDesign, setBlouseDesign] = useState('');
  const [measurements, setMeasurements] = useState({
    bust: '',
    waist: '',
    shoulder: '',
    sleeveLength: '',
  });
  const [fabricChoice, setFabricChoice] = useState('');
  const [notes, setNotes] = useState('');

  // Get all relevant items based on trigger category - using actual product category from database
  // Use flexible matching to handle categories like "Womens Sarees", "Designer Sarees", etc.
  const relevantItems = cartItems.filter(item => {
    if (!item.category) return false;
    const itemCategoryLower = item.category.toLowerCase();
    const triggerLower = triggerCategory.toLowerCase();
    const triggerSingular = triggerCategory.slice(0, -1).toLowerCase();
    
    return itemCategoryLower.includes(triggerLower) || 
           itemCategoryLower.includes(triggerSingular) ||
           itemCategoryLower === triggerLower ||
           itemCategoryLower === triggerSingular;
  });

  // For dropdown selection when multiple items
  const [selectedItemId, setSelectedItemId] = useState<string>(relevantItems[0]?.id || '');
  const selectedItem = relevantItems.find(item => item.id === selectedItemId) || relevantItems[0];

  const itemTypeName = triggerCategory.slice(0, -1).toLowerCase(); // "Sarees" -> "saree"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem) {
      toast.error(`No ${itemTypeName} found in cart`);
      return;
    }

    const measurementText = `Bust: ${measurements.bust}", Waist: ${measurements.waist}", Shoulder: ${measurements.shoulder}", Sleeve: ${measurements.sleeveLength}"`;
    const detailsText = `Design: ${blouseDesign} | Fabric: ${fabricChoice} | ${measurementText}${notes ? ` | Notes: ${notes}` : ''}`;
    
    addToCart({
      id: `custom-blouse-${selectedItem.id}-${Date.now()}`,
      name: 'Custom Blouse Stitching Service',
      price: 1299,
      image: selectedItem.image,
      size: 'Custom',
      color: detailsText
    });

    toast.success('Custom blouse added to cart!');
    onClose();
  };

  if (!selectedItem) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-600 mb-3">No {itemTypeName} found in cart. Please add a {itemTypeName} first.</p>
        <button
          onClick={onClose}
          className="px-4 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      {/* Show dropdown if multiple items, otherwise show auto-selected item */}
      {relevantItems.length > 1 ? (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Select {triggerCategory.slice(0, -1)} for Custom Blouse
          </label>
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {relevantItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5">
          <h4 className="text-xs font-semibold text-gray-900 mb-1.5">Selected {triggerCategory.slice(0, -1)}</h4>
          <div className="flex items-center gap-2">
            <img src={selectedItem.image} alt={selectedItem.name} className="w-12 h-12 object-cover rounded" />
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedItem.name}</p>
              <p className="text-xs text-gray-600">Auto-selected from cart</p>
            </div>
          </div>
        </div>
      )}

      {/* Show selected item preview when dropdown is used */}
      {relevantItems.length > 1 && selectedItem && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5">
          <h4 className="text-xs font-semibold text-gray-900 mb-1.5">Custom Blouse Preview</h4>
          <div className="flex items-center gap-2">
            <img src={selectedItem.image} alt={selectedItem.name} className="w-12 h-12 object-cover rounded" />
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedItem.name}</p>
              <p className="text-xs text-gray-600">Custom Stitched Blouse - ₹1,299</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Blouse Design</label>
        <select
          value={blouseDesign}
          onChange={(e) => setBlouseDesign(e.target.value)}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        >
          <option value="">Select design...</option>
          <option value="Simple Round Neck">Simple Round Neck</option>
          <option value="Boat Neck">Boat Neck</option>
          <option value="Sweetheart Neck">Sweetheart Neck</option>
          <option value="Backless">Backless</option>
          <option value="Designer Custom">Designer (Custom)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Fabric Preference</label>
        <select
          value={fabricChoice}
          onChange={(e) => setFabricChoice(e.target.value)}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        >
          <option value="">Select fabric...</option>
          <option value="Cotton">Cotton</option>
          <option value="Silk">Silk</option>
          <option value="Brocade">Brocade</option>
          <option value="Velvet">Velvet</option>
          <option value="Matching Saree Fabric">Matching Saree Fabric</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Bust (inches)</label>
          <input
            type="number"
            step="0.5"
            value={measurements.bust}
            onChange={(e) => setMeasurements({ ...measurements, bust: e.target.value })}
            placeholder="36"
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Waist (inches)</label>
          <input
            type="number"
            step="0.5"
            value={measurements.waist}
            onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
            placeholder="30"
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Shoulder (inches)</label>
          <input
            type="number"
            step="0.5"
            value={measurements.shoulder}
            onChange={(e) => setMeasurements({ ...measurements, shoulder: e.target.value })}
            placeholder="15"
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Sleeve Length</label>
          <input
            type="number"
            step="0.5"
            value={measurements.sleeveLength}
            onChange={(e) => setMeasurements({ ...measurements, sleeveLength: e.target.value })}
            placeholder="12"
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Additional Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special requirements..."
          rows={2}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-md p-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-700">Blouse Stitching:</span>
          <span className="font-semibold text-purple-600">₹1,299</span>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </form>
  );
};

export default CartAddOns;
