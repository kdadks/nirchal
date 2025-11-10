/**
 * Cookie Consent Settings Page
 * 
 * Allows users to view and manage their cookie preferences
 * Accessible from: Settings > Privacy Settings or footer link
 */

import React, { useState, useEffect } from 'react';
import { Settings, Shield, Download, Trash2, RefreshCw } from 'lucide-react';
import { useCookieConsent } from '../hooks/useCookieConsent';
import { cookieConsentManager, APP_COOKIES, CookieCategory } from '../utils/cookieConsentManager';
import toast from 'react-hot-toast';

const CookieConsentSettingsPage: React.FC = () => {
  const { preferences, updatePreferences, acceptAll, rejectAll, renewConsent, getAnalytics } = useCookieConsent();
  const [metadata, setMetadata] = useState(cookieConsentManager.getMetadata());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Load analytics data (for future reporting features)
    const analyticsData = getAnalytics();
    console.log('[Cookie Consent Settings] Analytics data loaded', analyticsData);
  }, [getAnalytics]);

  const handleToggleCategory = (category: CookieCategory) => {
    if (category === CookieCategory.ESSENTIAL) return;
    updatePreferences({
      ...preferences,
      [category]: !preferences[category],
    });
  };

  const handleRenewConsent = () => {
    renewConsent();
    setMetadata(cookieConsentManager.getMetadata());
    toast.success('Consent renewed for another 365 days!');
  };

  const handleDownloadConsent = () => {
    const data = {
      preferences,
      metadata,
      timestamp: new Date().toISOString(),
      cookiesList: APP_COOKIES,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nirchal-consent-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Consent data downloaded!');
  };

  const handleResetConsent = () => {
    if (window.confirm('Are you sure you want to reset consent preferences? You will be shown the banner again.')) {
      localStorage.removeItem('nirchal_cookie_consent');
      toast.success('Consent has been reset. Please refresh the page.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryBadgeColor = (category: CookieCategory) => {
    if (category === CookieCategory.ESSENTIAL) return 'bg-gray-100 text-gray-800';
    if (preferences[category]) return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Cookie & Privacy Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your cookie preferences and view your consent history.
          </p>
        </div>

        {/* Status Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-600">Essential Cookies</p>
              <p className="text-2xl font-bold text-green-600">✓ Enabled</p>
            </div>
            <div className={`border-l-4 ${preferences[CookieCategory.ANALYTICS] ? 'border-green-500' : 'border-gray-300'} pl-4`}>
              <p className="text-sm text-gray-600">Analytics</p>
              <p className={`text-2xl font-bold ${preferences[CookieCategory.ANALYTICS] ? 'text-green-600' : 'text-gray-400'}`}>
                {preferences[CookieCategory.ANALYTICS] ? '✓ Enabled' : '✗ Disabled'}
              </p>
            </div>
            <div className={`border-l-4 ${preferences[CookieCategory.MARKETING] ? 'border-green-500' : 'border-gray-300'} pl-4`}>
              <p className="text-sm text-gray-600">Marketing</p>
              <p className={`text-2xl font-bold ${preferences[CookieCategory.MARKETING] ? 'text-green-600' : 'text-gray-400'}`}>
                {preferences[CookieCategory.MARKETING] ? '✓ Enabled' : '✗ Disabled'}
              </p>
            </div>
            <div className={`border-l-4 ${preferences[CookieCategory.PERFORMANCE] ? 'border-green-500' : 'border-gray-300'} pl-4`}>
              <p className="text-sm text-gray-600">Performance</p>
              <p className={`text-2xl font-bold ${preferences[CookieCategory.PERFORMANCE] ? 'text-green-600' : 'text-gray-400'}`}>
                {preferences[CookieCategory.PERFORMANCE] ? '✓ Enabled' : '✗ Disabled'}
              </p>
            </div>
          </div>
        </div>

        {/* Consent Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Consent Timeline</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-medium">Granted:</span> {formatDate(metadata.timestamp)}
            </p>
            <p>
              <span className="font-medium">Expires:</span> {formatDate(metadata.expiryDate)}
            </p>
            <p>
              <span className="font-medium">Version:</span> {metadata.version}
            </p>
            <p>
              <span className="font-medium">Device:</span> {metadata.userAgent?.split(' ').slice(-2).join(' ')}
            </p>
            {metadata.geolocation && (
              <p>
                <span className="font-medium">Location:</span> {metadata.geolocation}
              </p>
            )}
          </div>
        </div>

        {/* Detailed Cookie Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Detailed Preferences
            </h2>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showDetails ? 'Collapse' : 'Expand'}
            </button>
          </div>

          {showDetails && (
            <div className="space-y-4">
              {/* Essential */}
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Essential Cookies</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Required for the website to function properly. Cannot be disabled.
                    </p>
                    <div className="mt-3">
                      {Object.entries(APP_COOKIES)
                        .filter(([_, config]) => config.category === CookieCategory.ESSENTIAL)
                        .map(([name, config]) => (
                          <div key={name} className="text-xs text-gray-500 py-1">
                            • {config.name} - {config.description}
                          </div>
                        ))}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(CookieCategory.ESSENTIAL)}`}>
                    Always Enabled
                  </span>
                </div>
              </div>

              {/* Analytics */}
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Analytics Cookies</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Help us understand how you use our website and improve your experience.
                    </p>
                    <div className="mt-3">
                      {Object.entries(APP_COOKIES)
                        .filter(([_, config]) => config.category === CookieCategory.ANALYTICS)
                        .map(([name, config]) => (
                          <div key={name} className="text-xs text-gray-500 py-1">
                            • {config.name} - {config.description}
                          </div>
                        ))}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences[CookieCategory.ANALYTICS]}
                    onChange={() => handleToggleCategory(CookieCategory.ANALYTICS)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Marketing */}
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Marketing Cookies</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Used for targeted advertising and conversion tracking across platforms.
                    </p>
                    <div className="mt-3">
                      {Object.entries(APP_COOKIES)
                        .filter(([_, config]) => config.category === CookieCategory.MARKETING)
                        .map(([name, config]) => (
                          <div key={name} className="text-xs text-gray-500 py-1">
                            • {config.name} - {config.description}
                          </div>
                        ))}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences[CookieCategory.MARKETING]}
                    onChange={() => handleToggleCategory(CookieCategory.MARKETING)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Performance */}
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Performance Cookies</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Improve website speed, caching, and remember your preferences.
                    </p>
                    <div className="mt-3">
                      {Object.entries(APP_COOKIES)
                        .filter(([_, config]) => config.category === CookieCategory.PERFORMANCE)
                        .map(([name, config]) => (
                          <div key={name} className="text-xs text-gray-500 py-1">
                            • {config.name} - {config.description}
                          </div>
                        ))}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences[CookieCategory.PERFORMANCE]}
                    onChange={() => handleToggleCategory(CookieCategory.PERFORMANCE)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={acceptAll}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Accept All Cookies
          </button>
          <button
            onClick={rejectAll}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Reject All (Except Essential)
          </button>
        </div>

        {/* Additional Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleRenewConsent}
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Renew Consent
          </button>
          <button
            onClick={handleDownloadConsent}
            className="border-2 border-gray-600 text-gray-600 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Consent
          </button>
          <button
            onClick={handleResetConsent}
            className="border-2 border-red-600 text-red-600 hover:bg-red-50 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Reset Preferences
          </button>
        </div>

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
          <h3 className="font-semibold text-blue-900 mb-2">📋 About Your Data</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your consent preferences are stored locally on your device</li>
            <li>• Consent expires after 365 days - you'll be asked to confirm again</li>
            <li>• You can change your preferences anytime by visiting this page</li>
            <li>• Essential cookies cannot be disabled as they're required for the site to work</li>
            <li>• We comply with GDPR and DPDP Act regulations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentSettingsPage;
