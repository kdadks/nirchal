import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Plus,
  Edit3, 
  Trash2, 
  Move, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  ExternalLink,
  AlertCircle,
  Info,
  X,
  Save
} from 'lucide-react';
import { useAdminHeroSlides } from '../../hooks/useHeroSlides';
import type { HeroSlide } from '../../types/admin';

const HeroSlidesPage: React.FC = () => {
  const { 
    heroSlides, 
    loading, 
    error, 
    createHeroSlide,
    updateHeroSlide,
    deleteHeroSlide, 
    toggleActive 
  } = useAdminHeroSlides();
  
  const [deletingSlide, setDeletingSlide] = useState<HeroSlide | null>(null);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const result = await toggleActive(id, !currentStatus);
      if (result.error) {
        throw new Error(result.error);
      }
      toast.success(`Hero slide ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update hero slide';
      console.error('Toggle active error:', error);
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (slide: HeroSlide) => {
    if (window.confirm(`Are you sure you want to delete "${slide.title}"?`)) {
      try {
        const result = await deleteHeroSlide(slide.id);
        if (result.error) {
          throw new Error(result.error);
        }
        toast.success('Hero slide deleted successfully');
        setDeletingSlide(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete hero slide';
        console.error('Delete error:', error);
        toast.error(errorMessage);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const slideData = {
      title: formData.get('title') as string,
      subtitle: formData.get('subtitle') as string,
      image_url: formData.get('image_url') as string,
      cta_text: formData.get('cta_text') as string,
      cta_link: formData.get('cta_link') as string,
      display_order: parseInt(formData.get('display_order') as string) || 1,
      is_active: formData.get('is_active') === 'true'
    };

    try {
      let result;
      if (editingSlide) {
        result = await updateHeroSlide(editingSlide.id, slideData);
      } else {
        result = await createHeroSlide(slideData);
      }

      if (result.error) {
        toast.error(`Error: ${result.error}`);
      } else {
        toast.success(editingSlide ? 'Hero slide updated successfully' : 'Hero slide created successfully');
        setEditingSlide(null);
        setShowCreateModal(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Form submission error:', error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Hero Slides</h1>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Hero Slides</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">Error loading hero slides: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hero Slides Management</h1>
          <p className="text-gray-600 mt-1">Manage the homepage hero carousel slides</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Slide
        </button>
      </div>

      {/* Image Dimension Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">📐 Optimal Image Dimensions</h3>
            <div className="text-blue-800 text-sm space-y-1">
              <p><strong>Recommended:</strong> 1920×1080px (16:9 aspect ratio)</p>
              <p><strong>Minimum:</strong> 1200×675px | <strong>Maximum:</strong> 3840×2160px</p>
              <p><strong>File Size:</strong> Keep under 500KB for optimal loading | <strong>Format:</strong> JPEG or WebP preferred</p>
              <p><strong>Design Tip:</strong> Keep important content in the left 60% of the image as text overlay appears there</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Slides List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Current Slides ({heroSlides.length})</h2>
        </div>

        {heroSlides.length === 0 ? (
          <div className="p-12 text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Hero Slides</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first hero slide</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Slide
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {heroSlides.map((slide, index) => (
              <div key={slide.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  {/* Slide Preview */}
                  <div className="flex-shrink-0">
                    <div className="relative w-32 h-20 bg-gray-100 rounded-lg overflow-hidden group">
                      <img
                        src={slide.image_url}
                        alt={slide.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/api/placeholder/320/180';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                    </div>
                  </div>

                  {/* Slide Details */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">{slide.title}</h3>
                        {slide.subtitle && (
                          <p className="text-gray-600 mb-2 line-clamp-2">{slide.subtitle}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="inline-flex items-center">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            {slide.cta_text}
                          </span>
                          <Link
                            to={slide.cta_link}
                            className="text-primary-600 hover:text-primary-700 hover:underline"
                          >
                            {slide.cta_link}
                          </Link>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {/* Active Toggle */}
                        <button
                          onClick={() => handleToggleActive(slide.id, slide.is_active)}
                          className={`p-2 rounded-lg transition-colors ${
                            slide.is_active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                          title={slide.is_active ? 'Active - Click to hide' : 'Hidden - Click to show'}
                        >
                          {slide.is_active ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => setEditingSlide(slide)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit slide"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeletingSlide(slide)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete slide"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Drag Handle */}
                        <div className="p-2 text-gray-400 cursor-move" title="Drag to reorder">
                          <Move className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          slide.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {slide.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingSlide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deletingSlide.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingSlide(null)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingSlide)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingSlide) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingSlide ? 'Edit Hero Slide' : 'Create New Hero Slide'}
              </h3>
              <button
                onClick={() => {
                  setEditingSlide(null);
                  setShowCreateModal(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  defaultValue={editingSlide?.title || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter slide title"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  id="subtitle"
                  name="subtitle"
                  defaultValue={editingSlide?.subtitle || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter slide subtitle"
                />
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  required
                  defaultValue={editingSlide?.image_url || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 1920×1080px, under 500KB
                </p>
              </div>

              {/* CTA Text */}
              <div>
                <label htmlFor="cta_text" className="block text-sm font-medium text-gray-700 mb-1">
                  Call-to-Action Text
                </label>
                <input
                  type="text"
                  id="cta_text"
                  name="cta_text"
                  defaultValue={editingSlide?.cta_text || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Shop Now"
                />
              </div>

              {/* CTA Link */}
              <div>
                <label htmlFor="cta_link" className="block text-sm font-medium text-gray-700 mb-1">
                  Call-to-Action Link
                </label>
                <input
                  type="text"
                  id="cta_link"
                  name="cta_link"
                  defaultValue={editingSlide?.cta_link || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="/products"
                />
              </div>

              {/* Display Order */}
              <div>
                <label htmlFor="display_order" className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order *
                </label>
                <input
                  type="number"
                  id="display_order"
                  name="display_order"
                  required
                  min="1"
                  defaultValue={editingSlide?.display_order || heroSlides.length + 1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Active Status */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    value="true"
                    defaultChecked={editingSlide?.is_active !== false}
                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active (visible on homepage)</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSlide(null);
                    setShowCreateModal(false);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingSlide ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingSlide ? 'Update Slide' : 'Create Slide'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSlidesPage;