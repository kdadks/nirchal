import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Star, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHeroSlides } from '../../hooks/useHeroSlides';

const HeroCarousel: React.FC = () => {
  const { heroSlides, loading, error } = useHeroSlides();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Preload first hero image for better LCP
  useEffect(() => {
    if (heroSlides.length > 0 && heroSlides[0].image_url) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = heroSlides[0].image_url;
      link.fetchPriority = 'high';
      document.head.appendChild(link);

      // Preload image in JavaScript as well
      const img = new Image();
      img.src = heroSlides[0].image_url;
      
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [heroSlides]);

  const nextSlide = useCallback(() => {
    if (isTransitioning || heroSlides.length === 0) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning, heroSlides.length]);

  const prevSlide = () => {
    if (isTransitioning || heroSlides.length === 0) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide || heroSlides.length === 0) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  useEffect(() => {
    if (isPaused || heroSlides.length === 0) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [nextSlide, isPaused, heroSlides.length]);

  // Reset current slide if it's out of bounds
  useEffect(() => {
    if (heroSlides.length > 0 && currentSlide >= heroSlides.length) {
      setCurrentSlide(0);
    }
  }, [heroSlides.length, currentSlide]);

  if (loading) {
    return (
      <section className="relative h-[400px] max-h-[400px] overflow-hidden bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </section>
    );
  }

  if (error || heroSlides.length === 0) {
    return (
      <section className="relative h-[400px] max-h-[400px] overflow-hidden bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="relative z-20 h-full flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl">
              <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Welcome to Nirchal
              </h1>
              <p className="text-lg sm:text-xl text-neutral-200 mb-8 font-light leading-relaxed max-w-2xl">
                Discover exquisite traditional wear with modern elegance
              </p>
              <Link
                to="/products"
                className="group inline-flex items-center px-6 py-3 lg:px-8 lg:py-4 bg-white text-primary-600 font-semibold rounded-2xl shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:-translate-y-1 hover:scale-105"
              >
                <span>Shop Now</span>
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="relative h-[400px] max-h-[400px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,69,19,0.1)_0%,transparent_70%)]"></div>
      </div>

      {/* Slides Container */}
      <div className="relative h-full">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              currentSlide === index 
                ? 'opacity-100 scale-100 z-10' 
                : 'opacity-0 scale-105 z-0'
            }`}
          >
            {/* Background Image with Parallax Effect - Using IMG for better LCP */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={slide.image_url}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 ease-out"
                style={{
                  transform: currentSlide === index ? 'scale(1.05)' : 'scale(1.1)',
                }}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding={index === 0 ? 'sync' : 'async'}
              />
              {/* Elegant Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-20 h-full flex items-center">
              <div className="container mx-auto px-6">
                <div className="max-w-3xl">
                  {/* Decorative Element */}
                  <div className={`flex items-center space-x-2 mb-6 transition-all duration-1000 delay-300 ${
                    currentSlide === index ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                  }`}>
                    <Sparkles className="w-5 h-5 text-accent-400" />
                    <span className="text-accent-200 font-accent font-medium text-sm uppercase tracking-widest">
                      Premium Collection
                    </span>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-accent-400 to-transparent"></div>
                  </div>

                  {/* Main Heading */}
                  <h1 className={`font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight transition-all duration-1000 delay-500 ${
                    currentSlide === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}>
                    <span className="block bg-gradient-to-r from-white via-accent-200 to-white bg-clip-text text-transparent">
                      {slide.title}
                    </span>
                  </h1>

                  {/* Subtitle */}
                  {slide.subtitle && (
                    <p className={`text-lg sm:text-xl md:text-2xl text-neutral-200 mb-6 md:mb-8 font-light leading-relaxed max-w-2xl transition-all duration-1000 delay-700 ${
                      currentSlide === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}>
                      {slide.subtitle}
                    </p>
                  )}

                  {/* Rating */}
                  <div className={`flex items-center space-x-2 mb-6 md:mb-8 transition-all duration-1000 delay-900 ${
                    currentSlide === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className="fill-accent-400 text-accent-400" />
                      ))}
                    </div>
                    <span className="text-neutral-300 text-sm font-medium">
                      Rated 4.9/5 by 10,000+ customers
                    </span>
                  </div>

                  {/* CTA Buttons */}
                  <div className={`flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 transition-all duration-1000 delay-1100 ${
                    currentSlide === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}>
                    <Link
                      to={slide.cta_link}
                      className="group inline-flex items-center px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-primary-600 via-accent-500 to-secondary-500 text-white font-accent font-semibold rounded-2xl shadow-2xl hover:shadow-accent-500/25 transition-all duration-300 hover:-translate-y-1 hover:scale-105"
                    >
                      <span>{slide.cta_text}</span>
                      <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>

                    <button className="group inline-flex items-center text-white hover:text-accent-200 font-accent font-medium transition-all duration-300">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mr-3 group-hover:bg-white/20 transition-all duration-300">
                        <Play size={18} className="ml-0.5" />
                      </div>
                      Watch Collection Video
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className={`absolute top-20 right-20 w-20 h-20 bg-gradient-to-br from-accent-400/20 to-primary-500/20 rounded-full backdrop-blur-sm animate-float transition-opacity duration-1000 ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`} style={{ animationDelay: '0s' }}></div>
            <div className={`absolute bottom-32 right-32 w-12 h-12 bg-gradient-to-br from-secondary-400/20 to-accent-500/20 rounded-full backdrop-blur-sm animate-float transition-opacity duration-1000 ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`} style={{ animationDelay: '1s' }}></div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {heroSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 lg:w-14 lg:h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group retina-button hw-accelerate"
            style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300 lucide" style={{ shapeRendering: 'geometricPrecision' }} />
          </button>

          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 lg:w-14 lg:h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group retina-button hw-accelerate"
            style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
          >
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform duration-300 lucide" style={{ shapeRendering: 'geometricPrecision' }} />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {heroSlides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
          <div className="flex space-x-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? 'bg-white scale-125 shadow-lg'
                    : 'bg-white/40 hover:bg-white/60 hover:scale-110'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Slide Counter */}
      {heroSlides.length > 1 && (
        <div className="absolute bottom-8 right-8 z-30 bg-black/20 backdrop-blur-md rounded-full px-4 py-2 text-white font-accent font-medium">
          <span className="text-accent-200">{String(currentSlide + 1).padStart(2, '0')}</span>
          <span className="text-white/60 mx-2">/</span>
          <span className="text-white/80">{String(heroSlides.length).padStart(2, '0')}</span>
        </div>
      )}

      {/* Progress Bar */}
      {heroSlides.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-30 h-1 bg-white/10">
          <div 
            className="h-full bg-gradient-to-r from-accent-400 to-primary-500 transition-all duration-300 ease-linear"
            style={{ width: `${((currentSlide + 1) / heroSlides.length) * 100}%` }}
          ></div>
        </div>
      )}
    </section>
  );
};

export default HeroCarousel;
