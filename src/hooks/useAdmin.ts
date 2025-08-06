import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type {
  Product,
  Category,
  ProductWithDetails,
  ProductFormData,
  CategoryFormData
} from '../types/admin';

// Categories
export const useCategories = () => {
  const { supabase } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only fetch if supabase client is available
  useEffect(() => {
    if (!supabase) return;
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  // Debug: log categories and error
  React.useEffect(() => {
    if (error) console.error('[Categories] Error:', error);
    if (categories) console.log('[Categories] Data:', categories);
  }, [categories, error]);

  const fetchCategories = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (data: CategoryFormData) => {
    if (!supabase) throw new Error('Supabase client not initialized');
    try {
      // Log session, user, and insert data before insert
      const session = await supabase.auth.getSession();
      console.log('[createCategory] Supabase session:', session);
      console.log('[createCategory] Insert data:', data);
      if (session.data.session) {
        console.log('[createCategory] Session user id:', session.data.session.user.id);
        console.log('[createCategory] Session user role:', session.data.session.user.role);
      } else {
        console.log('[createCategory] No session user');
      }

      const { error } = await supabase
        .from('categories')
        .insert([data]);

      if (error) {
        // Log and throw detailed error
        console.error('[createCategory] Supabase error:', error);
        throw new Error(error.message || 'Error creating category');
      }
      await fetchCategories();
    } catch (e) {
      // Log any unexpected error
      console.error('[createCategory] Unexpected error:', e);
      throw e instanceof Error ? e : new Error('Error creating category');
    }
  };

  const updateCategory = async (id: number, data: Partial<CategoryFormData>) => {
    if (!supabase) throw new Error('Supabase client not initialized');
    try {
      const { error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      await fetchCategories();
    } catch (e) {
      throw e instanceof Error ? e : new Error('Error updating category');
    }
  };

  const deleteCategory = async (id: number) => {
    if (!supabase) throw new Error('Supabase client not initialized');
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchCategories();
    } catch (e) {
      throw e instanceof Error ? e : new Error('Error deleting category');
    }
  };

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refresh: fetchCategories
  };
};

// Products
export const useProducts = () => {
  const { supabase } = useAuth();
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  // Debug: log products and error
  React.useEffect(() => {
    if (error) console.error('[Products] Error:', error);
    if (products) console.log('[Products] Data:', products);
  }, [products, error]);

  const fetchProducts = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories!products_category_id_fkey(*),
          images:product_images(*),
          variants:product_variants(*)
        `)
        .order('created_at', { ascending: false });

      // Debug: log raw response
      console.log('[Supabase products] data:', data);
      console.log('[Supabase products] error:', error);

      if (error && !data) throw error;
      setProducts(data as ProductWithDetails[] || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (data: ProductFormData): Promise<Product> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    try {
      const { images, variants, inventory, ...productData } = data;
      // Insert product
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (productError || !newProduct) throw productError || new Error('Failed to create product');

      // Upload images and insert records
      if (images?.length) {
        await Promise.all(images.map(async (image) => {
          if (image.file) {
            const fileName = `${Date.now()}-${image.file.name}`;
            const { error: uploadError } = await supabase.storage
              .from('product-images')
              .upload(fileName, image.file);

            if (uploadError) throw uploadError;

            const { error: imageError } = await supabase
              .from('product_images')
              .insert([{
                product_id: newProduct.id,
                image_url: fileName,
                alt_text: image.alt_text,
                is_primary: image.is_primary
              }]);

            if (imageError) throw imageError;
          }
        }));
      }

      // Insert variants
      if (variants?.length) {
        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variants.map(variant => ({
            ...variant,
            product_id: newProduct.id
          })));

        if (variantError) throw variantError;
      }

      // Insert inventory
      if (inventory) {
        const { error: inventoryError } = await supabase
          .from('inventory')
          .insert([{
            product_id: newProduct.id,
            ...inventory
          }]);

        if (inventoryError) throw inventoryError;
      }

      await fetchProducts();
      return newProduct as Product;
    } catch (e) {
      throw e instanceof Error ? e : new Error('Error creating product');
    }
  };

  const updateProduct = async (id: number, data: Partial<ProductFormData>) => {
    if (!supabase) throw new Error('Supabase client not initialized');
    try {
      const { error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      await fetchProducts();
    } catch (e) {
      throw e instanceof Error ? e : new Error('Error updating product');
    }
  };

  const deleteProduct = async (id: number) => {
    if (!supabase) throw new Error('Supabase client not initialized');
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchProducts();
    } catch (e) {
      throw e instanceof Error ? e : new Error('Error deleting product');
    }
  };

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refresh: fetchProducts
  };
};

// Rest of the code remains the same...