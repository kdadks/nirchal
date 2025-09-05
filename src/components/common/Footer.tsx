import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Mail, 
  Heart,
  Shield,
  Truck,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../config/supabase';

interface SocialMediaLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

const Footer: React.FC = () => {
  const [socialLinks, setSocialLinks] = useState<SocialMediaLinks>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        // Fetch social media links
        const { data: settings, error: settingsError } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', [
            'social_instagram_url',
            'social_facebook_url', 
            'social_twitter_url',
            'social_youtube_url'
          ]);

        // Fetch active categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, slug, is_active')
          .eq('is_active', true)
          .order('name');

        if (settingsError) {
          console.error('Error fetching social links:', settingsError);
          // Use fallback URLs if database fetch fails
          setSocialLinks({
            instagram: 'https://instagram.com/nirchal',
            facebook: 'https://facebook.com/nirchal',
            twitter: 'https://twitter.com/nirchal',
            youtube: 'https://youtube.com/nirchal'
          });
        } else {
          const links: SocialMediaLinks = {};
          settings?.forEach(setting => {
            let url = setting.value?.trim();
            if (url) {
              // Ensure URLs start with https:// if they don't have protocol
              if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
              }
              
              switch (setting.key) {
                case 'social_instagram_url':
                  links.instagram = url;
                  break;
                case 'social_facebook_url':
                  links.facebook = url;
                  break;
                case 'social_twitter_url':
                  links.twitter = url;
                  break;
                case 'social_youtube_url':
                  links.youtube = url;
                  break;
              }
            }
          });
          setSocialLinks(links);
        }

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
          // Use fallback categories
          setCategories([
            { id: 1, name: 'Sarees', slug: 'sarees', is_active: true },
            { id: 2, name: 'Lehengas', slug: 'lehengas', is_active: true },
            { id: 3, name: 'Gowns', slug: 'gowns', is_active: true },
            { id: 4, name: 'Kurtis & Suits', slug: 'kurtis', is_active: true },
            { id: 5, name: 'Accessories', slug: 'accessories', is_active: true }
          ]);
        } else {
          setCategories(categoriesData || []);
        }
      } catch (error) {
        console.error('Error in fetchFooterData:', error);
        // Use fallback data
        setSocialLinks({
          instagram: 'https://instagram.com/nirchal',
          facebook: 'https://facebook.com/nirchal',
          twitter: 'https://twitter.com/nirchal',
          youtube: 'https://youtube.com/nirchal'
        });
        setCategories([
          { id: 1, name: 'Sarees', slug: 'sarees', is_active: true },
          { id: 2, name: 'Lehengas', slug: 'lehengas', is_active: true },
          { id: 3, name: 'Gowns', slug: 'gowns', is_active: true },
          { id: 4, name: 'Kurtis & Suits', slug: 'kurtis', is_active: true },
          { id: 5, name: 'Accessories', slug: 'accessories', is_active: true }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

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
                <Mail size={16} className="text-accent-400" />
                <span className="text-gray-300">support@nirchal.com</span>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <p className="text-sm text-gray-400 mb-3">Follow Us</p>
              {loading ? (
                <div className="flex space-x-4">
                  <div className="bg-gray-800 p-3 rounded-full animate-pulse w-12 h-12"></div>
                  <div className="bg-gray-800 p-3 rounded-full animate-pulse w-12 h-12"></div>
                  <div className="bg-gray-800 p-3 rounded-full animate-pulse w-12 h-12"></div>
                  <div className="bg-gray-800 p-3 rounded-full animate-pulse w-12 h-12"></div>
                </div>
              ) : (
                <div className="flex space-x-4">
                  {socialLinks.instagram && (
                    <a 
                      href={socialLinks.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gray-800 p-3 rounded-full hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-110 retina-button hw-accelerate"
                      style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
                    >
                      <Instagram size={20} className="lucide" style={{ shapeRendering: 'geometricPrecision' }} />
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a 
                      href={socialLinks.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gray-800 p-3 rounded-full hover:bg-blue-600 transition-all duration-300 transform hover:scale-110 retina-button hw-accelerate"
                      style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
                    >
                      <Facebook size={20} className="lucide" style={{ shapeRendering: 'geometricPrecision' }} />
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a 
                      href={socialLinks.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gray-800 p-3 rounded-full hover:bg-blue-400 transition-all duration-300 transform hover:scale-110 retina-button hw-accelerate"
                      style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
                    >
                      <Twitter size={20} className="lucide" style={{ shapeRendering: 'geometricPrecision' }} />
                    </a>
                  )}
                  {socialLinks.youtube && (
                    <a 
                      href={socialLinks.youtube} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gray-800 p-3 rounded-full hover:bg-red-600 transition-all duration-300 transform hover:scale-110 retina-button hw-accelerate"
                      style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
                    >
                      <Youtube size={20} className="lucide" style={{ shapeRendering: 'geometricPrecision' }} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-accent-400">Shop</h3>
            <ul className="space-y-3">
              {categories.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <Link 
                    to={`/category/${category.slug}`} 
                    className="text-gray-300 hover:text-accent-400 transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              {/* Add New Arrivals as a static link */}
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
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3 text-gray-300 hw-accelerate" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-full retina-button">
                <Truck size={16} className="text-white lucide" style={{ shapeRendering: 'geometricPrecision' }} />
              </div>
              <div>
                <p className="text-sm font-semibold">Free Shipping</p>
                <p className="text-xs">On orders ₹2,999+</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-300 hw-accelerate" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-full retina-button">
                <Shield size={16} className="text-white lucide" style={{ shapeRendering: 'geometricPrecision' }} />
              </div>
              <div>
                <p className="text-sm font-semibold">Secure Payment</p>
                <p className="text-xs">100% Protected</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-300 hw-accelerate" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-full retina-button">
                <RefreshCw size={16} className="text-white lucide" style={{ shapeRendering: 'geometricPrecision' }} />
              </div>
              <div>
                <p className="text-sm font-semibold">Easy Returns</p>
                <p className="text-xs">2-day policy</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-300 hw-accelerate" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-2 rounded-full retina-button">
                <Heart size={16} className="text-white lucide" style={{ shapeRendering: 'geometricPrecision' }} />
              </div>
              <div>
                <p className="text-sm font-semibold">Made with Love</p>
                <p className="text-xs">Crafted in India</p>
              </div>
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
              <div className="flex space-x-2 items-center">
                {/* VISA Logo */}
                <div className="bg-white rounded border border-gray-200 p-2 min-w-[50px] h-8 flex items-center justify-center">
                  <img 
                    src="/images/payment/visa.png" 
                    alt="Visa" 
                    className="max-h-6 max-w-[40px] object-contain"
                    onError={(e) => {
                      // Show text fallback if image doesn't exist
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<span class="text-blue-600 font-bold text-xs">VISA</span>';
                      }
                    }}
                  />
                </div>
                {/* Mastercard Logo */}
                <div className="bg-white rounded border border-gray-200 p-2 min-w-[50px] h-8 flex items-center justify-center">
                  <img 
                    src="/images/payment/mastercard.png" 
                    alt="Mastercard" 
                    className="max-h-6 max-w-[40px] object-contain"
                    onError={(e) => {
                      // Show text fallback if image doesn't exist
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<span class="text-red-600 font-bold text-xs">MC</span>';
                      }
                    }}
                  />
                </div>
                {/* UPI Logo */}
                <div className="bg-white rounded border border-gray-200 p-2 min-w-[50px] h-8 flex items-center justify-center">
                  <img 
                    src="/images/payment/upi.png" 
                    alt="UPI" 
                    className="max-h-6 max-w-[40px] object-contain"
                    onError={(e) => {
                      // Show text fallback if image doesn't exist
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<span class="text-green-600 font-bold text-xs">UPI</span>';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
