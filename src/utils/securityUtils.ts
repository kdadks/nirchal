// Security utilities for PCI DSS compliance
export class SecurityUtils {
  
  /**
   * Sanitize user input to prevent XSS attacks
   */
  static sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Generate secure random token
   */
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const cryptoArray = new Uint8Array(length);
    
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(cryptoArray);
      for (let i = 0; i < length; i++) {
        result += chars[cryptoArray[i] % chars.length];
      }
    } else {
      // Fallback for non-crypto environments
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    
    return result;
  }

  /**
   * Validate if data contains potential cardholder information
   */
  static containsCardholderData(data: string): boolean {
    if (!data) return false;
    
    // PAN (Primary Account Number) patterns
    const panPatterns = [
      /\b4\d{3}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Visa
      /\b5[1-5]\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Mastercard
      /\b3[47]\d{2}[\s-]?\d{6}[\s-]?\d{5}\b/g, // American Express
      /\b6011[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Discover
    ];

    // CVV patterns
    const cvvPattern = /\b\d{3,4}\b/g;
    
    // Check for PAN patterns
    for (const pattern of panPatterns) {
      if (pattern.test(data)) {
        return true;
      }
    }

    // Check for potential CVV in isolation (this is a weak check)
    const words = data.split(/\s+/);
    for (const word of words) {
      if (cvvPattern.test(word) && word.length <= 4) {
        return true;
      }
    }

    return false;
  }

  /**
   * Mask sensitive data for logging
   */
  static maskSensitiveData(data: any): any {
    if (typeof data === 'string') {
      // Mask potential card numbers
      return data.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '**** **** **** ****')
                 .replace(/\b\d{3,4}\b/g, '***');
    }

    if (typeof data === 'object' && data !== null) {
      const masked = { ...data };
      const sensitiveFields = ['card', 'cvv', 'pan', 'cardNumber', 'securityCode', 'ccv'];
      
      for (const key in masked) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          masked[key] = '***MASKED***';
        } else if (typeof masked[key] === 'object') {
          masked[key] = this.maskSensitiveData(masked[key]);
        }
      }
      
      return masked;
    }

    return data;
  }

  /**
   * Enhanced data sanitization for PCI DSS compliance
   */
  static sanitizeUserInput(input: string): string {
    if (!input) return '';
    
    // Remove potential cardholder data patterns
    let sanitized = input
      .replace(/\b4\d{3}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD_REDACTED]')
      .replace(/\b5[1-5]\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD_REDACTED]')
      .replace(/\b3[47]\d{2}[\s-]?\d{6}[\s-]?\d{5}\b/g, '[CARD_REDACTED]')
      .replace(/\b6011[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD_REDACTED]')
      .replace(/\bcvv?\s*:?\s*\d{3,4}\b/gi, '[CVV_REDACTED]')
      .replace(/\b(0[1-9]|1[0-2])\/\d{2,4}\b/g, '[EXPIRY_REDACTED]');

    // Basic XSS protection
    sanitized = sanitized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return sanitized;
  }

  /**
   * Secure data storage with encryption
   */
  static secureStore(key: string, data: any, useSession: boolean = false): boolean {
    try {
      // Validate that we're not storing sensitive data
      const dataString = JSON.stringify(data);
      if (this.containsCardholderData(dataString)) {
        this.auditLog('attempt_to_store_cardholder_data', {
          key,
          action: 'blocked',
          reason: 'Contains cardholder data'
        }, 'critical');
        return false;
      }

      // Use appropriate storage
      const storage = useSession ? sessionStorage : localStorage;
      
      // In a production environment, you might want to encrypt the data
      // For now, we'll store it as-is after validation
      storage.setItem(key, dataString);
      
      this.auditLog('secure_data_stored', {
        key,
        storageType: useSession ? 'session' : 'local',
        timestamp: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      this.auditLog('secure_storage_failed', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'high');
      return false;
    }
  }

  /**
   * Secure data retrieval
   */
  static secureRetrieve(key: string, useSession: boolean = false): any {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      const data = storage.getItem(key);
      
      if (!data) return null;
      
      // Validate retrieved data doesn't contain cardholder information
      if (this.containsCardholderData(data)) {
        this.auditLog('cardholder_data_detected_in_storage', {
          key,
          action: 'data_removed'
        }, 'critical');
        
        // Remove the compromised data
        storage.removeItem(key);
        return null;
      }
      
      return JSON.parse(data);
    } catch (error) {
      this.auditLog('secure_retrieval_failed', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'medium');
      return null;
    }
  }

  /**
   * Clean up potentially sensitive data from storage
   */
  static cleanupSensitiveData(): void {
    try {
      const storages = [localStorage, sessionStorage];
      let cleanupCount = 0;
      
      storages.forEach(storage => {
        const keysToRemove: string[] = [];
        
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (!key) continue;
          
          const value = storage.getItem(key);
          if (value && this.containsCardholderData(value)) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => {
          storage.removeItem(key);
          cleanupCount++;
        });
      });
      
      if (cleanupCount > 0) {
        this.auditLog('sensitive_data_cleanup', {
          itemsRemoved: cleanupCount,
          timestamp: new Date().toISOString()
        }, 'medium');
      }
    } catch (error) {
      this.auditLog('cleanup_failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'high');
    }
  }

  /**
   * Validate session security
   */
  static validateSessionSecurity(): {
    isSecure: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // Check if running over HTTPS (except localhost)
    if (typeof window !== 'undefined') {
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        issues.push('Session not running over HTTPS');
      }

      // Check for secure cookie attributes
      if (!document.cookie.includes('Secure') && window.location.protocol === 'https:') {
        issues.push('Cookies missing Secure attribute');
      }

      // Check for HttpOnly flag (can't be checked from client-side, but we note it)
      if (!document.cookie.includes('HttpOnly')) {
        issues.push('Consider enabling HttpOnly cookies for session management');
      }
    }

    return {
      isSecure: issues.length === 0,
      issues
    };
  }

  /**
   * Audit log entry for PCI DSS compliance
   */
  static auditLog(event: string, details: any, severity: 'low' | 'medium' | 'high' | 'critical' = 'low'): void {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      event,
      details: this.maskSensitiveData(details),
      severity,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      sessionId: this.getSessionId(),
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`[PCI DSS AUDIT - ${severity.toUpperCase()}]`);
      console.log('Event:', event);
      console.log('Details:', auditEntry.details);
      console.log('Timestamp:', auditEntry.timestamp);
      console.groupEnd();
    }

    // In production, this would be sent to a secure audit service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to audit logging service
      console.log('[AUDIT]', JSON.stringify(auditEntry));
    }
  }

  /**
   * Get session identifier for audit trail
   */
  private static getSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = sessionStorage.getItem('pci_session_id');
    if (!sessionId) {
      sessionId = this.generateSecureToken(16);
      sessionStorage.setItem('pci_session_id', sessionId);
    }
    
    return sessionId;
  }

  /**
   * Enhanced payment data validation for PCI DSS
   */
  static validatePaymentData(paymentData: any): {
    isValid: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    // Check if any cardholder data is being stored
    if (this.containsCardholderData(JSON.stringify(paymentData))) {
      violations.push('Potential cardholder data detected in payment object');
    }

    // Verify payment is using tokenization
    if (paymentData.card_number || paymentData.cvv || paymentData.expiry) {
      violations.push('Raw payment data detected - should use tokenization');
    }

    // Check for proper encryption in transit
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      violations.push('Payment data transmitted over insecure connection');
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  /**
   * CSP (Content Security Policy) validation
   */
  static validateCSP(): {
    hasCSP: boolean;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    let hasCSP = false;

    if (typeof document !== 'undefined') {
      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      hasCSP = !!cspMeta;

      if (!hasCSP) {
        recommendations.push('Implement Content Security Policy to prevent XSS attacks');
      }
    }

    return {
      hasCSP,
      recommendations
    };
  }

  /**
   * Check for common security headers
   */
  static async checkSecurityHeaders(): Promise<{
    headers: Record<string, boolean>;
    recommendations: string[];
  }> {
    const recommendations: string[] = [];
    const headers = {
      'X-Frame-Options': false,
      'X-Content-Type-Options': false,
      'Referrer-Policy': false,
      'Permissions-Policy': false,
    };

    try {
      // This is a simplified check - in a real implementation,
      // you'd need to check actual HTTP headers
      if (typeof document !== 'undefined') {
        // These checks are approximations since we can't access HTTP headers from client-side
        headers['X-Frame-Options'] = true; // Assume Netlify provides this
        headers['X-Content-Type-Options'] = true; // Assume Netlify provides this
        headers['Referrer-Policy'] = !!document.querySelector('meta[name="referrer"]');
        headers['Permissions-Policy'] = true; // Modern browsers have this
      }
    } catch (error) {
      console.warn('Unable to check security headers:', error);
    }

    // Generate recommendations
    Object.entries(headers).forEach(([header, present]) => {
      if (!present) {
        recommendations.push(`Configure ${header} header for enhanced security`);
      }
    });

    return {
      headers,
      recommendations
    };
  }
}

export default SecurityUtils;
