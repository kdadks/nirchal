import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Search, Menu, X, User, ChevronDown, Sparkles, Gift, Star, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import CustomerAuthModal from '../auth/CustomerAuthModal';

const typeAheadSuggestions = [
  'Silk Sarees', 'Cotton Kurtis', 'Designer Lehengas', 'Wedding Collection',
  'Festive Wear', 'Casual Kurtas', 'Party Dresses', 'Traditional Wear',
  'Ethnic Jewelry', 'Bridal Collection'
];

const promotionalMessages = [
  {
    text: "🎉 FLASH SALE: Up to 70% OFF on Festive Collection!",
    icon: Sparkles,
    gradient: "from-yellow-400 via-orange-500 to-red-500"
  },
  {
    text: "🚚 FREE SHIPPING on orders above ₹999",
    icon: Gift,
    gradient: "from-green-400 via-blue-500 to-purple-500"
  },
  {
    text: "⭐ NEW ARRIVALS: Premium Silk Sarees Collection",
    icon: Star,
    gradient: "from-pink-400 via-purple-500 to-indigo-500"
  },
  {
    text: "⚡ EXPRESS DELIVERY within 24 hours",
    icon: Zap,
    gradient: "from-cyan-400 via-blue-500 to-indigo-500"
  },
  {
    text: "💎 DIAMOND JEWELRY: Exclusive Bridal Collection",
    icon: Sparkles,
    gradient: "from-purple-400 via-pink-500 to-red-500"
  }
];

