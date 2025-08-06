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
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Brand */}
          <div>
            <Link to="/" className="font-display text-2xl font-bold bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent mb-3 inline-block">
              Nirchal
            </Link>
            <p className="text-gray-300 text-sm mb-4">
              India's premier destination for authentic ethnic wear.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-3">
              <a 
                href="https://instagram.com/nirchal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-pink-600 transition-colors"
              >
                <Instagram size={16} />
              </a>
              <a 
                href="https://facebook.com/nirchal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition-colors"
              >
                <Facebook size={16} />
              </a>
              <a 
                href="https://twitter.com/nirchal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-blue-400 transition-colors"
              >
                <Twitter size={16} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-accent-400">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products?category=sarees" className="text-gray-300 hover:text-accent-400 transition-colors">Sarees</Link></li>
              <li><Link to="/products?category=lehengas" className="text-gray-300 hover:text-accent-400 transition-colors">Lehengas</Link></li>
              <li><Link to="/products?category=gowns" className="text-gray-300 hover:text-accent-400 transition-colors">Gowns</Link></li>
              <li><Link to="/products?category=kurtis" className="text-gray-300 hover:text-accent-400 transition-colors">Kurtis</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-accent-400">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-gray-300 hover:text-accent-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-accent-400 transition-colors">Contact</Link></li>
              <li><Link to="/faq" className="text-gray-300 hover:text-accent-400 transition-colors">FAQ</Link></li>
              <li><Link to="/size-guide" className="text-gray-300 hover:text-accent-400 transition-colors">Size Guide</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-accent-400">Policies</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shipping" className="text-gray-300 hover:text-accent-400 transition-colors">Shipping</Link></li>
              <li><Link to="/return-policy" className="text-gray-300 hover:text-accent-400 transition-colors">Returns</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-300 hover:text-accent-400 transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-accent-400 transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-gray-400">
              © 2025 Nirchal. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <div className="flex items-center space-x-2">
                <Truck size={14} className="text-accent-400" />
                <span className="text-gray-400">Free Shipping ₹2,999+</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield size={14} className="text-accent-400" />
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
