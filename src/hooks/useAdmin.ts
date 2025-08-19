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

	React.useEffect(() => {
		if (error) console.error('[Products] Error:', error);
		if (products) console.log('[Products] Data:', products);
	}, [products, error]);

	const fetchProducts = async () => {
		if (!supabase) return;
		setLoading(true);
		try {
			const { data, error } = await supabase
				.from('products')
				.select(`
					*,
					category:categories!products_category_id_fkey(*),
					images:product_images(*),
					variants:product_variants(*),
					inventory:inventory(*)
				`)
				.order('created_at', { ascending: false });

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
			// Log session and user info for debugging RLS
			const session = await supabase.auth.getSession();
			console.log('[createProduct] Supabase session:', session);
			if (session.data.session) {
				console.log('[createProduct] Session user id:', session.data.session.user.id);
				console.log('[createProduct] Session user role:', session.data.session.user.role);
			} else {
				console.log('[createProduct] No session user');
			}

			const { images, variants, inventory, variantsToDelete, ...productDataRaw } = data as any;
				// Convert empty string fields to null, and ensure sku is null if empty
				const productData = Object.fromEntries(
					Object.entries(productDataRaw).map(([k, v]) => {
						if (k === 'sku' && (!v || v === '')) return [k, null];
						return [k, v === '' ? null : v];
					})
				);
			// Insert product
			const { data: newProduct, error: productError } = await supabase
				.from('products')
				.insert([productData])
				.select()
				.single();

			if (productError || !newProduct) throw productError || new Error('Failed to create product');

			// Upload images and insert records
			if (images?.length) {
				await Promise.all(images.map(async (image: any) => {
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

				// Insert inventory for each variant
				if (insertedVariants && insertedVariants.length) {
					const inventoryRows = insertedVariants.map((variant: any, i: number) => ({
						product_id: newProduct.id,
						variant_id: variant.id,
						quantity: variants[i].quantity ?? 0,
						low_stock_threshold: variants[i].low_stock_threshold ?? (inventory?.low_stock_threshold ?? 10)
					}));
					const { error: inventoryError } = await supabase
						.from('inventory')
						.insert(inventoryRows)
						.select();
					if (inventoryError) throw inventoryError;

					// inventory_history now handled by DB trigger
				}
			} else if (inventory) {
				// No variants, insert inventory for product only
				const { error: inventoryError } = await supabase
					.from('inventory')
					.insert([{
						product_id: newProduct.id,
						variant_id: null,
						...inventory
					}])
					.select();
				if (inventoryError) throw inventoryError;

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

	const updateProduct = async (id: number, data: Partial<ProductFormDataWithDelete> & { imagesToDelete?: any[] }) => {
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
									let variantId: number | undefined = undefined;
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

	// Delete product function
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
