import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Helper function to handle lazy loading with retry mechanism
const lazyWithRetry = (componentImport: () => Promise<any>) => {
  return lazy(() => 
    componentImport().catch((error) => {
      console.error('Failed to load component, retrying...', error);
      // Force a page reload if dynamic import fails completely
      // This helps with cache/build mismatch issues
      if (error.message?.includes('Failed to fetch dynamically imported module')) {
        console.log('Dynamic import failed, reloading page to clear cache...');
        setTimeout(() => window.location.reload(), 1000);
      }
      return componentImport(); // Retry once
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