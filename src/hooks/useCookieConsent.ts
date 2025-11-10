/**
 * useCookieConsent Hook
 * 
 * Easy-to-use hook for managing cookie consent in components
 */

import { useState, useEffect, useCallback } from 'react';
import { cookieConsentManager, CookieCategory, ConsentPreferences, ConsentMetadata } from '../utils/cookieConsentManager';

interface UseCookieConsentReturn {
  // Preferences
  preferences: ConsentPreferences;
  hasConsent: (category: CookieCategory) => boolean;
  hasCookieConsent: (cookieName: string) => boolean;

  // Actions
  acceptAll: () => void;
  rejectAll: () => void;
  updatePreferences: (prefs: Partial<ConsentPreferences>) => void;

  // State
  isVisible: boolean;
  hasSeenBanner: boolean;
  isExpired: boolean;
  metadata: ConsentMetadata;

  // Methods
  showBanner: () => void;
  hideBanner: () => void;
  renewConsent: () => void;
  getAnalytics: () => any;
}

export const useCookieConsent = (): UseCookieConsentReturn => {
  const [preferences, setPreferences] = useState<ConsentPreferences>(
    cookieConsentManager.getPreferences()
  );
  const [isVisible, setIsVisible] = useState(false);
  const [metadata, setMetadata] = useState<ConsentMetadata>(
    cookieConsentManager.getMetadata()
  );

  // Update state when consent changes
  useEffect(() => {
    const handleConsentUpdate = () => {
      setPreferences(cookieConsentManager.getPreferences());
      setMetadata(cookieConsentManager.getMetadata());
    };

    window.addEventListener('cookieConsentUpdated', handleConsentUpdate);
    return () => {
      window.removeEventListener('cookieConsentUpdated', handleConsentUpdate);
    };
  }, []);

  const hasConsent = useCallback((category: CookieCategory): boolean => {
    return cookieConsentManager.hasConsent(category);
  }, []);

  const hasCookieConsent = useCallback((cookieName: string): boolean => {
    return cookieConsentManager.hasCookieConsent(cookieName);
  }, []);

  const acceptAll = useCallback(() => {
    cookieConsentManager.acceptAll();
    setPreferences(cookieConsentManager.getPreferences());
    setMetadata(cookieConsentManager.getMetadata());
  }, []);

  const rejectAll = useCallback(() => {
    cookieConsentManager.rejectAll();
    setPreferences(cookieConsentManager.getPreferences());
    setMetadata(cookieConsentManager.getMetadata());
  }, []);

  const updatePreferences = useCallback((prefs: Partial<ConsentPreferences>) => {
    cookieConsentManager.setPreferences(prefs);
    setPreferences(cookieConsentManager.getPreferences());
    setMetadata(cookieConsentManager.getMetadata());
  }, []);

  const showBanner = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideBanner = useCallback(() => {
    setIsVisible(false);
  }, []);

  const renewConsent = useCallback(() => {
    cookieConsentManager.renewConsent();
    setMetadata(cookieConsentManager.getMetadata());
  }, []);

  const getAnalytics = useCallback(() => {
    return cookieConsentManager.getConsentAnalytics();
  }, []);

  return {
    preferences,
    hasConsent,
    hasCookieConsent,
    acceptAll,
    rejectAll,
    updatePreferences,
    isVisible,
    hasSeenBanner: metadata.hasSeenBanner,
    isExpired: cookieConsentManager.isConsentExpired(),
    metadata,
    showBanner,
    hideBanner,
    renewConsent,
    getAnalytics,
  };
};

export default useCookieConsent;
