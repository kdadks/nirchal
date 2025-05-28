import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductDetail from '../components/product/ProductDetail';
import ProductCard from '../components/product/ProductCard';
import { products } from '../data/mockData';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState(products.find(p => p.id === id));
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    // Fetch product based on ID
    const foundProduct = products.find(p => p.id === id);
    setProduct(foundProduct);
    
    // Get related products in the same category
    if (foundProduct) {
      const related = products
        .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
        .slice(0, 4);
      setRelatedProducts(related);
    }

    // Scroll to top when product changes
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <a href="/" className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-colors">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 py-8">
        <ProductDetail product={product} />
        
        {/* Product Info Tabs */}
        <div className="mt-16 mb-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button className="border-b-2 border-primary-500 py-4 px-1 text-primary-600 font-medium">
                Description
              </button>
              <button className="border-b-2 border-transparent py-4 px-1 text-gray-500 hover:text-gray-700 font-medium">
                Specifications
              </button>
              <button className="border-b-2 border-transparent py-4 px-1 text-gray-500 hover:text-gray-700 font-medium">
                Reviews ({product.reviewCount})
              </button>
            </nav>
          </div>
          
          <div className="py-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                {product.description}
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our products are crafted with care by skilled artisans, ensuring that each piece meets our high standards of quality. We source only the finest materials to create garments that not only look beautiful but also stand the test of time.
              </p>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">
              You May Also Like
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map(relatedProduct => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;