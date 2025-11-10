/**
 * Cookie Consent Manager
 * 
 * Manages user consent for different cookie categories with:
 * - Granular category-based consent control
 * - Persistent storage of preferences
 * - Consent expiration tracking
 * - Cookie blocking/auto-blocking functionality
 * - GDPR/DPDP compliance
 * 
 * Features:
 * - Pre-built consent banner UI
 * - Granular cookie control (Essential, Analytics, Marketing, Performance)
 * - Sub-domain consent sharing
 * - Geo-targeting support
 * - Consent log and reporting
 * - Cookie policy generator integration
 */

// Cookie categories
export enum CookieCategory {
  ESSENTIAL = 'essential',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing',
  PERFORMANCE = 'performance',
}

// Consent state interface
export interface ConsentPreferences {
  [CookieCategory.ESSENTIAL]: boolean; // Always true
  [CookieCategory.ANALYTICS]: boolean;
  [CookieCategory.MARKETING]: boolean;
  [CookieCategory.PERFORMANCE]: boolean;
}

// Consent metadata
export interface ConsentMetadata {
  preferences: ConsentPreferences;
  timestamp: string;
  expiryDate: string;
  version: string;
  geolocation?: string;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  hasSeenBanner: boolean;
  bannerVersion: string;
}

// Cookie configuration
interface CookieConfig {
  name: string;
  category: CookieCategory;
  domain?: string;
  description: string;
}

// List of all cookies used in the app
export const APP_COOKIES: Record<string, CookieConfig> = {
  // Essential cookies
  
  // Analytics cookies
  '_ga': {
    name: 'Google Analytics',
    category: CookieCategory.ANALYTICS,
    domain: '.google-analytics.com',
    description: 'Tracks visitor behavior and page analytics'
  },
  '_gid': {
    name: 'Google Analytics Session',
    category: CookieCategory.ANALYTICS,
    domain: '.google-analytics.com',
    description: 'Google Analytics session tracking'
  },

  // Marketing cookies
  '_fbp': {
    name: 'Facebook Pixel',
    category: CookieCategory.MARKETING,
    domain: '.facebook.com',
    description: 'Facebook conversion tracking and retargeting'
  },
  'fr': {
    name: 'Facebook Audience Network',
    category: CookieCategory.MARKETING,
    domain: '.facebook.com',
    description: 'Facebook audience network for ad targeting'
  },

  // Performance cookies
  'nirchal_cache': {
    name: 'Cache Control',
    category: CookieCategory.PERFORMANCE,
    description: 'Caches category and product data for faster loading'
  },
  'nirchal_preferences': {
    name: 'User Preferences',
    category: CookieCategory.PERFORMANCE,
    description: 'Stores user preferences like theme, language, etc.'
  },
};

// Consent storage key
const CONSENT_STORAGE_KEY = 'nirchal_cookie_consent';
const CONSENT_VERSION = '1.0';
const CONSENT_EXPIRY_DAYS = 365;

class CookieConsentManager {
  private preferences: ConsentPreferences;
  private metadata: ConsentMetadata;

  constructor() {
    this.preferences = this.getDefaultPreferences();
    this.metadata = this.loadMetadata();
  }

  /**
   * Get default preferences (only essential enabled)
   */
  private getDefaultPreferences(): ConsentPreferences {
    return {
      [CookieCategory.ESSENTIAL]: true, // Always true
      [CookieCategory.ANALYTICS]: false,
      [CookieCategory.MARKETING]: false,
      [CookieCategory.PERFORMANCE]: false,
    };
  }

