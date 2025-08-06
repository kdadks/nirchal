import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from './components/layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import AppRoutes from './routes';

// Import all pages and routes as needed for the router
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AboutPage from './pages/footer/AboutPage';
import SizeGuidePage from './pages/footer/SizeGuidePage';
import FAQPage from './pages/footer/FAQPage';
import PrivacyPolicyPage from './pages/footer/PrivacyPolicyPage';
import ContactPage from './pages/footer/ContactPage';
import ShippingPage from './pages/footer/ShippingPage';
import ReturnPolicyPage from './pages/footer/ReturnPolicyPage';
import TermsPage from './pages/footer/TermsPage';
import LoginPage from './pages/admin/LoginPage';
import AdminRoutes from './routes/AdminRoutes';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><AppRoutes /></Layout>,
    children: [
      { path: '', element: <HomePage /> },
      { path: 'products', element: <ProductListingPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'order-confirmation', element: <OrderConfirmationPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'size-guide', element: <SizeGuidePage /> },
      { path: 'faq', element: <FAQPage /> },
      { path: 'privacy-policy', element: <PrivacyPolicyPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'shipping', element: <ShippingPage /> },
      { path: 'return-policy', element: <ReturnPolicyPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'admin/login', element: <LoginPage /> },
      { path: 'admin/*', element: <AdminRoutes isAuthenticated={true} /> },
    ],
  },
], {
  // Remove unsupported 'future' options for react-router v7
  // future: {
  //   v7_startTransition: true,
  //   v7_relativeSplatPath: true,
  // },
});

const App: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Nirchal - Indian Ethnic Wear</title>
        <meta
          name="description"
          content="Discover authentic Indian ethnic wear at Nirchal. Shop our curated collection of traditional and contemporary designs."
        />
      </Helmet>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <RouterProvider router={router} />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </>
  );
};

export default App;
