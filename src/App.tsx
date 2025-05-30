import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from './contexts/AuthContext';

// Public Pages
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';

// Footer Pages
import AboutPage from './pages/footer/AboutPage';
import FAQPage from './pages/footer/FAQPage';
import PrivacyPolicyPage from './pages/footer/PrivacyPolicyPage';
import ContactPage from './pages/footer/ContactPage';
import ShippingPage from './pages/footer/ShippingPage';
import ReturnPolicyPage from './pages/footer/ReturnPolicyPage';
import TermsPage from './pages/footer/TermsPage';

// Admin Pages
import LoginPage from './pages/admin/LoginPage';
import AdminRoutes from './routes/AdminRoutes';

const App: React.FC = () => {
  const { user, isAdmin } = useAuth();

  return (
    <Router>
      <Helmet>
        <title>Nirchal - Indian Ethnic Wear</title>
        <meta
          name="description"
          content="Discover authentic Indian ethnic wear at Nirchal. Shop our curated collection of traditional and contemporary designs."
        />
      </Helmet>

      <Routes>
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />

          {/* Footer Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/return-policy" element={<ReturnPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin/*"
          element={<AdminRoutes isAuthenticated={!!user} isAdmin={isAdmin} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
