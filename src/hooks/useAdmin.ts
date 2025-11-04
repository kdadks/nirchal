import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabaseAdmin } from '../config/supabase';
import { 
	extractFileName, 
	deleteImageFromPublicFolder, 
	saveImageToPublicFolder, 
	generateProductImageFileName 
} from '../utils/imageStorageAdapter';
import type {
	Product,
	Category,
	Vendor,
	LogisticsPartner,
	ProductWithDetails,
	ProductFormData,
	CategoryFormData,
	ProductFormDataWithDelete
} from '../types/admin';

// Categories
export const useCategories = () => {
	const { supabase } = useAuth();
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!supabase) return;
		fetchCategories();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [supabase]);

	React.useEffect(() => {
		if (error) console.error('[Categories] Error:', error);
		if (import.meta.env.DEV && categories) console.debug('[Categories] data:', categories);
	}, [categories, error]);

	const fetchCategories = async () => {
		if (!supabase) return;
		setLoading(true);
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
				console.error('[createCategory] Supabase error:', error);
				throw new Error(error.message || 'Error creating category');
			}
			await fetchCategories();
		} catch (e) {
			console.error('[createCategory] Unexpected error:', e);
			throw e instanceof Error ? e : new Error('Error creating category');
		}
	};

	const updateCategory = async (id: string, data: Partial<CategoryFormData>) => {
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

	const deleteCategory = async (id: string) => {
		if (!supabase) throw new Error('Supabase client not initialized');
		try {
			// 1. Get category data including image URL for storage cleanup
			const { data: category, error: categoryFetchError } = await supabase
				.from('categories')
				.select('image_url')
				.eq('id', id)
				.single();
			
			if (categoryFetchError) {
				throw categoryFetchError;
			}
			
			// 2. Delete category image from local storage if it exists
			if (category?.image_url) {
				// Extract filename from URL - only delete files we uploaded (not external URLs)
				const fileName = extractFileName(category.image_url);
				
				if (fileName) {
					console.log('Deleting category image from local storage:', fileName);
					const deleteResult = await deleteImageFromPublicFolder(fileName, 'categories');
					
					if (!deleteResult.success) {
						console.warn('Category image deletion error (non-critical):', deleteResult.error);
					} else {
						console.log('✅ Category image deleted from local storage');
					}
				}
			}
			
			// 3. Delete category from database
			const { error } = await supabase
				.from('categories')
				.delete()
				.eq('id', id);

			if (error) throw error;
			
			console.log('✅ Category deleted successfully');
			await fetchCategories();
		} catch (e) {
			console.error('Error deleting category:', e);
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

// Vendors
export const useVendors = () => {
	const { supabase } = useAuth();
	const [vendors, setVendors] = useState<Vendor[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!supabase) return;
		fetchVendors();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [supabase]);

	React.useEffect(() => {
		if (error) console.error('[Vendors] Error:', error);
		if (import.meta.env.DEV && vendors) console.debug('[Vendors] data:', vendors);
	}, [vendors, error]);

	const fetchVendors = async () => {
		if (!supabase) return;
		setLoading(true);
		try {
			const { data, error } = await supabase
				.from('vendors')
				.select('*')
				.order('name');

			if (error) throw error;
			setVendors(data || []);
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Error fetching vendors');
		} finally {
			setLoading(false);
		}
	};

	const createVendor = async (data: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>) => {
		if (!supabase) throw new Error('Supabase client not initialized');
		try {
			const { data: vendor, error } = await supabase
				.from('vendors')
				.insert([data])
				.select()
				.single();

			if (error) throw error;
			await fetchVendors();
			return vendor;
		} catch (e) {
			throw e instanceof Error ? e : new Error('Error creating vendor');
		}
	};

	const updateVendor = async (id: string, data: Partial<Omit<Vendor, 'id' | 'created_at' | 'updated_at'>>) => {
		if (!supabase) throw new Error('Supabase client not initialized');
		try {
			const { error } = await supabase
				.from('vendors')
				.update(data)
				.eq('id', id);

			if (error) throw error;
			await fetchVendors();
		} catch (e) {
			throw e instanceof Error ? e : new Error('Error updating vendor');
		}
	};

	const deleteVendor = async (id: string) => {
		if (!supabase) throw new Error('Supabase client not initialized');
		try {
			const { error } = await supabase
				.from('vendors')
				.delete()
				.eq('id', id);

			if (error) throw error;
			await fetchVendors();
		} catch (e) {
			throw e instanceof Error ? e : new Error('Error deleting vendor');
		}
	};

	return {
		vendors,
		loading,
		error,
		createVendor,
		updateVendor,
		deleteVendor,
		refresh: fetchVendors
	};
};

// Logistics Partners
export const useLogisticsPartners = () => {
	const { supabase } = useAuth();
	const [logisticsPartners, setLogisticsPartners] = useState<LogisticsPartner[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!supabase) return;
		fetchLogisticsPartners();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [supabase]);

	React.useEffect(() => {
		if (error) console.error('[LogisticsPartners] Error:', error);
		if (import.meta.env.DEV && logisticsPartners) console.debug('[LogisticsPartners] data:', logisticsPartners);
	}, [logisticsPartners, error]);

	const fetchLogisticsPartners = async () => {
		if (!supabase) return;
		setLoading(true);
		try {
			const { data, error } = await supabase
				.from('logistics_partners')
				.select('*')
				.order('name');

			if (error) throw error;
			setLogisticsPartners(data || []);
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Error fetching logistics partners');
		} finally {
			setLoading(false);
		}
	};

	const createLogisticsPartner = async (data: Omit<LogisticsPartner, 'id' | 'created_at' | 'updated_at'>) => {
		if (!supabase) throw new Error('Supabase client not initialized');
		try {
			const { data: partner, error } = await supabase
				.from('logistics_partners')
				.insert([data])
				.select()
				.single();

			if (error) throw error;
			await fetchLogisticsPartners();
			return partner;
		} catch (e) {
			throw e instanceof Error ? e : new Error('Error creating logistics partner');
		}
	};

	const updateLogisticsPartner = async (id: string, data: Partial<Omit<LogisticsPartner, 'id' | 'created_at' | 'updated_at'>>) => {
		if (!supabase) throw new Error('Supabase client not initialized');
		
		// Use admin client if available, fallback to regular client
		const client = supabaseAdmin || supabase;
		const clientType = supabaseAdmin ? 'ADMIN' : 'REGULAR';
		
		try {
			console.log(`[${clientType}] Updating logistics partner with data:`, data);
			const { data: result, error } = await client
				.from('logistics_partners')
				.update(data)
				.eq('id', id)
				.select();

			if (error) {
				console.error(`[${clientType}] Supabase error:`, error);
				throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
			}
			
			console.log(`[${clientType}] Update successful:`, result);
			await fetchLogisticsPartners();
		} catch (e) {
			console.error(`[${clientType}] Full error details:`, e);
			throw e instanceof Error ? e : new Error('Error updating logistics partner');
		}
	};

	const deleteLogisticsPartner = async (id: string) => {
		if (!supabase) throw new Error('Supabase client not initialized');
		try {
			const { error } = await supabase
				.from('logistics_partners')
				.delete()
				.eq('id', id);

			if (error) throw error;
			await fetchLogisticsPartners();
		} catch (e) {
			throw e instanceof Error ? e : new Error('Error deleting logistics partner');
		}
	};

	return {
		logisticsPartners,
		loading,
		error,
		createLogisticsPartner,
		updateLogisticsPartner,
		deleteLogisticsPartner,
		refresh: fetchLogisticsPartners
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

	React.useEffect(() => {
		if (error) console.error('[Products] Error:', error);
		if (import.meta.env.DEV && products) console.debug('[Products] data:', products);
	}, [products, error]);

	const fetchProducts = async () => {
		if (!supabase) return;
		setLoading(true);
		try {
			// Try JOIN query first (like frontend) for better reliability
			const { data: joinedData, error: joinError } = await supabase
				.from('products')
				.select(`
					*,
					category:categories(id, name),
					images:product_images(*),
					variants:product_variants(*),
					inventory(*)
				`)
				.order('created_at', { ascending: false });

			if (!joinError && joinedData) {
				setProducts(joinedData as ProductWithDetails[] || []);
				return;
			}

			// Fallback to manual join (original method)
			const { data: productsData, error: productsError } = await supabase
				.from('products')
				.select(`
					*,
					category:categories(id, name)
				`)
				.order('created_at', { ascending: false });

			if (productsError) {
				console.error('[Products] Error:', productsError);
				throw productsError;
			}

			// Fetch additional data in parallel for better performance
			const [imagesData, variantsData, inventoryData] = await Promise.all([
				// Product images
				supabase
					.from('product_images')
					.select('*')
					.then(({ data, error }) => {
						if (error) console.warn('[Products] Images fetch failed:', error);
						return data || [];
					}),
				
				// Product variants with swatch images
				supabase
					.from('product_variants')
					.select(`
						*,
						swatch_image:product_images!swatch_image_id(*)
					`)
					.then(({ data, error }) => {
						if (error) console.warn('[Products] Variants fetch failed:', error);
						return data || [];
					}),
				
				// Inventory data
				supabase
					.from('inventory')
					.select('*')
					.then(({ data, error }) => {
						if (error) console.warn('[Products] Inventory fetch failed:', error);
						return data || [];
					})
			]);

			// Efficiently map all data together
			const productsWithInventory = (productsData || []).map(product => {
				const productInventory = (inventoryData || []).filter(inv => inv.product_id === product.id);
				const productImages = (imagesData || []).filter(img => img.product_id === product.id);
				const productVariants = (variantsData || []).filter(variant => variant.product_id === product.id);
				
				return {
					...product,
					images: productImages,
					variants: productVariants,
					inventory: productInventory
				};
			});

			setProducts(productsWithInventory as ProductWithDetails[] || []);
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Error fetching products');
		} finally {
			setLoading(false);
		}
	};

	const createProduct = async (data: ProductFormData): Promise<Product> => {
		if (!supabase) throw new Error('Supabase client not initialized');
		try {
			const { images, variants, inventory, variantsToDelete, ...productDataRaw } = data as any;
				// Convert empty string fields to null, and ensure sku is null if empty
				const productData = Object.fromEntries(
					Object.entries(productDataRaw).map(([k, v]) => {
						if (k === 'sku' && (!v || v === '')) return [k, null];
						return [k, v === '' ? null : v];
					})
				);
			// Insert product
			console.log('[createProduct] Creating product:', productData.name);
			console.log('[createProduct] Product data to insert:', productData);
			
			let insertResult;
			try {
				insertResult = await supabase
					.from('products')
					.insert([productData])
					.select()
					.single();
				console.log('[createProduct] Product insert result:', insertResult);
			} catch (productInsertError) {
				console.error('[createProduct] Product insert failed:', productInsertError);
				throw productInsertError;
			}

			const { data: newProduct, error: productError } = insertResult;
			if (productError || !newProduct) {
				console.error('[createProduct] Product creation error:', productError);
				throw productError || new Error('Failed to create product');
			}
			console.log('[createProduct] Product created with ID:', newProduct.id, 'Type:', typeof newProduct.id);

			// Upload images and insert records
			if (images?.length) {
				console.log('[createProduct] Starting image upload for', images.length, 'images');
				await Promise.all(images.map(async (image: any, index: number) => {
					if (image.file) {
						console.log(`[createProduct] Processing image ${index + 1}:`, image.file.name);
						
						// Generate unique filename for R2 storage
						const fileName = generateProductImageFileName((productData as any).name || 'product', image.file.name, index);
						
						// Upload image to R2 storage
						const uploadResult = await saveImageToPublicFolder(image.file, fileName, 'products');

						if (!uploadResult.success) {
							console.error(`[createProduct] Upload error for image ${index + 1}:`, uploadResult.error);
							throw new Error(uploadResult.error || 'Image upload failed');
						}

						// Use the R2 URL from upload result
						const imageUrl = uploadResult.url || fileName;
						console.log(`[createProduct] Inserting image ${index + 1} record with product_id:`, newProduct.id, 'Image URL:', imageUrl);
						const { error: imageError } = await supabase
							.from('product_images')
							.insert([{
								product_id: newProduct.id,
								image_url: imageUrl, // Store full GitHub URL for consistency
								alt_text: image.alt_text,
								is_primary: image.is_primary
							}]);

						if (imageError) {
							console.error(`[createProduct] Image DB insert error for image ${index + 1}:`, imageError);
							console.error(`[createProduct] Failed insert data:`, {
								product_id: newProduct.id,
								product_id_type: typeof newProduct.id,
								image_url: imageUrl,
								alt_text: image.alt_text,
								is_primary: image.is_primary
							});
							throw imageError;
						}
						console.log(`[createProduct] Image ${index + 1} successfully inserted`);
					}
				}));
				console.log('[createProduct] Images uploaded successfully');
			}


			// Insert variants and inventory for each variant
			if (variants?.length) {
				// Only include fields that exist in the database schema
				const variantsToInsert = variants.map(({ quantity, low_stock_threshold, material, style, variant_type, swatch_image, ...rest }: { 
					quantity: number; 
					low_stock_threshold: number; 
					material?: any;
					style?: any;
					variant_type?: any;
					swatch_image?: any;
					[key: string]: any 
				}) => ({
					sku: rest.sku === '' ? null : rest.sku,
					size: rest.size || null,
					color: rest.color || null,
					price_adjustment: rest.price_adjustment || 0,
					swatch_image_id: rest.swatch_image_id || null,
					color_hex: rest.color_hex || null,
					product_id: newProduct.id
				}));
				
				const { data: insertedVariants, error: variantError } = await supabase
					.from('product_variants')
					.insert(variantsToInsert)
					.select();
				
				if (variantError) throw variantError;
				console.log('[createProduct] Created', insertedVariants?.length, 'variants');

				// Insert inventory for each variant
				if (insertedVariants && insertedVariants.length) {
					const inventoryRows = insertedVariants.map((variant: any, i: number) => ({
						product_id: newProduct.id,
						variant_id: variant.id,
						quantity: variants[i].quantity ?? 0,
						low_stock_threshold: variants[i].low_stock_threshold ?? (inventory?.low_stock_threshold ?? 2)
					}));
					
					console.log('[createProduct] About to insert inventory. Checking auth status...');
					
					// Check current session before inventory insertion
					const sessionCheck = await supabase.auth.getSession();
					console.log('[createProduct] Session status:', {
						hasSession: !!sessionCheck.data.session,
						userId: sessionCheck.data.session?.user?.id,
						userRole: sessionCheck.data.session?.user?.role,
						userEmail: sessionCheck.data.session?.user?.email
					});
					
					console.log('[createProduct] Inserting inventory rows:', inventoryRows);
					
					const { error: inventoryError, data: inventoryData } = await supabase
						.from('inventory')
						.insert(inventoryRows)
						.select();
					
					if (inventoryError) {
						console.error('[createProduct] Inventory error details:', inventoryError);
						console.error('[createProduct] Inventory error code:', inventoryError.code);
						console.error('[createProduct] Inventory error message:', inventoryError.message);
						console.error('[createProduct] Inventory error hint:', inventoryError.hint);
						throw inventoryError;
					}
					
					console.log('[createProduct] Created inventory for', inventoryData?.length, 'variants');

					// inventory_history now handled by DB trigger
				}
			} else if (inventory !== undefined && inventory !== null) {
				// No variants, insert inventory for product only
				console.log('[createProduct] About to insert default inventory. Checking auth status...');
				
				// Check current session before inventory insertion
				const sessionCheck = await supabase.auth.getSession();
				console.log('[createProduct] Session status:', {
					hasSession: !!sessionCheck.data.session,
					userId: sessionCheck.data.session?.user?.id,
					userRole: sessionCheck.data.session?.user?.role,
					userEmail: sessionCheck.data.session?.user?.email
				});
				
				const { error: inventoryError } = await supabase
					.from('inventory')
					.insert([{
						product_id: newProduct.id,
						variant_id: null,
						...inventory
					}])
					.select();
				
				if (inventoryError) {
					console.error('[createProduct] Default inventory error details:', inventoryError);
					console.error('[createProduct] Default inventory error code:', inventoryError.code);
					console.error('[createProduct] Default inventory error message:', inventoryError.message);
					console.error('[createProduct] Default inventory error hint:', inventoryError.hint);
					throw inventoryError;
				}
				console.log('[createProduct] Created default inventory');

				// inventory_history now handled by DB trigger
			}

			await fetchProducts();
			return newProduct as Product;
		} catch (e) {
			// Improved error logging for debugging
			try {
				console.error('[createProduct] Caught exception (stringified):', JSON.stringify(e, Object.getOwnPropertyNames(e)));
			} catch (jsonErr) {
				console.error('[createProduct] Caught exception (raw):', e);
			}
			if (e instanceof Error && e.stack) {
				console.error('[createProduct] Stack trace:', e.stack);
			}
			throw e instanceof Error ? e : new Error('Error creating product');
		}
	};

	// (Removed unused uploadAndSaveProductImages helper)

	const updateProduct = async (id: string, data: Partial<ProductFormDataWithDelete> & { imagesToDelete?: any[] }) => {
		if (!supabase) throw new Error('Supabase client not initialized');
				const { images, imagesToDelete = [], variants, inventory, variantsToDelete, ...updateData } = data;
				
				// Debug logging
				console.log('[updateProduct] Received variants:', variants);
				console.log('[updateProduct] Received variantsToDelete:', variantsToDelete);
				
				// Ensure sku is null if empty or whitespace
				if ('sku' in updateData && (!updateData.sku || String(updateData.sku).trim() === '')) {
					updateData.sku = null;
				}
				delete (updateData as any).images;
				delete (updateData as any).image_url;
				delete (updateData as any).inventory;
				delete (updateData as any).variants;
				delete (updateData as any).variantsToDelete;
		try {
			// 1. Update product fields
			const { error } = await supabase
				.from('products')
				.update(updateData)
				.eq('id', id);
			if (error) throw error;

			// 2. Delete images marked for deletion
			for (const img of imagesToDelete) {
				if (img.image_url) {
					// Extract filename and remove from local storage
					const filename = extractFileName(img.image_url);
					if (filename) {
						console.log('Deleting image from local storage during update:', filename);
						const deleteResult = await deleteImageFromPublicFolder(filename, 'products');
						if (!deleteResult.success) {
							console.warn('Local storage deletion error during update:', deleteResult.error);
						}
					}
					// Remove from DB
					await supabase.from('product_images').delete().eq('id', img.id);
				}
			}

			// 3. Update metadata for existing images
			if (images) {
				// First, unset is_primary for all images of this product to ensure only one is primary
				await supabase
					.from('product_images')
					.update({ is_primary: false })
					.eq('product_id', id);
				
				// Then update each image with its correct metadata
				for (const img of images) {
					if (img.existing && img.id) {
						await supabase.from('product_images').update({
							alt_text: img.alt_text,
							is_primary: img.is_primary
						}).eq('id', img.id);
					}
				}
			}

			// 4. Upload and insert new images
			if (images) {
				for (const img of images) {
				if (img.file && !img.existing) {
					// Generate unique filename for R2 storage
					const fileName = generateProductImageFileName((updateData as any).name || 'product', img.file.name);
					
					// Upload image to R2 storage
					const uploadResult = await saveImageToPublicFolder(img.file, fileName, 'products');
					
					if (!uploadResult.success) {
						throw new Error(uploadResult.error || 'Image upload failed');
					}
					
					// Use the R2 URL from upload result
					const imageUrl = uploadResult.url || fileName;						const { error: imageError } = await supabase
							.from('product_images')
							.insert([{
								product_id: id,
								image_url: imageUrl, // Store full GitHub URL for consistency
								alt_text: img.alt_text,
								is_primary: img.is_primary
							}]);
						if (imageError) throw imageError;
					}
				}
			}

			// 5. Handle variant deletion first (regardless of whether there are new/updated variants)
			const variantsToDelete = (data as ProductFormDataWithDelete).variantsToDelete;
			if (variantsToDelete && variantsToDelete.length > 0) {
				console.log('[updateProduct] 🗑️ Starting variant deletion process');
				console.log('[updateProduct] Variants to delete:', variantsToDelete);
				
				// 1. Find inventory ids for these variants
				console.log('[updateProduct] Step 1: Finding inventory records for variants...');
				const { data: invRows, error: invFetchError } = await supabase
					.from('inventory')
					.select('id, variant_id')
					.in('variant_id', variantsToDelete);
				
				if (invFetchError) {
					console.error('[updateProduct] Error fetching inventory:', invFetchError);
					throw invFetchError;
				}
				
				const inventoryIds = (invRows || []).map((row: any) => row.id);
				console.log('[updateProduct] Found inventory records:', invRows);
				console.log('[updateProduct] Inventory IDs to delete:', inventoryIds);
				
				// 2. Delete inventory_history
				if (inventoryIds.length > 0) {
					console.log('[updateProduct] Step 2: Deleting inventory history...');
					const { error: histDelError, data: histDelData } = await supabase
						.from('inventory_history')
						.delete()
						.in('inventory_id', inventoryIds);
					console.log('[updateProduct] Inventory history delete result:', { error: histDelError, data: histDelData });
					if (histDelError) {
						console.error('[updateProduct] Failed to delete inventory history:', histDelError);
						throw histDelError;
					}
				}
				
				// 3. Delete inventory
				if (inventoryIds.length > 0) {
					console.log('[updateProduct] Step 3: Deleting inventory records...');
					const { error: invDelError, data: invDelData } = await supabase
						.from('inventory')
						.delete()
						.in('id', inventoryIds);
					console.log('[updateProduct] Inventory delete result:', { error: invDelError, data: invDelData });
					if (invDelError) {
						console.error('[updateProduct] Failed to delete inventory:', invDelError);
						throw invDelError;
					}
				}
				
				// 4. Delete variants
				console.log('[updateProduct] Step 4: Deleting product variants...');
				const { error: varDelError, data: varDelData } = await supabase
					.from('product_variants')
					.delete()
					.in('id', variantsToDelete);
				console.log('[updateProduct] Variant delete result:', { error: varDelError, data: varDelData });
				
				if (varDelError) {
					console.error('[updateProduct] Failed to delete variants:', varDelError);
					throw varDelError;
				}
				
				console.log('[updateProduct] ✅ Variant deletion completed successfully');
				
				// Check if this was the last variant deletion - if so, clean up and ensure product-level inventory
				const { data: remainingVariants } = await supabase
					.from('product_variants')
					.select('id')
					.eq('product_id', id);
				
				if (!remainingVariants || remainingVariants.length === 0) {
					console.log('[updateProduct] No variants remaining - cleaning up orphaned variant inventory');
					
					// Delete ALL variant inventory (variant_id !== null) for this product
					await supabase
						.from('inventory')
						.delete()
						.eq('product_id', id)
						.not('variant_id', 'is', null);
					
					console.log('[updateProduct] Ensuring product-level inventory exists');
					// Check if product-level inventory exists
					const { data: productInv } = await supabase
						.from('inventory')
						.select('*')
						.eq('product_id', id)
						.is('variant_id', null)
						.single();
					
					if (!productInv && inventory) {
						// Create product-level inventory if it doesn't exist
						console.log('[updateProduct] Creating product-level inventory after variant deletion');
						await supabase
							.from('inventory')
							.insert({
								product_id: id,
								variant_id: null,
								quantity: inventory.quantity || 0,
								low_stock_threshold: inventory.low_stock_threshold || 2
							});
					}
				}
			}

			// 6. Update/insert variants and inventory
			if (variants && variants.length > 0) {

								// Update or insert each variant
								for (let i = 0; i < variants.length; i++) {
									const v = variants[i];
									console.log(`[updateProduct] Processing variant ${i}:`, { id: v.id, size: v.size, color: v.color });
									let variantId: string | undefined = undefined;
									if (v.id) {
										// Try to update existing variant
										const { data: updateResult, error: updateVarError } = await supabase
											.from('product_variants')
											.update({
												sku: v.sku === '' ? null : v.sku,
												size: v.size,
												color: v.color,
												price_adjustment: v.price_adjustment,
												swatch_image_id: v.swatch_image_id || null,
												color_hex: (v as any).color_hex || null
											})
											.eq('id', v.id)
											.select();
										
										if (updateVarError) throw updateVarError;
										
										// Check if the update actually found and updated a row
										if (updateResult && updateResult.length > 0) {
											// Successfully updated existing variant
											variantId = v.id;
										} else {
											// Variant with this ID doesn't exist, treat as new variant
											console.log('[updateProduct] Variant ID not found, creating new variant:', v.id);
											const { data: newVar, error: insertVarError } = await supabase
												.from('product_variants')
												.insert({
													product_id: id,
													sku: v.sku === '' ? null : v.sku,
													size: v.size,
													color: v.color,
													price_adjustment: v.price_adjustment,
													swatch_image_id: v.swatch_image_id || null,
													color_hex: (v as any).color_hex || null
												})
												.select()
												.single();
											if (insertVarError) throw insertVarError;
											variantId = newVar.id;
										}
									} else {
										// Insert new variant
										// quantity and low_stock_threshold are unused
										const { data: newVar, error: insertVarError } = await supabase
											.from('product_variants')
											.insert({
												product_id: id,
												sku: v.sku === '' ? null : v.sku,
												size: v.size,
												color: v.color,
												price_adjustment: v.price_adjustment,
												swatch_image_id: v.swatch_image_id || null
											})
											.select()
											.single();
										if (insertVarError) throw insertVarError;
										variantId = newVar.id;
									}

									// Update or insert inventory for this variant
									if (variantId) {
										// Check if inventory exists for this variant
										console.log('[updateProduct] Checking inventory for variant_id:', variantId);
										const { data: invList, error: fetchInvError } = await supabase
											.from('inventory')
											.select('*')
											.eq('variant_id', variantId);
										if (fetchInvError) throw fetchInvError;

										const inv = invList && invList.length > 0 ? invList[0] : null;
										console.log('[updateProduct] Found inventory:', inv ? `ID: ${inv.id}` : 'none');

										if (inv) {
											// Update inventory
											// const prevQty = inv.quantity;
											const newQty = v.quantity ?? 0;
											const { error: updateInvError } = await supabase
												.from('inventory')
												.update({
													quantity: newQty,
													low_stock_threshold: v.low_stock_threshold ?? 2
												})
												.eq('id', inv.id);
											if (updateInvError) throw updateInvError;
											// inventory_history now handled by DB trigger
										} else {
											// Insert inventory - let database generate ID
											const inventoryData = {
												product_id: id,
												variant_id: variantId,
												quantity: v.quantity ?? 0,
												low_stock_threshold: v.low_stock_threshold ?? 2
											};
											console.log('[updateProduct] Inserting inventory:', inventoryData);
											
											// Try insert, if it fails with duplicate key, the sequence is out of sync
											let insertAttempts = 0;
											let insertSuccess = false;
											let lastError = null;
											
											while (insertAttempts < 3 && !insertSuccess) {
												const { error: insertInvError } = await supabase
													.from('inventory')
													.insert(inventoryData)
													.select();
												
												if (!insertInvError) {
													insertSuccess = true;
												} else if (insertInvError.code === '23505') {
													// Duplicate key - sequence out of sync, retry
													console.warn(`[updateProduct] Inventory insert attempt ${insertAttempts + 1} failed with duplicate key, retrying...`);
													insertAttempts++;
													lastError = insertInvError;
													// Wait a tiny bit before retry
													await new Promise(resolve => setTimeout(resolve, 50));
												} else {
													// Different error, throw immediately
													console.error('[updateProduct] Inventory insert error:', insertInvError);
													throw insertInvError;
												}
											}
											
											if (!insertSuccess) {
												console.error('[updateProduct] Failed to insert inventory after 3 attempts:', lastError);
												throw lastError;
											}
											// inventory_history now handled by DB trigger
										}
									}
								}
							}

			// Always update product-level inventory if provided (regardless of variants)
			if (inventory !== undefined && inventory !== null) {
				// Update or insert inventory for product level (variant_id = null)
				const { data: inv, error: fetchInvError } = await supabase
					.from('inventory')
					.select('*')
					.eq('product_id', id)
					.is('variant_id', null)
					.single();
				if (fetchInvError && fetchInvError.code !== 'PGRST116') throw fetchInvError;
				if (inv) {
					const { error: updateInvError } = await supabase
						.from('inventory')
						.update({
							quantity: inventory.quantity,
							low_stock_threshold: inventory.low_stock_threshold
						})
						.eq('id', inv.id);
					if (updateInvError) throw updateInvError;
				} else {
					const { error: insertInvError } = await supabase
						.from('inventory')
						.insert({
							product_id: id,
							variant_id: null,
							quantity: inventory.quantity,
							low_stock_threshold: inventory.low_stock_threshold
						});
					if (insertInvError) throw insertInvError;
				}
			}

			await fetchProducts();
		} catch (e) {
			// Improved error logging
			try {
				console.error('[updateProduct] Caught exception (stringified):', JSON.stringify(e, null, 2));
			} catch (jsonErr) {
				console.error('[updateProduct] Caught exception (raw):', e);
			}
			throw e instanceof Error ? e : new Error('Error updating product');
		}
	};

	// Delete product function with cascade deletion of associated items
	const deleteProduct = async (id: string) => {
		if (!supabase) throw new Error('Supabase client not initialized');
		try {
			// 1. Get product_images for storage cleanup
			const { data: productImages, error: imagesFetchError } = await supabase
				.from('product_images')
				.select('image_url')
				.eq('product_id', id);
			
			if (imagesFetchError) {
				console.warn('Could not fetch product images for cleanup:', imagesFetchError);
			}
			
			// 2. Get variant swatch images separately
			const { data: variantImages, error: variantImagesFetchError } = await supabase
				.from('product_variants')
				.select(`
					swatch_image_id,
					swatch_image:product_images!swatch_image_id(image_url)
				`)
				.eq('product_id', id);
			
			if (variantImagesFetchError) {
				console.warn('Could not fetch variant swatch images for cleanup:', variantImagesFetchError);
			}
			
			// 3. Collect all image URLs for storage cleanup
			const imageUrlsToDelete: string[] = [];
			
			// Add product_images table images
			if (productImages && Array.isArray(productImages)) {
				imageUrlsToDelete.push(...productImages.map(img => img.image_url));
			}
			
			// Add variant swatch images
			if (variantImages && Array.isArray(variantImages)) {
				variantImages.forEach((variant: any) => {
					if (variant.swatch_image?.image_url) {
						imageUrlsToDelete.push(variant.swatch_image.image_url);
					}
				});
			}
			
			// 4. Delete all images from local storage IMMEDIATELY (before any database deletions)
			if (imageUrlsToDelete.length > 0) {
				const imageFilenames = imageUrlsToDelete
					.map(url => extractFileName(url))
					.filter(filename => filename !== null) as string[];
				
				if (imageFilenames.length > 0) {
					console.log('Deleting product images from GitHub storage:', imageFilenames);
					
					// Delete each image individually to handle errors gracefully
					for (const filename of imageFilenames) {
						const deleteResult = await deleteImageFromPublicFolder(filename, 'products');
						if (!deleteResult.success) {
							console.warn(`❌ Failed to delete image ${filename}:`, deleteResult.error);
						} else {
							console.log(`✅ Successfully processed image deletion: ${filename}`);
						}
					}
					
					console.log(`✅ Processed ${imageFilenames.length} product images for deletion`);
				}
			} else {
				console.log('No images to delete from storage');
			}
			
			// 5. Delete inventory history records (get fresh list to ensure we catch all)
			const { data: allInventoryForProduct, error: allInvError } = await supabase
				.from('inventory')
				.select('id')
				.eq('product_id', id);
			if (allInvError) throw allInvError;
			
			const allInventoryIds = allInventoryForProduct?.map(inv => inv.id) || [];
			if (allInventoryIds.length > 0) {
				// Delete all inventory history for these inventory records
				const { error: historyDeleteError } = await supabase
					.from('inventory_history')
					.delete()
					.in('inventory_id', allInventoryIds);
				if (historyDeleteError) {
					console.warn('Inventory history deletion error:', historyDeleteError.message);
					// Try alternative approach - delete any remaining history records
					try {
						const { error: remainingHistoryError } = await supabase
							.from('inventory_history')
							.delete()
							.in('inventory_id', allInventoryIds);
						if (remainingHistoryError) {
							console.warn('[deleteProduct] Still some inventory history remaining, will proceed anyway');
						}
					} catch (e) {
						console.warn('[deleteProduct] Could not clean all inventory history, continuing...');
					}
				} else {
					console.log('[deleteProduct] Deleted inventory history records:', allInventoryIds.length);
				}
			}
			
			// 8. Delete inventory records (both variant and product inventory)
			try {
				const { error: inventoryDeleteError } = await supabase
					.from('inventory')
					.delete()
					.eq('product_id', id);
				if (inventoryDeleteError) {
					// If there are still foreign key issues, try to clean up remaining history
					if (inventoryDeleteError.code === '23503' && 
						inventoryDeleteError.message?.includes('inventory_history')) {
						console.warn('[deleteProduct] Inventory deletion conflict, cleaning remaining history...');
						
						// Get current inventory IDs and clean up any remaining history AGGRESSIVELY
						const { data: currentInventory } = await supabase
							.from('inventory')
							.select('id')
							.eq('product_id', id);
						
						if (currentInventory && currentInventory.length > 0) {
							const currentIds = currentInventory.map(inv => inv.id);
							console.log('[deleteProduct] Found remaining inventory IDs:', currentIds);
							
							// Try multiple cleanup attempts
							for (let attempt = 0; attempt < 3; attempt++) {
								console.log(`[deleteProduct] History cleanup attempt ${attempt + 1}/3`);
								
								// First, let's try to see ALL inventory_history without any filters
								const { data: allHistory, error: allHistoryError } = await supabase
									.from('inventory_history')
									.select('id, inventory_id')
									.limit(100);
								
								if (!allHistoryError && allHistory) {
									console.log(`[deleteProduct] Total inventory_history records in database: ${allHistory.length}`);
									
									// Check if any of these match our inventory IDs
									const matchingHistory = allHistory.filter(h => currentIds.includes(h.inventory_id));
									console.log(`[deleteProduct] Records matching our inventory IDs: ${matchingHistory.length}`, matchingHistory);
								}
								
								// Now check for our specific inventory IDs
								const { data: remainingHistory, error: historyQueryError } = await supabase
									.from('inventory_history')
									.select('id, inventory_id')
									.in('inventory_id', currentIds);
								
								if (!historyQueryError && remainingHistory && remainingHistory.length > 0) {
									console.log(`[deleteProduct] Found ${remainingHistory.length} remaining history records`, remainingHistory);
									
									const { error: cleanupError } = await supabase
										.from('inventory_history')
										.delete()
										.in('inventory_id', currentIds);
									
									if (cleanupError) {
										console.warn(`[deleteProduct] Cleanup attempt ${attempt + 1} failed:`, cleanupError.message);
									} else {
										console.log(`[deleteProduct] Cleanup attempt ${attempt + 1} succeeded`);
										break;
									}
								} else {
									console.log(`[deleteProduct] No more history records found on attempt ${attempt + 1}`);
									
									// Let's try a different approach - delete by product_id if possible
									const { data: historyByProduct, error: productHistoryError } = await supabase
										.from('inventory_history')
										.select('id, inventory_id')
										.eq('product_id', id);  // This might not exist, but let's try
									
									if (!productHistoryError && historyByProduct && historyByProduct.length > 0) {
										console.log(`[deleteProduct] Found history records by product_id: ${historyByProduct.length}`);
										
										const { error: productCleanupError } = await supabase
											.from('inventory_history')
											.delete()
											.eq('product_id', id);
										
										if (!productCleanupError) {
											console.log(`[deleteProduct] Successfully cleaned history by product_id`);
											break;
										}
									}
									
									// If we still can't find history records but get FK error, try raw SQL cleanup
									console.log(`[deleteProduct] Attempting raw cleanup with SQL function...`);
									break;
								}
							}
							
							// Try inventory deletion again
							const { error: retryInventoryError } = await supabase
								.from('inventory')
								.delete()
								.eq('product_id', id);
							if (retryInventoryError) {
								console.error('[deleteProduct] Inventory deletion still failed after cleanup:', retryInventoryError);
								
								// Last resort: try the RPC function for this specific product
								console.log('[deleteProduct] Attempting last resort: RPC function for remaining cleanup...');
								try {
									// First try the helper function to clean inventory history
									const { data: cleanupResult, error: cleanupRpcError } = await supabase.rpc('clean_inventory_history_for_product', {
										product_id: id
									});
									
									if (!cleanupRpcError) {
										console.log(`[deleteProduct] Helper function cleaned ${cleanupResult} inventory history records`);
										
										// Now try inventory deletion again
										const { error: finalInventoryError } = await supabase
											.from('inventory')
											.delete()
											.eq('product_id', id);
										
										if (!finalInventoryError) {
											console.log('[deleteProduct] Inventory deletion succeeded after RPC cleanup!');
											// Continue with the rest of the deletion process - don't try full RPC
											
											// Clean up audit logs now that inventory is handled
											try {
												const { error: auditCleanupError } = await supabase
													.from('product_audit_log')
													.delete()
													.eq('product_id', id);
												if (auditCleanupError) {
													console.warn('[deleteProduct] Audit log cleanup warning (continuing anyway):', auditCleanupError.message);
												} else {
													console.log('[deleteProduct] Cleaned up audit logs');
												}
											} catch (auditError) {
												console.warn('[deleteProduct] Audit log cleanup failed (continuing anyway)');
											}
										} else {
											console.log('[deleteProduct] Inventory deletion still failed, trying full RPC function...');
											
											// If helper didn't work, try the full RPC function
											const { error: rpcError } = await supabase.rpc('delete_product_with_audit_cleanup', {
												product_id: id
											});
											
											if (rpcError) {
												console.error('[deleteProduct] RPC function also failed:', rpcError.message);
												throw retryInventoryError;
											} else {
												console.log('[deleteProduct] RPC function succeeded! Product deletion completed.');
												return; // Skip the rest of the deletion process since RPC handled everything
											}
										}
									} else {
										// Helper function failed, try the full RPC function
										console.log('[deleteProduct] Helper function failed, trying full RPC function...');
										
										const { error: rpcError } = await supabase.rpc('delete_product_with_audit_cleanup', {
											product_id: id
										});
										
										if (rpcError) {
											console.error('[deleteProduct] RPC function also failed:', rpcError.message);
											throw retryInventoryError;
										} else {
											console.log('[deleteProduct] RPC function succeeded! Product deletion completed.');
											return; // Skip the rest of the deletion process since RPC handled everything
										}
									}
								} catch (rpcFallbackError) {
									console.error('[deleteProduct] RPC fallback failed:', rpcFallbackError);
									throw retryInventoryError;
								}
							} else {
								console.log('[deleteProduct] Inventory deletion succeeded after cleanup');
							}
						}
					} else {
						throw inventoryDeleteError;
					}
				}
				console.log('[deleteProduct] Deleted inventory records for product:', id);
			} catch (invError) {
				console.error('[deleteProduct] Inventory deletion failed:', invError);
				throw invError;
			}
			
			// 9. Handle order items that reference this product (set product_id to NULL) - OPTIONAL
			try {
				const { error: orderItemsUpdateError } = await supabase
					.from('order_items')
					.update({ product_id: null })
					.eq('product_id', id);
				if (orderItemsUpdateError) {
					console.warn('[deleteProduct] Order items update skipped (table not accessible):', orderItemsUpdateError.message);
				} else {
					console.log('[deleteProduct] Updated order items to remove product reference');
				}
			} catch (orderError) {
				console.warn('[deleteProduct] Order items update skipped (table not accessible)');
			}
			
			// 10. Delete product analytics records - OPTIONAL  
			try {
				const { error: analyticsDeleteError } = await supabase
					.from('product_analytics')
					.delete()
					.eq('product_id', id);
				if (analyticsDeleteError) {
					console.warn('[deleteProduct] Analytics deletion skipped (table not accessible):', analyticsDeleteError.message);
				} else {
					console.log('[deleteProduct] Deleted product analytics records');
				}
			} catch (analyticsError) {
				console.warn('[deleteProduct] Analytics deletion skipped (table not accessible)');
			}
			
			// 11. Delete the product using a stored procedure to handle audit log conflicts
			console.log('[deleteProduct] About to delete product:', id);
			
			// First, try to delete using RPC (stored procedure) if available
			try {
				const { error: rpcError } = await supabase.rpc('delete_product_with_audit_cleanup', {
					product_id: id
				});
				
				if (rpcError) {
					console.log('[deleteProduct] RPC method not available, trying direct deletion');
					
					// Fallback to direct deletion with manual audit cleanup
					// Temporarily delete audit logs to avoid trigger conflict
					await supabase
						.from('product_audit_log')
						.delete()
						.eq('product_id', id);
					
					// Now delete the product (trigger will try to create audit log but we'll handle the error)
					const { error: productDeleteError } = await supabase
						.from('products')
						.delete()
						.eq('id', id);
					
					if (productDeleteError) {
						// If it's the audit log trigger conflict, ignore it (product was deleted)
						if (productDeleteError.code === '23503' && 
							productDeleteError.message?.includes('product_audit_log')) {
							console.warn('[deleteProduct] Product deleted successfully, audit trigger conflict ignored');
						} else {
							console.error('[deleteProduct] Product deletion error:', productDeleteError);
							throw productDeleteError;
						}
					}
				}
				
				console.log('[deleteProduct] Deleted product:', id);
			} catch (deleteError: any) {
				// Handle the audit log trigger conflict specifically
				if (deleteError.code === '23503' && 
					deleteError.message?.includes('product_audit_log')) {
					console.warn('[deleteProduct] Product deleted successfully despite audit trigger conflict');
				} else {
					console.error('[deleteProduct] Unexpected product deletion error:', deleteError);
					throw deleteError;
				}
			}
			
			await fetchProducts();
		} catch (e) {
			console.error('Error deleting product:', e);
			// Enhanced error logging for debugging
			if (e && typeof e === 'object') {
				try {
					console.error('Error details (stringified):', JSON.stringify(e, null, 2));
				} catch (jsonErr) {
					console.error('Error details (raw object):', e);
					if ((e as any).constructor) {
						console.error('Error constructor:', (e as any).constructor.name);
					}
					if ((e as any).message) {
						console.error('Error message:', (e as any).message);
					}
					if ((e as any).code) {
						console.error('Error code:', (e as any).code);
					}
					if ((e as any).details) {
						console.error('Error details:', (e as any).details);
					}
				}
			}
			throw e instanceof Error ? e : new Error('Error deleting product');
		}
	};

	// Bulk delete products function
	const deleteProducts = async (ids: string[]) => {
		if (!supabase) throw new Error('Supabase client not initialized');
		if (!ids || ids.length === 0) throw new Error('No product IDs provided');
		
		try {
			// Delete products one by one to ensure proper cleanup
			const results = [];
			for (const id of ids) {
				try {
					await deleteProduct(id);
					results.push({ id, success: true });
				} catch (error) {
					console.error(`Failed to delete product ${id}:`, error);
					// Enhanced error logging for debugging
					if (error && typeof error === 'object') {
						try {
							console.error(`Product ${id} error details (stringified):`, JSON.stringify(error, null, 2));
						} catch (jsonErr) {
							console.error(`Product ${id} error details (raw):`, error);
						}
					}
					results.push({ id, success: false, error });
				}
			}
			
			const failureCount = results.filter(r => !r.success).length;
			
			if (failureCount > 0) {
				const failedIds = results.filter(r => !r.success).map(r => r.id);
				throw new Error(`Failed to delete ${failureCount} products: ${failedIds.join(', ')}`);
			}
			
			return results;
		} catch (e) {
			console.error('Bulk deletion error:', e);
			throw e instanceof Error ? e : new Error('Error in bulk product deletion');
		}
	};

	return {
		products,
		loading,
		error,
		createProduct,
		updateProduct,
		deleteProduct,
		deleteProducts,
		refresh: fetchProducts
	};
};

// Dashboard Analytics
export const useDashboardAnalytics = () => {
	const { supabase } = useAuth();
	const [analytics, setAnalytics] = useState({
		totalOrders: 0,
		totalRevenue: 0,
		totalCustomers: 0,
		totalProducts: 0
	});
	const [recentOrders, setRecentOrders] = useState<any[]>([]);
	const [topProducts, setTopProducts] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!supabase) return;
		fetchDashboardData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [supabase]);

	const fetchDashboardData = async () => {
		if (!supabase) return;
		setLoading(true);
		try {
			// Check if orders table exists
			const { error: ordersCheckError } = await supabase
				.from('orders')
				.select('id')
				.limit(1);

			if (ordersCheckError && ordersCheckError.code === '42P01') {
				// Tables don't exist, use mock data
				console.log('Using mock data - orders tables not yet created');
				setAnalytics({
					totalOrders: 6,
					totalRevenue: 25294,
					totalCustomers: 6,
					totalProducts: 0
				});

				setRecentOrders([
					{
						id: 1,
						order_number: 'ORD-001',
						customer_name: 'Priya Sharma',
						avatar_initials: 'PS',
						status: 'processing',
						total_amount: 2499,
						time_ago: '2 mins ago'
					},
					{
						id: 2,
						order_number: 'ORD-002',
						customer_name: 'Arjun Patel',
						avatar_initials: 'AP',
						status: 'shipped',
						total_amount: 4299,
						time_ago: '15 mins ago'
					},
					{
						id: 3,
						order_number: 'ORD-003',
						customer_name: 'Meera Singh',
						avatar_initials: 'MS',
						status: 'delivered',
						total_amount: 1899,
						time_ago: '1 hour ago'
					},
					{
						id: 4,
						order_number: 'ORD-004',
						customer_name: 'Rohit Kumar',
						avatar_initials: 'RK',
						status: 'processing',
						total_amount: 3599,
						time_ago: '2 hours ago'
					}
				]);

				setTopProducts([
					{
						id: 1,
						name: 'Elegant Banarasi Saree',
						total_sales: 45,
						total_revenue: 112455,
						trend: '+12%',
						image_url: null
					},
					{
						id: 2,
						name: 'Royal Lehenga Set',
						total_sales: 23,
						total_revenue: 105777,
						trend: '+8%',
						image_url: null
					},
					{
						id: 3,
						name: 'Designer Anarkali',
						total_sales: 18,
						total_revenue: 28782,
						trend: '+15%',
						image_url: null
					}
				]);
			} else {
				// Real database queries (when tables exist)
				const today = new Date().toISOString().split('T')[0];
				
				// Get today's analytics
				const { data: todayAnalytics, error: analyticsError } = await supabase
					.from('daily_analytics')
					.select('*')
					.eq('date', today)
					.single();

				if (analyticsError && analyticsError.code !== 'PGRST116') {
					console.warn('Analytics error:', analyticsError);
				}

				// Get total customers count
				const { count: customersCount, error: customersError } = await supabase
					.from('customers')
					.select('*', { count: 'exact', head: true });

				if (customersError) {
					console.warn('Customers count error:', customersError);
				}

				// Fetch recent orders
				const { data: orders, error: ordersError } = await supabase
					.from('recent_orders_view')
					.select('*')
					.limit(5);

				if (ordersError) {
					console.warn('Recent orders error:', ordersError);
					setRecentOrders([]);
				} else {
					setRecentOrders(orders || []);
				}

				// Fetch top products
				const { data: products, error: topProductsError } = await supabase
					.from('top_products_view')
					.select('*')
					.limit(3);

				if (topProductsError) {
					console.warn('Top products error:', topProductsError);
					setTopProducts([]);
				} else {
					setTopProducts(products || []);
				}

				// Set analytics data
				setAnalytics({
					totalOrders: todayAnalytics?.total_orders || 0,
					totalRevenue: todayAnalytics?.total_revenue || 0,
					totalCustomers: customersCount || 0,
					totalProducts: 0
				});
			}

			// Get total products count (this table exists)
			const { count: productsCount, error: productsError } = await supabase
				.from('products')
				.select('*', { count: 'exact', head: true });

			if (productsError) {
				console.warn('Products count error:', productsError);
			} else {
				setAnalytics(prev => ({ ...prev, totalProducts: productsCount || 0 }));
			}

		} catch (e) {
			setError(e instanceof Error ? e.message : 'Error fetching dashboard data');
		} finally {
			setLoading(false);
		}
	};

	return {
		analytics,
		recentOrders,
		topProducts,
		loading,
		error,
		refresh: fetchDashboardData
	};
};

