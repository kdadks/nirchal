import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from './components/layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import AppRoutes from './routes';

const App: React.FC = () => {
  return (
    <Router>
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
            <Layout>
              <AppRoutes />
            </Layout>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
