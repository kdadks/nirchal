/* global HTMLTextAreaElement, JSX, React */
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
  const { user, loading: authLoading, supabase } = useAuth();
  const { categories, loading, createCategory, deleteCategory, refresh } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CategoryFormData>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const columns = [
    { key: 'name', title: 'Name', sortable: true },
    { key: 'slug', title: 'Slug' },
    { key: 'description', title: 'Description' },
    { key: 'is_active', title: 'Active', render: (row: Category) => row.is_active ? 'Yes' : 'No' },
  ];

  const actions = [
    // Edit can be added here
    {
      label: 'Delete',
      color: 'danger' as const,
      onClick: async (row: Category) => {
        if (window.confirm('Delete this category?')) {
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
      ...(name === 'name' ? { slug: value.toLowerCase().replace(/\s+/g, '-') } : {})
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    // ...existing code...
    try {
      await createCategory(form);
      setModalOpen(false);
      refresh();
    } catch (err: any) {
      setError(err?.message || 'Error creating category');
    } finally {
      setSaving(false);
    }
  };


  // Debug: log user and session
  React.useEffect(() => {
    if (supabase) {
      supabase.auth.getSession(); // No-op, just to trigger session fetch if needed
    }
  }, [user, supabase]);

  if (authLoading) {
    return <div className="p-8">Loading authentication...</div>;
  }
  if (!user) {
    return <div className="p-8 text-red-600 font-semibold">You must be logged in to view this page.</div>;
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
            {error && (
              <div className="mb-2 text-red-600 text-sm font-medium">{error}</div>
            )}
            <form onSubmit={handleSave} className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                <input
                  name="image_url"
                  type="text"
                  value={form.image_url || ''}
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
                <label className="text-sm">Active</label>
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 rounded mt-2"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">All Categories</h2>
        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-600 font-semibold">{error}</div>
        ) : categories.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No categories found.</div>
        ) : (
          <DataTable
            columns={columns}
            data={categories}
            actions={actions}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
