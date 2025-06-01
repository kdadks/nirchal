import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from './components/layout/Layout';

// Footer Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/footer/AboutPage';
import FAQPage from './pages/footer/FAQPage';
import PrivacyPolicyPage from './pages/footer/PrivacyPolicyPage';
import ContactPage from './pages/footer/ContactPage';
import ShippingPage from './pages/footer/ShippingPage';
import ReturnPolicyPage from './pages/footer/ReturnPolicyPage';
import TermsPage from './pages/footer/TermsPage';

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

      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/return-policy" element={<ReturnPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
