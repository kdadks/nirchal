import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  Heart,
  Shield,
  Truck,
  RefreshCw
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand & Description */}
          <div className="lg:col-span-2">
            <Link to="/" className="font-display text-3xl font-bold bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent mb-4 inline-block">
              Nirchal
            </Link>
            <p className="text-gray-300 mb-6 leading-relaxed">
              India's premier destination for authentic ethnic wear. We celebrate the rich heritage of Indian craftsmanship while bringing you contemporary designs that blend tradition with modern elegance.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-accent-400" />
                <span className="text-gray-300">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-accent-400" />
                <span className="text-gray-300">hello@nirchal.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin size={16} className="text-accent-400 mt-1" />
                <span className="text-gray-300">
                  123 Fashion Street,<br />
                  Mumbai, Maharashtra 400001
                </span>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <p className="text-sm text-gray-400 mb-3">Follow Us</p>
              <div className="flex space-x-4">
                <a 
                  href="https://instagram.com/nirchal" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-800 p-3 rounded-full hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-110"
                >
                  <Instagram size={20} />
                </a>
                <a 
                  href="https://facebook.com/nirchal" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-800 p-3 rounded-full hover:bg-blue-600 transition-all duration-300 transform hover:scale-110"
                >
                  <Facebook size={20} />
                </a>
                <a 
                  href="https://twitter.com/nirchal" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-800 p-3 rounded-full hover:bg-blue-400 transition-all duration-300 transform hover:scale-110"
                >
                  <Twitter size={20} />
                </a>
                <a 
                  href="https://youtube.com/nirchal" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-800 p-3 rounded-full hover:bg-red-600 transition-all duration-300 transform hover:scale-110"
                >
                  <Youtube size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-accent-400">Shop</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/products?category=sarees" className="text-gray-300 hover:text-accent-400 transition-colors">
                  Sarees
                </Link>
              </li>
              <li>
                <Link to="/products?category=lehengas" className="text-gray-300 hover:text-accent-400 transition-colors">
                  Lehengas
                </Link>
              </li>
              <li>
                <Link to="/products?category=gowns" className="text-gray-300 hover:text-accent-400 transition-colors">
                  Gowns
                </Link>
              </li>
              <li>
                <Link to="/products?category=kurtis" className="text-gray-300 hover:text-accent-400 transition-colors">
                  Kurtis & Suits
                </Link>
              </li>
              <li>
                <Link to="/products?category=accessories" className="text-gray-300 hover:text-accent-400 transition-colors">
                  Accessories
                </Link>
              </li>
              <li>
                <Link to="/products?featured=true" className="text-gray-300 hover:text-accent-400 transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-accent-400">Customer Care</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-accent-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-accent-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-accent-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="text-gray-300 hover:text-accent-400 transition-colors">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link to="/store-locator" className="text-gray-300 hover:text-accent-400 transition-colors">
                  Store Locator
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-accent-400 transition-colors">
                  Fashion Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-accent-400">Policies</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/shipping" className="text-gray-300 hover:text-accent-400 transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="text-gray-300 hover:text-accent-400 transition-colors">
                  Return & Exchange
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-300 hover:text-accent-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-accent-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-gray-300 hover:text-accent-400 transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/cancellation-policy" className="text-gray-300 hover:text-accent-400 transition-colors">
                  Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3 text-gray-300">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-full">
                <Truck size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">Free Shipping</p>
                <p className="text-xs">On orders ₹2,999+</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-300">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-full">
                <Shield size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">Secure Payment</p>
                <p className="text-xs">100% Protected</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-300">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-full">
                <RefreshCw size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">Easy Returns</p>
                <p className="text-xs">30-day policy</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-300">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-2 rounded-full">
                <Heart size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">Made with Love</p>
                <p className="text-xs">Crafted in India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-lg font-semibold mb-3 text-accent-400">Stay Updated</h4>
            <p className="text-gray-300 mb-6">Subscribe to get special offers, exclusive collections, and style tips.</p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 Nirchal. All rights reserved. Made with ❤️ in India.
            </p>
            <div className="flex space-x-6">
              <span className="text-gray-400 text-sm">We accept:</span>
              <div className="flex space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1 rounded text-xs text-white">VISA</div>
                <div className="bg-gradient-to-r from-orange-500 to-red-600 px-3 py-1 rounded text-xs text-white">MC</div>
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-3 py-1 rounded text-xs text-white">UPI</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
