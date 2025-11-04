import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { transactionalEmailService } from '../../services/transactionalEmailService';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  tempPassword?: string;
  onPasswordChanged: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  email,
  tempPassword,
  onPasswordChanged
}) => {
  const [formData, setFormData] = useState({
    currentPassword: tempPassword || '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);

    try {
      // Client-side password change implementation
      console.log('Starting password change process...');
      
      // 1. First, verify the current password by fetching customer data
      const { data: customerData, error: fetchError } = await supabase
        .from('customers')
        .select('id, password_hash, first_name, last_name')
        .eq('email', email)
        .single();

      if (fetchError || !customerData) {
        console.error('Error fetching customer data:', fetchError);
        setError('Failed to verify current password. Please try again.');
        return;
      }

      // 2. Import bcrypt and verify current password
      const bcrypt = await import('bcryptjs');
      const isCurrentPasswordValid = await bcrypt.compare(formData.currentPassword, customerData.password_hash as string);

      if (!isCurrentPasswordValid) {
        setError('Current password is incorrect');
        return;
      }

      console.log('Current password verified successfully');

      // 3. Hash the new password
      const hashedNewPassword = await bcrypt.hash(formData.newPassword, 12);
      console.log('New password hashed');

      // 4. Update the password using the secure function
      const { data, error: updateError } = await supabase.rpc('change_customer_password', {
        customer_email: email,
        current_password: formData.currentPassword,
        new_password: hashedNewPassword
      });

      // Type assertion for the RPC response
      const response = data as { 
        success: boolean; 
        error?: string; 
        message?: string;
        customer_first_name?: string;
        customer_last_name?: string;
        customer_email?: string;
      } | null;

      if (updateError || !response?.success) {
        console.error('Error updating password:', updateError || response?.error);
        setError(response?.error || 'Failed to update password. Please try again.');
        return;
      }

      console.log('Password updated successfully');

      // Send password change confirmation email if customer data is available
      try {
        if (response.customer_first_name && response.customer_last_name && response.customer_email) {
          await transactionalEmailService.sendPasswordChangeEmail({
            first_name: response.customer_first_name,
            last_name: response.customer_last_name,
            email: response.customer_email
          });
          console.log('Password change confirmation email sent successfully');
        }
      } catch (emailError) {
        console.error('Failed to send password change confirmation email:', emailError);
        // Don't block the password change process if email fails
      }

      // Clear temp password from storage
      sessionStorage.removeItem('new_customer_temp_password');
      sessionStorage.removeItem('new_customer_email');
      
      onPasswordChanged();
      onClose();
    } catch (error) {
      console.error('Password change error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {tempPassword ? 'Set Your Password' : 'Change Password'}
        </h2>
        
        {tempPassword && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Welcome!</strong> We've created an account for you. Please set a new password to secure your account.
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Your temporary password: <code className="bg-yellow-100 px-1 rounded">{tempPassword}</code>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              {tempPassword ? 'Temporary Password' : 'Current Password'}
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-12"
                required
                readOnly={!!tempPassword}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-12"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-12"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-amber-600 text-white py-3 px-4 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-base font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
