import React from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { CartItem as CartItemType } from '../../types';
import { useCart } from '../../contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity, size } = item;

  const incrementQuantity = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row border-b border-gray-200 py-4">
      {/* Product image */}
      <div className="w-full sm:w-24 h-24 flex-shrink-0 mb-4 sm:mb-0">
        <img 
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover rounded-md"
        />
      </div>
      
      {/* Product details */}
      <div className="flex-grow sm:ml-4">
        <div className="flex flex-wrap justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500">Size: {size}</p>
            <p className="text-sm text-gray-500">Color: {product.color}</p>
          </div>
          
          <div className="text-right">
            <p className="text-lg font-medium text-gray-900">₹{product.price.toLocaleString()}</p>
            {product.originalPrice && (
              <p className="text-sm text-gray-500 line-through">
                ₹{product.originalPrice.toLocaleString()}
              </p>
            )}
          </div>
        </div>
        
        {/* Quantity selector and remove button */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button 
              onClick={decrementQuantity}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
            >
              <Minus size={16} />
            </button>
            <span className="px-3 py-1 text-gray-900">{quantity}</span>
            <button 
              onClick={incrementQuantity}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <button 
            onClick={() => removeFromCart(product.id)}
            className="text-gray-500 hover:text-red-500 transition-colors"
            aria-label="Remove item"
          >
            <X size={18} />
            <span className="sr-only">Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;