const Header: React.FC = () => {
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  const isAuthenticated = !!user;
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [menDropdownOpen, setMenDropdownOpen] = useState(false);
  const [womenDropdownOpen, setWomenDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setMenDropdownOpen(false);
      setWomenDropdownOpen(false);
      setUserDropdownOpen(false);
      setShowSuggestions(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Auto-rotate promotional banner
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % promotionalMessages.length);
    }, 10000); // Change banner every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const filteredSuggestions = typeAheadSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 0
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    navigate(`/products?search=${encodeURIComponent(suggestion)}`);
    setSearchOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-xl border-b border-primary-100/50'
          : 'bg-white/90 backdrop-blur-md shadow-lg border-b border-primary-50/30'
      }`}
    >
      {/* Main Header Bar */}
      <div className="relative">
        <div className="container mx-auto px-4 lg:px-6 py-2">
          <div className="flex items-center justify-between lg:justify-center gap-2 lg:gap-6">
            {/* Logo Section */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className="flex-shrink-0"
            >
              <Link
                to="/"
                className="relative group flex items-center gap-2 lg:gap-4"
              >
                {/* Enhanced Logo Container with Glossy Effects */}
                <div className="relative p-3 rounded-xl bg-gradient-to-br from-primary-500/15 via-accent-500/15 to-secondary-500/15 backdrop-blur-md border border-primary-200/60 group-hover:border-primary-300/80 transition-all duration-500 shadow-xl group-hover:shadow-2xl overflow-hidden">
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 via-accent-400/20 to-secondary-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Glossy shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-all duration-1000"></div>

                  {/* Glowing border effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-500"></div>

                  {/* Logo Placeholder with Enhanced Styling */}
                  <div className="relative flex items-center justify-center w-10 h-10">
                    {/* Outer glow ring */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-accent-500 to-secondary-500 rounded-full opacity-20 group-hover:opacity-40 blur-md transition-opacity duration-500"></div>

                    {/* Main logo container */}
                    <div className="relative w-full h-full bg-gradient-to-br from-primary-600 via-accent-500 to-secondary-500 rounded-full border-2 border-white/30 shadow-lg overflow-hidden">
                      {/* Inner gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/20"></div>

                      {/* Logo content placeholder - will be replaced with image */}
                      <div className="relative w-full h-full flex items-center justify-center">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 32 32"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-white drop-shadow-lg"
                        >
                          {/* Enhanced logo design */}
                          <circle
                            cx="16"
                            cy="16"
                            r="14"
                            fill="url(#enhancedLogoGradient)"
                            stroke="rgba(255,255,255,0.3)"
                            strokeWidth="1"
                          />

                          {/* Stylized N with enhanced design */}
                          <path
                            d="M9 11 L9 21 L11 21 L11 15 L13.5 19 L13.5 21 L15.5 21 L15.5 11 L13.5 11 L13.5 17 L11 13 L11 11 Z"
                            fill="white"
                            className="drop-shadow-sm"
                          />

                          {/* Decorative elements */}
                          <circle cx="19" cy="13" r="1" fill="white" opacity="0.9" />
                          <circle cx="21" cy="17" r="0.8" fill="white" opacity="0.7" />
                          <circle cx="23" cy="21" r="0.6" fill="white" opacity="0.6" />

                          {/* Enhanced gradient definition */}
                          <defs>
                            <linearGradient id="enhancedLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                              <stop offset="50%" stopColor="rgba(255,255,255,0.7)" />
                              <stop offset="100%" stopColor="rgba(255,255,255,0.5)" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>

                      {/* Inner shine effect */}
                      <div className="absolute top-1 left-1 w-2 h-2 bg-white/40 rounded-full blur-sm"></div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Company Name */}
                <div className="hidden lg:block relative">
                  {/* Text glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-accent-500 to-secondary-500 opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-500"></div>

                  <span className="relative text-xl font-bold font-serif bg-gradient-to-r from-primary-800 via-accent-600 to-secondary-600 bg-clip-text text-transparent group-hover:from-primary-900 group-hover:via-accent-700 group-hover:to-secondary-700 transition-all duration-500 drop-shadow-sm">
                    Nirchal
                  </span>

                  {/* Animated underline */}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 via-accent-500 to-secondary-500 group-hover:w-full transition-all duration-500 rounded-full"></div>

                  {/* Subtle shine effect on text */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-all duration-1000 rounded-lg"></div>
                </div>

                {/* Floating sparkle effects */}
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-ping"></div>
                </div>
                <div className="absolute -bottom-1 -left-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-ping"></div>
                </div>
              </Link>
            </motion.div>

            {/* Navigation Menu - Desktop */}
            <div className="hidden lg:flex items-center gap-6 flex-shrink-0 mx-8">
              {/* Collections Link */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <Link
                  to="/products"
                  className="relative px-3 py-2 text-primary-700 hover:text-primary-800 font-semibold transition-all duration-300 group rounded-lg hover:bg-white/50 text-sm"
                >
                  Collections
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-300" />
                </Link>
              </motion.div>

              {/* MEN with dropdown */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onMouseEnter={() => setMenDropdownOpen(true)}
                  onMouseLeave={() => setMenDropdownOpen(false)}
                  className="relative flex items-center gap-2 text-primary-700 hover:text-primary-600 font-semibold transition-all duration-300 group text-sm"
                >
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face"
                    alt="Men's Fashion"
                    className="w-6 h-6 rounded-full object-cover border border-primary-200"
                  />
                  MEN
                  <motion.div
                    animate={{ rotate: menDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-300" />
                </motion.button>

                {/* MEN Dropdown Menu */}
                <AnimatePresence>
                  {menDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      onMouseEnter={() => setMenDropdownOpen(true)}
                      onMouseLeave={() => setMenDropdownOpen(false)}
                      className={`absolute top-full left-0 mt-2 w-64 lg:w-64 md:w-56 rounded-2xl shadow-2xl border overflow-hidden z-[1001] max-w-[calc(100vw-2rem)] ${
                        isScrolled
                          ? 'bg-neutral-100/95 backdrop-blur-lg border-neutral-200/50 shadow-xl'
                          : 'bg-neutral-200/95 backdrop-blur-md border-neutral-300/30 shadow-lg'
                      }`}
                    >
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-neutral-800 mb-3 text-center">
                          MEN
                        </h3>
                        <div className="space-y-2">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.03, duration: 0.2 }}
                          >
                            <Link
                              to="/products?category=Mens%20Kurta%20Sets"
                              onClick={() => setMenDropdownOpen(false)}
                              className="block p-3 rounded-xl bg-gradient-to-r from-primary-50/50 to-accent-50/50 hover:from-primary-100/80 hover:to-accent-100/80 text-neutral-700 hover:text-primary-700 font-medium transition-all duration-200 text-sm border border-white/30 hover:border-primary-300/50"
                            >
                              Mens Kurta Sets
                            </Link>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* WOMEN with dropdown */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onMouseEnter={() => setWomenDropdownOpen(true)}
                  onMouseLeave={() => setWomenDropdownOpen(false)}
                  className="relative flex items-center gap-2 text-primary-700 hover:text-primary-600 font-semibold transition-all duration-300 group text-sm"
                >
                  <img
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=48&h=48&fit=crop&crop=face"
                    alt="Women's Fashion"
                    className="w-6 h-6 rounded-full object-cover border border-primary-200"
                  />
                  WOMEN
                  <motion.div
                    animate={{ rotate: womenDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-300" />
                </motion.button>

                {/* WOMEN Dropdown Menu */}
                <AnimatePresence>
                  {womenDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      onMouseEnter={() => setWomenDropdownOpen(true)}
                      onMouseLeave={() => setWomenDropdownOpen(false)}
                      className={`absolute top-full left-0 mt-2 w-80 lg:w-80 md:w-72 rounded-2xl shadow-2xl border overflow-hidden z-[1001] max-w-[calc(100vw-2rem)] ${
                        isScrolled
                          ? 'bg-neutral-100/95 backdrop-blur-lg border-neutral-200/50 shadow-xl'
                          : 'bg-neutral-200/95 backdrop-blur-md border-neutral-300/30 shadow-lg'
                      }`}
                    >
                      <div className="p-4 lg:p-6">
                        <h3 className="text-lg font-bold text-neutral-800 mb-3 lg:mb-4 text-center">
                          WOMEN
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-3">
                          {[
                            'Women Accessories',
                            'Blouses',
                            'Dupatta',
                            'Dress Materials',
                            'Women Kurtis',
                            'Women Kurta Sets',
                            'Women Lehenga Choli',
                            'Women Skirts',
                            'Womens Sarees'
                          ].map((item, index) => (
                            <motion.div
                              key={item}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.03, duration: 0.2 }}
                            >
                              <Link
                                to={`/products?category=${encodeURIComponent(item)}`}
                                onClick={() => setWomenDropdownOpen(false)}
                                className="block p-3 rounded-xl bg-gradient-to-r from-primary-50/50 to-accent-50/50 hover:from-primary-100/80 hover:to-accent-100/80 text-neutral-700 hover:text-primary-700 font-medium transition-all duration-200 text-sm border border-white/30 hover:border-primary-300/50"
                              >
                                {item.replace('Women ', '').replace('Womens ', '')}
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* KIDS Link */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <Link
                  to="/products?category=Kidswear"
                  className="relative flex items-center gap-2 px-3 py-2 text-primary-700 hover:text-primary-800 font-semibold transition-all duration-300 group rounded-lg hover:bg-white/50 text-sm"
                >
                  <img
                    src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=48&h=48&fit=crop&crop=face"
                    alt="Kids Fashion"
                    className="w-6 h-6 rounded-full object-cover border border-primary-200"
                  />
                  KIDS
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-300" />
                </Link>
              </motion.div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-xl ml-12 mr-6 relative" onClick={(e) => e.stopPropagation()}>
              <motion.div
                initial={false}
                animate={searchOpen ? { scale: 1.02 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`relative rounded-full overflow-hidden transition-all duration-300 shadow-lg ${
                  searchOpen
                    ? 'bg-white/98 backdrop-blur-md shadow-2xl ring-4 ring-primary-200/30 border-2 border-primary-300/50'
                    : 'bg-white/90 backdrop-blur-md border-2 border-primary-200/40 hover:bg-white/95 hover:border-primary-300/60 hover:shadow-xl'
                }`}
              >
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-500 w-5 h-5 z-10" />
                  <input
                    type="text"
                    placeholder="Search for sarees, kurtas, lehengas..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => {
                      setSearchOpen(true);
                      setShowSuggestions(searchQuery.length > 0);
                    }}
                    className="w-full pl-12 pr-6 py-3 bg-transparent text-primary-900 placeholder-primary-400 outline-none font-medium text-sm rounded-full"
                  />
                  {/* Search button */}
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center hover:from-primary-600 hover:to-accent-600 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Search className="w-4 h-4 text-white" />
                  </button>
                </form>

                {/* Enhanced type-ahead suggestions */}
                <AnimatePresence>
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 mt-3 bg-neutral-100/95 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-neutral-200/50 overflow-hidden z-[1001]"
                    >
                      {filteredSuggestions.slice(0, 6).map((suggestion, index) => (
                        <motion.button
                          key={suggestion}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full px-5 py-4 text-left text-primary-700 hover:bg-primary-50/80 hover:text-primary-800 transition-all duration-200 flex items-center gap-4 first:rounded-t-3xl last:rounded-b-3xl border-b border-primary-100/30 last:border-b-0"
                        >
                          <div className="w-8 h-8 bg-primary-100/50 rounded-full flex items-center justify-center">
                            <Search className="w-4 h-4 text-primary-500" />
                          </div>
                          <span className="font-medium">{suggestion}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Mobile Search Bar - Collapsible */}
            <div className="lg:hidden relative" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                {!searchOpen ? (
                  // Collapsed state - just search icon
                  <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSearchOpen(true)}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50/50 backdrop-blur-sm border border-primary-200/30 hover:bg-primary-100/70 hover:border-primary-300/50 transition-all duration-300 shadow-sm hover:shadow-md"
                    aria-label="Open search"
                  >
                    <Search className="w-5 h-5 text-primary-600" />
                  </motion.button>
                ) : (
                  // Expanded state - full search input
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0, width: 40 }}
                    animate={{ scale: 1, opacity: 1, width: 'auto' }}
                    exit={{ scale: 0.8, opacity: 0, width: 40 }}
                    transition={{ duration: 0.2 }}
                    className="relative rounded-full overflow-hidden transition-all duration-300 bg-white/98 backdrop-blur-md shadow-2xl ring-4 ring-primary-200/30 border-2 border-primary-300/50"
                  >
                    <form onSubmit={handleSearch} className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-500 w-4 h-4 z-10" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowSuggestions(e.target.value.length > 0);
                        }}
                        onBlur={() => {
                          // Close search if input is empty
                          if (!searchQuery.trim()) {
                            setTimeout(() => {
                              setSearchOpen(false);
                              setShowSuggestions(false);
                            }, 150);
                          }
                        }}
                        className="w-64 pl-9 pr-12 py-2.5 bg-transparent text-primary-900 placeholder-primary-400 outline-none font-medium text-sm rounded-full"
                        autoFocus
                      />
                      {/* Close button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery('');
                          setShowSuggestions(false);
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-neutral-200 hover:bg-neutral-300 rounded-full flex items-center justify-center transition-colors duration-200"
                      >
                        <X className="w-3 h-3 text-neutral-600" />
                      </button>
                    </form>

                    {/* Mobile type-ahead suggestions */}
                    <AnimatePresence>
                      {showSuggestions && filteredSuggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-neutral-100/95 backdrop-blur-lg rounded-2xl shadow-2xl border-2 border-neutral-200/50 overflow-hidden z-[1001] max-h-64 overflow-y-auto"
                        >
                          {filteredSuggestions.slice(0, 4).map((suggestion, index) => (
                            <motion.button
                              key={suggestion}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.03 }}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full px-4 py-3 text-left text-primary-700 hover:bg-primary-50/80 hover:text-primary-800 transition-all duration-200 flex items-center gap-3 first:rounded-t-2xl last:rounded-b-2xl border-b border-primary-100/30 last:border-b-0"
                            >
                              <Search className="w-4 h-4 text-primary-500 flex-shrink-0" />
                              <span className="font-medium text-sm truncate">{suggestion}</span>
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 lg:gap-3 ml-2 lg:ml-6">
              {/* User Account/Login */}
              <motion.div className="relative" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!isAuthenticated) {
                      setAuthOpen(true);
                    }
                  }}
                  onMouseEnter={() => {
                    if (isAuthenticated) {
                      setUserDropdownOpen(true);
                    }
                  }}
                  onMouseLeave={() => {
                    if (isAuthenticated) {
                      setUserDropdownOpen(false);
                    }
                  }}
                  className="relative overflow-hidden px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">
                      {isAuthenticated ? (user?.name || 'Account') : 'Login'}
                    </span>
                    {isAuthenticated && (
                      <motion.div
                        animate={{ rotate: userDropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {isAuthenticated && userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      onMouseEnter={() => setUserDropdownOpen(true)}
                      onMouseLeave={() => setUserDropdownOpen(false)}
                      className={`absolute top-full right-0 mt-2 w-48 rounded-2xl shadow-2xl border overflow-hidden z-[1001] ${
                        isScrolled
                          ? 'bg-neutral-100/95 backdrop-blur-lg border-neutral-200/50 shadow-xl'
                          : 'bg-neutral-200/95 backdrop-blur-md border-neutral-300/30 shadow-lg'
                      }`}
                    >
                      <div className="p-2">
                        <motion.button
                          whileHover={{ backgroundColor: 'rgba(var(--color-primary-50), 0.8)' }}
                          onClick={() => {
                            navigate('/myaccount');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left text-neutral-700 hover:text-primary-700 rounded-xl transition-colors duration-200 flex items-center gap-3"
                        >
                          <User className="w-4 h-4 text-neutral-400" />
                          <span className="font-medium">My Account</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                          onClick={async () => {
                            await signOut();
                            setUserDropdownOpen(false);
                            navigate('/');
                          }}
                          className="w-full px-4 py-3 text-left text-red-600 hover:text-red-700 rounded-xl transition-colors duration-200 flex items-center gap-3"
                        >
                          <X className="w-4 h-4" />
                          <span className="font-medium">Sign Out</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Wishlist Icon */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Link
                  to="/products?filter=wishlist"
                  className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary-50/50 backdrop-blur-sm border border-primary-200/30 hover:bg-primary-100/70 hover:border-primary-300/50 transition-all duration-300 shadow-sm hover:shadow-md group"
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5 text-primary-600 group-hover:text-primary-700 transition-colors duration-300" />
                </Link>
              </motion.div>

              {/* Cart Icon */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Link
                  to="/cart"
                  className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary-50/50 backdrop-blur-sm border border-primary-200/30 hover:bg-primary-100/70 hover:border-primary-300/50 transition-all duration-300 shadow-sm hover:shadow-md group"
                  aria-label="Cart"
                >
                  <ShoppingBag className="w-5 h-5 text-primary-600 group-hover:text-primary-700 transition-colors duration-300" />
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-accent-500 to-secondary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-2 text-primary-600 hover:text-primary-700 transition-colors duration-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rolling Promotional Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-accent-500 to-secondary-500">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-spin" style={{animationDuration: '20s'}}></div>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 via-accent-400/20 to-secondary-400/20 blur-xl"></div>

        <div className="relative container mx-auto px-6 py-2">
          <div className="flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBannerIndex}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.9 }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 100
                }}
                className="flex items-center gap-4 text-white cursor-pointer"
                onClick={() => navigate('/products')}
              >
                {/* Icon with glow */}
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-white/30 rounded-full blur-md"></div>
                  <div className="relative p-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                    {React.createElement(promotionalMessages[currentBannerIndex].icon, {
                      className: "w-5 h-5 text-white drop-shadow-lg"
                    })}
                  </div>
                </motion.div>

                {/* Main text */}
                <div className="flex items-center gap-2">
                  <motion.span
                    className="font-bold text-lg md:text-xl tracking-wide drop-shadow-lg"
                    animate={{
                      textShadow: [
                        "0 0 10px rgba(255,255,255,0.5)",
                        "0 0 20px rgba(255,255,255,0.8)",
                        "0 0 10px rgba(255,255,255,0.5)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {promotionalMessages[currentBannerIndex].text}
                  </motion.span>
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation(); // Prevent triggering the parent banner click
                    navigate('/products');
                  }}
                  className="hidden sm:flex items-center gap-2 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                >
                  <span className="font-semibold text-white drop-shadow-lg">Shop Now</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.div>
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom border gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/95 backdrop-blur-lg border-t border-primary-100/30 shadow-lg max-h-[calc(100vh-120px)] overflow-y-auto"
          >
            <nav className="container mx-auto px-6 py-6 pb-8 space-y-2">
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 py-4 px-4 text-primary-700 hover:text-primary-800 font-semibold rounded-xl hover:bg-primary-50/50 transition-all duration-300 border border-transparent hover:border-primary-200/30"
              >
                <span>Collections</span>
              </Link>

              {/* MEN Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 py-3 px-4 text-primary-700 font-semibold">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=56&h=56&fit=crop&crop=face"
                    alt="Men's Fashion"
                    className="w-7 h-7 rounded-full object-cover border border-primary-200"
                  />
                  <span>MEN</span>
                </div>
                <div className="ml-6 space-y-1">
                  <Link
                    to="/products?category=Mens%20Kurta%20Sets"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-2.5 px-4 text-primary-600 hover:text-primary-800 text-sm rounded-lg hover:bg-primary-50/50 transition-all duration-300 border border-transparent hover:border-primary-200/30"
                  >
                    <span>Mens Kurta Sets</span>
                  </Link>
                </div>
              </div>

              {/* WOMEN Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 py-3 px-4 text-primary-700 font-semibold">
                  <img
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=56&h=56&fit=crop&crop=face"
                    alt="Women's Fashion"
                    className="w-7 h-7 rounded-full object-cover border border-primary-200"
                  />
                  <span>WOMEN</span>
                </div>
                <div className="ml-6 grid grid-cols-1 gap-1">
                  {[
                    'Women Accessories',
                    'Blouses',
                    'Dupatta',
                    'Dress Materials',
                    'Women Kurtis',
                    'Women Kurta Sets',
                    'Women Lehenga Choli',
                    'Women Skirts',
                    'Womens Sarees'
                  ].map((item) => (
                    <Link
                      key={item}
                      to={`/products?category=${encodeURIComponent(item)}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-2.5 px-4 text-primary-600 hover:text-primary-800 text-sm rounded-lg hover:bg-primary-50/50 transition-all duration-300 border border-transparent hover:border-primary-200/30"
                    >
                      <span>{item.replace('Women ', '').replace('Womens ', '')}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* KIDS Section */}
              <Link
                to="/products?category=Kidswear"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 py-4 px-4 text-primary-700 hover:text-primary-800 font-semibold rounded-xl hover:bg-primary-50/50 transition-all duration-300 border border-transparent hover:border-primary-200/30"
              >
                <img
                  src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=56&h=56&fit=crop&crop=face"
                  alt="Kids Fashion"
                  className="w-7 h-7 rounded-full object-cover border border-primary-200"
                />
                <span>KIDS</span>
              </Link>

              {isAuthenticated ? (
                <div className="pt-6 border-t border-primary-100/30 space-y-3">
                  <p className="text-sm text-primary-600 px-4 font-medium">Signed in as {user?.name}</p>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        navigate('/myaccount');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full py-3 px-4 text-primary-700 hover:text-primary-800 rounded-lg hover:bg-primary-50/50 transition-all duration-300 border border-transparent hover:border-primary-200/30"
                    >
                      <User className="w-4 h-4" />
                      <span className="font-medium">My Account</span>
                    </button>
                    <button
                      onClick={async () => {
                        await signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full py-3 px-4 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50/50 transition-all duration-300 border border-transparent hover:border-red-200/30"
                    >
                      <X className="w-4 h-4" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-6 border-t border-primary-100/30">
                  <button
                    onClick={() => {
                      setAuthOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <User className="w-4 h-4" />
                    <span>Login / Sign Up</span>
                  </button>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Auth Modal */}
      <CustomerAuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </motion.header>
  );
};

export default Header;
