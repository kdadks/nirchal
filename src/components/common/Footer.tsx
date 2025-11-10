import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Shield,
  Truck
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start space-y-4 md:space-y-0">
          
          {/* Brand */}
          <div className="flex-1">
            <Link to="/" className="font-display text-xl font-bold bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent mb-2 inline-block">
              Nirchal
            </Link>
            <p className="text-gray-300 text-xs mb-3">
              India's premier destination for authentic ethnic wear.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-2">
              <a 
                href="https://instagram.com/nirchal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-1.5 rounded-full hover:bg-pink-600 transition-colors"
              >
                <Instagram size={14} />
              </a>
              <a 
                href="https://facebook.com/nirchal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-1.5 rounded-full hover:bg-blue-600 transition-colors"
              >
                <Facebook size={14} />
              </a>
              <a 
                href="https://twitter.com/nirchal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-1.5 rounded-full hover:bg-blue-400 transition-colors"
              >
                <Twitter size={14} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
            {/* Shop */}
            <div>
              <h3 className="text-xs font-semibold mb-2 text-accent-400">Shop</h3>
              <ul className="space-y-1 text-xs">
                <li><Link to="/products?category=sarees" className="text-gray-300 hover:text-accent-400 transition-colors">Sarees</Link></li>
                <li><Link to="/products?category=lehengas" className="text-gray-300 hover:text-accent-400 transition-colors">Lehengas</Link></li>
                <li><Link to="/products?category=gowns" className="text-gray-300 hover:text-accent-400 transition-colors">Gowns</Link></li>
                <li><Link to="/products?category=kurtis" className="text-gray-300 hover:text-accent-400 transition-colors">Kurtis</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-xs font-semibold mb-2 text-accent-400">Support</h3>
              <ul className="space-y-1 text-xs">
                <li><Link to="/about" className="text-gray-300 hover:text-accent-400 transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-accent-400 transition-colors">Contact</Link></li>
                <li><Link to="/faq" className="text-gray-300 hover:text-accent-400 transition-colors">FAQ</Link></li>
                <li><Link to="/size-guide" className="text-gray-300 hover:text-accent-400 transition-colors">Size Guide</Link></li>
              </ul>
            </div>

            {/* Policies */}
            <div>
              <h3 className="text-xs font-semibold mb-2 text-accent-400">Policies</h3>
              <ul className="space-y-1 text-xs">
                <li><Link to="/shipping" className="text-gray-300 hover:text-accent-400 transition-colors">Shipping</Link></li>
                <li><Link to="/return-policy" className="text-gray-300 hover:text-accent-400 transition-colors">Returns</Link></li>
                <li><Link to="/privacy-policy" className="text-gray-300 hover:text-accent-400 transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="text-gray-300 hover:text-accent-400 transition-colors">Terms</Link></li>
                <li><Link to="/cookie-policy" className="text-gray-300 hover:text-accent-400 transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 bg-gray-900">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row justify-center items-center text-xs">
            <p className="text-gray-400 text-center">
              @ 2025 Nirchal.com. All rights reserved. Made by <a href="https://it-wala.com/" target="_blank" rel="noopener noreferrer" className="hover:text-accent-400 transition-colors">ITwala</a>
            </p>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <div className="flex items-center space-x-1">
                <Truck size={12} className="text-accent-400" />
                <span className="text-gray-400">Free Shipping Across India 🇮🇳</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield size={12} className="text-accent-400" />
                <span className="text-gray-400">Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
