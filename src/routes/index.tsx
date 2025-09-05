import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Lazy load components for better performance
const HomePage = lazy(() => import('../pages/HomePage'));
const ProductListingPage = lazy(() => import('../pages/ProductListingPage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'));
const CategoryPage = lazy(() => import('../pages/CategoryPage'));
const CartPage = lazy(() => import('../pages/CartPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('../pages/OrderConfirmationPage'));
const AccountPage = lazy(() => import('../pages/AccountPage'));

// Footer Pages - Lazy loaded
const AboutPage = lazy(() => import('../pages/footer/AboutPage'));
const SizeGuidePage = lazy(() => import('../pages/footer/SizeGuidePage'));
const FAQPage = lazy(() => import('../pages/footer/FAQPage'));
const PrivacyPolicyPage = lazy(() => import('../pages/footer/PrivacyPolicyPage'));
const ContactPage = lazy(() => import('../pages/footer/ContactPage'));
const ShippingPage = lazy(() => import('../pages/footer/ShippingPage'));
const ReturnPolicyPage = lazy(() => import('../pages/footer/ReturnPolicyPage'));
const TermsPage = lazy(() => import('../pages/footer/TermsPage'));

// Admin Pages - Lazy loaded
const LoginPage = lazy(() => import('../pages/admin/LoginPage'));
const AdminRoutes = lazy(() => import('./AdminRoutes'));
const AuthDebug = lazy(() => import('../pages/AuthDebug'));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/categories" element={<CategoryPage />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/products" element={<ProductListingPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="/myaccount" element={<AccountPage />} />
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

        {/* Admin Routes */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route 
          path="/admin/*" 
          element={<AdminRoutes />} 
        />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;