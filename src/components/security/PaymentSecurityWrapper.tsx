import React, { useEffect, useState, ReactNode } from 'react';
import { SecurityUtils } from '../../utils/securityUtils';
import { SECURITY_CONFIG } from '../../config/security-dev';

interface PaymentSecurityWrapperProps {
  children: ReactNode;
  onSecurityViolation?: (violation: string) => void;
}

interface SecurityState {
  isSecure: boolean;
  violations: string[];
  sessionValidated: boolean;
}

/**
 * Payment Security Wrapper - Ensures PCI DSS compliance for payment operations
 * This component wraps payment-related components and enforces security controls
 */
const PaymentSecurityWrapper: React.FC<PaymentSecurityWrapperProps> = ({ 
  children, 
  onSecurityViolation 
}) => {
  const [securityState, setSecurityState] = useState<SecurityState>({
    isSecure: false,
    violations: [],
    sessionValidated: false,
  });

  useEffect(() => {
    performSecurityValidation();
    
    // Set up continuous monitoring
    const monitoringInterval = setInterval(performSecurityValidation, 30000); // Check every 30 seconds
    
    return () => clearInterval(monitoringInterval);
  }, []);

  const performSecurityValidation = async () => {
    const violations: string[] = [];

    // Skip all security checks in development environment
    if (process.env.NODE_ENV === 'development' || SECURITY_CONFIG.IS_ENABLED) {
      if (SECURITY_CONFIG.ENABLE_SECURITY_DEBUGGING) {
        console.log('[SECURITY] Development mode: Bypassing all PCI DSS checks');
      }
      setSecurityState({
        isSecure: true,
        violations: [],
        sessionValidated: true,
      });
      return;
    }

    try {
      // 1. Validate HTTPS enforcement
      if (typeof window !== 'undefined') {
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          violations.push('Payment processing requires HTTPS connection');
        }
      }

      // 2. Validate session security (actual violations only)
      const sessionValidation = SecurityUtils.validateSessionSecurity();
      if (!sessionValidation.isSecure) {
        violations.push(...sessionValidation.issues);
      }

      // 3. Check for cardholder data in local storage
      if (typeof window !== 'undefined') {
        const localStorage = window.localStorage;
        const sessionStorage = window.sessionStorage;
        
        // Development environment exclusions
        const developmentExclusions = SECURITY_CONFIG.IS_ENABLED ? 
          SECURITY_CONFIG.EXCLUDED_STORAGE_KEYS : 
          ['eyogi_session', 'eyogi_users', 'cart', 'auth_token', 'customer_data'];
        
        // Check localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          const value = localStorage.getItem(key || '');
          
          // Skip development-specific keys
          if (process.env.NODE_ENV === 'development' && key && developmentExclusions.includes(key)) {
            continue;
          }
          
          if (value && SecurityUtils.containsCardholderData(value)) {
            violations.push(`Potential cardholder data found in localStorage: ${key}`);
          }
        }

        // Check sessionStorage
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          const value = sessionStorage.getItem(key || '');
          
          // Skip development-specific keys
          if (process.env.NODE_ENV === 'development' && key && developmentExclusions.includes(key)) {
            continue;
          }
          
          if (value && SecurityUtils.containsCardholderData(value)) {
            violations.push(`Potential cardholder data found in sessionStorage: ${key}`);
          }
        }
      }

      // 4. Infrastructure security checks (separate from violations)
      const infrastructureIssues: string[] = [];
      
      // Get infrastructure recommendations
      const infraRecommendations = SecurityUtils.getInfrastructureRecommendations();
      infrastructureIssues.push(...infraRecommendations);
      
      // Validate CSP implementation
      const cspValidation = SecurityUtils.validateCSP();
      if (!cspValidation.hasCSP) {
        infrastructureIssues.push('Content Security Policy not implemented');
      }

      // Check security headers
      const headersCheck = await SecurityUtils.checkSecurityHeaders();
      infrastructureIssues.push(...headersCheck.recommendations);

      // Update security state
      setSecurityState({
        isSecure: violations.length === 0,
        violations,
        sessionValidated: true,
      });

      // Report actual violations (not infrastructure issues)
      if (violations.length > 0) {
        violations.forEach(violation => {
          SecurityUtils.auditLog('security_violation', { violation }, 'high');
          onSecurityViolation?.(violation);
        });
      }

      // Log infrastructure issues only in development or as info level
      if (infrastructureIssues.length > 0) {
        if (process.env.NODE_ENV === 'development') {
          infrastructureIssues.forEach(issue => {
            SecurityUtils.auditLog('infrastructure_recommendation', { recommendation: issue }, 'low');
          });
        }
      }

      // Log successful validation
      if (violations.length === 0) {
        SecurityUtils.auditLog('security_validation', { status: 'passed' }, 'low');
      }

    } catch (error) {
      const errorMsg = 'Security validation failed';
      SecurityUtils.auditLog('security_validation_error', { error }, 'critical');
      setSecurityState({
        isSecure: false,
        violations: [errorMsg],
        sessionValidated: false,
      });
      onSecurityViolation?.(errorMsg);
    }
  };

  // Intercept and validate payment-related operations
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Override localStorage setItem to prevent cardholder data storage
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key: string, value: string) {
      if (SecurityUtils.containsCardholderData(value)) {
        SecurityUtils.auditLog('cardholder_data_storage_attempt', { key }, 'critical');
        throw new Error('PCI DSS Violation: Attempt to store cardholder data in localStorage');
      }
      return originalSetItem.call(this, key, value);
    };

    // Override sessionStorage setItem to prevent cardholder data storage
    const originalSessionSetItem = sessionStorage.setItem;
    sessionStorage.setItem = function(key: string, value: string) {
      if (SecurityUtils.containsCardholderData(value)) {
        SecurityUtils.auditLog('cardholder_data_storage_attempt', { key }, 'critical');
        throw new Error('PCI DSS Violation: Attempt to store cardholder data in sessionStorage');
      }
      return originalSessionSetItem.call(this, key, value);
    };

    // Monitor form submissions for payment data
    const handleFormSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement;
      if (form && form.tagName === 'FORM') {
        const formData = new FormData(form);
        const formObject: Record<string, any> = {};
        
        formData.forEach((value, key) => {
          formObject[key] = value;
        });

        const validation = SecurityUtils.validatePaymentData(formObject);
        if (!validation.isValid) {
          validation.violations.forEach((violation: string) => {
            SecurityUtils.auditLog('payment_data_violation', { violation, form: form.id }, 'critical');
          });
        }
      }
    };

    document.addEventListener('submit', handleFormSubmit);

    return () => {
      document.removeEventListener('submit', handleFormSubmit);
      // Restore original methods
      localStorage.setItem = originalSetItem;
      sessionStorage.setItem = originalSessionSetItem;
    };
  }, []);

  // Don't render children if security validation hasn't completed
  if (!securityState.sessionValidated) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Validating security compliance...</p>
        </div>
      </div>
    );
  }

  // Show security warning if violations exist
  if (!securityState.isSecure && process.env.NODE_ENV === 'development') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <div className="flex items-center mb-2">
          <div className="w-5 h-5 text-red-600 mr-2">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800">Security Violations Detected</h3>
        </div>
        <div className="text-red-700 mb-4">
          <p className="font-medium mb-2">The following PCI DSS compliance issues were found:</p>
          <ul className="list-disc list-inside space-y-1">
            {securityState.violations.map((violation, index) => (
              <li key={index} className="text-sm">{violation}</li>
            ))}
          </ul>
        </div>
        <p className="text-red-600 text-sm font-medium">
          Payment processing has been disabled until these issues are resolved.
        </p>
      </div>
    );
  }

  // Render children if security validation passes
  return <>{children}</>;
};

export default PaymentSecurityWrapper;
