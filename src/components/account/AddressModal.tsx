import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import toast from 'react-hot-toast';

interface AddressData {
  id?: number;
  type: string;
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  is_billing: boolean;
  is_shipping: boolean;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editAddress?: AddressData | null;
}

const AddressModal: React.FC<AddressModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editAddress 
}) => {
  const { customer } = useCustomerAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AddressData>({
    type: 'shipping',
    first_name: '',
    last_name: '',
    company: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    phone: '',
    is_default: false,
    is_billing: false,
    is_shipping: true
  });

  useEffect(() => {
    if (editAddress) {
      setFormData(editAddress);
    } else {
      // Reset form for new address
      setFormData({
        type: 'shipping',
        first_name: customer?.first_name || '',
        last_name: customer?.last_name || '',
        company: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        phone: '',
        is_default: false,
        is_billing: false,
        is_shipping: true
      });
    }
  }, [editAddress, customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    setLoading(true);
    try {
      if (editAddress?.id) {
        // Update existing address
        const { error } = await supabase
          .from('customer_addresses')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editAddress.id)
          .eq('customer_id', customer.id);

        if (error) throw error;
        toast.success('Address updated successfully!');
      } else {
        // Create new address
        const { error } = await supabase
          .from('customer_addresses')
          .insert({
            ...formData,
            customer_id: customer.id
          });

        if (error) throw error;
        toast.success('Address added successfully!');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editAddress ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Address Usage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Address Usage
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_shipping"
                  id="is_shipping"
                  checked={formData.is_shipping}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="is_shipping" className="ml-2 text-sm text-gray-700">
                  Use as shipping address
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_billing"
                  id="is_billing"
                  checked={formData.is_billing}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="is_billing" className="ml-2 text-sm text-gray-700">
                  Use as billing address
                </label>
              </div>
            </div>
            {!formData.is_shipping && !formData.is_billing && (
              <p className="text-sm text-red-600 mt-1">
                Please select at least one usage type for this address.
              </p>
            )}
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company (Optional)
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Address Lines */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1 *
            </label>
            <input
              type="text"
              name="address_line_1"
              value={formData.address_line_1}
              onChange={handleChange}
              placeholder="Street address, P.O. Box, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2 (Optional)
            </label>
            <input
              type="text"
              name="address_line_2"
              value={formData.address_line_2}
              onChange={handleChange}
              placeholder="Apartment, suite, unit, building, floor, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* City, State, Postal Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code *
              </label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Japan">Japan</option>
              <option value="Singapore">Singapore</option>
              <option value="UAE">UAE</option>
            </select>
          </div>

          {/* Default Address Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_default"
              id="is_default"
              checked={formData.is_default}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="is_default" className="ml-2 text-sm text-gray-700">
              Set as default address
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              disabled={loading || (!formData.is_shipping && !formData.is_billing)}
            >
              {loading ? 'Saving...' : editAddress ? 'Update Address' : 'Add Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;
