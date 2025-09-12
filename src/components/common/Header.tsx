import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Search, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useCategories } from '../../hooks/useCategories';
import AuthModal from '../auth/AuthModal';
import CustomerAuthModal from '../auth/CustomerAuthModal';

const Header: React.FC = () => {
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  const { customer } = useCustomerAuth();
  const { categories } = useCategories();
  const isAuthenticated = !!user;
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [showCustomerAuthModal, setShowCustomerAuthModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle navigation to wishlist after customer authentication
  useEffect(() => {
    if (customer && showCustomerAuthModal) {
      setShowCustomerAuthModal(false);
      navigate('/wishlist');
    }
  }, [customer, showCustomerAuthModal, navigate]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[1000] pointer-events-auto transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="font-serif text-2xl md:text-3xl font-bold text-primary-700"
          >
            Nirchal
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {categories.slice(0, 4).map(category => (
              <Link 
                key={category.id}
                to={`/category/${category.slug || category.name}`}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                {category.name}
              </Link>
            ))}
            <Link
              to="/categories"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              All Categories
            </Link>
          </nav>

          {/* Search Input and Icons */}
          <div className="flex items-center space-x-4">
            {/* Inline Search Input - Desktop Only */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const searchInput = e.currentTarget.querySelector('input') as HTMLInputElement;
                if (searchInput && searchInput.value.trim()) {
                  navigate(`/products?search=${encodeURIComponent(searchInput.value.trim())}`);
                  searchInput.value = '';
                }
              }}
              className="hidden md:flex items-center"
            >
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-48 py-1.5 pl-8 pr-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Search size={14} className="absolute left-2.5 top-2 text-gray-400 pointer-events-none" />
              </div>
            </form>

            {/* Mobile Search Button */}
            <button 
              onClick={(e) => {
                console.log('Mobile search button clicked!', e);
                setSearchOpen(!searchOpen);
              }}
              className="md:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors cursor-pointer"
              aria-label="Search"
              style={{ backgroundColor: 'red', zIndex: 9999 }}
            >
              <Search size={20} />
            </button>
            
            {/* Removed separate desktop Account menu to avoid duplicate/overlapping targets */}
            
            <button 
              onClick={(e) => {
                console.log('Heart button clicked!', e);
                if (customer) {
                  navigate('/wishlist');
                } else {
                  setShowCustomerAuthModal(true);
                }
              }}
              className="p-2 text-gray-700 hover:text-primary-600 transition-colors cursor-pointer"
              aria-label="Wishlist"
              style={{ backgroundColor: 'blue', zIndex: 9999 }}
            >
              <Heart size={20} />
            </button>
            
            <Link 
              to="/cart" 
              className="p-2 text-gray-700 hover:text-primary-600 transition-colors relative cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            
            <button 
              className="md:hidden p-2 text-gray-700 cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

          {/* Search Panel */}
        {searchOpen && (
          <div className="absolute left-0 right-0 bg-white shadow-md p-4 mt-2 animate-slideDown">
            <div className="max-w-2xl mx-auto">
              <form onSubmit={(e) => {
                e.preventDefault();
                const searchInput = e.currentTarget.querySelector('input') as HTMLInputElement;
                if (searchInput && searchInput.value.trim()) {
                  navigate(`/products?search=${encodeURIComponent(searchInput.value.trim())}`);
                  setSearchOpen(false);
                }
              }}>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search for products..." 
                    className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoFocus
                  />
                  <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                  <button 
                    type="submit"
                    className="absolute right-3 top-2 px-3 py-1 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 transition-colors"
                  >
                    Search
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Sarees', 'Lehengas', 'Wedding Collection', 'New Arrivals'].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        navigate(`/products?search=${encodeURIComponent(term)}`);
                        setSearchOpen(false);
                      }}
                      className="text-sm text-gray-600 hover:text-primary-600 bg-gray-100 px-3 py-1 rounded-full transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg animate-slideDown">
            <nav className="flex flex-col p-4">
              {categories.map(category => (
                <Link 
                  key={category.id}
                  to={`/category/${category.slug || category.name}`}
                  className="py-3 border-b border-gray-100 text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              <Link
                to="/categories"
                className="py-3 border-b border-gray-100 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                All Categories
              </Link>
              {isAuthenticated ? (
                <>
                  <div className="py-3 border-b border-gray-100 text-gray-500 px-3">
                    Signed in as {user?.name}
                  </div>
                  <button
                    className="py-3 border-b border-gray-100 text-gray-700 text-left"
                    onClick={() => {
                      if (!isAuthenticated) {
                        setAuthOpen(true);
                      } else {
                        navigate('/myaccount');
                      }
                      setMobileMenuOpen(false);
                    }}
                  >
                    Account
                  </button>
                  <button
                    onClick={async () => {
                      await signOut();
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="w-full text-left py-3 border-b border-gray-100 text-gray-700"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  className="py-3 border-b border-gray-100 text-gray-700 text-left"
                  onClick={() => {
                    if (!isAuthenticated) {
                      setAuthOpen(true);
                    } else {
                      navigate('/myaccount');
                    }
                    setMobileMenuOpen(false);
                  }}
                >
                  Account
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <CustomerAuthModal 
        open={showCustomerAuthModal} 
        onClose={() => setShowCustomerAuthModal(false)}
        preventRedirect={true}
      />
    </header>
  );
};

export default Header;
