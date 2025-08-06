import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, Heart, User } from 'lucide-react';
import Footer from '../common/Footer';
import AIChatbot from '../common/AIChatbot';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Initialize with empty cart for now
  const cartItemCount = 0;

  // Don't render header/footer for admin routes
  if (isAdminRoute) {
    return <>{children}</>;
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <nav className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="font-display text-3xl font-bold bg-gradient-to-r from-accent-600 to-primary-600 bg-clip-text text-transparent">
                Nirchal
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/products" className="relative text-gray-700 hover:text-primary-600 transition-colors font-medium text-lg group">
                Shop
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-accent-500 to-primary-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/about" className="relative text-gray-700 hover:text-primary-600 transition-colors font-medium text-lg group">
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-accent-500 to-primary-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/contact" className="relative text-gray-700 hover:text-primary-600 transition-colors font-medium text-lg group">
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-accent-500 to-primary-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button className="hidden md:flex items-center justify-center w-10 h-10 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-full transition-all">
                <Search size={20} />
              </button>
              
              {/* Wishlist */}
              <button className="hidden md:flex items-center justify-center w-10 h-10 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-full transition-all">
                <Heart size={20} />
              </button>
              
              {/* User Account */}
              <button className="hidden md:flex items-center justify-center w-10 h-10 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-full transition-all">
                <User size={20} />
              </button>
              
              {/* Cart */}
              <Link to="/cart" className="relative flex items-center justify-center w-10 h-10 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-full transition-all">
                <ShoppingBag size={20} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-accent-500 to-primary-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMenu}
                className="md:hidden flex items-center justify-center w-10 h-10 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-full transition-all"
                aria-label="Menu"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4 bg-white">
              <div className="space-y-4">
                <Link
                  to="/products"
                  className="block px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Shop
                </Link>
                <Link
                  to="/about"
                  className="block px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="block px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="flex items-center justify-around px-4">
                    <button className="flex flex-col items-center space-y-1 text-gray-600">
                      <Search size={20} />
                      <span className="text-xs">Search</span>
                    </button>
                    <button className="flex flex-col items-center space-y-1 text-gray-600">
                      <Heart size={20} />
                      <span className="text-xs">Wishlist</span>
                    </button>
                    <button className="flex flex-col items-center space-y-1 text-gray-600">
                      <User size={20} />
                      <span className="text-xs">Account</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
};

export default Layout;