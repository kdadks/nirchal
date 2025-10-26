import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getActiveFeaturedSections } from '../../services/featuredSectionService';
import ProductCard from '../product/ProductCard';
import type { FeaturedSectionWithProducts } from '../../types/featuredSection.types';

export const DynamicFeaturedSections: React.FC = () => {
  const [sections, setSections] = useState<FeaturedSectionWithProducts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    setLoading(true);
    const data = await getActiveFeaturedSections();
    setSections(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-8"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j}>
                      <div className="bg-gray-200 aspect-[3/4] rounded-lg md:rounded-2xl mb-2 md:mb-4"></div>
                      <div className="h-3 md:h-4 bg-gray-200 rounded mb-1 md:mb-2"></div>
                      <div className="h-3 md:h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return null;
  }

  return (
    <>
      {sections.map((section) => {
        if (section.products.length === 0) return null;

        return (
          <section
            key={section.id}
            className="py-8 md:py-12"
            style={{
              backgroundColor: section.background_color,
              color: section.text_color,
            }}
          >
            <div className="container mx-auto px-4">
              <div className="text-center mb-6 md:mb-10">
                <h2
                  className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4"
                  style={{ color: section.text_color }}
                >
                  {section.title}
                </h2>
                {section.description && (
                  <p
                    className="text-sm md:text-lg max-w-2xl mx-auto leading-relaxed opacity-90"
                    style={{ color: section.text_color }}
                  >
                    {section.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                {section.products.slice(0, section.max_products).map((product) => (
                  <div
                    key={product.id}
                    className="transform hover:scale-105 transition-transform duration-300"
                  >
                    <ProductCard product={product as any} showActionButtons={true} />
                  </div>
                ))}
              </div>

              {(section.show_view_all_button ?? true) && (
                <div className="text-center mt-6 md:mt-8">
                  <Link
                    to="/products"
                    className="inline-flex items-center bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-medium text-base md:text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    View All Products
                    <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                  </Link>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
};
