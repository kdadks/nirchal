import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, CheckCircle, Eye, Download, RefreshCw } from 'lucide-react';
import { SecurityUtils } from '../../utils/securityUtils';

interface SecurityEvent {
  id: string;
  timestamp: string;
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: any;
  source: string;
}

interface ComplianceMetrics {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  compliancePercentage: number;
  lastUpdated: string;
}

/**
 * Security Monitoring Dashboard - PCI DSS Compliance
 * Provides real-time monitoring and reporting of security events
 */
const SecurityMonitoringDashboard: React.FC = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    totalChecks: 0,
    passedChecks: 0,
    failedChecks: 0,
    compliancePercentage: 0,
    lastUpdated: new Date().toISOString(),
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    initializeMonitoring();
    
    let refreshInterval: NodeJS.Timeout;
    if (autoRefresh) {
      refreshInterval = setInterval(updateMetrics, 30000); // Update every 30 seconds
    }

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [autoRefresh]);

  const initializeMonitoring = () => {
    setIsMonitoring(true);
    
    // Initialize metrics
    updateMetrics();
    
    // Set up event listeners for security monitoring
    setupSecurityEventListeners();
    
    SecurityUtils.auditLog('security_monitoring_started', {
      dashboard: 'PCI_DSS_Compliance',
      timestamp: new Date().toISOString()
    }, 'low');
  };

  const setupSecurityEventListeners = () => {
    // Monitor for console errors that might indicate security issues
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      if (errorMessage.toLowerCase().includes('security') || 
          errorMessage.toLowerCase().includes('violation') ||
          errorMessage.toLowerCase().includes('unauthorized')) {
        addSecurityEvent('console_security_error', 'medium', {
          message: errorMessage,
          timestamp: new Date().toISOString()
        });
      }
      originalConsoleError.apply(console, args);
    };

    // Monitor for CSP violations
    document.addEventListener('securitypolicyviolation', (event) => {
      addSecurityEvent('csp_violation', 'high', {
        violatedDirective: event.violatedDirective,
        blockedURI: event.blockedURI,
        documentURI: event.documentURI,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber
      });
    });

    // Monitor for payment-related network requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0]?.toString() || '';
      
      if (url.includes('payment') || url.includes('razorpay') || url.includes('checkout')) {
        addSecurityEvent('payment_api_request', 'low', {
          url: url,
          method: args[1]?.method || 'GET',
          timestamp: new Date().toISOString()
        });
      }
      
      return originalFetch.apply(window, args);
    };
  };

  const addSecurityEvent = (event: string, severity: SecurityEvent['severity'], details: any) => {
    const newEvent: SecurityEvent = {
      id: SecurityUtils.generateSecureToken(8),
      timestamp: new Date().toISOString(),
      event,
      severity,
      details: SecurityUtils.maskSensitiveData(details),
      source: window.location.pathname
    };

    setSecurityEvents(prev => [newEvent, ...prev].slice(0, 100)); // Keep last 100 events
    
    // Update metrics
    updateMetrics();
  };

  const updateMetrics = async () => {
    try {
      // Perform comprehensive security checks
      const checks = [
        checkHTTPS(),
        checkSessionSecurity(),
        checkDataProtection(),
        await checkSecurityHeaders(),
        checkCSP(),
        checkPaymentTokenization(),
        checkAccessControls(),
        checkAuditLogging()
      ];

      const totalChecks = checks.length;
      const passedChecks = checks.filter(Boolean).length;
      const failedChecks = totalChecks - passedChecks;
      const compliancePercentage = Math.round((passedChecks / totalChecks) * 100);

      setMetrics({
        totalChecks,
        passedChecks,
        failedChecks,
        compliancePercentage,
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      addSecurityEvent('metrics_update_error', 'medium', { error });
    }
  };

  // Security check functions
  const checkHTTPS = (): boolean => {
    return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  };

  const checkSessionSecurity = (): boolean => {
    const validation = SecurityUtils.validateSessionSecurity();
    return validation.isSecure;
  };

  const checkDataProtection = (): boolean => {
    // Check for cardholder data in storage
    const localStorage = window.localStorage;
    const sessionStorage = window.sessionStorage;
    
    for (let i = 0; i < localStorage.length; i++) {
      const value = localStorage.getItem(localStorage.key(i) || '');
      if (value && SecurityUtils.containsCardholderData(value)) {
        return false;
      }
    }
    
    for (let i = 0; i < sessionStorage.length; i++) {
      const value = sessionStorage.getItem(sessionStorage.key(i) || '');
      if (value && SecurityUtils.containsCardholderData(value)) {
        return false;
      }
    }
    
    return true;
  };

  const checkSecurityHeaders = async (): Promise<boolean> => {
    const check = await SecurityUtils.checkSecurityHeaders();
    return Object.values(check.headers).every(Boolean);
  };

  const checkCSP = (): boolean => {
    const validation = SecurityUtils.validateCSP();
    return validation.hasCSP;
  };

  const checkPaymentTokenization = (): boolean => {
    return typeof window.Razorpay !== 'undefined';
  };

  const checkAccessControls = (): boolean => {
    // Check for authentication token
    const authToken = localStorage.getItem('supabase.auth.token') || 
                     sessionStorage.getItem('supabase.auth.token');
    return !!authToken;
  };

  const checkAuditLogging = (): boolean => {
    return typeof console !== 'undefined' && typeof console.log === 'function';
  };

  const exportSecurityReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      events: securityEvents,
      complianceStatus: getComplianceStatus()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pci-dss-security-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    addSecurityEvent('security_report_exported', 'low', { reportSize: securityEvents.length });
  };

  const getComplianceStatus = () => {
    if (metrics.compliancePercentage >= 90) return { level: 'excellent', color: 'text-green-600' };
    if (metrics.compliancePercentage >= 70) return { level: 'good', color: 'text-yellow-600' };
    return { level: 'needs_improvement', color: 'text-red-600' };
  };

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-md max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">PCI DSS Monitor</h3>
          {isMonitoring && <Eye className="w-4 h-4 text-green-500" />}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-1 rounded ${autoRefresh ? 'text-green-600' : 'text-gray-400'}`}
            title="Auto refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportSecurityReport}
            className="p-1 rounded text-gray-600 hover:text-gray-800"
            title="Export security report"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Compliance Score */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Compliance Score</span>
          <span className={`text-lg font-bold ${getComplianceStatus().color}`}>
            {metrics.compliancePercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              metrics.compliancePercentage >= 90 ? 'bg-green-500' :
              metrics.compliancePercentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${metrics.compliancePercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>✓ {metrics.passedChecks}</span>
          <span>✗ {metrics.failedChecks}</span>
        </div>
      </div>

      {/* Recent Security Events */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          Recent Events ({securityEvents.length})
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {securityEvents.slice(0, 5).map((event) => (
            <div key={event.id} className="text-xs border rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className={`px-1 rounded text-xs ${getSeverityColor(event.severity)}`}>
                  {event.severity.toUpperCase()}
                </span>
                <span className="text-gray-500">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="font-medium text-gray-900">{event.event}</div>
              <div className="text-gray-600 truncate">{event.source}</div>
            </div>
          ))}
          
          {securityEvents.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm">No security events detected</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
        Last updated: {new Date(metrics.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default SecurityMonitoringDashboard;
