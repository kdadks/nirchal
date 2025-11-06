import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

const NotFoundPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Page Not Found - 404"
        description="The page you are looking for could not be found. Browse our collection or return to the homepage."
        noindex={true}
        nofollow={true}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">
              404
            </h1>
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-primary-100 rounded-full opacity-50 animate-ping"></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Oops! Page Not Found
            </h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved. 
              Let's get you back on track!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Home className="w-5 h-5 mr-2" />
                Go to Homepage
              </Link>
              
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200"
              >
                <Search className="w-5 h-5 mr-2" />
                Browse Products
              </Link>
            </div>

            {/* Back Button */}
            <div className="mt-8">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go back to previous page
              </button>
            </div>
          </div>

          {/* Popular Links */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Popular Pages
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/products"
                className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
              >
                All Products
              </Link>
              <Link
                to="/categories"
                className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
              >
                Categories
              </Link>
              <Link
                to="/about"
                className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
