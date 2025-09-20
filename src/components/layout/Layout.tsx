import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Footer from '../common/Footer_new';
import Header from '../common/Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Don't render header/footer for admin routes
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-25 via-white to-accent-25">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow pt-32">
        {children}
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default Layout;