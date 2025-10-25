import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ReturnRequestWithItems } from '../../types/return.types';
import { returnService } from '../../services/returnService';
import toast from 'react-hot-toast';

interface ReturnAddressEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnRequest: ReturnRequestWithItems;
  onSave: () => void;
}

export const ReturnAddressEditModal: React.FC<ReturnAddressEditModalProps> = ({
  isOpen,
  onClose,
  returnRequest,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    return_address_line1: '',
    return_address_line2: '',
    return_address_city: '',
    return_address_state: '',
    return_address_postal_code: '',
    return_address_country: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && returnRequest) {
      setFormData({
        return_address_line1: returnRequest.return_address_line1 || '',
        return_address_line2: returnRequest.return_address_line2 || '',
        return_address_city: returnRequest.return_address_city || '',
        return_address_state: returnRequest.return_address_state || '',
        return_address_postal_code: returnRequest.return_address_postal_code || '',
        return_address_country: returnRequest.return_address_country || '',
      });
    }
  }, [isOpen, returnRequest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await returnService.updateReturnAddress(
        returnRequest.id,
        formData
      );

      if (error) {
        toast.error('Failed to update return address');
        return;
      }

      toast.success('Return address updated successfully');
      onSave();
    } catch (error) {
      console.error('Error updating return address:', error);
      toast.error('An error occurred while updating the address');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Return Address
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Return #{returnRequest.return_number} • Order #{returnRequest.order_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Address Line 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.return_address_line1}
                onChange={(e) =>
                  setFormData({ ...formData, return_address_line1: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Street address, P.O. box, company name"
              />
            </div>

            {/* Address Line 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.return_address_line2}
                onChange={(e) =>
                  setFormData({ ...formData, return_address_line2: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Apartment, suite, unit, building, floor, etc."
              />
            </div>

            {/* City and State */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.return_address_city}
                  onChange={(e) =>
                    setFormData({ ...formData, return_address_city: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.return_address_state}
                  onChange={(e) =>
                    setFormData({ ...formData, return_address_state: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Postal Code and Country */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.return_address_postal_code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      return_address_postal_code: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.return_address_country}
                  onChange={(e) =>
                    setFormData({ ...formData, return_address_country: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
