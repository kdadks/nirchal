import React from 'react';
import { X } from 'lucide-react';
import type { ProductFormImage } from '../../types/admin';
import { getStorageImageUrl } from '../../utils/storageUtils';

interface SwatchSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSwatch: (imageId: string) => void;
  productImages: ProductFormImage[];
  currentSwatchId?: string | null;
}

export const SwatchSelectionModal: React.FC<SwatchSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectSwatch,
  productImages,
  currentSwatchId
}) => {
  if (!isOpen) return null;

  console.log('[SwatchSelectionModal] Rendering with:', {
    imagesCount: productImages.length,
    images: productImages.map(img => ({
      id: img.id,
      image_url: img.image_url,
      url: img.url,
      alt_text: img.alt_text
    }))
  });

  const handleSelectSwatch = (imageId: string) => {
    onSelectSwatch(imageId);
    onClose();
  };

  const clearSwatch = () => {
    onSelectSwatch('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Select Swatch Image
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Choose an existing product image to use as a color/material swatch for this variant.
        </p>

        {productImages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No product images available. Please add product images first.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {productImages.map((image) => {
              let imageUrl = image.image_url || image.url;
              const imageId = image.id;
              
              console.log('[SwatchSelectionModal] Processing image:', {
                id: imageId,
                originalUrl: image.image_url,
                fallbackUrl: image.url,
                finalUrl: imageUrl
              });
              
              if (!imageUrl || !imageId) {
                console.warn('[SwatchSelectionModal] Skipping image with missing data:', { imageUrl, imageId });
                return null;
              }
              
              // Convert filename to full Supabase storage URL if needed
              if (imageUrl && !imageUrl.startsWith('http')) {
                const fullUrl = getStorageImageUrl(imageUrl);
                console.log('[SwatchSelectionModal] Converted URL:', imageUrl, '→', fullUrl);
                imageUrl = fullUrl;
              }
              
              return (
                <div
                  key={imageId}
                  onClick={() => handleSelectSwatch(imageId)}
                  className={`
                    relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                    ${currentSwatchId === imageId 
                      ? 'border-primary-500 ring-2 ring-primary-200' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <img
                    src={imageUrl}
                    alt={image.alt_text || 'Product image'}
                    className="w-full h-32 object-cover"
                  />
                  {image.is_primary && (
                    <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                  {currentSwatchId === imageId && (
                    <div className="absolute inset-0 bg-primary-500 bg-opacity-20 flex items-center justify-center">
                      <div className="bg-primary-500 text-white rounded-full p-1">
                        ✓
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={clearSwatch}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Remove Swatch
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
