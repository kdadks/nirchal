import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Public Pages
import HomePage from '../pages/HomePage';
import ProductListingPage from '../pages/ProductListingPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CategoryPage from '../pages/CategoryPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderConfirmationPage from '../pages/OrderConfirmationPage';
import AccountPage from '../pages/AccountPage';

// Footer Pages
// Update the path below to match the actual location and name of AboutPage
import AboutPage from '../pages/footer/AboutPage';
import SizeGuidePage from '../pages/footer/SizeGuidePage';
import FAQPage from '../pages/footer/FAQPage';
import PrivacyPolicyPage from '../pages/footer/PrivacyPolicyPage';
import ContactPage from '../pages/footer/ContactPage';
import ShippingPage from '../pages/footer/ShippingPage';
import ReturnPolicyPage from '../pages/footer/ReturnPolicyPage';
import TermsPage from '../pages/footer/TermsPage';

// Admin Pages
import LoginPage from '../pages/admin/LoginPage';
import AdminRoutes from './AdminRoutes';
import AuthDebug from '../pages/AuthDebug';

export const AppRoutes: React.FC = () => {
  return (
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
  );
};

export default AppRoutes;