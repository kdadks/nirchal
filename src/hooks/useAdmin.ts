import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import type {
  Product,
  Category,
  ProductWithDetails,
  ProductFormData,
  CategoryFormData
} from '../types/admin';

// Categories
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
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
    try {
      const { error } = await supabase
        .from('categories')
        .insert([data]);

      if (error) throw error;
      await fetchCategories();
    } catch (e) {
      throw e instanceof Error ? e : new Error('Error creating category');
    }
  };

  const updateCategory = async (id: number, data: Partial<CategoryFormData>) => {
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
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*),
          inventory:inventory(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data as ProductWithDetails[] || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (data: ProductFormData): Promise<Product> => {
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