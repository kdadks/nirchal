import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ThumbsUp, MessageCircle } from 'lucide-react';
import { formatDisplayDate } from '../utils/formatDate';
import SEO from '../components/SEO';

interface Review {
  id: number;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
}

const ProductReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Mock reviews data - in a real app, this would be filtered by product id
  const reviews: Review[] = useMemo(() => [
    {
      id: 1,
      userName: "Sarah Johnson",
      rating: 5,
      date: "2024-02-15",
      comment: "Absolutely love this product! The quality is outstanding and it exceeded my expectations.",
      helpful: 24
    },
    {
      id: 2,
      userName: "Michael Chen",
      rating: 4,
      date: "2024-02-10",
      comment: "Great product overall. Would definitely recommend it to others.",
      helpful: 15
    },
    {
      id: 3,
      userName: "Emma Wilson",
      rating: 5,
      date: "2024-02-05",
      comment: "Perfect fit and excellent quality. Will be buying more in different colors!",
      helpful: 19
    }
  ], []);

  // Calculate average rating
  const averageRating = useMemo(() => {
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Number((total / reviews.length).toFixed(1));
  }, [reviews]);

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title={`Product Reviews - #${id}`}
        description={`Customer reviews and ratings for product #${id}`}
        noindex={true}
        nofollow={true}
      />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Customer Reviews</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Overall Rating</h2>
              <div className="flex items-center mt-2">
                <div className="flex mr-2">
                  {renderStars(averageRating)}
                </div>
                <span className="text-lg font-medium">{averageRating} out of 5</span>
              </div>
            </div>
            <button 
              onClick={() => window.location.href = `/product/${id}/review/new`}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Write a Review
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{review.userName}</h3>
                  <div className="flex items-center mt-1">
                    <div className="flex mr-2">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-gray-500 text-sm">
                      {formatDisplayDate(review.date)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{review.comment}</p>
              <div className="flex items-center text-gray-500">
                <button className="flex items-center hover:text-blue-600 transition-colors">
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  <span>Helpful ({review.helpful})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductReviewPage;