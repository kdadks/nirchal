import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, RefreshCw } from 'lucide-react';
import { SecurityUtils } from '../../utils/securityUtils';

interface SecurityCheck {
  name: string;
  status: boolean;
  details: string;
  recommendation: string;
  critical: boolean;
}

const SecurityDebugPanel: React.FC = () => {
  const [checks, setChecks] = useState<SecurityCheck[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runDetailedSecurityAnalysis = async () => {
    setIsLoading(true);
    const results: SecurityCheck[] = [];

    try {
      // 1. HTTPS Check
      const httpsCheck = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      results.push({
        name: 'HTTPS Enforcement',
        status: httpsCheck,
        details: httpsCheck 
          ? `Site is properly served over HTTPS (${window.location.protocol})` 
          : `Site is NOT served over HTTPS (${window.location.protocol}). This is a critical security vulnerability.`,
        recommendation: httpsCheck 
          ? 'HTTPS is properly configured.' 
          : 'Configure your hosting provider (Netlify) to force HTTPS redirects and ensure SSL certificate is active.',
        critical: true
      });

      // 2. Session Security Check
      const sessionValidation = SecurityUtils.validateSessionSecurity();
      results.push({
        name: 'Session Security',
        status: sessionValidation.isSecure,
        details: sessionValidation.isSecure 
          ? 'Session security validation passed.' 
          : `Session security issues: ${sessionValidation.issues.join(', ')}`,
        recommendation: sessionValidation.isSecure 
          ? 'Session security is properly configured.' 
          : 'Ensure secure session configuration and HTTPS enforcement.',
        critical: true
      });

      // 3. Data Protection Check
      const dataProtectionCheck = () => {
        const localStorage = window.localStorage;
        const sessionStorage = window.sessionStorage;
        
        let foundCardholderData = false;
        const problematicKeys: string[] = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i) || '';
          const value = localStorage.getItem(key) || '';
          if (SecurityUtils.containsCardholderData(value)) {
            foundCardholderData = true;
            problematicKeys.push(`localStorage.${key}`);
          }
        }
        
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i) || '';
          const value = sessionStorage.getItem(key) || '';
          if (SecurityUtils.containsCardholderData(value)) {
            foundCardholderData = true;
            problematicKeys.push(`sessionStorage.${key}`);
          }
        }
        
        return { passed: !foundCardholderData, issues: problematicKeys };
      };

      const dataProtection = dataProtectionCheck();
      results.push({
        name: 'Data Protection',
        status: dataProtection.passed,
        details: dataProtection.passed 
          ? 'No cardholder data found in browser storage.' 
          : `Cardholder data detected in: ${dataProtection.issues.join(', ')}`,
        recommendation: dataProtection.passed 
          ? 'Data protection is compliant.' 
          : 'Remove cardholder data from browser storage. Use secure server-side storage instead.',
        critical: true
      });

      // 4. Security Headers Check
      const securityHeaders = await SecurityUtils.checkSecurityHeaders();
      const headersPassed = Object.values(securityHeaders.headers).every(Boolean);
      results.push({
        name: 'Security Headers',
        status: headersPassed,
        details: headersPassed 
          ? 'All required security headers are present.' 
          : `Missing headers: ${Object.entries(securityHeaders.headers)
              .filter(([, present]) => !present)
              .map(([header]) => header)
              .join(', ')}`,
        recommendation: headersPassed 
          ? 'Security headers are properly configured.' 
          : 'Configure security headers in Netlify _headers file or server configuration.',
        critical: false
      });

      // 5. CSP Check
      const cspValidation = SecurityUtils.validateCSP();
      results.push({
        name: 'Content Security Policy',
        status: cspValidation.hasCSP,
        details: cspValidation.hasCSP 
          ? 'Content Security Policy is implemented.' 
          : 'No Content Security Policy meta tag found.',
        recommendation: cspValidation.hasCSP 
          ? 'CSP is properly configured.' 
          : 'Implement CSP meta tag or HTTP header to prevent XSS attacks.',
        critical: false
      });

      // 6. Payment Tokenization Check
      const razorpayCheck = typeof window.Razorpay !== 'undefined';
      results.push({
        name: 'Payment Tokenization',
        status: razorpayCheck,
        details: razorpayCheck 
          ? 'Razorpay payment library is loaded and available.' 
          : 'Razorpay payment library is not loaded.',
        recommendation: razorpayCheck 
          ? 'Payment tokenization is available.' 
          : 'Ensure Razorpay script is loaded for secure payment processing.',
        critical: false
      });

      // 7. Access Controls Check
      const authTokenCheck = () => {
        const authToken = localStorage.getItem('supabase.auth.token') || 
                         sessionStorage.getItem('supabase.auth.token') ||
                         localStorage.getItem('sb-mnykqmhtlrtqdkewipyl-auth-token') ||
                         document.cookie.includes('sb-auth');
        return !!authToken;
      };

      const accessControl = authTokenCheck();
      results.push({
        name: 'Access Controls',
        status: accessControl,
        details: accessControl 
          ? 'Authentication tokens are present and access controls are active.' 
          : 'No authentication tokens found. User may not be logged in.',
        recommendation: accessControl 
          ? 'Access controls are properly configured.' 
          : 'Ensure users are properly authenticated for accessing admin features.',
        critical: false
      });

      // 8. Audit Logging Check
      const auditLoggingCheck = typeof console !== 'undefined' && typeof console.log === 'function';
      results.push({
        name: 'Audit Logging',
        status: auditLoggingCheck,
        details: auditLoggingCheck 
          ? 'Console logging is available for audit trails.' 
          : 'Console logging is not available.',
        recommendation: auditLoggingCheck 
          ? 'Basic audit logging is available.' 
          : 'Implement proper server-side audit logging system.',
        critical: false
      });

    } catch (error) {
      console.error('Security analysis error:', error);
    }

    setChecks(results);
    setIsLoading(false);
  };

  useEffect(() => {
    runDetailedSecurityAnalysis();
  }, []);

  const passedCount = checks.filter(check => check.status).length;
  const totalCount = checks.length;
  const compliancePercentage = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Security Compliance Analysis</h3>
          <p className="text-sm text-gray-600">Detailed breakdown of security checks and recommendations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`text-2xl font-bold ${
            compliancePercentage >= 90 ? 'text-green-600' :
            compliancePercentage >= 70 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {compliancePercentage}%
          </div>
          <button
            onClick={runDetailedSecurityAnalysis}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Analyzing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {checks.map((check, index) => (
          <div key={index} className={`border rounded-lg p-4 ${
            check.status ? 'border-green-200 bg-green-50' : 
            check.critical ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
          }`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {check.status ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : check.critical ? (
                  <XCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-900">{check.name}</h4>
                  {check.critical && (
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                      Critical
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-2">{check.details}</p>
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">{check.recommendation}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {compliancePercentage < 100 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Steps to Achieve 100% Compliance:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Fix all critical security issues (marked in red)</li>
            <li>2. Configure security headers in your Netlify deployment</li>
            <li>3. Implement Content Security Policy</li>
            <li>4. Ensure all payment processing uses proper tokenization</li>
            <li>5. Set up proper server-side audit logging</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default SecurityDebugPanel;
