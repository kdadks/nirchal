/* global HTMLTextAreaElement */
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCategories } from '../../hooks/useAdmin';
import DataTable from '../../components/admin/DataTable';
import type { Category, CategoryFormData } from '../../types/admin';
import { Plus, Edit, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CategoryFormData>(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const columns = [
    {
      key: 'image_url',
      title: 'Image',
      render: (row: Category) =>
        row.image_url ? (
          <img 
            src={row.image_url} 
            alt={row.name} 
            style={{ 
              width: '48px', 
              height: '48px', 
              objectFit: 'cover', 
              borderRadius: '6px',
              border: '1px solid var(--admin-border)'
            }} 
          />
        ) : (
          <div className="admin-image-placeholder" style={{ width: '48px', height: '48px' }}>
            <ImageIcon className="h-5 w-5" />
          </div>
        ),
    },
    { 
      key: 'name', 
      title: 'Category Name', 
      sortable: true,
      render: (row: Category) => (
        <div>
          <div style={{ fontWeight: '500', marginBottom: '2px' }}>{row.name}</div>
          <div className="admin-text-muted admin-text-xs admin-font-mono">{row.slug}</div>
        </div>
      )
    },
    { 
      key: 'description', 
      title: 'Description',
      render: (row: Category) => (
        <p className="admin-text-secondary admin-text-sm" style={{ 
          maxWidth: '200px', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          margin: 0
        }}>
          {row.description || 'No description'}
        </p>
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
  ];

  const actions = [
    {
      label: 'Edit',
      color: 'primary' as const,
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: Category) => {
        setForm(row);
        setIsEditing(true);
        setEditingId(row.id);
        setModalOpen(true);
      },
    },
    {
      label: 'Delete',
      color: 'danger' as const,
      icon: <Trash2 className="h-4 w-4" />,
      onClick: async (row: Category) => {
        if (window.confirm(`Are you sure you want to delete "${row.name}"?`)) {
          try {
            await deleteCategory(row.id);
            refresh();
          } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category');
          }
        }
      },
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      alert('Category name is required');
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
      alert('Failed to save category');
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
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
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
      alert('Failed to upload image');
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
      {/* Add Category Button */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={() => setModalOpen(true)}
          className="admin-btn admin-btn-primary"
        >
          <Plus className="admin-btn-icon" />
          Add Category
        </button>
      </div>

      {/* Categories Table */}
      <DataTable
        columns={columns}
        data={categories || []}
        actions={actions}
        isLoading={loading}
        searchable={true}
        filterable={true}
        title={`Categories (${categories?.length || 0})`}
        subtitle="Product categories and organization"
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
    </div>
  );
};

export default CategoriesPage;
