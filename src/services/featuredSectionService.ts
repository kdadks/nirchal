import { supabase, supabaseAdmin } from '../config/supabase';
import {
  FeaturedSection,
  FeaturedSectionWithProducts,
  CreateFeaturedSectionInput,
  UpdateFeaturedSectionInput,
} from '../types/featuredSection.types';

// Get client (prefer admin for bypassing RLS)
const getClient = () => supabaseAdmin || supabase;

/**
 * Get all active featured sections for homepage
 */
export async function getActiveFeaturedSections(): Promise<FeaturedSectionWithProducts[]> {
  try {
    const { data: sections, error: sectionsError } = await supabase
      .from('featured_sections')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (sectionsError) throw sectionsError;
    if (!sections || sections.length === 0) return [];

    // Fetch products for each section
    const sectionsWithProducts = await Promise.all(
      sections.map(async (section: any) => {
        const { data: productData, error: productsError } = await supabase
          .from('featured_section_products')
          .select(`
            display_order,
            product:products (
              id,
              name,
              slug,
              price,
              sale_price,
              category_id,
              category:categories (
                name
              ),
              product_images (
                id,
                image_url,
                is_primary,
                display_order
              ),
              variants:product_variants (
                id,
                size,
                color,
                color_hex,
                sku,
                price_adjustment,
                swatch_image_id
              ),
              inventory (
                id,
                variant_id,
                quantity,
                low_stock_threshold
              ),
              product_reviews (
                rating
              )
            )
          `)
          .eq('section_id', section.id)
          .order('display_order', { ascending: true })
          .limit(section.max_products);

        if (productsError) {
          console.error('Error fetching products for section:', productsError);
          return { ...section, products: [] };
        }

        const products = (productData || [])
          .filter((item: any) => item.product && item.product.category_id) // Filter out null products and products without categories
          .map((item: any) => {
            const product = item.product as any;
            
            // Create image lookup by ID for swatch matching
            const imageById = (product.product_images || []).reduce((acc: any, img: any) => {
              acc[img.id] = img.image_url;
              return acc;
            }, {});
            
            // Transform product images to match ProductCard expectations
            const images = (product.product_images || [])
              .sort((a: any, b: any) => {
                // Primary image first, then by display_order
                if (a.is_primary && !b.is_primary) return -1;
                if (!a.is_primary && b.is_primary) return 1;
                return (a.display_order || 0) - (b.display_order || 0);
              })
              .map((img: any) => img.image_url);

            // Map variants and add quantity from inventory
            const variants = (product.variants || []).map((variant: any) => {
              const inventoryItem = (product.inventory || []).find(
                (inv: any) => inv.variant_id === variant.id
              );
              
              return {
                id: variant.id,
                size: variant.size,
                color: variant.color,
                colorHex: variant.color_hex,
                sku: variant.sku,
                priceAdjustment: variant.price_adjustment,
                swatchImageId: variant.swatch_image_id,
                swatchImage: variant.swatch_image_id ? imageById[variant.swatch_image_id] : null,
                quantity: inventoryItem?.quantity || 0,
              };
            });

            // Extract unique sizes and colors from variants
            const sizes = variants.length > 0 
              ? Array.from(new Set(variants.map((v: any) => v.size).filter(Boolean)))
              : [];
            const colors = variants.length > 0
              ? Array.from(new Set(variants.map((v: any) => v.color).filter(Boolean)))
              : [];

            // Calculate stock status and quantity from inventory
            const stockInfo = (() => {
              if (Array.isArray(product.inventory) && product.inventory.length > 0) {
                const hasVariants = variants.length > 0;
                const relevantInventory = product.inventory.filter((inv: any) => {
                  if (hasVariants) {
                    return inv.variant_id !== null;
                  } else {
                    return inv.variant_id === null;
                  }
                });
                
                const totalQuantity = relevantInventory.reduce((sum: number, inv: any) => sum + (inv.quantity || 0), 0);
                const minThreshold = relevantInventory.length > 0 
                  ? Math.min(...relevantInventory.map((inv: any) => inv.low_stock_threshold || 10))
                  : 10;
                
                let status: 'In Stock' | 'Low Stock' | 'Out of Stock';
                if (totalQuantity === 0) {
                  status = 'Out of Stock';
                } else if (totalQuantity <= minThreshold) {
                  status = 'Low Stock';
                } else {
                  status = 'In Stock';
                }
                
                return { quantity: totalQuantity, status };
              }
              return { quantity: 0, status: 'In Stock' as const }; // Default if no inventory data
            })();

            // Calculate average rating from reviews
            const reviews = product.product_reviews || [];
            const rating = reviews.length > 0
              ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
              : 0;
            const reviewCount = reviews.length;

            return {
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.sale_price || product.price,
              originalPrice: product.sale_price ? product.price : undefined,
              images: images,
              variants: variants,
              sizes: sizes,
              colors: colors,
              stockStatus: stockInfo.status,
              stockQuantity: stockInfo.quantity,
              rating: rating,
              reviewCount: reviewCount,
              display_order: item.display_order,
              category: product.category?.name || 'Uncategorized',
            };
          });

        return {
          ...section,
          products,
        };
      })
    );

    return sectionsWithProducts as FeaturedSectionWithProducts[];
  } catch (error) {
    console.error('Error fetching featured sections:', error);
    return [];
  }
}

/**
 * Get all featured sections (admin view)
 */
