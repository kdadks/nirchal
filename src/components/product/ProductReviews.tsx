import React, { useState } from 'react';
import { Review, ReviewFormData } from '../../types';
import { format } from 'date-fns';

interface ProductReviewsProps {
  reviews: Review[];
  onAddReview: (review: ReviewFormData) => void;
}

const ReviewForm: React.FC<{ onSubmit: (review: ReviewFormData) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 5,
    comment: '',
  });
  const [images, setImages] = useState<FileList | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      images: images ? Array.from(images) : undefined,
    });
    setFormData({ rating: 5, comment: '' });
    setImages(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4 bg-gray-50">
      <h4 className="text-lg font-semibold">Write a Review</h4>
      
      <div>
        <label className="block text-sm font-medium mb-1">Rating</label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className={`text-2xl ${
                star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Your Review</label>
        <textarea
          rows={4}
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          className="w-full border rounded p-2"
          placeholder="Share your experience with this product..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Images (optional)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImages(e.target.files)}
          className="w-full"
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
      >
        Submit Review
      </button>
    </form>
  );
};

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  return (
    <div className="border-b py-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-medium">{review.userName}</div>
          <div className="text-sm text-gray-500">
            {format(new Date(review.createdAt), 'MMM d, yyyy')}
          </div>
        </div>
        <div className="flex items-center space-x-1 text-yellow-400">
          {'★'.repeat(review.rating)}
          <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
        </div>
      </div>
      
      <p className="text-gray-700 mb-2">{review.comment}</p>
      
      {review.images && review.images.length > 0 && (
        <div className="flex space-x-2 mb-2">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review ${index + 1}`}
              className="w-20 h-20 object-cover rounded"
            />
          ))}
        </div>
      )}

      <div className="flex items-center text-sm text-gray-500">
        <button className="flex items-center space-x-1 hover:text-gray-700">
          <span>👍</span>
          <span>Helpful ({review.helpful})</span>
        </button>
      </div>
    </div>
  );
};

const ProductReviews: React.FC<ProductReviewsProps> = ({ reviews, onAddReview }) => {
  const averageRating = reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Customer Reviews</h3>
        <div className="text-lg">
          <span className="font-medium">{averageRating.toFixed(1)}</span>
          <span className="text-yellow-400 ml-1">★</span>
          <span className="text-gray-500 text-sm ml-1">({reviews.length} reviews)</span>
        </div>
      </div>

      <ReviewForm onSubmit={onAddReview} />

      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;