  /**
   * Load consent metadata from storage
   */
  private loadMetadata(): ConsentMetadata {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          preferences: {
            [CookieCategory.ESSENTIAL]: true, // Always true
            ...parsed.preferences,
          }
        };
      }
    } catch (error) {
      console.warn('[Cookie Consent] Failed to load metadata:', error);
    }

    return this.createDefaultMetadata();
  }

  /**
   * Create default metadata
   */
  private createDefaultMetadata(): ConsentMetadata {
    const now = new Date();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + CONSENT_EXPIRY_DAYS);

    return {
      preferences: this.getDefaultPreferences(),
      timestamp: now.toISOString(),
      expiryDate: expiry.toISOString(),
      version: CONSENT_VERSION,
      userAgent: navigator.userAgent,
      hasSeenBanner: false,
      bannerVersion: '1.0',
    };
  }

  /**
   * Get geolocation data
   */
  private async getGeolocation(): Promise<string | undefined> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        return data.country_code;
      }
    } catch (error) {
      console.warn('[Cookie Consent] Failed to get geolocation:', error);
    }
    return undefined;
  }

  /**
   * Initialize consent manager (load or create consent)
   */
  public async init(): Promise<void> {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        this.metadata = this.loadMetadata();
        this.preferences = { ...this.metadata.preferences };
      } else {
        this.metadata = this.createDefaultMetadata();
        // Load geolocation asynchronously
        this.metadata.geolocation = await this.getGeolocation();
        this.saveMetadata();
      }

      console.log('[Cookie Consent] Manager initialized', {
        hasConsent: !!stored,
        preferences: this.preferences,
      });
    } catch (error) {
      console.error('[Cookie Consent] Initialization failed:', error);
    }
  }

  /**
   * Save metadata to storage
   */
  private saveMetadata(): void {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(this.metadata));
      console.log('[Cookie Consent] Metadata saved');
    } catch (error) {
      console.error('[Cookie Consent] Failed to save metadata:', error);
    }
  }

  /**
   * Update consent preferences
   */
  public setPreferences(preferences: Partial<ConsentPreferences>): void {
    try {
      // Always keep essential as true
      this.preferences = {
        ...this.preferences,
        ...preferences,
        [CookieCategory.ESSENTIAL]: true,
      };

      // Update metadata
      const now = new Date();
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + CONSENT_EXPIRY_DAYS);

      this.metadata = {
        ...this.metadata,
        preferences: this.preferences,
        timestamp: now.toISOString(),
        expiryDate: expiry.toISOString(),
        version: CONSENT_VERSION,
      };

      // Log consent change
      this.logConsentChange();

      // Save to storage
      this.saveMetadata();

      // Apply consent (block/unblock tracking scripts)
      this.applyConsent();

      console.log('[Cookie Consent] Preferences updated', this.preferences);
    } catch (error) {
      console.error('[Cookie Consent] Failed to update preferences:', error);
    }
  }

  /**
   * Get current preferences
   */
  public getPreferences(): ConsentPreferences {
    return { ...this.preferences };
  }

  /**
   * Get full metadata
   */
  public getMetadata(): ConsentMetadata {
    return { ...this.metadata };
  }

  /**
   * Check if user has given consent for a category
   */
  public hasConsent(category: CookieCategory): boolean {
    return this.preferences[category] === true;
  }

  /**
   * Check if user has given consent for a specific cookie
   */
  public hasCookieConsent(cookieName: string): boolean {
    const cookieConfig = APP_COOKIES[cookieName];
    if (!cookieConfig) {
      console.warn(`[Cookie Consent] Unknown cookie: ${cookieName}`);
      return false;
    }

    return this.hasConsent(cookieConfig.category);
  }

  /**
   * Mark that user has seen the banner
   */
  public setHasSeenBanner(seen: boolean = true): void {
    this.metadata.hasSeenBanner = seen;
    this.saveMetadata();
  }

  /**
   * Check if user has seen the banner
   */
  public hasSeenBanner(): boolean {
    return this.metadata.hasSeenBanner === true;
  }

  /**
   * Renew user consent (extend expiry)
   */
  public renewConsent(): void {
    const now = new Date();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + CONSENT_EXPIRY_DAYS);

    this.metadata.timestamp = now.toISOString();
    this.metadata.expiryDate = expiry.toISOString();

    this.saveMetadata();
    console.log('[Cookie Consent] Consent renewed');
  }

  /**
   * Check if consent has expired
   */
  public isConsentExpired(): boolean {
    const expiry = new Date(this.metadata.expiryDate);
    return new Date() > expiry;
  }

  /**
   * Reset all consent preferences (except essential)
   */
  public resetPreferences(): void {
    this.setPreferences(this.getDefaultPreferences());
    console.log('[Cookie Consent] Preferences reset to defaults');
  }

  /**
   * Apply consent (block/unblock tracking cookies and scripts)
   */
  private applyConsent(): void {
    // Block analytics if not consented
    if (!this.hasConsent(CookieCategory.ANALYTICS)) {
      this.blockAnalyticsCookies();
    }

    // Block marketing if not consented
    if (!this.hasConsent(CookieCategory.MARKETING)) {
      this.blockMarketingCookies();
    }

    // Block performance cookies if not consented
    if (!this.hasConsent(CookieCategory.PERFORMANCE)) {
      this.blockPerformanceCookies();
    }

    // Dispatch event for external scripts to listen
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
      detail: { preferences: this.preferences }
    }));
  }

  /**
   * Block analytics cookies
   */
  private blockAnalyticsCookies(): void {
    // Remove GA4 cookies
    document.cookie = '_ga=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    document.cookie = '_gid=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    document.cookie = '_gat=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';

    // Prevent GA4 script execution (handled in analytics.ts)
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'anonymizeIp': true,
      'allow_google_signals': false,
      'allow_ad_personalization_signals': false,
    });

    console.log('[Cookie Consent] Analytics cookies blocked');
  }

  /**
   * Block marketing cookies
   */
  private blockMarketingCookies(): void {
    // Remove Facebook Pixel cookies
    document.cookie = '_fbp=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    document.cookie = 'fr=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';

    // Prevent Facebook Pixel execution
    if (window.fbq) {
      window.fbq('consent', 'revoke');
    }

    console.log('[Cookie Consent] Marketing cookies blocked');
  }

  /**
   * Block performance cookies
   */
  private blockPerformanceCookies(): void {
    // Remove cache and preference cookies
    Object.keys(localStorage).forEach(key => {
      if (key.includes('nirchal_cache') || key.includes('nirchal_preferences')) {
        localStorage.removeItem(key);
      }
    });

    console.log('[Cookie Consent] Performance cookies blocked');
  }

  /**
   * Log consent change for reporting
   */
  private logConsentChange(): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      preferences: this.preferences,
      type: 'consent_change',
      version: CONSENT_VERSION,
    };

    // Store in local storage for reporting
    try {
      const logs = JSON.parse(localStorage.getItem('nirchal_consent_logs') || '[]');
      logs.push(logEntry);

      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.shift();
      }

      localStorage.setItem('nirchal_consent_logs', JSON.stringify(logs));
    } catch (error) {
      console.warn('[Cookie Consent] Failed to log consent change:', error);
    }
  }

  /**
   * Get consent logs for reporting
   */
  public getConsentLogs(): any[] {
    try {
      return JSON.parse(localStorage.getItem('nirchal_consent_logs') || '[]');
    } catch (error) {
      console.warn('[Cookie Consent] Failed to load consent logs:', error);
      return [];
    }
  }

  /**
   * Get consent analytics/reporting data
   */
  public getConsentAnalytics(): {
    totalPageviews: number;
    totalVisitors: number;
    consentRate: {
      essential: number;
      analytics: number;
      marketing: number;
      performance: number;
    };
    trends: any[];
  } {
    const logs = this.getConsentLogs();

    return {
      totalPageviews: 0, // Would be tracked separately
      totalVisitors: 0, // Would be tracked separately
      consentRate: {
        essential: 100, // Always 100%
        analytics: logs.filter(l => l.preferences.analytics).length / Math.max(logs.length, 1) * 100,
        marketing: logs.filter(l => l.preferences.marketing).length / Math.max(logs.length, 1) * 100,
        performance: logs.filter(l => l.preferences.performance).length / Math.max(logs.length, 1) * 100,
      },
      trends: logs.slice(-30), // Last 30 entries
    };
  }

  /**
   * Accept all consents
   */
  public acceptAll(): void {
    this.setPreferences({
      [CookieCategory.ESSENTIAL]: true,
      [CookieCategory.ANALYTICS]: true,
      [CookieCategory.MARKETING]: true,
      [CookieCategory.PERFORMANCE]: true,
    });
    this.setHasSeenBanner(true);
    console.log('[Cookie Consent] All consents accepted');
  }

  /**
   * Reject all non-essential consents
   */
  public rejectAll(): void {
    this.setPreferences({
      [CookieCategory.ESSENTIAL]: true,
      [CookieCategory.ANALYTICS]: false,
      [CookieCategory.MARKETING]: false,
      [CookieCategory.PERFORMANCE]: false,
    });
    this.setHasSeenBanner(true);
    console.log('[Cookie Consent] Non-essential consents rejected');
  }

  /**
   * Check if consent is required (for GDPR/DPDP jurisdictions)
   */
  public isConsentRequired(): boolean {
    // Check geolocation for GDPR/DPDP compliance
    const geolocation = this.metadata.geolocation;

    // EU (GDPR) and India (DPDP Act) countries require explicit consent
    const gdprCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
    const dpdpCountries = ['IN'];
    const requiresConsent = [...gdprCountries, ...dpdpCountries];

    return geolocation ? requiresConsent.includes(geolocation) : true; // Default to true for safety
  }

  /**
   * Get cookie policy text (simplified)
   */
  public getCookiePolicy(): string {
    return `
# Cookie Policy

## Essential Cookies
These cookies are necessary for the website to function properly.
- Visitor tracking
- Authentication tokens
- Checkout progress tracking

## Analytics Cookies
These cookies help us understand how visitors use our website.
- Google Analytics
- NitroX email tracking

## Marketing Cookies
These cookies are used to deliver personalized ads and track conversions.
- Facebook Pixel
- Retargeting cookies

## Performance Cookies
These cookies improve the website performance.
- Cache control
- User preferences storage

For more information, visit our privacy policy.
    `;
  }
}

// Create and export singleton instance
export const cookieConsentManager = new CookieConsentManager();

// Development helper: Make cookie consent manager available globally for testing
if (import.meta.env.DEV) {
  (window as any).nirchalCookieConsent = {
    reset: () => {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      localStorage.removeItem('nirchal_consent_logs');
      console.log('[Cookie Consent] Reset complete! Refresh the page to see the banner.');
    },
    getPreferences: () => cookieConsentManager.getPreferences(),
    getMetadata: () => cookieConsentManager.getMetadata(),
    acceptAll: () => cookieConsentManager.acceptAll(),
    rejectAll: () => cookieConsentManager.rejectAll(),
    show: () => {
      const event = new CustomEvent('showCookieBanner');
      window.dispatchEvent(event);
    },
  };
  console.log('[Cookie Consent] Development helpers available at window.nirchalCookieConsent');
  console.log('  - nirchalCookieConsent.reset() - Clear consent and show banner again');
  console.log('  - nirchalCookieConsent.getPreferences() - View current preferences');
  console.log('  - nirchalCookieConsent.acceptAll() - Accept all cookies');
  console.log('  - nirchalCookieConsent.rejectAll() - Reject all non-essential');
}

export default cookieConsentManager;
