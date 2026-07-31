import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Shown while the page reloads after a stale chunk error
export const ChunkLoadErrorPage: React.FC = () => {
  useEffect(() => {
    const reloadKey = 'chunk_error_page_reload';
    if (!sessionStorage.getItem(reloadKey)) {
      sessionStorage.setItem(reloadKey, 'true');
      window.location.reload();
    }
  }, []);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center px-6">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Updating application&hellip;</h2>
        <p className="text-gray-500 text-sm">A new version is available. The page will refresh automatically.</p>
        <button
          onClick={() => {
            sessionStorage.removeItem('lazy_reload_attempted');
            sessionStorage.removeItem('chunk_error_page_reload');
            window.location.reload();
          }}
          className="mt-6 px-5 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
        >
          Refresh now
        </button>
      </div>
    </div>
  );
};

// Helper function to handle lazy loading with retry mechanism
const isChunkLoadError = (error: any): boolean => {
  const msg = error?.message || error?.toString() || '';
  return msg.includes('Failed to fetch dynamically imported module') ||
         msg.includes('Unexpected token') ||
         msg.includes('Unexpected end of JSON input') ||
         msg.includes('NetworkError when attempting to fetch resource');
};

const lazyWithRetry = (componentImport: () => Promise<any>) => {
  return lazy(() =>
    componentImport().catch((error) => {
      console.error('[lazyWithRetry] Failed to load chunk:', error?.message);
      if (isChunkLoadError(error)) {
        const reloadKey = 'lazy_reload_attempted';
        if (!sessionStorage.getItem(reloadKey)) {
          sessionStorage.setItem(reloadKey, 'true');
          // Reload immediately; return a blank placeholder while reload is pending
          window.location.reload();
          return Promise.resolve({ default: () => null as any });
        }
        // Already tried reloading — show the ChunkLoadErrorPage instead of crashing
        return Promise.resolve({ default: ChunkLoadErrorPage as () => any });
      }
      throw error;
    })
  );
};

// Lazy load components for better performance with error handling
const HomePage = lazyWithRetry(() => import('../pages/HomePage'));
const ProductListingPage = lazyWithRetry(() => import('../pages/ProductListingPage'));
const ProductDetailPage = lazyWithRetry(() => import('../pages/ProductDetailPage'));
const CategoryPage = lazyWithRetry(() => import('../pages/CategoryPage'));
const CartPage = lazyWithRetry(() => import('../pages/CartPage'));
const CheckoutPage = lazyWithRetry(() => import('../pages/CheckoutPage'));
const OrderConfirmationPage = lazyWithRetry(() => import('../pages/OrderConfirmationPage'));
const AccountPage = lazyWithRetry(() => import('../pages/AccountPage'));
const ResetPasswordPage = lazyWithRetry(() => import('../pages/ResetPasswordPage'));
const ReturnRequestPage = lazyWithRetry(() => import('../pages/ReturnRequestPage'));
const VerifyEmailPage = lazyWithRetry(() => import('../pages/VerifyEmailPage'));

// Footer Pages - Lazy loaded with error handling
const AboutPage = lazyWithRetry(() => import('../pages/footer/AboutPage'));
const SizeGuidePage = lazyWithRetry(() => import('../pages/footer/SizeGuidePage'));
const FAQPage = lazyWithRetry(() => import('../pages/footer/FAQPage'));
const PrivacyPolicyPage = lazyWithRetry(() => import('../pages/footer/PrivacyPolicyPage'));
const ContactPage = lazyWithRetry(() => import('../pages/footer/ContactPage'));
const ShippingPage = lazyWithRetry(() => import('../pages/footer/ShippingPage'));
const ReturnPolicyPage = lazyWithRetry(() => import('../pages/footer/ReturnPolicyPage'));
const TermsPage = lazyWithRetry(() => import('../pages/footer/TermsPage'));
const CookiePolicyPage = lazyWithRetry(() => import('../pages/CookiePolicyPage'));
const CookieConsentSettingsPage = lazyWithRetry(() => import('../pages/CookieConsentSettingsPage'));

// Admin Pages - Lazy loaded with error handling
const LoginPage = lazyWithRetry(() => import('../pages/admin/LoginPage'));
const AdminRoutes = lazyWithRetry(() => import('./AdminRoutes'));
const AuthDebug = lazyWithRetry(() => import('../pages/AuthDebug'));

// Error Pages
const NotFoundPage = lazyWithRetry(() => import('../pages/NotFoundPage'));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/categories" element={<CategoryPage />} />
        <Route path="/category/:categorySlug" element={<ProductListingPage />} />
        <Route path="/products" element={<ProductListingPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="/myaccount" element={<AccountPage />} />
        <Route path="/return-request" element={<ReturnRequestPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/auth-debug" element={<AuthDebug />} />

        {/* Footer Pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/size-guide" element={<SizeGuidePage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/shipping" element={<ShippingPage />} />
        <Route path="/return-policy" element={<ReturnPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cookie-policy" element={<CookiePolicyPage />} />

        {/* Settings Routes */}
        <Route path="/settings/cookies" element={<CookieConsentSettingsPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route 
          path="/admin/*" 
          element={<AdminRoutes />} 
        />
        
        {/* 404 - Catch all unmatched routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;