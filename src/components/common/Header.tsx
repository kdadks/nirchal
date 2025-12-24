import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Search, Menu, X, User, ChevronDown, Sparkles, Gift, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import CustomerAuthModal from '../auth/CustomerAuthModal';
import { useProductSearch } from '../../hooks/useProductSearch';
import { MENU_CATEGORIES } from '../../constants/categories';
import CurrencySwitcher from './CurrencySwitcher';

const promotionalMessages = [
  //{
  //  text: "🎉 FLASH SALE: Up to 70% OFF on Festive Collection!",
  //  icon: Sparkles,
  //  gradient: "from-yellow-400 via-orange-500 to-red-500"
  //},
  {
    text: "🚚 FREE SHIPPING on All Orders Across India 🇮🇳",
    icon: Gift,
    gradient: "from-green-400 via-blue-500 to-purple-500"
  },
  {
    text: "⭐ NEW ARRIVALS: Premium Silk Sarees Collection",
    icon: Star,
    gradient: "from-pink-400 via-purple-500 to-indigo-500"
  },
  //{
  //  text: "⚡ EXPRESS DELIVERY within 24 hours",
  //  icon: Zap,
  //  gradient: "from-cyan-400 via-blue-500 to-indigo-500"
  //},
  {
    text: "💎 ARTIFICIAL JEWELRY: Exclusive Collection",
    icon: Sparkles,
    gradient: "from-purple-400 via-pink-500 to-red-500"
  }
];

