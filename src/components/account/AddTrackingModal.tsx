import React, { useState } from 'react';
import { X, TruckIcon } from 'lucide-react';
import { ReturnRequestWithItems } from '../../types/return.types';
import { returnService } from '../../services/returnService';
import toast from 'react-hot-toast';

interface AddTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnRequest: ReturnRequestWithItems;
  onSuccess: () => void;
}

export const AddTrackingModal: React.FC<AddTrackingModalProps> = ({
  isOpen,
  onClose,
  returnRequest,
  onSuccess,
}) => {
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courierName.trim() || !trackingNumber.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await returnService.markAsShipped(returnRequest.id, {
        customer_tracking_number: trackingNumber.trim(),
        customer_courier_name: courierName.trim(),
      });

      if (error) {
        toast.error('Failed to add tracking information');
        return;
      }

      toast.success('Tracking information added successfully! Your return is now marked as shipped.', {
        duration: 5000,
      });
      onSuccess();
    } catch (error) {
      console.error('Error adding tracking info:', error);
      toast.error('An error occurred while adding tracking information');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <TruckIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add Tracking Information</h2>
              <p className="text-sm text-gray-500">{returnRequest.return_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>📦 Shipping Instructions:</strong>
                <br />
                Please pack your items securely and ship them to the return address provided. Once
                shipped, add your tracking details below to help us track your return.
              </p>
            </div>

            {/* Courier Name */}
            <div>
              <label htmlFor="courierName" className="block text-sm font-medium text-gray-700 mb-2">
                Courier/Delivery Partner <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="courierName"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                placeholder="e.g., Blue Dart, DTDC, India Post"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Tracking Number */}
            <div>
              <label
                htmlFor="trackingNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tracking Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="trackingNumber"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking/AWB number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                You can find this on your shipping receipt
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Mark as Shipped'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
