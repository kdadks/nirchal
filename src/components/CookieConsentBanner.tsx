/**
 * Cookie Consent Banner Component
 * 
 * Features:
 * - Sticky banner at bottom of page
 * - Granular consent controls for each category
 * - Accept All / Reject All quick actions
 * - Link to detailed settings and cookie policy
 * - Only shows if user hasn't previously consented
 * - Responsive design for mobile/desktop
 */

import React, { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';
import { cookieConsentManager, CookieCategory } from '../utils/cookieConsentManager';

interface CookieConsentBannerProps {
  onClose?: () => void;
  showSettings?: boolean;
}

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onClose,
  showSettings = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(showSettings);
  const [preferences, setPreferences] = useState(cookieConsentManager.getPreferences());

  useEffect(() => {
    // Show banner only if user hasn't seen it or consent has expired
    const hasSeenBanner = cookieConsentManager.hasSeenBanner();
    const isExpired = cookieConsentManager.isConsentExpired();

    if (!hasSeenBanner || isExpired) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    cookieConsentManager.acceptAll();
    setIsVisible(false);
    onClose?.();
  };

  const handleRejectAll = () => {
    cookieConsentManager.rejectAll();
    setIsVisible(false);
    onClose?.();
  };

  const handleSavePreferences = () => {
    cookieConsentManager.setPreferences(preferences);
    setIsVisible(false);
    onClose?.();
  };

  const handleToggleCategory = (category: CookieCategory) => {
    // Can't toggle essential
    if (category === CookieCategory.ESSENTIAL) return;

    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Banner Background */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {!isDetailsOpen ? (
            // Simple Banner View
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🍪 We use cookies
                </h3>
                <p className="text-sm text-gray-600">
                  We use cookies to improve your experience, personalize content, and analyze traffic.
                  By clicking "Accept All", you consent to our use of cookies. You can customize your
                  preferences or read our{' '}
                  <button
                    onClick={() => setIsDetailsOpen(true)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    cookie policy
                  </button>
                  .
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 flex-shrink-0">
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Reject All
                </button>

                <button
                  onClick={() => setIsDetailsOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Settings size={16} />
                  Customize
                </button>

                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Accept All
                </button>

                <button
                  onClick={() => {
                    setIsVisible(false);
                    onClose?.();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close banner"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ) : (
            // Detailed Settings View
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  🍪 Cookie Preferences
                </h3>
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close settings"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Essential Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">Essential</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Necessary for the website to function properly.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences[CookieCategory.ESSENTIAL]}
                      disabled
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Always enabled</p>
                </div>

                {/* Analytics Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">Analytics</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Help us understand how you use our website.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences[CookieCategory.ANALYTICS]}
                      onChange={() => handleToggleCategory(CookieCategory.ANALYTICS)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Includes: Google Analytics, NitroX</p>
                </div>

                {/* Marketing Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">Marketing</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Used for targeted advertising and conversion tracking.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences[CookieCategory.MARKETING]}
                      onChange={() => handleToggleCategory(CookieCategory.MARKETING)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Includes: Facebook Pixel, Retargeting</p>
                </div>

                {/* Performance Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">Performance</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Improve website speed and user experience.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences[CookieCategory.PERFORMANCE]}
                      onChange={() => handleToggleCategory(CookieCategory.PERFORMANCE)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Includes: Cache, Preferences storage</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Reject All
                </button>

                <button
                  onClick={handleSavePreferences}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Save Preferences
                </button>

                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Accept All
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Consent expires in 365 days. Visit settings anytime to manage your preferences.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop - Only visible when settings open */}
      {isDetailsOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setIsDetailsOpen(false)}
          style={{ zIndex: 40 }}
        />
      )}
    </div>
  );
};

export default CookieConsentBanner;
