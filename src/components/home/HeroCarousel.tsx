/* global setTimeout */
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Star, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { heroSlides } from '../../data/mockData';

const HeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning]);

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  return (
    <section 
      className="relative h-screen overflow-hidden"
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
            {/* Background Image with Parallax Effect */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transform transition-transform duration-700 ease-out"
              style={{
                backgroundImage: `url(${slide.image})`,
                transform: currentSlide === index ? 'scale(1.05)' : 'scale(1.1)',
              }}
            >
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
                  <h1 className={`font-display text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 md:mb-6 leading-tight transition-all duration-1000 delay-500 ${
                    currentSlide === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}>
                    <span className="block bg-gradient-to-r from-white via-accent-200 to-white bg-clip-text text-transparent">
                      {slide.title}
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className={`text-lg sm:text-xl md:text-2xl text-neutral-200 mb-6 md:mb-8 font-light leading-relaxed max-w-2xl transition-all duration-1000 delay-700 ${
                    currentSlide === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}>
                    {slide.subtitle}
                  </p>

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
                      to={slide.link}
                      className="group inline-flex items-center px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-primary-600 via-accent-500 to-secondary-500 text-white font-accent font-semibold rounded-2xl shadow-2xl hover:shadow-accent-500/25 transition-all duration-300 hover:-translate-y-1 hover:scale-105"
                    >
                      <span>{slide.cta}</span>
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

      {/* Slide Indicators */}
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

      {/* Slide Counter */}
      <div className="absolute bottom-8 right-8 z-30 bg-black/20 backdrop-blur-md rounded-full px-4 py-2 text-white font-accent font-medium">
        <span className="text-accent-200">{String(currentSlide + 1).padStart(2, '0')}</span>
        <span className="text-white/60 mx-2">/</span>
        <span className="text-white/80">{String(heroSlides.length).padStart(2, '0')}</span>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 h-1 bg-white/10">
        <div 
          className="h-full bg-gradient-to-r from-accent-400 to-primary-500 transition-all duration-300 ease-linear"
          style={{ width: `${((currentSlide + 1) / heroSlides.length) * 100}%` }}
        ></div>
      </div>
    </section>
  );
};

export default HeroCarousel;