// Product Import Functionality
interface ImportOptions {
	batchSize: number;
	skipDuplicates: boolean;
	updateExisting: boolean;
	validateOnly: boolean;
	onProgress?: (progress: number, status: string) => void;
}

interface ImportResult {
	success: number;
	failed: number;
	errors: Array<{
		row: number;
		product: string;
		error: string;
	}>;
	warnings: Array<{
		row: number;
		product: string;
		warning: string;
	}>;
}

export const importProducts = async (
	csvData: any[], 
	options: ImportOptions
): Promise<ImportResult> => {
	const { batchSize, skipDuplicates, updateExisting, validateOnly, onProgress } = options;
	const result: ImportResult = {
		success: 0,
		failed: 0,
		errors: [],
		warnings: []
	};

	try {
		// Validate CSV structure
		onProgress?.(5, 'Validating CSV structure...');
		const requiredFields = ['name', 'category_name', 'price'];
		const firstRow = csvData[0];
		
		for (const field of requiredFields) {
			if (!Object.prototype.hasOwnProperty.call(firstRow, field)) {
				throw new Error(`Missing required field: ${field}`);
			}
		}

		// Get categories and vendors for reference
		onProgress?.(10, 'Loading reference data...');
		
		if (!supabaseAdmin) {
			throw new Error('Supabase admin client not initialized - missing service role key');
		}
		
		const [categoriesResult, vendorsResult] = await Promise.all([
			supabaseAdmin.from('categories').select('id, name'),
			supabaseAdmin.from('vendors').select('id, name')
		]);

		if (categoriesResult.error) throw categoriesResult.error;
		if (vendorsResult.error) throw vendorsResult.error;

		const categoriesMap = new Map(
			categoriesResult.data.map((cat: any) => [cat.name.toLowerCase(), cat.id])
		);
		const vendorsMap = new Map(
			vendorsResult.data.map((vendor: any) => [vendor.name.toLowerCase(), vendor.id])
		);

		// Process products in batches
		const totalProducts = csvData.length;
		const batches = [];
		
		for (let i = 0; i < totalProducts; i += batchSize) {
			batches.push(csvData.slice(i, i + batchSize));
		}

		let processedCount = 0;

		for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
			const batch = batches[batchIndex];
			const batchProgress = 15 + (batchIndex / batches.length) * 80;
			
			onProgress?.(batchProgress, `Processing batch ${batchIndex + 1}/${batches.length}...`);

			for (const row of batch) {
				const rowNumber = processedCount + 1;
				
				try {
					// Generate slug from name
					const slug = generateSlug(row.name || '');
					if (!slug) {
						throw new Error('Product name is required');
					}

					// Validate required fields
					if (!row.name?.trim()) {
						throw new Error('Product name is required');
					}
					if (!row.category_name?.trim()) {
						throw new Error('Category name is required');
					}
					if (!row.price || isNaN(parseFloat(row.price))) {
						throw new Error('Valid price is required');
					}

					// Check for duplicates
					if (skipDuplicates) {
						const existingProduct = await supabaseAdmin
							.from('products')
							.select('id, name')
							.or(`sku.eq.${row.sku || ''},slug.eq.${slug}`)
							.single();

						if (existingProduct.data && !updateExisting) {
							result.warnings.push({
								row: rowNumber,
								product: row.name,
								warning: 'Product already exists (skipped)'
							});
							continue;
						}
					}

					// Find category ID
					const categoryId = categoriesMap.get(row.category_name.toLowerCase());
					if (!categoryId) {
						throw new Error(`Category "${row.category_name}" not found`);
					}

					// Find vendor ID (optional)
					let vendorId = null;
					if (row.vendor_name?.trim()) {
						vendorId = vendorsMap.get(row.vendor_name.toLowerCase());
						if (!vendorId) {
							result.warnings.push({
								row: rowNumber,
								product: row.name,
								warning: `Vendor "${row.vendor_name}" not found, creating without vendor`
							});
						}
					}

					if (validateOnly) {
						// Just validate, don't actually import
						result.success++;
						continue;
					}

					// Prepare product data
					const productData = {
						name: row.name.trim(),
						slug: slug,
						description: row.description || null,
						category_id: categoryId,
						vendor_id: vendorId,
						price: parseFloat(row.price),
						sale_price: row.sale_price ? parseFloat(row.sale_price) : null,
						sku: row.sku || null,
						is_active: row.is_active?.toLowerCase() === 'true',
						meta_title: row.meta_title || null,
						meta_description: row.meta_description || null,
						created_by: 'import',
						updated_by: 'import'
					};

					// Insert product
					const { data: newProduct, error: productError } = await supabaseAdmin
						.from('products')
						.insert(productData)
						.select()
						.single();

					if (productError) throw productError;

					// Process variants if they exist
					if (row.variant_sizes || row.variant_colors) {
						const variantSizes = row.variant_sizes ? row.variant_sizes.split('|') : [''];
						const variantColors = row.variant_colors ? row.variant_colors.split('|') : [''];
						const variantSkus = row.variant_skus ? row.variant_skus.split('|') : [];
						const variantColorHex = row.variant_color_hex ? row.variant_color_hex.split('|') : [];
						const variantPriceAdjustments = row.variant_price_adjustments ? row.variant_price_adjustments.split('|') : [];
						const quantities = row.quantities ? row.quantities.split('|') : [];
						const lowStockThresholds = row.low_stock_thresholds ? row.low_stock_thresholds.split('|') : [];

						const variants: Array<{
							size: string | null;
							color: string | null;
							color_hex: string | null;
							sku: string | null;
							quantity: number;
							low_stock_threshold: number;
							price_adjustment: number;
						}> = [];
						const maxVariants = Math.max(variantSizes.length, variantColors.length, 1);

						for (let i = 0; i < maxVariants; i++) {
							if (variantSizes[i] || variantColors[i]) {
								variants.push({
									size: variantSizes[i] || null,
									color: variantColors[i] || null,
									sku: variantSkus[i] || null,
									color_hex: variantColorHex[i] || null,
									price_adjustment: variantPriceAdjustments[i] ? parseFloat(variantPriceAdjustments[i]) : 0,
									quantity: quantities[i] ? parseInt(quantities[i]) : 0,
									low_stock_threshold: lowStockThresholds[i] ? parseInt(lowStockThresholds[i]) : 2
								});
							}
						}

						// Insert variants
						if (variants.length > 0) {
							const variantsToInsert = variants.map(variant => ({
								product_id: newProduct.id,
								sku: variant.sku,
								size: variant.size,
								color: variant.color,
								color_hex: variant.color_hex,
								price_adjustment: variant.price_adjustment,
								swatch_image_id: null
							}));

							const { data: insertedVariants, error: variantError } = await supabaseAdmin
								.from('product_variants')
								.insert(variantsToInsert)
								.select();

							if (variantError) throw variantError;

							// Insert inventory for each variant
							const inventoryToInsert = insertedVariants.map((variant: any, index: any) => ({
								product_id: newProduct.id,
								variant_id: variant.id,
								quantity: variants[index].quantity,
								low_stock_threshold: variants[index].low_stock_threshold
							}));

							const { error: inventoryError } = await supabaseAdmin
								.from('inventory')
								.insert(inventoryToInsert);

							if (inventoryError) throw inventoryError;
						} else {
							// Product without variants - create base inventory
							const { error: inventoryError } = await supabaseAdmin
								.from('inventory')
								.insert({
									product_id: newProduct.id,
									variant_id: null,
									quantity: row.quantities ? parseInt(row.quantities) : 0,
									low_stock_threshold: row.low_stock_thresholds ? parseInt(row.low_stock_thresholds) : 2
								});

							if (inventoryError) throw inventoryError;
						}
					} else {
						// Product without variants - create base inventory
						const { error: inventoryError } = await supabaseAdmin
							.from('inventory')
							.insert({
								product_id: newProduct.id,
								variant_id: null,
								quantity: row.quantities ? parseInt(row.quantities) : 0,
								low_stock_threshold: row.low_stock_thresholds ? parseInt(row.low_stock_thresholds) : 2
							});

						if (inventoryError) throw inventoryError;
					}

					result.success++;

				} catch (error) {
					result.failed++;
					result.errors.push({
						row: rowNumber,
						product: row.name || 'Unknown',
						error: error instanceof Error ? error.message : 'Unknown error'
					});
				}

				processedCount++;
			}
		}

		onProgress?.(100, 'Import completed');
		return result;

	} catch (error) {
		throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
};

// Helper function to generate URL-friendly slug
const generateSlug = (text: string): string => {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9 -]/g, '') // Remove special characters
		.replace(/\s+/g, '-') // Replace spaces with hyphens
		.replace(/-+/g, '-') // Replace multiple hyphens with single
		.replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};
