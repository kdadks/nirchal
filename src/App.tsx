
import React, { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { CustomerAuthProvider } from './contexts/CustomerAuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AIAssistantButton } from './components/ai/AIAssistantButton';
import TawkToChat from './components/common/TawkToChat';
import { preloadCategories } from './utils/categoryCache';
import AppRoutes from './routes';
import VisitorTracker from './components/VisitorTracker';
import CookieConsentBanner from './components/CookieConsentBanner';
import SnowflakesEffect from './components/seasonal/SnowflakesEffect';
import { initGA4, initFacebookPixel } from './utils/analytics';
import { cookieConsentManager } from './utils/cookieConsentManager';
import { supabase } from './config/supabase';

const router = createBrowserRouter([
  {
    path: '*',
    element: <Layout><AppRoutes /></Layout>,
  },
]);

const App: React.FC = () => {
  const [seoSettings, setSeoSettings] = useState({
    site_title: 'Nirchal - Indian Ethnic Wear',
    meta_description: 'Discover authentic Indian ethnic wear at Nirchal. Shop our curated collection of traditional and contemporary designs.',
    meta_keywords: '',
    google_analytics_id: '',
    facebook_pixel_id: '',
    instagram_business_id: '',
  });

  // Load SEO settings from database
  useEffect(() => {
    const loadSEOSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('key, value')
          .eq('category', 'seo');

        if (error) {
          console.warn('[SEO Settings] Failed to load:', error.message);
          return;
        }

        if (data && data.length > 0) {
          const settings: any = {};
          data.forEach((setting: any) => {
            settings[setting.key] = setting.value || '';
          });

          setSeoSettings(prev => ({
            ...prev,
            site_title: settings.site_title || prev.site_title,
            meta_description: settings.meta_description || prev.meta_description,
            meta_keywords: settings.meta_keywords || prev.meta_keywords,
            google_analytics_id: settings.google_analytics_id || prev.google_analytics_id,
            facebook_pixel_id: settings.facebook_pixel_id || prev.facebook_pixel_id,
            instagram_business_id: settings.instagram_business_id || prev.instagram_business_id,
          }));
        }
      } catch (err) {
        console.warn('[SEO Settings] Error loading settings:', err);
      }
    };

    loadSEOSettings();
  }, []);

  // Initialize cookie consent manager on app start
  useEffect(() => {
    const initCookieConsent = async () => {
      try {
        await cookieConsentManager.init();
        console.log('[Cookie Consent] Manager initialized');
      } catch (error) {
        console.error('[Cookie Consent] Initialization failed:', error);
      }
    };

    initCookieConsent();
  }, []);

  // Initialize Google Analytics 4 and Facebook Pixel
  useEffect(() => {
    // Try database settings first, fallback to env variable
    const ga4Id = seoSettings.google_analytics_id || import.meta.env.VITE_GA4_MEASUREMENT_ID;
    
    if (ga4Id) {
      initGA4(ga4Id);
      if (import.meta.env.DEV) {
        console.log('[GA4] Initialized with ID:', ga4Id);
      }
    }
    // Silently skip if no GA4 ID - not critical for functionality

    // Initialize Facebook Pixel
    const fbPixelId = seoSettings.facebook_pixel_id;
    if (fbPixelId) {
      initFacebookPixel(fbPixelId);
      if (import.meta.env.DEV) {
        console.log('[Facebook Pixel] Initialized with ID:', fbPixelId);
      }
    }
  }, [seoSettings]);

  // Preload category cache on app startup
  useEffect(() => {
    preloadCategories().catch(error => {
      console.warn('[App] Failed to preload category cache:', error);
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>{seoSettings.site_title}</title>
        <meta
          name="description"
          content={seoSettings.meta_description}
        />
        {seoSettings.meta_keywords && (
          <meta name="keywords" content={seoSettings.meta_keywords} />
        )}
      </Helmet>
      <AuthProvider>
        <CustomerAuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CurrencyProvider>
                <VisitorTracker>
                  <RouterProvider router={router} />
                  <CookieConsentBanner />
                  <SnowflakesEffect />
                  <AIAssistantButton />
                  <TawkToChat />
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#ffffff',
                        color: '#1f2937',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      },
                      success: {
                        style: {
                          background: '#f0fdf4',
                          color: '#166534',
                          border: '1px solid #bbf7d0',
                        },
                      },
                      error: {
                        style: {
                          background: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                        },
                      },
                    }}
                  />
                </VisitorTracker>
              </CurrencyProvider>
            </WishlistProvider>
          </CartProvider>
        </CustomerAuthProvider>
      </AuthProvider>
    </>
  );
};

export default App;
