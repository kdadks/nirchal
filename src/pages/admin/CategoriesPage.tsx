import React, { useState } from 'react';
import { useCategories, useProducts } from '../../hooks/useAdmin';
import { usePagination } from '../../hooks/usePagination';
import { useAdminSearch } from '../../contexts/AdminSearchContext';
import Pagination from '../../components/common/Pagination';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';
import { saveImageToPublicFolder, generateCategoryImageFileName } from '../../utils/imageStorageAdapter';
import { getCategoryStorageUrl } from '../../utils/storageUtils';
import type { CategoryFormData } from '../../types/admin';
import { Plus, Trash2, X, Upload, Download, Image as ImageIcon, Filter, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const initialForm: CategoryFormData = {
  name: '',
  slug: '',
  description: '',
  parent_id: null,
  image_url: null,
  is_active: true,
  featured: false,
};

const CategoriesPage: React.FC = () => {
  const { categories, loading, error, createCategory, updateCategory, deleteCategory, refresh } = useCategories();
  const { products } = useProducts();
  const { searchTerm } = useAdminSearch();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single' | 'bulk'; id?: string; ids?: string[] }>({ type: 'single' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CategoryFormData>(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  // Helper function to check if category has associated products
  const hasAssociatedProducts = (categoryId: string): boolean => {
    return products?.some(product => product.category_id === categoryId) || false;
  };

  // Helper function to get count of associated products
  const getAssociatedProductsCount = (categoryId: string): number => {
    return products?.filter(product => product.category_id === categoryId).length || 0;
  };

  // Filter categories based on search term
  const filteredCategories = React.useMemo(() => {
    if (!categories) return [];
    
    if (!searchTerm) return categories;
    
    const searchLower = searchTerm.toLowerCase();
    return categories.filter(category => {
      const matchesName = category.name.toLowerCase().includes(searchLower);
      const matchesDescription = category.description?.toLowerCase().includes(searchLower);
      const matchesSlug = category.slug?.toLowerCase().includes(searchLower);
      
      return matchesName || matchesDescription || matchesSlug;
    });
  }, [categories, searchTerm]);

  // Pagination
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData: paginatedCategories,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination({
    data: filteredCategories || [],
    defaultItemsPerPage: 25,
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select categories from current page that don't have associated products
      const selectableCategories = paginatedCategories?.filter(c => !hasAssociatedProducts(c.id)).map(c => c.id) || [];
      setSelectedCategories(prev => {
        const newSelected = [...new Set([...prev, ...selectableCategories])];
        return newSelected;
      });
    } else {
      // Deselect all categories from current page
      const currentPageIds = paginatedCategories?.map(c => c.id) || [];
      setSelectedCategories(prev => prev.filter(id => !currentPageIds.includes(id)));
    }
  };

  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    // Don't allow selection of categories with associated products
    if (checked && hasAssociatedProducts(categoryId)) {
      return;
    }
    
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    setDeleteTarget({ type: 'single', id: categoryId });
    setShowDeleteConfirm(true);
  };

  const handleBulkDelete = () => {
    if (selectedCategories.length === 0) return;
    setDeleteTarget({ type: 'bulk', ids: selectedCategories });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'single' && deleteTarget.id) {
        await deleteCategory(deleteTarget.id);
      } else if (deleteTarget.type === 'bulk' && deleteTarget.ids) {
        // Delete categories one by one since there's no bulk delete in the hook
        for (const id of deleteTarget.ids) {
          await deleteCategory(id);
        }
        setSelectedCategories([]); // Clear selection after bulk delete
      }
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleFeatured = async (categoryId: string, featured: boolean) => {
    try {
      const category = categories?.find(c => c.id === categoryId);
      if (!category) return;

      const updatedData = {
        ...category,
        featured,
        // Ensure we don't send undefined values to the database
        description: category.description || null,
        parent_id: category.parent_id || null,
        image_url: category.image_url || null
      };

      await updateCategory(categoryId, updatedData);
      toast.success(`Category ${featured ? 'added to' : 'removed from'} featured list`);
    } catch (error) {
      console.error('Featured toggle error:', error);
      toast.error('Failed to update featured status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (isEditing && editingId) {
        await updateCategory(editingId, form);
      } else {
        await createCategory(form);
      }
      
      resetForm();
      refresh();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setImageUploading(true);

      // Generate unique filename for local storage
      const fileName = generateCategoryImageFileName(form.name || 'category', file.name);

      // Upload image to R2 storage
      const uploadResult = await saveImageToPublicFolder(file, fileName, 'categories');

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Image upload failed');
      }

      // Set the form to use the R2 URL
      const imageUrl = uploadResult.url || '';
      setForm(prev => ({ ...prev, image_url: imageUrl }));
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleNameChange = (name: string) => {
    const slug = generateSlug(name);
    setForm(prev => ({ ...prev, name, slug }));
  };

  if (error) {
    return (
      <div className="admin-card">
        <div className="admin-card-content">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p className="admin-text-muted">Error loading categories: {error}</p>
            <button onClick={refresh} className="admin-btn admin-btn-primary" style={{ marginTop: '16px' }}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Title and Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Categories ({totalItems})</h1>
            </div>
            <div className="flex items-center space-x-3">
              {selectedCategories.length > 0 && (
                <>
                  <span className="text-sm text-gray-500">
                    {selectedCategories.length} selected
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Selected
                  </button>
                </>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Filter className="h-4 w-4 mr-1" />
                {showFilters ? 'Hide Filters' : 'Filters'}
              </button>
              <button
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Upload className="h-4 w-4 mr-1" />
                Import
              </button>
              <button
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                  <option>All Statuses</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                  <option>All Types</option>
                  <option>Parent Category</option>
                  <option>Sub Category</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-500">Loading categories...</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="relative px-4 py-2 text-left">
                    <input
                      type="checkbox"
                      checked={
                        paginatedCategories?.length > 0 && 
                        selectedCategories.length === paginatedCategories?.filter(c => !hasAssociatedProducts(c.id)).length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-4 py-2">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCategories?.map((category) => {
                  const hasProducts = hasAssociatedProducts(category.id);
                  const productsCount = getAssociatedProductsCount(category.id);
                  
                  return (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={(e) => handleSelectCategory(category.id, e.target.checked)}
                          disabled={hasProducts}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                          title={hasProducts ? `Cannot select - ${productsCount} products associated` : ''}
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {category.image_url ? (
                          <img 
                            src={getCategoryStorageUrl(category.image_url)} 
                            alt={category.name} 
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <button
                              onClick={() => {
                                const categoryWithDefaults = {
                                  ...category,
                                  featured: category.featured ?? false
                                };
                                setForm(categoryWithDefaults);
                                setIsEditing(true);
                                setEditingId(category.id);
                                setModalOpen(true);
                              }}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600"
                            >
                              {category.name}
                            </button>
                            <div className="text-xs text-gray-400">/{category.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {productsCount > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {productsCount} product{productsCount !== 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-gray-400">No products</span>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleFeatured(category.id, !(category.featured ?? false))}
                          className={`inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-md uppercase w-16 min-w-16 transition-colors ${
                            (category.featured ?? false)
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={`Click to ${(category.featured ?? false) ? 'remove from' : 'add to'} featured categories`}
                        >
                          {(category.featured ?? false) ? 'Yes' : 'No'}
                        </button>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-md uppercase w-20 min-w-20 ${
                          category.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              const categoryWithDefaults = {
                                ...category,
                                featured: category.featured ?? false
                              };
                              setForm(categoryWithDefaults);
                              setIsEditing(true);
                              setEditingId(category.id);
                              setModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit category"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => hasProducts ? null : handleDeleteCategory(category.id)}
                            disabled={hasProducts}
                            className={`${
                              hasProducts 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-red-600 hover:text-red-800'
                            }`}
                            title={hasProducts ? `Cannot delete - ${productsCount} products associated` : 'Delete category'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-4 py-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="admin-card" style={{ width: '500px', maxWidth: '90vw', margin: '20px' }}>
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                {isEditing ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={resetForm}
                className="admin-action-btn"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="admin-card-content">
              <div className="admin-form-group">
                <label className="admin-label">Category Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="admin-input"
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="admin-input admin-font-mono"
                  placeholder="category-slug"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Description</label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="admin-input admin-textarea"
                  placeholder="Category description"
                  rows={3}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Category Image</label>
                
                {form.image_url && (
                  <div style={{ marginBottom: '12px' }}>
                    <img 
                      src={getCategoryStorageUrl(form.image_url)} 
                      alt="Preview" 
                      style={{ 
                        width: '100px', 
                        height: '100px', 
                        objectFit: 'cover', 
                        borderRadius: '6px',
                        border: '1px solid var(--admin-border)'
                      }} 
                    />
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={imageUploading}
                    style={{ display: 'none' }}
                    id="image-upload"
                  />
                  <label 
                    htmlFor="image-upload" 
                    className={`admin-btn admin-btn-secondary ${imageUploading ? 'opacity-50' : ''}`}
                    style={{ cursor: imageUploading ? 'not-allowed' : 'pointer' }}
                  >
                    <Upload className="admin-btn-icon" />
                    {imageUploading ? 'Uploading...' : 'Upload Image'}
                  </label>
                  
                  {form.image_url && (
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, image_url: null }))}
                      className="admin-btn admin-btn-secondary"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="admin-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                  <span className="admin-label" style={{ margin: 0 }}>Active</span>
                </label>
              </div>

              <div className="admin-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.featured ?? false}
                    onChange={(e) => setForm(prev => ({ ...prev, featured: e.target.checked }))}
                  />
                  <span className="admin-label" style={{ margin: 0 }}>Featured on Homepage</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Featured categories will be displayed in the "Shop by Category" section on the homepage</p>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={resetForm}
                  className="admin-btn admin-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                >
                  {isEditing ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteTarget({ type: 'single' });
        }}
        onConfirm={confirmDelete}
        title={deleteTarget.type === 'single' ? 'Delete Category' : 'Delete Categories'}
        description={
          deleteTarget.type === 'single' 
            ? 'Are you sure you want to delete this category? This action cannot be undone.'
            : `Are you sure you want to delete ${deleteTarget.ids?.length} selected categories? This action cannot be undone.`
        }
        itemType="category"
        items={
          deleteTarget.type === 'bulk' && deleteTarget.ids
            ? deleteTarget.ids.map(id => {
                const category = categories.find(c => c.id === id);
                return { id, name: category?.name || 'Unknown Category' };
              })
            : []
        }
        singleItemName={
          deleteTarget.type === 'single' && deleteTarget.id
            ? categories.find(c => c.id === deleteTarget.id)?.name
            : undefined
        }
        consequences={[
          'Category information and description',
          'Category image',
          'All subcategories',
          'Product associations'
        ]}
        isDeleting={isDeleting}
        variant="danger"
      />
    </div>
  );
};

export default CategoriesPage;
