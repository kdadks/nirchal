import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllFeaturedSections,
  createFeaturedSection,
  updateFeaturedSection,
  deleteFeaturedSection,
} from '../../services/featuredSectionService';
import { supabase } from '../../config/supabase';
import type { FeaturedSection, CreateFeaturedSectionInput } from '../../types/featuredSection.types';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category_id: string;
}

interface Category {
  id: string;
  name: string;
}

export const FeaturedSectionsPanel: React.FC = () => {
  const [sections, setSections] = useState<FeaturedSection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<FeaturedSection | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    max_products: 5,
    background_color: '#ffffff',
    text_color: '#000000',
    show_view_all_button: true,
  });
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    loadSections();
    loadProducts();
    loadCategories();
  }, []);

  const loadSections = async () => {
    setLoading(true);
    const data = await getAllFeaturedSections();
    setSections(data);
    setLoading(false);
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (!error && data) {
      setCategories(data as Category[]);
    } else {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, category_id, product_images(image_url)')
      .eq('is_active', true)
      .order('name');

    if (!error && data) {
      // Transform data to include images array
      const productsWithImages = data.map((product: any) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        category_id: product.category_id,
        images: product.product_images?.map((img: any) => img.image_url) || []
      }));
      setProducts(productsWithImages as any);
    } else {
      console.error('Error loading products:', error);
    }
  };

  const handleOpenModal = (section?: FeaturedSection) => {
    if (section) {
      setEditingSection(section);
      setFormData({
        title: section.title,
        description: section.description || '',
        slug: section.slug,
        max_products: section.max_products,
        background_color: section.background_color,
        text_color: section.text_color,
        show_view_all_button: section.show_view_all_button ?? true,
      });
      // Load selected products for this section
      loadSectionProducts(section.id);
    } else {
      setEditingSection(null);
      setFormData({
        title: '',
        description: '',
        slug: '',
        max_products: 5,
        background_color: '#ffffff',
        text_color: '#000000',
        show_view_all_button: true,
      });
      setSelectedProductIds([]);
    }
    setIsModalOpen(true);
  };

  const loadSectionProducts = async (sectionId: string) => {
    const { data, error } = await supabase
      .from('featured_section_products')
      .select('product_id')
      .eq('section_id', sectionId)
      .order('display_order');

    if (!error && data) {
      setSelectedProductIds(data.map((item: any) => String(item.product_id)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const input: CreateFeaturedSectionInput = {
      ...formData,
      product_ids: selectedProductIds,
      display_order: editingSection ? editingSection.display_order : sections.length,
    };

    let result;
    if (editingSection) {
      result = await updateFeaturedSection(editingSection.id, {
        ...input,
        product_ids: selectedProductIds,
      });
    } else {
      result = await createFeaturedSection(input);
    }

    if (result.success) {
      toast.success(result.message);
      setIsModalOpen(false);
      loadSections();
    } else {
      toast.error(result.message);
    }
  };

  const handleDelete = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    const result = await deleteFeaturedSection(sectionId);
    if (result.success) {
      toast.success(result.message);
      loadSections();
    } else {
      toast.error(result.message);
    }
  };

  const handleToggleActive = async (section: FeaturedSection) => {
    const result = await updateFeaturedSection(section.id, {
      is_active: !section.is_active,
    });

    if (result.success) {
      toast.success(`Section ${section.is_active ? 'hidden' : 'shown'}`);
      loadSections();
    } else {
      toast.error(result.message);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent<HTMLTableRowElement>, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newSections = [...sections];
    const draggedSection = newSections[draggedIndex];
    
    // Remove dragged item and insert at new position
    newSections.splice(draggedIndex, 1);
    newSections.splice(dropIndex, 0, draggedSection);
    
    // Update display_order for all sections
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      display_order: index
    }));
    
    setSections(updatedSections);
    setDraggedIndex(null);

    // Save the new order to database
    try {
      const updatePromises = updatedSections.map(section =>
        updateFeaturedSection(section.id, { display_order: section.display_order })
      );
      
      await Promise.all(updatePromises);
      toast.success('Section order updated successfully');
    } catch (error) {
      console.error('Error updating section order:', error);
      toast.error('Failed to update section order');
      // Reload sections to revert the change
      loadSections();
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));
  const availableProducts = filteredProducts.filter(p => !selectedProductIds.includes(p.id));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Featured Sections</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Section
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : (
        <>
          {sections.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <GripVertical className="w-4 h-4" />
                <span>Drag and drop sections to reorder them. The topmost section will appear first on the homepage (when active).</span>
              </p>
            </div>
          )}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sections.map((section, index) => (
                <tr 
                  key={section.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`${draggedIndex === index ? 'opacity-50' : ''} cursor-move hover:bg-gray-50 transition-colors`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-5 h-5 text-gray-400" />
                      <span className="text-xs font-medium text-gray-600">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{section.title}</div>
                      {section.description && (
                        <div className="text-sm text-gray-500">{section.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Max {section.max_products}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {section.is_active ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        Hidden
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleActive(section)}
                        className="text-gray-600 hover:text-gray-900"
                        title={section.is_active ? 'Hide' : 'Show'}
                      >
                        {section.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleOpenModal(section)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(section.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {editingSection ? 'Edit Featured Section' : 'New Featured Section'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (!editingSection) {
                        setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Products
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.max_products}
                    onChange={(e) => setFormData({ ...formData, max_products: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={formData.background_color}
                    onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                    className="w-full h-9 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text Color
                  </label>
                  <input
                    type="color"
                    value={formData.text_color}
                    onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                    className="w-full h-9 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.show_view_all_button}
                    onChange={(e) => setFormData({ ...formData, show_view_all_button: e.target.checked })}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Show "View All Products" button</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">Uncheck to hide the "View All Products" button below this section</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Products
                </label>
                
                {/* Category Filter and Search */}
                <div className="flex gap-2 mb-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                {/* Selected Products Section */}
                {selectedProducts.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs font-medium text-gray-700 mb-1 bg-primary-50 px-2 py-1.5 rounded-t-lg border border-primary-200">
                      Selected Products ({selectedProducts.length})
                    </div>
                    <div className="border border-primary-200 rounded-b-lg max-h-40 overflow-y-auto bg-primary-50/30">
                      {selectedProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-2 p-2 hover:bg-primary-100 border-b border-primary-100 last:border-0"
                        >
                          <button
                            type="button"
                            onClick={() => toggleProductSelection(product.id)}
                            className="flex-shrink-0 text-red-600 hover:text-red-700"
                            title="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {product.images && product.images.length > 0 && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-900 truncate">{product.name}</div>
                            <div className="text-xs text-gray-500">₹{product.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Products Section */}
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-1">
                    Available Products
                  </div>
                  <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                    {availableProducts.length > 0 ? (
                      availableProducts.map((product) => (
                        <label
                          key={product.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                        >
                          <input
                            type="checkbox"
                            checked={false}
                            onChange={() => toggleProductSelection(product.id)}
                            className="rounded text-primary-600 focus:ring-primary-500 flex-shrink-0"
                          />
                          {product.images && product.images.length > 0 && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-900 truncate">{product.name}</div>
                            <div className="text-xs text-gray-500">₹{product.price}</div>
                          </div>
                        </label>
                      ))
                    ) : (
                      <div className="p-6 text-center text-gray-500 text-sm">
                        {searchQuery || selectedCategory ? 'No products found matching your filters' : 'No products available'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                >
                  <Save className="w-4 h-4" />
                  {editingSection ? 'Update' : 'Create'} Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
