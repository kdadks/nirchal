import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantId?: string;
  size?: string;
  color?: string;
  category?: string; // Product category for add-ons detection
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: string; variantId?: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; variantId?: string; quantity: number } }
  | { type: 'CLEAR_CART' };

interface CartContextType {
  state: CartState;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string, variantId?: string) => void;
  updateQuantity: (id: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  totalItems: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void; // alias for addToCart
}

const CartContext = createContext<CartContextType | null>(null);

const initialState: CartState = {
  items: [],
  total: 0
};

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => 
          item.id === action.payload.id && 
          item.variantId === action.payload.variantId
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };

        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems)
        };
      }

      const newItems = [...state.items, { ...action.payload, quantity: 1 }];
      
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems)
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(
        item => 
          !(item.id === action.payload.id && 
            item.variantId === action.payload.variantId)
      );

      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems)
      };
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id && 
        item.variantId === action.payload.variantId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems)
      };
    }

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    // Load cart from localStorage on init
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : initialState;
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    try {
      dispatch({ type: 'ADD_ITEM', payload: { ...item, quantity: 1 } });
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  const removeItem = (id: string, variantId?: string) => {
    try {
      dispatch({ type: 'REMOVE_ITEM', payload: { id, variantId } });
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const updateQuantity = (id: string, quantity: number, variantId?: string) => {
    try {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity, variantId } });
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };

  const clearCart = () => {
    try {
      dispatch({ type: 'CLEAR_CART' });
      // Persist the empty cart immediately in case navigation happens before the effect runs
      localStorage.setItem('cart', JSON.stringify(initialState));
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart: addItem,
        addItem,  // provide both names for compatibility
        removeFromCart: removeItem,
        updateQuantity,
        clearCart,
        totalItems: state.items.reduce((sum, item) => sum + item.quantity, 0)
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;