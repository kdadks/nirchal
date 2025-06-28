import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdminRoute = location.pathname.startsWith('/admin');
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
      <header className="bg-white border-b border-gray-200">
        <nav className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="font-serif text-2xl font-bold text-gray-900">
              Nirchal
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/products" className="text-gray-600 hover:text-gray-900">
                Shop
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900">
                About
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-gray-900">
                Contact
              </Link>
            </div>

            {/* Cart and Mobile Menu */}
            <div className="flex items-center">
              <Link to="/cart" className="relative p-2">
                <ShoppingBag className="h-6 w-6 text-gray-600" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMenu}
                className="ml-4 p-2 md:hidden"
                aria-label="Menu"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6 text-gray-600" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <Link
                  to="/products"
                  className="text-gray-600 hover:text-gray-900"
                  onClick={toggleMenu}
                >
                  Shop
                </Link>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-gray-900"
                  onClick={toggleMenu}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-gray-900"
                  onClick={toggleMenu}
                >
                  Contact
                </Link>
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
      <footer className="bg-gray-100">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">About Nirchal</h3>
              <p className="text-gray-600">
                Your premier destination for authentic Indian ethnic wear.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-600 hover:text-gray-900">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-600 hover:text-gray-900">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="text-gray-600 hover:text-gray-900">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-gray-600 hover:text-gray-900">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Policies</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy-policy" className="text-gray-600 hover:text-gray-900">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-600 hover:text-gray-900">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/return-policy" className="text-gray-600 hover:text-gray-900">
                    Return Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Contact Us</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Email: support@nirchal.com</li>
                <li>Phone: +91 123 456 7890</li>
                <li>10 AM - 7 PM IST (Mon-Sat)</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} Nirchal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;