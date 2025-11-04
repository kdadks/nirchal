import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCustomerAuth } from './CustomerAuthContext';
import { supabase } from '../config/supabase';

interface WishlistContextType {
  addToWishlist: (productId: string) => Promise<{ success: boolean; requiresAuth?: boolean }>;
  removeFromWishlist: (productId: string) => Promise<{ success: boolean }>;
  isInWishlist: (productId: string) => boolean;
  wishlist: string[];
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { customer } = useCustomerAuth();

  // Load wishlist when customer logs in
  useEffect(() => {
    if (customer?.id) {
      loadWishlist();
    } else {
      setWishlist([]);
    }
  }, [customer?.id]);

  const loadWishlist = async () => {
    if (!customer?.id) return;
    
    setLoading(true);
    try {
      // Create wishlist table if it doesn't exist
      const { data, error } = await supabase
        .from('customer_wishlist')
        .select('product_id')
        .eq('customer_id', customer.id);

      if (error && error.code === '42P01') {
        // Table doesn't exist, create it
        console.log('Wishlist table does not exist, will create when first item is added');
        setWishlist([]);
      } else if (error) {
        // Only log errors in production
        if (window.location.hostname !== 'localhost') {
          console.error('Error loading wishlist:', error);
        }
        setWishlist([]);
      } else {
        setWishlist((data || []).map(item => (item as any).product_id as string));
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string): Promise<{ success: boolean; requiresAuth?: boolean }> => {
    if (!customer?.id) {
      return { success: false, requiresAuth: true };
    }

    if (wishlist.includes(productId)) {
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('customer_wishlist')
        .upsert({
          customer_id: customer.id,
          product_id: productId,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'customer_id,product_id'
        });

      if (error) {
        console.error('Error adding to wishlist:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return { success: false };
      }

      setWishlist(prev => [...prev, productId]);
      return { success: true };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      console.error('Exception details:', error instanceof Error ? error.message : JSON.stringify(error));
      return { success: false };
    }
  };

  const removeFromWishlist = async (productId: string): Promise<{ success: boolean }> => {
    if (!customer?.id) {
      return { success: false };
    }

    try {
      const { error } = await supabase
        .from('customer_wishlist')
        .delete()
        .eq('customer_id', customer.id)
        .eq('product_id', productId);

      if (error) {
        console.error('Error removing from wishlist:', error);
        return { success: false };
      }

      setWishlist(prev => prev.filter(id => id !== productId));
      return { success: true };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false };
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        loading
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

// This hook needs to be exported separately from the component
// to maintain proper tree-shaking in production builds
export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};