export async function getAllFeaturedSections(): Promise<FeaturedSection[]> {
  try {
    const { data, error } = await getClient()
      .from('featured_sections')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as FeaturedSection[];
  } catch (error) {
    console.error('Error fetching all featured sections:', error);
    return [];
  }
}

/**
 * Get single featured section with products
 */
export async function getFeaturedSection(sectionId: string): Promise<FeaturedSectionWithProducts | null> {
  try {
    const { data: section, error: sectionError } = await getClient()
      .from('featured_sections')
      .select('*')
      .eq('id', sectionId)
      .single();

    if (sectionError) throw sectionError;
    if (!section) return null;

    const { data: productData, error: productsError } = await getClient()
      .from('featured_section_products')
      .select(`
        display_order,
        product:products (
          id,
          name,
          slug,
          price,
          sale_price,
          images,
          stock_quantity
        )
      `)
      .eq('section_id', sectionId)
      .order('display_order', { ascending: true });

    if (productsError) throw productsError;

    const products = (productData || [])
      .filter((item: any) => item.product)
      .map((item: any) => ({
        ...(item.product as any),
        display_order: item.display_order,
      }));

    return {
      ...section,
      products,
    } as FeaturedSectionWithProducts;
  } catch (error) {
    console.error('Error fetching featured section:', error);
    return null;
  }
}

/**
 * Create new featured section
 */
export async function createFeaturedSection(
  input: CreateFeaturedSectionInput
): Promise<{ success: boolean; message: string; sectionId?: string }> {
  try {
    const client = getClient();

    // Get current user for created_by
    const { data: { user } } = await supabase.auth.getUser();

    const { data: section, error: sectionError } = await client
      .from('featured_sections')
      .insert({
        title: input.title,
        description: input.description || null,
        slug: input.slug,
        display_order: input.display_order || 0,
        section_type: input.section_type || 'custom',
        max_products: input.max_products || 8,
        background_color: input.background_color || '#ffffff',
        text_color: input.text_color || '#000000',
        is_active: true,
        created_by: user?.id || null,
        show_view_all_button: input.show_view_all_button ?? true,
      })
      .select('id')
      .single();

    if (sectionError) throw sectionError;

    // Add products if provided
    if (input.product_ids && input.product_ids.length > 0) {
      const productInserts = input.product_ids.map((productId, index) => ({
        section_id: section.id,
        product_id: productId,
        display_order: index,
      }));

      const { error: productsError } = await client
        .from('featured_section_products')
        .insert(productInserts);

      if (productsError) throw productsError;
    }

    return {
      success: true,
      message: 'Featured section created successfully',
      sectionId: String(section.id),
    };
  } catch (error: any) {
    console.error('Error creating featured section:', error);
    return {
      success: false,
      message: error.message || 'Failed to create featured section',
    };
  }
}

/**
 * Update featured section
 */
export async function updateFeaturedSection(
  sectionId: string,
  input: UpdateFeaturedSectionInput
): Promise<{ success: boolean; message: string }> {
  try {
    const client = getClient();

    // Update section details
    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.display_order !== undefined) updateData.display_order = input.display_order;
    if (input.is_active !== undefined) updateData.is_active = input.is_active;
    if (input.max_products !== undefined) updateData.max_products = input.max_products;
    if (input.background_color !== undefined) updateData.background_color = input.background_color;
    if (input.text_color !== undefined) updateData.text_color = input.text_color;
    if (input.show_view_all_button !== undefined) updateData.show_view_all_button = input.show_view_all_button;

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await client
        .from('featured_sections')
        .update(updateData)
        .eq('id', sectionId);

      if (updateError) throw updateError;
    }

    // Update products if provided
    if (input.product_ids !== undefined) {
      // Delete existing products
      await client
        .from('featured_section_products')
        .delete()
        .eq('section_id', sectionId);

      // Insert new products
      if (input.product_ids.length > 0) {
        const productInserts = input.product_ids.map((productId, index) => ({
          section_id: sectionId,
          product_id: productId,
          display_order: index,
        }));

        const { error: productsError } = await client
          .from('featured_section_products')
          .insert(productInserts);

        if (productsError) throw productsError;
      }
    }

    return {
      success: true,
      message: 'Featured section updated successfully',
    };
  } catch (error: any) {
    console.error('Error updating featured section:', error);
    return {
      success: false,
      message: error.message || 'Failed to update featured section',
    };
  }
}

/**
 * Delete featured section
 */
export async function deleteFeaturedSection(
  sectionId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const client = getClient();

    const { error } = await client
      .from('featured_sections')
      .delete()
      .eq('id', sectionId);

    if (error) throw error;

    return {
      success: true,
      message: 'Featured section deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting featured section:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete featured section',
    };
  }
}

/**
 * Reorder sections
 */
export async function reorderSections(
  sectionOrders: Array<{ id: string; display_order: number }>
): Promise<{ success: boolean; message: string }> {
  try {
    const client = getClient();

    // Update each section's display_order
    await Promise.all(
      sectionOrders.map(({ id, display_order }) =>
        client
          .from('featured_sections')
          .update({ display_order })
          .eq('id', id)
      )
    );

    return {
      success: true,
      message: 'Sections reordered successfully',
    };
  } catch (error: any) {
    console.error('Error reordering sections:', error);
    return {
      success: false,
      message: error.message || 'Failed to reorder sections',
    };
  }
}
