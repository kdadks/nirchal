/* global HTMLTextAreaElement */
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCategories } from '../../hooks/useAdmin';
import DataTable from '../../components/admin/DataTable';
import type { Category, CategoryFormData } from '../../types/admin';
import { ShoppingBag, Plus, Edit, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';

const initialForm: CategoryFormData = {
  name: '',
  slug: '',
  description: '',
  parent_id: null,
  image_url: null,
  is_active: true,
};

const CategoriesPage: React.FC = () => {
  const { user, supabase } = useAuth();
  const { categories, loading, error, createCategory, updateCategory, deleteCategory, refresh } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CategoryFormData>(initialForm);

  const columns = [
    {
      key: 'image_url',
      title: 'Image',
      render: (row: Category) =>
        row.image_url ? (
          <div className="h-12 w-12 rounded-xl overflow-hidden border border-neutral-200">
            <img src={row.image_url} alt={row.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center border border-neutral-200">
            <ImageIcon className="h-5 w-5 text-neutral-400" />
          </div>
        ),
    },
    { 
      key: 'name', 
      title: 'Name', 
      sortable: true,
      render: (row: Category) => (
        <div>
          <p className="font-accent font-semibold text-primary-800">{row.name}</p>
          <p className="text-xs text-neutral-500">{row.slug}</p>
        </div>
      )
    },
    { 
      key: 'description', 
      title: 'Description',
      render: (row: Category) => (
        <p className="text-sm text-neutral-600 max-w-xs truncate">
          {row.description || 'No description'}
        </p>
      )
    },
    { 
      key: 'is_active', 
      title: 'Status', 
      render: (row: Category) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
          row.is_active 
            ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
            : 'bg-neutral-100 text-neutral-800 border-neutral-200'
        }`}>
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
        setModalOpen(true);
      },
    },
    {
      label: 'Delete',
      color: 'danger' as const,
      icon: <Trash2 className="h-4 w-4" />,
      onClick: async (row: Category) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
          await deleteCategory(row.id);
          refresh();
        }
      },
    },
  ];

  const openModal = () => {
    setForm(initialForm);
    setModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let fieldValue: any = value;
    if (type === 'checkbox') {
      fieldValue = (e.target as HTMLInputElement).checked;
    }
    setForm(prev => ({
      ...prev,
      [name]: fieldValue,
      ...(name === 'name' ? { slug: value.toLowerCase().replace(/\s+/g, '-') } : {}),
    }));
  };

  // handleSave: create or update category
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = form.image_url || null;
    if ((form as any).imageFile && supabase) {
      const file = (form as any).imageFile;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(fileName, file);
      if (uploadError) {
        alert('Image upload failed: ' + uploadError.message);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('category-images').getPublicUrl(fileName);
      imageUrl = publicUrlData?.publicUrl || null;
    }
    const categoryData = { ...form, image_url: imageUrl };
    delete (categoryData as any).imageFile;
    if ((form as any).id) {
      await updateCategory((form as any).id, categoryData);
    } else {
      await createCategory(categoryData);
    }
    setModalOpen(false);
    refresh();
  };

  if (!user) {
    return <div className="p-8 text-red-600 font-semibold">You must be logged in to view this page.</div>;
  }
  if (loading) {
    return <div className="p-8">Loading categories...</div>;
  }
  if (error) {
    return <div className="p-8 text-red-600 font-semibold">Error loading categories: {error}</div>;
  }

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="mb-6 lg:mb-0">
          <div className="flex items-center space-x-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-2xl">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary-800 to-accent-600 bg-clip-text text-transparent">
                Categories
              </h1>
              <p className="text-neutral-600 font-accent">
                Organize your products into categories
              </p>
            </div>
          </div>
        </div>
        
        <button
          className="flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-3 rounded-2xl hover:shadow-lg transition-all duration-200 group"
          onClick={openModal}
        >
          <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
          <span className="font-medium">Add Category</span>
        </button>
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md relative border border-neutral-200/50">
            <button
              className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all duration-200"
              onClick={() => setModalOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-primary-800 mb-2">
                {(form as any).id ? 'Edit Category' : 'Create Category'}
              </h2>
              <p className="text-neutral-600 text-sm">
                {(form as any).id ? 'Update category information' : 'Add a new product category'}
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                  Category Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                  URL Slug
                </label>
                <input
                  name="slug"
                  type="text"
                  required
                  value={form.slug}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                  placeholder="category-url-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                  placeholder="Brief description of the category"
                />
              </div>

              <div>
                <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                  Category Image
                </label>
                <div className="relative">
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files && e.target.files[0];
                      setForm(prev => ({ ...prev, imageFile: file }));
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 rounded-xl bg-neutral-50/50 hover:bg-neutral-100/50 transition-colors">
                    {form.image_url ? (
                      <img src={form.image_url} alt="Category" className="h-24 w-24 object-cover rounded-lg" />
                    ) : (
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                        <p className="text-sm text-neutral-600">Click to upload image</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  name="is_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <label className="text-sm font-accent font-medium text-neutral-700">
                  Make category active
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
              >
                {(form as any).id ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Error/Loading States */}
      {!user && (
        <div className="text-center py-12">
          <p className="text-red-600 font-semibold">You must be logged in to view this page.</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <p className="text-neutral-600">Loading categories...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-600 font-semibold">Error loading categories: {error}</p>
        </div>
      )}

      {/* Categories Table */}
      {!loading && !error && user && (
        <DataTable
          title="Category Management"
          subtitle={`${categories?.length || 0} categories in your store`}
          columns={columns}
          data={categories || []}
          actions={actions}
          isLoading={loading}
          searchable={true}
          filterable={true}
        />
      )}
    </div>
  );
};

export default CategoriesPage;
