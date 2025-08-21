import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type {
	Product,
	Category,
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
		if (categories) console.log('[Categories] Data:', categories);
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

	React.useEffect(() => {
		if (error) console.error('[Products] Error:', error);
		if (products) console.log('[Products] Data:', products);
	}, [products, error]);

	const fetchProducts = async () => {
		if (!supabase) return;
		setLoading(true);
		try {
			// First fetch products with basic joins
			const { data: productsData, error: productsError } = await supabase
				.from('products')
				.select(`
					*,
					category:categories(*),
					images:product_images(*),
					variants:product_variants(*)
				`)
				.order('created_at', { ascending: false });

			console.log('[Supabase products] productsData:', productsData);
			console.log('[Supabase products] productsError:', productsError);

			if (productsError && !productsData) throw productsError;

			// Fetch inventory separately
			console.log('[Debug] About to fetch inventory...');
			
			// Check current user and session
			const { data: session } = await supabase.auth.getSession();
			console.log('[Auth Check] Current session:', session?.session?.user?.id);
			console.log('[Auth Check] User role:', session?.session?.user?.role);
			console.log('[Auth Check] User email:', session?.session?.user?.email);
			
			const { data: inventoryData, error: inventoryError } = await supabase
				.from('inventory')
				.select('*');

			console.log('[Supabase inventory] inventoryData:', inventoryData);
			console.log('[Supabase inventory] inventoryError:', inventoryError);
			
			// If we get an empty array, try to understand why
			if (inventoryData && inventoryData.length === 0) {
				console.log('[Debug] Inventory table returned empty. Checking if it\'s an RLS issue...');
				
				// Try to get just one specific record that we know exists
				const { data: specificInventory, error: specificError } = await supabase
					.from('inventory')
					.select('*')
					.eq('product_id', '707d596f-902f-4b04-9dac-1e0aa844572a')
					.limit(1);
				console.log('[Debug] Specific inventory for product 707d596f:', specificInventory, specificError);
				
				// Try a simple count without data
				const { count: totalCount, error: countErr } = await supabase
					.from('inventory')
					.select('*', { count: 'exact', head: true });
				console.log('[Debug] Total inventory count:', totalCount, 'error:', countErr);
			}

			// Also try to get count
			const { count, error: countError } = await supabase
				.from('inventory')
				.select('*', { count: 'exact', head: true });
			
			console.log('[Inventory Count]', count, 'error:', countError);

			// Test if we can see any data with different conditions
			const { data: allInventory, error: allError } = await supabase
				.from('inventory')
				.select('id, product_id, quantity')
				.limit(10);
			
			console.log('[All Inventory Limited]', allInventory, allError);

			// Try without RLS (this will fail if RLS is enabled but helps debug)
			try {
				const { data: rawInventory, error: rawError } = await supabase
					.rpc('get_inventory_raw');
				console.log('[Raw Inventory Check]', rawInventory, rawError);
			} catch (rpcError) {
				console.log('[RPC Error]', rpcError);
			}

			if (inventoryError) {
				console.error('[Inventory Error]', inventoryError);
			}

			// Manually join inventory to products
			const productsWithInventory = (productsData || []).map(product => {
				const productInventory = (inventoryData || []).filter(inv => inv.product_id === product.id);
				console.log(`[Manual Join] Product ${product.name} (${product.id}) matched inventory:`, productInventory);
				return {
					...product,
					inventory: productInventory
				};
			});

			console.log('[Products Debug] productsWithInventory:', productsWithInventory);
			if (productsWithInventory.length > 0) {
				console.log('[Products Debug] First product inventory:', productsWithInventory[0]?.inventory);
				console.log('[Products Debug] All product IDs:', productsWithInventory.map(p => p.id));
			}

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
						const fileName = `${Date.now()}-${image.file.name}`;
						const { error: uploadError } = await supabase.storage
							.from('product-images')
							.upload(fileName, image.file);

						if (uploadError) {
							console.error(`[createProduct] Upload error for image ${index + 1}:`, uploadError);
							throw uploadError;
						}

						console.log(`[createProduct] Inserting image ${index + 1} record with product_id:`, newProduct.id, 'Type:', typeof newProduct.id);
						const { error: imageError } = await supabase
							.from('product_images')
							.insert([{
								product_id: newProduct.id,
								image_url: fileName,
								alt_text: image.alt_text,
								is_primary: image.is_primary
							}]);

						if (imageError) {
							console.error(`[createProduct] Image DB insert error for image ${index + 1}:`, imageError);
							console.error(`[createProduct] Failed insert data:`, {
								product_id: newProduct.id,
								product_id_type: typeof newProduct.id,
								image_url: fileName,
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
				// Remove quantity and low_stock_threshold from variant insert, collect for inventory
				const variantsToInsert = variants.map(({ quantity, low_stock_threshold, ...rest }: { quantity: number; low_stock_threshold: number; [key: string]: any }) => ({
					...rest,
					sku: rest.sku === '' ? null : rest.sku,
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
						low_stock_threshold: variants[i].low_stock_threshold ?? (inventory?.low_stock_threshold ?? 10)
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
			} else if (inventory) {
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
					// Remove from storage
					await supabase.storage.from('product-images').remove([img.image_url]);
					// Remove from DB
					await supabase.from('product_images').delete().eq('id', img.id);
				}
			}

			// 3. Update metadata for existing images
			if (images) {
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
						const fileName = `${Date.now()}-${img.file.name}`;
						const { error: uploadError } = await supabase.storage
							.from('product-images')
							.upload(fileName, img.file);
						if (uploadError) throw uploadError;
						const { error: imageError } = await supabase
							.from('product_images')
							.insert([{
								product_id: id,
								image_url: fileName,
								alt_text: img.alt_text,
								is_primary: img.is_primary
							}]);
						if (imageError) throw imageError;
					}
				}
			}

			// 5. Update variants and inventory
								if (variants && variants.length > 0) {
									// Delete variants explicitly marked for deletion
									const variantsToDelete = (data as ProductFormDataWithDelete).variantsToDelete;
													if (variantsToDelete && variantsToDelete.length > 0) {
														console.log('[updateProduct] Deleting variants:', variantsToDelete);
														// 1. Find inventory ids for these variants
														const { data: invRows, error: invFetchError } = await supabase
															.from('inventory')
															.select('id')
															.in('variant_id', variantsToDelete);
														if (invFetchError) throw invFetchError;
														const inventoryIds = (invRows || []).map((row: any) => row.id);
														// 2. Delete inventory_history
														if (inventoryIds.length > 0) {
															const { error: histDelError, data: histDelData } = await supabase
																.from('inventory_history')
																.delete()
																.in('inventory_id', inventoryIds);
															console.log('[updateProduct] Inventory history delete result:', histDelError, histDelData);
														}
														// 3. Delete inventory
														if (inventoryIds.length > 0) {
															const { error: invDelError, data: invDelData } = await supabase
																.from('inventory')
																.delete()
																.in('id', inventoryIds);
															console.log('[updateProduct] Inventory delete result:', invDelError, invDelData);
														}
														// 4. Delete variants
														const { error: varDelError, data: varDelData } = await supabase
															.from('product_variants')
															.delete()
															.in('id', variantsToDelete);
														console.log('[updateProduct] Variant delete result:', varDelError, varDelData);
													}

								// Update or insert each variant
								for (let i = 0; i < variants.length; i++) {
									const v = variants[i];
									let variantId: string | undefined = undefined;
									if (v.id) {
										variantId = v.id;
										// Update existing variant
										// quantity and low_stock_threshold are unused
										const { error: updateVarError } = await supabase
											.from('product_variants')
											.update({
												sku: v.sku === '' ? null : v.sku,
												size: v.size,
												color: v.color,
												price_adjustment: v.price_adjustment
											})
											.eq('id', variantId);
										if (updateVarError) throw updateVarError;
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
												price_adjustment: v.price_adjustment
											})
											.select()
											.single();
										if (insertVarError) throw insertVarError;
										variantId = newVar.id;
									}

									// Update or insert inventory for this variant
									if (variantId) {
										// Check if inventory exists for this variant
										const { data: inv, error: fetchInvError } = await supabase
											.from('inventory')
											.select('*')
											.eq('variant_id', variantId)
											.single();
										if (fetchInvError && fetchInvError.code !== 'PGRST116') throw fetchInvError;

										if (inv) {
											// Update inventory
											// const prevQty = inv.quantity;
											const newQty = v.quantity ?? 0;
											const { error: updateInvError } = await supabase
												.from('inventory')
												.update({
													quantity: newQty,
													low_stock_threshold: v.low_stock_threshold ?? 10
												})
												.eq('id', inv.id);
											if (updateInvError) throw updateInvError;
											// inventory_history now handled by DB trigger
										} else {
											// Insert inventory
											const { error: insertInvError } = await supabase
												.from('inventory')
												.insert({
													product_id: id,
													variant_id: variantId,
													quantity: v.quantity ?? 0,
													low_stock_threshold: v.low_stock_threshold ?? 10
												})
												.select()
												.single();
											if (insertInvError) throw insertInvError;
											// inventory_history now handled by DB trigger
										}
									}
								}
							} else if (inventory) {
				// No variants, update or insert inventory for product only
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
			console.log('[deleteProduct] Starting deletion for product:', id);
			
			// 1. Get product images for storage cleanup
			const { data: productImages, error: imagesFetchError } = await supabase
				.from('product_images')
				.select('image_url')
				.eq('product_id', id);
			
			if (imagesFetchError) throw imagesFetchError;
			
			// 2. Get product variants for inventory cleanup
			const { data: productVariants, error: variantsFetchError } = await supabase
				.from('product_variants')
				.select('id')
				.eq('product_id', id);
			
			if (variantsFetchError) throw variantsFetchError;
			
			// 3. Get inventory records for history cleanup
			const variantIds = productVariants?.map(v => v.id) || [];
			let inventoryIds: any[] = [];
			
			if (variantIds.length > 0) {
				const { data: variantInventory, error: variantInvError } = await supabase
					.from('inventory')
					.select('id')
					.in('variant_id', variantIds);
				if (variantInvError) throw variantInvError;
				inventoryIds = [...inventoryIds, ...(variantInventory?.map(inv => inv.id) || [])];
			}
			
			// Also get main product inventory (without variant)
			const { data: productInventory, error: productInvError } = await supabase
				.from('inventory')
				.select('id')
				.eq('product_id', id)
				.is('variant_id', null);
			if (productInvError) throw productInvError;
			inventoryIds = [...inventoryIds, ...(productInventory?.map(inv => inv.id) || [])];
			
			// 4. Delete inventory history records
			if (inventoryIds.length > 0) {
				const { error: historyDeleteError } = await supabase
					.from('inventory_history')
					.delete()
					.in('inventory_id', inventoryIds);
				if (historyDeleteError) throw historyDeleteError;
				console.log('[deleteProduct] Deleted inventory history records:', inventoryIds.length);
			}
			
			// 5. Delete inventory records (both variant and product inventory)
			const { error: inventoryDeleteError } = await supabase
				.from('inventory')
				.delete()
				.eq('product_id', id);
			if (inventoryDeleteError) throw inventoryDeleteError;
			console.log('[deleteProduct] Deleted inventory records for product:', id);
			
			// 6. Handle order items that reference this product (set product_id to NULL) - OPTIONAL
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
			
			// 7. Delete product analytics records - OPTIONAL  
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
			
			// 8. Delete product audit log records - MOVED TO AFTER PRODUCT DELETION
			// We'll let the cascade handle this or delete it after the product
			
			// 9. Delete product images from storage
			if (productImages && productImages.length > 0) {
				const imageUrls = productImages
					.map(img => img.image_url)
					.filter(url => url && !url.startsWith('http')); // Only delete files we uploaded
				
				if (imageUrls.length > 0) {
					const { error: storageDeleteError } = await supabase.storage
						.from('product-images')
						.remove(imageUrls);
					if (storageDeleteError) {
						console.warn('[deleteProduct] Storage deletion error (non-critical):', storageDeleteError);
					} else {
						console.log('[deleteProduct] Deleted images from storage:', imageUrls.length);
					}
				}
			}
			
			// 9. Delete the product (this will cascade to product_images and product_variants)
			console.log('[deleteProduct] About to delete product:', id);
			
			const { error: productDeleteError } = await supabase
				.from('products')
				.delete()
				.eq('id', id);
			
			if (productDeleteError) {
				console.error('[deleteProduct] Product deletion error:', productDeleteError);
				throw productDeleteError;
			}
			console.log('[deleteProduct] Deleted product:', id);
			
			// 10. Clean up audit log records AFTER product deletion (if the constraint allows it)
			try {
				const { error: auditDeleteError } = await supabase
					.from('product_audit_log')
					.delete()
					.eq('product_id', id);
				if (auditDeleteError) {
					console.warn('[deleteProduct] Audit log cleanup skipped (likely already handled by cascade):', auditDeleteError.message);
				} else {
					console.log('[deleteProduct] Cleaned up audit log records');
				}
			} catch (auditError) {
				console.warn('[deleteProduct] Audit log cleanup skipped (likely already handled by cascade)');
			}
			
			await fetchProducts();
		} catch (e) {
			console.error('[deleteProduct] Error:', e);
			console.error('[deleteProduct] Error details:', JSON.stringify(e, null, 2));
			throw e instanceof Error ? e : new Error('Error deleting product');
		}
	};

	// Bulk delete products function
	const deleteProducts = async (ids: string[]) => {
		if (!supabase) throw new Error('Supabase client not initialized');
		if (!ids || ids.length === 0) throw new Error('No product IDs provided');
		
		try {
			console.log('[deleteProducts] Starting bulk deletion for products:', ids);
			
			// Delete products one by one to ensure proper cleanup
			// We could optimize this with bulk operations, but for safety we'll do individual deletes
			const results = [];
			for (const id of ids) {
				try {
					await deleteProduct(id);
					results.push({ id, success: true });
				} catch (error) {
					console.error(`[deleteProducts] Failed to delete product ${id}:`, error);
					results.push({ id, success: false, error });
				}
			}
			
			const successCount = results.filter(r => r.success).length;
			const failureCount = results.filter(r => !r.success).length;
			
			console.log(`[deleteProducts] Bulk deletion completed: ${successCount} success, ${failureCount} failed`);
			
			if (failureCount > 0) {
				const failedIds = results.filter(r => !r.success).map(r => r.id);
				throw new Error(`Failed to delete ${failureCount} products: ${failedIds.join(', ')}`);
			}
			
			return results;
		} catch (e) {
			console.error('[deleteProducts] Bulk deletion error:', e);
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
