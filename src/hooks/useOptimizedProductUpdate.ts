import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useOptimizedProductUpdate = () => {
  const { supabase } = useAuth();

  const updateProductOptimized = async (id: string, data: any) => {
    if (!supabase) throw new Error('Supabase client not initialized');

    try {
      console.log('[OptimizedUpdate] Starting product update...');
      const startTime = performance.now();

      const { images, imagesToDelete = [], variants, inventory, variantsToDelete, ...updateData } = data;

      // Clean up update data
      if ('sku' in updateData && (!updateData.sku || String(updateData.sku).trim() === '')) {
        updateData.sku = null;
      }
      delete (updateData as any).images;
      delete (updateData as any).image_url;
      delete (updateData as any).inventory;
      delete (updateData as any).variants;
      delete (updateData as any).variantsToDelete;

      // Run all operations in parallel where possible
      const operations = [];

      // 1. Update product fields (always needed)
      operations.push(
        supabase
          .from('products')
          .update(updateData)
          .eq('id', id)
      );

      // 2. Handle image deletions in parallel
      if (imagesToDelete.length > 0) {
        const deleteOperations = imagesToDelete.map(async (img: any) => {
          if (img.image_url) {
            // Do storage and DB deletion in parallel
            await Promise.all([
              supabase.storage.from('product-images').remove([img.image_url]),
              supabase.from('product_images').delete().eq('id', img.id)
            ]);
          }
        });
        operations.push(Promise.all(deleteOperations));
      }

      // 3. Handle image updates in parallel
      if (images) {
        const updateImageOps = images
          .filter((img: any) => img.existing && img.id)
          .map((img: any) =>
            supabase.from('product_images').update({
              alt_text: img.alt_text,
              is_primary: img.is_primary
            }).eq('id', img.id)
          );
        
        if (updateImageOps.length > 0) {
          operations.push(Promise.all(updateImageOps));
        }
      }

      // Execute basic operations in parallel
      const results = await Promise.all(operations);
      
      // Check for errors in parallel operations
      results.forEach((result) => {
        if (Array.isArray(result)) {
          result.forEach((subResult: any) => {
            if (subResult?.error) throw subResult.error;
          });
        } else if (result?.error) {
          throw result.error;
        }
      });

      // 4. Handle new image uploads (must be sequential due to file uploads)
      if (images) {
        const newImages = images.filter((img: any) => img.file && !img.existing);
        for (const img of newImages) {
          const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${img.file.name}`;
          
          const uploadResult = await supabase.storage.from('product-images').upload(fileName, img.file);
          
          if (uploadResult.error) throw uploadResult.error;
          
          const { error: imageError } = await supabase
            .from('product_images')
            .insert({
              product_id: id,
              image_url: fileName,
              alt_text: img.alt_text,
              is_primary: img.is_primary
            });
          
          if (imageError) throw imageError;
        }
      }

      // 5. Handle variant operations in parallel where possible
      if (variantsToDelete && variantsToDelete.length > 0) {
        // Delete variants and related data
        await Promise.all([
          supabase.from('inventory').delete().in('variant_id', variantsToDelete),
          supabase.from('product_variants').delete().in('id', variantsToDelete)
        ]);
      }

      // 6. Handle variant updates/inserts
      if (variants && variants.length > 0) {
        const variantOps = variants.map(async (variant: any) => {
          if (variant.id) {
            // Update existing variant
            return supabase
              .from('product_variants')
              .update(variant)
              .eq('id', variant.id);
          } else {
            // Insert new variant
            return supabase
              .from('product_variants')
              .insert({ ...variant, product_id: id })
              .select()
              .single();
          }
        });

        await Promise.all(variantOps);
      }

      // 7. Handle inventory update
      if (inventory !== undefined) {
        const { data: existingInventory } = await supabase
          .from('inventory')
          .select('*')
          .eq('product_id', id)
          .is('variant_id', null)
          .single();

        if (existingInventory) {
          await supabase
            .from('inventory')
            .update({
              quantity: inventory.quantity,
              low_stock_threshold: inventory.low_stock_threshold
            })
            .eq('id', existingInventory.id);
        } else {
          await supabase
            .from('inventory')
            .insert({
              product_id: id,
              variant_id: null,
              quantity: inventory.quantity,
              low_stock_threshold: inventory.low_stock_threshold
            });
        }
      }

      const endTime = performance.now();
      console.log(`[OptimizedUpdate] Product update completed in ${(endTime - startTime).toFixed(2)}ms`);
      
      toast.success('Product updated successfully');
      
    } catch (e) {
      console.error('[OptimizedUpdate] Error:', e);
      toast.error('Failed to update product');
      throw e instanceof Error ? e : new Error('Error updating product');
    }
  };

  return { updateProductOptimized };
};
