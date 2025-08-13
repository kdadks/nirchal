import { ArrowRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  image?: string;
  description?: string;
  slug?: string;
}

interface CategoryCardProps {
  category: Category;
  onClick: (categorySlug: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  // Generic fallback image - single fallback instead of category-specific ones
  const fallbackImage = 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop&q=80';

  return (
    <div
      onClick={() => onClick(category.slug || category.name)}
      className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
    >
      {/* Category Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={category.image || fallbackImage}
          alt={category.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            // Fallback to generic image if the category image fails to load
            const target = e.target as HTMLImageElement;
            if (target.src !== fallbackImage) {
              target.src = fallbackImage;
            }
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
        
        {/* Hover Arrow */}
        <div className="absolute top-4 right-4 transform translate-x-8 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <ArrowRight className="w-4 h-4 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Category Info */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {category.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-amber-600 group-hover:text-amber-700 transition-colors">
            Explore Collection
          </span>
          <ArrowRight className="w-4 h-4 text-amber-600 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out" />
    </div>
  );
};

export default CategoryCard;
