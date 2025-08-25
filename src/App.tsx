
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { CustomerAuthProvider } from './contexts/CustomerAuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import AppRoutes from './routes';

const router = createBrowserRouter([
  {
    path: '*',
    element: <Layout><AppRoutes /></Layout>,
  },
]);

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
        <CustomerAuthProvider>
          <CartProvider>
            <WishlistProvider>
              <RouterProvider router={router} />
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
            </WishlistProvider>
          </CartProvider>
        </CustomerAuthProvider>
      </AuthProvider>
    </>
  );
};

export default App;
