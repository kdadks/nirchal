import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, Heart, User, Crown, LogOut } from 'lucide-react';
import Footer from '../common/Footer';
import AIChatbot from '../common/AIChatbot';
import CustomerAuthModal from '../auth/CustomerAuthModal';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { customer, signOut } = useCustomerAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleAccountClick = () => {
    if (customer) {
      navigate('/myaccount');
    } else {
      setShowAuthModal(true);
    }
  };

  const navigationLinks = [
    { to: '/products', label: 'Collections' },
    { to: '/categories', label: 'Categories' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-25 via-white to-accent-25">
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-primary-100' 
            : 'bg-transparent'
        }`}
      >
        <nav className="container mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-600 via-accent-600 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-400 rounded-full animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-3xl font-bold bg-gradient-to-r from-primary-700 via-accent-600 to-secondary-600 bg-clip-text text-transparent hw-accelerate" style={{ 
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility'
                }}>
                  Nirchal
                </span>
                <span className="text-xs font-medium text-primary-600 tracking-widest uppercase -mt-1 hw-accelerate" style={{
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale'
                }}>
                  Ethnic Heritage
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-10">
              {navigationLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative font-accent font-medium text-neutral-700 hover:text-primary-700 transition-all duration-300 group py-2 retina-button"
                  style={{
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility'
                  }}
                >
                  {link.label}
                  <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
                  <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Search */}
              <button className="group relative p-3 text-neutral-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all duration-300">
                <Search size={20} />
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-100 to-accent-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></span>
              </button>
              
              {/* Wishlist */}
              <button className="group relative p-3 text-neutral-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all duration-300">
                <Heart size={20} />
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-100 to-accent-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></span>
              </button>
              
              {/* User Account */}
              <button 
                onClick={handleAccountClick}
                className="group relative p-3 text-neutral-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all duration-300 retina-button"
              >
                {customer ? (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold hw-accelerate" style={{
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale'
                  }}>
                    {customer.first_name?.[0]?.toUpperCase() || 'U'}
                  </span>
                ) : (
                  <User size={20} className="lucide hw-accelerate" style={{
                    shapeRendering: 'geometricPrecision'
                  }} />
                )}
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-100 to-accent-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></span>
              </button>
              
              {/* Logout Icon */}
              {customer && (
                <button
                  onClick={async () => {
                    try {
                      signOut();
                    } catch (error) {
                      console.error('Error signing out:', error);
                    } finally {
                      navigate('/');
                    }
                  }}
                  className="group relative p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300 retina-button"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut size={20} className="lucide hw-accelerate" style={{
                    shapeRendering: 'geometricPrecision'
                  }} />
                  <span className="absolute inset-0 rounded-xl bg-red-100/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></span>
                </button>
              )}
              
              {/* Cart */}
              <Link 
                to="/cart" 
                className="group relative p-3 text-neutral-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all duration-300 retina-button hw-accelerate"
                style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
              >
                <ShoppingBag size={20} className="lucide" style={{ shapeRendering: 'geometricPrecision' }} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-accent-500 to-secondary-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {cartItemCount}
                  </span>
                )}
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-100 to-accent-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden flex items-center justify-center w-12 h-12 text-neutral-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all duration-300 retina-button hw-accelerate"
              aria-label="Menu"
              style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
            >
              {isMenuOpen ? <X size={24} className="lucide" style={{ shapeRendering: 'geometricPrecision' }} /> : <Menu size={24} className="lucide" style={{ shapeRendering: 'geometricPrecision' }} />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div 
            className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
              isMenuOpen 
                ? 'max-h-96 opacity-100 pb-6' 
                : 'max-h-0 opacity-0 pb-0'
            }`}
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 mt-4 border border-primary-100 shadow-xl">
              <div className="space-y-4">
                {navigationLinks.map((link, index) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block px-4 py-3 text-neutral-700 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all duration-300 font-accent font-medium animate-fade-in-left"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {/* Mobile Actions */}
                <div className="border-t border-primary-100 pt-4 mt-6">
                  <div className="grid grid-cols-4 gap-3">
                    <button className="flex flex-col items-center space-y-2 p-4 text-neutral-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all duration-300">
                      <Search size={22} />
                      <span className="text-sm font-medium">Search</span>
                    </button>
                    <button className="flex flex-col items-center space-y-2 p-4 text-neutral-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all duration-300">
                      <Heart size={22} />
                      <span className="text-sm font-medium">Wishlist</span>
                    </button>
                    <button 
                      onClick={handleAccountClick}
                      className="flex flex-col items-center space-y-2 p-4 text-neutral-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all duration-300"
                    >
                      <User size={22} />
                      <span className="text-sm font-medium">Account</span>
                    </button>
                    <Link 
                      to="/cart"
                      className="flex flex-col items-center space-y-2 p-4 text-neutral-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all duration-300 relative"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShoppingBag size={22} />
                      <span className="text-sm font-medium">Cart</span>
                      {cartItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-accent-500 to-secondary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {cartItemCount}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* AI Chatbot */}
      <AIChatbot />

      {/* Auth Modal */}
      <CustomerAuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default Layout;