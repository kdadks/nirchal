import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, User, Search, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCategories } from '../../hooks/useCategories';

const Header: React.FC = () => {
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  const { categories } = useCategories();
  const isAuthenticated = !!user;
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
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
                to={`/products?category=${category.slug || category.name}`}
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

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-gray-700 hover:text-primary-600 transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            
            {/* Account Menu */}
            <div className="relative hidden md:block">
              {isAuthenticated ? (
                <div className="group relative">
                  <button 
                    className="flex items-center space-x-1 p-2 text-gray-700 hover:text-primary-600 transition-colors"
                    aria-label="Account"
                  >
                    <User size={20} />
                    <span className="text-sm font-medium">{user?.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link 
                      to="/orders" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Orders
                    </Link>
                    <button
                      onClick={async () => {
                        await signOut();
                        navigate('/');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="flex items-center space-x-1 p-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <User size={20} />
                  <span className="text-sm font-medium">Sign in</span>
                </Link>
              )}
            </div>
            
            <Link 
              to="/wishlist" 
              className="p-2 text-gray-700 hover:text-primary-600 transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={20} />
            </Link>
            
            <Link 
              to="/cart" 
              className="p-2 text-gray-700 hover:text-primary-600 transition-colors relative"
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
              className="md:hidden p-2 text-gray-700"
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
                const searchInput = e.currentTarget.querySelector('input');
                if (searchInput) {
                  window.location.href = `/products?search=${searchInput.value}`;
                }
                setSearchOpen(false);
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
                        window.location.href = `/products?search=${term}`;
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
                  to={`/products?category=${category.slug || category.name}`}
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
                  <Link 
                    to="/profile"
                    className="py-3 border-b border-gray-100 text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/orders"
                    className="py-3 border-b border-gray-100 text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Orders
                  </Link>
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
                <Link 
                  to="/login"
                  className="py-3 border-b border-gray-100 text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
