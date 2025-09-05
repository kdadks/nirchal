import SecurityUtils from '../utils/securityUtils';

/**
 * Secure form input handler for PCI DSS compliance
 */
export class SecureFormHandler {
  /**
   * Validate and sanitize form input
   */
  static validateInput(inputValue: string, fieldType: string): {
    isValid: boolean;
    sanitizedValue: string;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let sanitizedValue = inputValue;
    let isValid = true;

    // Check for cardholder data in non-payment fields
    if (fieldType !== 'payment' && SecurityUtils.containsCardholderData(inputValue)) {
      warnings.push('Potential cardholder data detected in non-payment field');
      isValid = false;
      
      // Log security incident
      SecurityUtils.auditLog('cardholder_data_in_form', {
        fieldType,
        action: 'input_blocked',
        timestamp: new Date().toISOString()
      }, 'critical');
    }

    // Sanitize input
    sanitizedValue = SecurityUtils.sanitizeUserInput(inputValue);

    // Additional validation based on field type
    switch (fieldType) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitizedValue)) {
          warnings.push('Invalid email format');
          isValid = false;
        }
        break;
        
      case 'phone':
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(sanitizedValue.replace(/[\s\-\(\)]/g, ''))) {
          warnings.push('Invalid phone number format');
          isValid = false;
        }
        break;
        
      case 'text':
        // Basic length validation
        if (sanitizedValue.length > 1000) {
          warnings.push('Input too long');
          isValid = false;
        }
        break;
    }

    return {
      isValid,
      sanitizedValue,
      warnings
    };
  }

  /**
   * Secure form submission handler
   */
  static async secureSubmit(formData: Record<string, any>): Promise<{
    success: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      // Validate all form fields
      for (const [key, value] of Object.entries(formData)) {
        if (typeof value === 'string') {
          const validation = this.validateInput(value, key);
          if (!validation.isValid) {
            errors.push(...validation.warnings);
          }
          // Update form data with sanitized value
          formData[key] = validation.sanitizedValue;
        }
      }

      // Additional security checks
      if (this.detectSQLInjection(JSON.stringify(formData))) {
        errors.push('Potential SQL injection detected');
        SecurityUtils.auditLog('sql_injection_attempt', {
          formData: SecurityUtils.maskSensitiveData(formData),
          timestamp: new Date().toISOString()
        }, 'critical');
      }

      if (this.detectXSSAttempt(JSON.stringify(formData))) {
        errors.push('Potential XSS attempt detected');
        SecurityUtils.auditLog('xss_attempt', {
          formData: SecurityUtils.maskSensitiveData(formData),
          timestamp: new Date().toISOString()
        }, 'critical');
      }

      if (errors.length > 0) {
        return { success: false, errors };
      }

      // Log successful secure submission
      SecurityUtils.auditLog('secure_form_submission', {
        fields: Object.keys(formData),
        timestamp: new Date().toISOString()
      });

      return { success: true, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      SecurityUtils.auditLog('form_submission_error', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      }, 'high');
      
      return { success: false, errors: ['Form submission failed'] };
    }
  }

  /**
   * Detect potential SQL injection attempts
   */
  private static detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(OR\s+1\s*=\s*1)/i,
      /(AND\s+1\s*=\s*1)/i,
      /(';\s*(DROP|DELETE|INSERT|UPDATE))/i,
      /(--|\#|\/\*|\*\/)/
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Detect potential XSS attempts
   */
  private static detectXSSAttempt(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
      /<img[^>]+src\s*=\s*["']javascript:/i,
      /<svg[^>]*onload/i
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }
}

export default SecureFormHandler;
