import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-serif mb-4">Nirchal</h3>
            <p className="text-gray-300 mb-6">
              Premium Indian ethnic wear for women and girls, bridging traditional craftsmanship with modern shopping convenience.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/category/sarees" className="text-gray-300 hover:text-white transition-colors">
                  Sarees
                </Link>
              </li>
              <li>
                <Link to="/category/lehengas" className="text-gray-300 hover:text-white transition-colors">
                  Lehengas
                </Link>
              </li>
              <li>
                <Link to="/category/suits" className="text-gray-300 hover:text-white transition-colors">
                  Salwar Suits
                </Link>
              </li>
              <li>
                <Link to="/category/kurtis" className="text-gray-300 hover:text-white transition-colors">
                  Kurtis
                </Link>
              </li>
              <li>
                <Link to="/new-arrivals" className="text-gray-300 hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-medium mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/account/orders" className="text-gray-300 hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-300 hover:text-white transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-300 hover:text-white transition-colors">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="text-gray-300 hover:text-white transition-colors">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-lg font-medium mb-4">Stay Updated</h3>
            <p className="text-gray-300 mb-4">Subscribe to receive updates on new arrivals and special offers.</p>
            <div className="flex mb-6">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow px-4 py-2 bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-primary-500"
              />
              <button className="bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 transition-colors">
                Subscribe
              </button>
            </div>
            <div className="text-gray-300 space-y-2">
              <div className="flex items-center">
                <Mail size={16} className="mr-2" />
                <span>support@nirchal.com</span>
              </div>
              <div className="flex items-center">
                <Phone size={16} className="mr-2" />
                <span>+91 123 456 7890</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Nirchal. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;