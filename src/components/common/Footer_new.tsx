import React from 'react';
import { Link } from 'react-router-dom';
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Mail,
  Phone,
  Heart,
  Shield,
  Truck,
  RefreshCw
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border-t border-gray-700/50">
      {/* Single Row Minimal Footer */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">

          {/* Brand & Contact */}
          <div className="text-center lg:text-left">
            <Link to="/" className="font-display text-2xl font-bold bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent mb-2 inline-block">
              Nirchal
            </Link>
            <p className="text-gray-400 text-sm mb-3">Authentic ethnic wear</p>
            <div className="flex items-center justify-center lg:justify-start gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Phone size={12} />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail size={12} />
                <span>hello@nirchal.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center lg:text-left">
            <h4 className="text-sm font-semibold mb-3 text-accent-400">Quick Links</h4>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-xs">
              <Link to="/about" className="text-gray-400 hover:text-accent-400 transition-colors">About</Link>
              <Link to="/contact" className="text-gray-400 hover:text-accent-400 transition-colors">Contact</Link>
              <Link to="/faq" className="text-gray-400 hover:text-accent-400 transition-colors">FAQ</Link>
              <Link to="/privacy-policy" className="text-gray-400 hover:text-accent-400 transition-colors">Privacy</Link>
              <Link to="/return-policy" className="text-gray-400 hover:text-accent-400 transition-colors">Returns</Link>
              <Link to="/shipping" className="text-gray-400 hover:text-accent-400 transition-colors">Shipping</Link>
              <Link to="/products" className="text-gray-400 hover:text-accent-400 transition-colors">Shop</Link>
              <Link to="/terms" className="text-gray-400 hover:text-accent-400 transition-colors">Terms</Link>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="text-center lg:text-left">
            <h4 className="text-sm font-semibold mb-3 text-accent-400">Trust & Security</h4>
            <div className="flex justify-center lg:justify-start gap-4">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-1 rounded">
                  <Truck size={10} className="text-white" />
                </div>
                <span>Free Ship</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-1 rounded">
                  <Shield size={10} className="text-white" />
                </div>
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-1 rounded">
                  <RefreshCw size={10} className="text-white" />
                </div>
                <span>Returns</span>
              </div>
            </div>
          </div>

          {/* Social & Payment */}
          <div className="text-center lg:text-right">
            <h4 className="text-sm font-semibold mb-3 text-accent-400">Connect & Pay</h4>

            {/* Social Links */}
            <div className="flex justify-center lg:justify-end gap-2 mb-3">
              <a
                href="https://instagram.com/nirchal"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 transition-all duration-300"
              >
                <Instagram size={14} />
              </a>
              <a
                href="https://facebook.com/nirchal"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded hover:bg-blue-600 transition-all duration-300"
              >
                <Facebook size={14} />
              </a>
              <a
                href="https://twitter.com/nirchal"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded hover:bg-blue-400 transition-all duration-300"
              >
                <Twitter size={14} />
              </a>
              <a
                href="https://youtube.com/nirchal"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded hover:bg-red-600 transition-all duration-300"
              >
                <Youtube size={14} />
              </a>
            </div>

            {/* Payment Methods */}
            <div className="flex justify-center lg:justify-end gap-2 text-xs">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-2 py-1 rounded text-white">VISA</div>
              <div className="bg-gradient-to-r from-orange-500 to-red-600 px-2 py-1 rounded text-white">MC</div>
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-2 py-1 rounded text-white">UPI</div>
            </div>
          </div>

        </div>

        {/* Centered Copyright */}
        <div className="text-center mt-4">
          <p className="text-gray-400 text-xs">
            © 2025 Nirchal.com. All rights reserved. Made by{' '}
            <a
              href="https://it-wala.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-400 transition-colors"
            >
              ITwala
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
