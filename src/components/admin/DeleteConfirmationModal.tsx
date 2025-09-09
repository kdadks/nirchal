import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X, Trash2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

interface DeleteItem {
  id: string;
  name: string;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  itemType: string; // 'product', 'category', 'vendor', etc.
  items?: DeleteItem[]; // For multiple items
  singleItemName?: string; // For single item
  consequences?: string[]; // What will be deleted
  isDeleting: boolean;
  variant?: 'danger' | 'warning';
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemType,
  items = [],
  singleItemName,
  consequences = [],
  isDeleting,
  variant = 'danger'
}) => {
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isDeleting, onClose]);

  const handleConfirm = async () => {
    try {
      await onConfirm();
      
      // Success toast
      const itemCount = items.length || 1;
      const itemName = singleItemName || `${itemCount} ${itemType}${itemCount > 1 ? 's' : ''}`;
      
      toast.success(
        `${itemName} deleted successfully`,
        {
          duration: 4000,
          icon: '🗑️',
          style: {
            background: '#10B981',
            color: 'white',
            fontWeight: '500',
          },
        }
      );
      
      onClose();
    } catch (error) {
      // Error toast
      toast.error(
        `Failed to delete ${itemType}. Please try again.`,
        {
          duration: 5000,
          icon: '❌',
          style: {
            background: '#EF4444',
            color: 'white',
            fontWeight: '500',
          },
        }
      );
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isMultiple = items.length > 1;
  const displayName = singleItemName || (isMultiple ? `${items.length} ${itemType}s` : itemType);

  const modal = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleBackdropClick}
      />
      
      <div className="min-h-screen px-4 text-center">
        <div className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</div>
        
        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all duration-300 transform bg-white shadow-2xl rounded-2xl animate-in zoom-in-95 slide-in-from-bottom-4">
          
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`flex-shrink-0 w-12 h-12 mx-auto flex items-center justify-center rounded-full ${
                variant === 'danger' 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-amber-100 text-amber-600'
              }`}>
                {variant === 'danger' ? (
                  <Trash2 className="w-6 h-6" />
                ) : (
                  <ShieldAlert className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            
            {/* Warning Alert */}
            <div className={`flex gap-3 p-4 rounded-xl border ${
              variant === 'danger' 
                ? 'bg-red-50 border-red-200' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                variant === 'danger' ? 'text-red-600' : 'text-amber-600'
              }`} />
              <div>
                <h4 className={`font-medium ${
                  variant === 'danger' ? 'text-red-900' : 'text-amber-900'
                }`}>
                  {variant === 'danger' ? 'Permanent Deletion' : 'Warning'}
                </h4>
                <p className={`text-sm mt-1 ${
                  variant === 'danger' ? 'text-red-700' : 'text-amber-700'
                }`}>
                  {description}
                </p>
              </div>
            </div>



            {/* Consequences */}
            {consequences.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h5 className="font-medium text-gray-900 mb-2">
                  This will permanently delete:
                </h5>
                <ul className="space-y-1">
                  {consequences.map((consequence, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                      {consequence}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                variant === 'danger'
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
              } ${isDeleting ? 'cursor-not-allowed' : ''}`}
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete {displayName}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default DeleteConfirmationModal;
