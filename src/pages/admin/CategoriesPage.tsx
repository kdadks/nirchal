/* global HTMLTextAreaElement */
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCategories, useProducts } from '../../hooks/useAdmin';
import { usePagination } from '../../hooks/usePagination';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/common/Pagination';
import type { Category, CategoryFormData } from '../../types/admin';
import { Plus, Trash2, X, Upload, Download, Image as ImageIcon, Filter, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const initialForm: CategoryFormData = {
  name: '',
  slug: '',
  description: '',
  parent_id: null,
  image_url: null,
  is_active: true,
};

const CategoriesPage: React.FC = () => {
  const { supabase } = useAuth();
  const { categories, loading, error, createCategory, updateCategory, deleteCategory, refresh } = useCategories();
  const { products } = useProducts();
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
    data: categories || [],
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

  const columns = [
    {
      key: 'select',
      title: (
        <input
          type="checkbox"
          checked={
            categories?.length > 0 && 
            selectedCategories.length === categories?.filter(c => !hasAssociatedProducts(c.id)).length
          }
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="admin-checkbox"
        />
      ),
      render: (row: Category) => {
        const hasProducts = hasAssociatedProducts(row.id);
        return (
          <input
            type="checkbox"
            checked={selectedCategories.includes(row.id)}
            onChange={(e) => handleSelectCategory(row.id, e.target.checked)}
            disabled={hasProducts}
            className="admin-checkbox"
            title={hasProducts ? `Cannot select - ${getAssociatedProductsCount(row.id)} products associated` : ''}
          />
        );
      },
    },
    {
      key: 'image_url',
      title: '',
      render: (row: Category) =>
        row.image_url ? (
          <img 
            src={row.image_url} 
            alt={row.name} 
            style={{ 
              width: '40px', 
              height: '40px', 
              objectFit: 'cover', 
              borderRadius: '6px',
              border: '1px solid var(--admin-border)'
            }} 
          />
        ) : (
          <div className="admin-image-placeholder" style={{ width: '40px', height: '40px' }}>
            <ImageIcon className="h-5 w-5" />
          </div>
        ),
    },
    { 
      key: 'name', 
      title: 'Category Name', 
      sortable: true,
      render: (row: Category) => (
        <div className="admin-product-title-wrapper">
          <button
            onClick={() => {
              setForm(row);
              setIsEditing(true);
              setEditingId(row.id);
              setModalOpen(true);
            }}
            className="admin-product-title-link"
          >
            {row.name}
          </button>
        </div>
      )
    },
    { 
      key: 'is_active', 
      title: 'Status', 
      render: (row: Category) => (
        <span className={`admin-badge ${row.is_active ? 'admin-badge-success' : 'admin-badge-neutral'}`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row: Category) => {
        const hasProducts = hasAssociatedProducts(row.id);
        const productsCount = getAssociatedProductsCount(row.id);
        
        return (
          <button
            onClick={() => hasProducts ? null : handleDeleteCategory(row.id)}
            disabled={hasProducts}
            className={`admin-btn admin-btn-sm ${hasProducts ? 'admin-btn-secondary' : 'admin-btn-danger'}`}
            title={hasProducts ? `Cannot delete as ${productsCount} product${productsCount === 1 ? ' is' : 's are'} associated with this category` : 'Delete Category'}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        );
      },
    },
  ];

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
    if (!e.target.files || !e.target.files[0] || !supabase) return;

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

      const fileExt = file.name.split('.').pop();
      const fileName = `category-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('category-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('category-images')
        .getPublicUrl(fileName);

      setForm(prev => ({ ...prev, image_url: publicUrl }));
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
      {/* Categories Table */}
      <DataTable
        columns={columns}
        data={paginatedCategories || []}
        isLoading={loading}
        searchable={true}
        filterable={true}
        title={`Categories (${totalItems})`}
        subtitle="Product categories and organization"
        headerActions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {selectedCategories.length > 0 && (
              <>
                <span className="admin-text-secondary admin-text-sm">
                  {selectedCategories.length} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="admin-btn admin-btn-danger admin-btn-sm"
                  title={`Delete ${selectedCategories.length} selected categories`}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </button>
              </>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="admin-btn admin-btn-secondary admin-btn-sm"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              title="Import Categories"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              title="Export Categories"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="admin-btn admin-btn-primary admin-btn-sm"
              title="Add Category"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>
        }
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

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
                      src={form.image_url} 
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
      {showDeleteConfirm && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Confirm Deletion
              </h3>
            </div>
            <div className="admin-modal-content">
              <p className="admin-text-secondary">
                {deleteTarget.type === 'single' 
                  ? 'Are you sure you want to delete this category? This action cannot be undone.'
                  : `Are you sure you want to delete ${deleteTarget.ids?.length} categories? This action cannot be undone.`
                }
              </p>
            </div>
            <div className="admin-modal-actions">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="admin-btn admin-btn-secondary"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="admin-btn admin-btn-danger"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