const Header: React.FC = () => {
  const { totalItems } = useCart();
  const { customer, signOut } = useCustomerAuth();
  const isAuthenticated = !!customer;
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

  // Product search hook for typeahead (increased to 12 products)
  const { products: searchProducts } = useProductSearch(searchQuery, 12);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // If there are search results, go to the first product
      if (searchProducts.length > 0) {
        const firstProduct = searchProducts[0];
        const productSlug = firstProduct.slug || firstProduct.id;
        navigate(`/products/${productSlug}`);
      } else {
        // Fallback to products listing page
        navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      }
      setSearchOpen(false);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleProductClick = (product: { slug?: string; id: string }) => {
    const productSlug = product.slug || product.id;
    navigate(`/products/${productSlug}`);
    setSearchOpen(false);
    setSearchQuery('');
    setShowSuggestions(false);
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
                {/* Clean Logo Container */}
                <div className="relative">
                  {/* Logo - Clean and Large */}
                  <div className="relative flex items-center justify-center w-16 h-16">
                    {/* Logo image */}
                    <img 
                      src="/Nirchal_Logo.png" 
                      alt="Nirchal Logo" 
                      className="w-full h-full object-contain"
                      style={{
                        imageRendering: 'crisp-edges',
                        WebkitBackfaceVisibility: 'hidden',
                        backfaceVisibility: 'hidden',
                        transform: 'translateZ(0)'
                      }}
                    />
                    {/* Christmas Santa Cap - positioned at top left corner */}
                    {(() => {
                      const now = new Date();
                      const month = now.getMonth();
                      const day = now.getDate();
                      const isChristmasSeason = (month === 11 && day >= 15) || (month === 0 && day <= 10);
                      
                      if (isChristmasSeason) {
                        return (
                          <div className="absolute -top-3 -left-3 pointer-events-none z-10" style={{ width: '40px', height: '40px' }}>
                            <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', transform: 'rotate(-30deg)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                              {/* Main red hat cone */}
                              <path d="M 35 85 L 60 15 L 85 85 Z" fill="#DC2626" stroke="#B91C1C" strokeWidth="2"/>
                              {/* Darker red for depth on left side */}
                              <path d="M 35 85 L 60 15 L 60 85 Z" fill="#B91C1C" opacity="0.3"/>
                              {/* White fuzzy trim band at bottom */}
                              <rect x="30" y="80" width="60" height="10" rx="5" fill="#FFFFFF"/>
                              <ellipse cx="60" cy="85" rx="32" ry="8" fill="#F3F4F6"/>
                              {/* White fluffy pom-pom at the tip */}
                              <circle cx="60" cy="15" r="10" fill="#FFFFFF"/>
                              <circle cx="63" cy="13" r="7" fill="#F9FAFB" opacity="0.8"/>
                            </svg>
                          </div>
                        );
                      }
                      return null;
                    })()}
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
                  className="relative flex items-center gap-2 px-3 py-2 text-primary-700 hover:text-primary-800 font-semibold transition-all duration-300 group rounded-lg hover:bg-white/50 text-sm"
                >
                  <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=48&h=48&fit=crop&crop=center"
                    alt="Collections"
                    className="w-6 h-6 rounded-full object-cover border border-primary-200"
                  />
                  COLLECTIONS
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
                              to={`/category/${MENU_CATEGORIES.men[0].slug}`}
                              onClick={() => setMenDropdownOpen(false)}
                              className="block p-3 rounded-xl bg-gradient-to-r from-primary-50/50 to-accent-50/50 hover:from-primary-100/80 hover:to-accent-100/80 text-neutral-700 hover:text-primary-700 font-medium transition-all duration-200 text-sm border border-white/30 hover:border-primary-300/50"
                            >
                              {MENU_CATEGORIES.men[0].displayName}
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
                          {MENU_CATEGORIES.women.map((item, index) => (
                            <motion.div
                              key={item.slug}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.03, duration: 0.2 }}
                            >
                              <Link
                                to={`/category/${item.slug}`}
                                onClick={() => setWomenDropdownOpen(false)}
                                className="block p-3 rounded-xl bg-gradient-to-r from-primary-50/50 to-accent-50/50 hover:from-primary-100/80 hover:to-accent-100/80 text-neutral-700 hover:text-primary-700 font-medium transition-all duration-200 text-sm border border-white/30 hover:border-primary-300/50"
                              >
                                {item.displayName}
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
                  to={`/category/${MENU_CATEGORIES.kids[0].slug}`}
                  className="relative flex items-center gap-2 px-3 py-2 text-primary-700 hover:text-primary-800 font-semibold transition-all duration-300 group rounded-lg hover:bg-white/50 text-sm"
                >
                  <img
                    src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=48&h=48&fit=crop&crop=face"
                    alt="Kids Fashion"
                    className="w-6 h-6 rounded-full object-cover border border-primary-200"
                  />
                  {MENU_CATEGORIES.kids[0].displayName.toUpperCase()}
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-300" />
                </Link>
              </motion.div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-xl ml-12 mr-6 relative z-[10000]" onClick={(e) => e.stopPropagation()}>
              <motion.div
                initial={false}
                animate={searchOpen ? { scale: 1.02 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`relative rounded-full overflow-visible transition-all duration-300 shadow-lg z-[10000] ${
                  searchOpen
                    ? 'bg-white/98 backdrop-blur-md shadow-2xl ring-4 ring-primary-200/30 border-2 border-primary-300/50'
                    : 'bg-white/90 backdrop-blur-md border-2 border-primary-200/40 hover:bg-white/95 hover:border-primary-300/60 hover:shadow-xl'
                }`}
                style={{ zIndex: 10000 }}
              >
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-500 w-5 h-5 z-10" />
                  <input
                    type="text"
                    placeholder="Search for sarees, kurtas, lehengas..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true); // Always show when typing
                    }}
                    onFocus={() => {
                      setSearchOpen(true);
                      setShowSuggestions(true); // Always show on focus if there's content
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

                {/* Enhanced product search suggestions */}
                <AnimatePresence>
                  {showSuggestions && searchProducts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 mt-3 bg-white backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 z-[10002] min-w-[500px] max-h-[400px] overflow-hidden"
                      style={{ zIndex: 10002 }}
                    >
                      {/* Header with result count */}
                      {searchProducts.length > 8 && (
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs text-gray-600">
                          Showing {Math.min(searchProducts.length, 10)} of {searchProducts.length} results
                        </div>
                      )}
                      
                      {/* Scrollable results container */}
                      <div className="overflow-y-auto max-h-[360px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {searchProducts.slice(0, 10).map((product, index) => (
                          <motion.button
                            key={product.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleProductClick(product)}
                            onMouseDown={(e) => e.preventDefault()} // Prevent input blur when clicking
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-all duration-200 flex items-center gap-4 border-b border-gray-100 last:border-b-0"
                        >
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Search className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate text-sm leading-5">{product.name}</div>
                            {product.matchType === 'description' && product.matchContext && (
                              <div className="text-xs text-blue-600 mt-1 italic truncate">
                                "{product.matchContext}"
                              </div>
                            )}
                            <div className="text-sm text-gray-600 mt-1">
                              {product.sale_price > 0 ? `₹${product.sale_price.toLocaleString()}` : 'Price not available'}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                      </div>
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
                          setShowSuggestions(true);
                        }}
                        onBlur={(e) => {
                          // Capture references before timeout to avoid null currentTarget
                          const currentElement = e.currentTarget;
                          const relatedTarget = e.relatedTarget;
                          
                          // Delay closing to allow clicking on suggestions
                          setTimeout(() => {
                            // Check if the related target is within the suggestions dropdown
                            const suggestionsContainer = currentElement?.closest('.relative')?.querySelector('[data-suggestions]');
                            if (!suggestionsContainer?.contains(relatedTarget as Node)) {
                              if (!searchQuery.trim()) {
                                setSearchOpen(false);
                              }
                              setShowSuggestions(false);
                            }
                          }, 200);
                        }}
                        onFocus={() => {
                          if (searchQuery.trim()) {
                            setShowSuggestions(true);
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
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile product search suggestions - positioned outside collapsed/expanded container */}
              <AnimatePresence>
                {showSuggestions && searchProducts.length > 0 && searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-[10002] max-h-64 overflow-y-auto"
                    style={{ zIndex: 10002 }}
                    data-suggestions="true"
                  >
                    {searchProducts.slice(0, 4).map((product, index) => (
                      <motion.button
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleProductClick(product)}
                        onMouseDown={(e) => e.preventDefault()} // Prevent input blur when clicking
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                      >
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Search className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate text-sm">{product.name}</div>
                          <div className="text-sm text-gray-600">
                            {product.sale_price > 0 ? `₹${product.sale_price.toLocaleString()}` : 'Price not available'}
                          </div>
                        </div>
                      </motion.button>
                    ))}
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
                      {isAuthenticated ? (customer?.first_name ? `${customer.first_name} ${customer.last_name}` : 'Account') : 'Login'}
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
                          whileHover={{ backgroundColor: 'rgba(253, 248, 246, 0.8)' }}
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

              {/* Currency Switcher */}
              <div className="hidden md:block">
                <CurrencySwitcher />
              </div>

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
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=56&h=56&fit=crop&crop=center"
                  alt="Collections"
                  className="w-7 h-7 rounded-full object-cover border border-primary-200"
                />
                <span>COLLECTIONS</span>
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
                    to={`/category/${MENU_CATEGORIES.men[0].slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-2.5 px-4 text-primary-600 hover:text-primary-800 text-sm rounded-lg hover:bg-primary-50/50 transition-all duration-300 border border-transparent hover:border-primary-200/30"
                  >
                    <span>{MENU_CATEGORIES.men[0].displayName}</span>
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
                  {MENU_CATEGORIES.women.map((item) => (
                    <Link
                      key={item.slug}
                      to={`/category/${item.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-2.5 px-4 text-primary-600 hover:text-primary-800 text-sm rounded-lg hover:bg-primary-50/50 transition-all duration-300 border border-transparent hover:border-primary-200/30"
                    >
                      <span>{item.displayName}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* KIDS Section */}
              <Link
                to={`/category/${MENU_CATEGORIES.kids[0].slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 py-4 px-4 text-primary-700 hover:text-primary-800 font-semibold rounded-xl hover:bg-primary-50/50 transition-all duration-300 border border-transparent hover:border-primary-200/30"
              >
                <img
                  src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=56&h=56&fit=crop&crop=face"
                  alt="Kids Fashion"
                  className="w-7 h-7 rounded-full object-cover border border-primary-200"
                />
                <span>{MENU_CATEGORIES.kids[0].displayName.toUpperCase()}</span>
              </Link>

              {isAuthenticated ? (
                <div className="pt-6 border-t border-primary-100/30 space-y-3">
                  <p className="text-sm text-primary-600 px-4 font-medium">Signed in as {customer?.first_name ? `${customer.first_name} ${customer.last_name}` : customer?.email}</p>
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
