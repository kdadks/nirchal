import React, { useEffect } from 'react';
import { SecurityUtils } from '../../utils/securityUtils';

interface SecurePaymentFormProps {
  paymentMethod: 'cod' | 'online' | 'upi' | 'razorpay';
  onPaymentMethodChange: (method: 'cod' | 'online' | 'upi' | 'razorpay') => void;
}

/**
 * Secure Payment Form Component
 * Provides secure payment method selection with PCI DSS compliance
 */
const SecurePaymentForm: React.FC<SecurePaymentFormProps> = ({
  paymentMethod,
  onPaymentMethodChange
}) => {

  useEffect(() => {
    // Validate secure payment environment on mount
    validatePaymentEnvironment();
  }, []);

  const validatePaymentEnvironment = () => {
    try {
      // Validate HTTPS in production
      const isProduction = process.env.NODE_ENV === 'production';
      const isHTTPS = window.location.protocol === 'https:';
      
      if (isProduction && !isHTTPS) {
        SecurityUtils.auditLog('payment_security_violation', {
          type: 'insecure_connection',
          details: 'Payment attempted over insecure connection in production'
        });
        return false;
      }

      // Check for basic security headers
      const hasSecureHeaders = document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null;
      
      if (!hasSecureHeaders) {
        SecurityUtils.auditLog('payment_security_warning', {
          type: 'missing_security_headers',
          details: 'CSP headers not detected'
        });
      }

      return true;
    } catch (error) {
      SecurityUtils.auditLog('payment_security_error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const method = e.target.value as 'cod' | 'online' | 'upi' | 'razorpay';
    
    // Validate method selection for security
    if (method === 'razorpay' && !validatePaymentEnvironment()) {
      SecurityUtils.auditLog('payment_method_security_block', {
        method,
        reason: 'Failed security validation'
      });
      return;
    }

    onPaymentMethodChange(method);
  };

  return (
    <div className="space-y-4">
      {[
        { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive your order', icon: '💵' },
        { value: 'razorpay', label: 'Credit/Debit Card & UPI', desc: 'Secure payment via Razorpay', icon: '💳' },
        { value: 'online', label: 'Other Online Payment', desc: 'Alternative payment methods', icon: '🌐' },
        { value: 'upi', label: 'Direct UPI', desc: 'Pay using UPI apps directly', icon: '📱' }
      ].map((method) => (
        <label key={method.value} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
          paymentMethod === method.value
            ? 'border-amber-500 bg-amber-50'
            : 'border-gray-200 hover:bg-gray-50'
        }`}>
          <input
            type="radio"
            name="paymentMethod"
            value={method.value}
            checked={paymentMethod === method.value}
            onChange={handlePaymentMethodChange}
            className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500 focus:ring-2"
          />
          <div className="ml-4 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{method.icon}</span>
              <span className="font-medium text-gray-900">{method.label}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{method.desc}</p>
          </div>
        </label>
      ))}
    </div>
  );
};

export default SecurePaymentForm;
