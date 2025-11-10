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

    console.log('[Cookie Consent Banner] Checking visibility:', {
      hasSeenBanner,
      isExpired,
      shouldShow: !hasSeenBanner || isExpired,
    });

    // In development, always show banner on first load for testing
    // Add ?resetCookies=true to URL to reset and see banner
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('resetCookies')) {
        console.log('[Cookie Consent Banner] Resetting cookies for testing');
        localStorage.removeItem('nirchal_cookie_consent');
        setIsVisible(true);
        return;
      }
    }

    if (!hasSeenBanner || isExpired) {
      setIsVisible(true);
    } else {
      console.log('[Cookie Consent Banner] Banner not shown - consent already given');
    }

    // Listen for show banner event (development helper)
    const handleShowBanner = () => {
      console.log('[Cookie Consent Banner] Show event triggered');
      setIsVisible(true);
    };
    window.addEventListener('showCookieBanner', handleShowBanner);

    return () => {
      window.removeEventListener('showCookieBanner', handleShowBanner);
    };
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

    setPreferences(prev => {
      const updated = {
        ...prev,
        [category]: !prev[category],
      };
      console.log('[Cookie Consent Banner] Category toggled:', {
        category,
        previousValue: prev[category],
        newValue: updated[category],
        allPreferences: updated,
      });
      return updated;
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Backdrop - Only visible when settings open */}
      {isDetailsOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 cursor-pointer"
          onClick={() => setIsDetailsOpen(false)}
        />
      )}

      {/* Banner Container */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        {/* Banner Background */}
        <div className="bg-white border-t border-gray-200 shadow-lg pointer-events-auto">
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
                  preferences or{' '}
                  <a
                    href="/cookie-policy"
                    className="text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    read our cookie policy
                  </a>
                  .
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 flex-shrink-0">
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  Reject All
                </button>

                <button
                  onClick={() => setIsDetailsOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Settings size={16} />
                  Customize
                </button>

                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                >
                  Accept All
                </button>

                <button
                  onClick={() => {
                    setIsVisible(false);
                    onClose?.();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
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
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  aria-label="Close settings"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Essential Cookies */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <label className="flex-1 cursor-not-allowed">
                      <h4 className="font-medium text-gray-900">Essential</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Necessary for the website to function properly.
                      </p>
                    </label>
                    <input
                      type="checkbox"
                      checked={preferences[CookieCategory.ESSENTIAL]}
                      disabled
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 cursor-not-allowed flex-shrink-0"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Always enabled</p>
                </div>

                {/* Analytics Cookies */}
                <div 
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                >
                  <label className="flex items-start justify-between cursor-pointer">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Analytics</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Help us understand how you use our website.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences[CookieCategory.ANALYTICS]}
                      onChange={() => {
                        console.log('[Analytics Checkbox] Toggled');
                        handleToggleCategory(CookieCategory.ANALYTICS);
                      }}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer flex-shrink-0"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Includes: Google Analytics, NitroX</p>
                </div>

                {/* Marketing Cookies */}
                <div 
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                >
                  <label className="flex items-start justify-between cursor-pointer">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Marketing</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Used for targeted advertising and conversion tracking.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences[CookieCategory.MARKETING]}
                      onChange={() => {
                        console.log('[Marketing Checkbox] Toggled');
                        handleToggleCategory(CookieCategory.MARKETING);
                      }}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer flex-shrink-0"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Includes: Facebook Pixel, Retargeting</p>
                </div>

                {/* Performance Cookies */}
                <div 
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                >
                  <label className="flex items-start justify-between cursor-pointer">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Performance</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Improve website speed and user experience.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences[CookieCategory.PERFORMANCE]}
                      onChange={() => {
                        console.log('[Performance Checkbox] Toggled');
                        handleToggleCategory(CookieCategory.PERFORMANCE);
                      }}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer flex-shrink-0"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Includes: Cache, Preferences storage</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  Reject All
                </button>

                <button
                  onClick={handleSavePreferences}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                >
                  Save Preferences
                </button>

                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors cursor-pointer"
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
      </div>
    </>
  );
};

export default CookieConsentBanner;
