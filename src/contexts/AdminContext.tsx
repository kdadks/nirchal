import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../config/supabase';

interface AdminCounts {
  vendors: number;
  orders: number;
  users: number;
  products: number;
  categories: number;
}

interface AdminContextType {
  counts: AdminCounts;
  refreshCounts: () => Promise<void>;
  refreshSpecificCount: (type: keyof AdminCounts) => Promise<void>;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [counts, setCounts] = useState<AdminCounts>({
    vendors: 0,
    orders: 0,
    users: 0,
    products: 0,
    categories: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchCounts = async (): Promise<AdminCounts> => {
    try {
      // Fetch all counts in parallel
      const [vendorsResult, ordersResult, usersResult, productsResult, categoriesResult] = await Promise.all([
        supabase.from('vendors').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true })
      ]);

      return {
        vendors: vendorsResult.count || 0,
        orders: ordersResult.count || 0,
        users: usersResult.count || 0,
        products: productsResult.count || 0,
        categories: categoriesResult.count || 0,
      };
    } catch (error) {
      console.error('Error fetching admin counts:', error);
      return {
        vendors: 0,
        orders: 0,
        users: 0,
        products: 0,
        categories: 0,
      };
    }
  };

  const refreshCounts = async () => {
    setLoading(true);
    try {
      const newCounts = await fetchCounts();
      setCounts(newCounts);
    } finally {
      setLoading(false);
    }
  };

  const refreshSpecificCount = async (type: keyof AdminCounts) => {
    try {
      let count = 0;
      switch (type) {
        case 'vendors':
          const vendorsResult = await supabase.from('vendors').select('id', { count: 'exact', head: true });
          count = vendorsResult.count || 0;
          setCounts(prev => ({ ...prev, vendors: count }));
          break;
        case 'orders':
          const ordersResult = await supabase.from('orders').select('id', { count: 'exact', head: true });
          count = ordersResult.count || 0;
          setCounts(prev => ({ ...prev, orders: count }));
          break;
        case 'users':
          const usersResult = await supabase.from('customers').select('id', { count: 'exact', head: true });
          count = usersResult.count || 0;
          setCounts(prev => ({ ...prev, users: count }));
          break;
        case 'products':
          const productsResult = await supabase.from('products').select('id', { count: 'exact', head: true });
          count = productsResult.count || 0;
          setCounts(prev => ({ ...prev, products: count }));
          break;
        case 'categories':
          const categoriesResult = await supabase.from('categories').select('id', { count: 'exact', head: true });
          count = categoriesResult.count || 0;
          setCounts(prev => ({ ...prev, categories: count }));
          break;
      }
    } catch (error) {
      console.error(`Error refreshing ${type} count:`, error);
    }
  };

  useEffect(() => {
    refreshCounts();
  }, []);

  return (
    <AdminContext.Provider value={{ 
      counts, 
      refreshCounts, 
      refreshSpecificCount, 
      loading 
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminContext must be used within AdminProvider');
  }
  return context;
};
