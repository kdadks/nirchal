import React from 'react';
import { Link } from 'react-router-dom';
import { usePublicProducts } from '../hooks/usePublicProducts';
import LoadingSpinner from '../components/common/LoadingSpinner';

const HomePage: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gray-50">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              Discover Authentic Indian Ethnic Wear
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Explore our curated collection of traditional and contemporary designs
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">
            Featured Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Sarees', 'Lehengas', 'Kurtis'].map((category) => (
              <div key={category} className="relative group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg aspect-w-3 aspect-h-4">
                  <div className="h-80 bg-gray-200 group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <h3 className="text-2xl font-serif text-white">{category}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {(() => {
              const { products, loading, error } = usePublicProducts(true);
              
              if (loading) return <LoadingSpinner />;
              if (error) return <p className="text-red-500 text-center col-span-4">Error loading products</p>;
              
              return products.slice(0, 4).map((product) => (
                <Link 
                  to={`/products/${product.id}`} 
                  key={product.id} 
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-64 bg-gray-200">
                    {product.images?.[0]?.image_url && (
                      <img 
                        src={product.images[0].image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600">₹{product.price.toLocaleString()}</p>
                  </div>
                </Link>
              ));
            })()}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-primary-600">✨</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Authentic Designs
              </h3>
              <p className="text-gray-600">
                Handpicked collection of traditional and contemporary designs
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-primary-600">🚚</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Free Shipping
              </h3>
              <p className="text-gray-600">
                On orders above ₹2,999 across India
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-primary-600">💯</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Quality Assured
              </h3>
              <p className="text-gray-600">
                Premium quality fabrics and craftsmanship
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
