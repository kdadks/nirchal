/* global HTMLTextAreaElement */
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCategories } from '../../hooks/useAdmin';
import DataTable from '../../components/admin/DataTable';
import type { Category, CategoryFormData } from '../../types/admin';

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
          <img src={row.image_url} alt={row.name} className="w-16 h-16 object-cover rounded" />
        ) : (
          <span className="text-gray-400">No Image</span>
        ),
    },
    { key: 'name', title: 'Name', sortable: true },
    { key: 'slug', title: 'Slug' },
    { key: 'description', title: 'Description' },
    { key: 'is_active', title: 'Active', render: (row: Category) => (row.is_active ? 'Yes' : 'No') },
  ];

  const actions = [
    {
      label: 'Edit',
      color: 'primary' as const,
      onClick: (row: Category) => {
        setForm(row);
        setModalOpen(true);
      },
    },
    {
      label: 'Delete',
      color: 'danger' as const,
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <button
          className="bg-primary-600 text-white px-4 py-2 rounded"
          onClick={openModal}
        >
          Add Category
        </button>
      </div>
      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setModalOpen(false)}
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">Create New Category</h2>
            <form onSubmit={handleSave}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Slug</label>
                <input
                  name="slug"
                  type="text"
                  required
                  value={form.slug}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={form.description || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex items-center">
                <input
                  name="is_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span>Active</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Image</label>
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files && e.target.files[0];
                    setForm(prev => ({ ...prev, imageFile: file }));
                  }}
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
                {form.image_url && (
                  <img src={form.image_url} alt="Category" className="mt-2 w-16 h-16 object-cover rounded" />
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 rounded mt-2"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">All Categories</h2>
        {categories.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No categories found.</div>
        ) : (
          <DataTable
            columns={columns}
            data={categories}
            actions={actions}
            isLoading={false}
          />
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
