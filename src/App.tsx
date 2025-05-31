import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Public Pages
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/footer/AboutPage';
import ContactPage from './pages/footer/ContactPage';

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
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
