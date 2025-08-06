/* global URL */
import { useState } from 'react';
import type { Product, Review, ReviewFormData } from '../types';

export const useReviews = (initialProduct: Product) => {
  const [product, setProduct] = useState<Product>(initialProduct);

  const addReview = (formData: ReviewFormData) => {
    const newReview: Review = {
      id: `review-${Date.now()}`,
      userId: 'current-user', // In a real app, this would come from auth context
      userName: 'Current User', // In a real app, this would come from auth context
      rating: formData.rating,
      comment: formData.comment,
      createdAt: new Date().toISOString(),
      helpful: 0,
      images: formData.images?.map(file => URL.createObjectURL(file))
    };

    setProduct(prev => ({
      ...prev,
      reviews: [newReview, ...prev.reviews],
      rating: calculateAverageRating([newReview, ...prev.reviews]),
      reviewCount: prev.reviewCount + 1
    }));
  };

  const markReviewHelpful = (reviewId: string) => {
    setProduct(prev => ({
      ...prev,
      reviews: prev.reviews.map(review =>
        review.id === reviewId
          ? { ...review, helpful: review.helpful + 1 }
          : review
      )
    }));
  };

  const calculateAverageRating = (reviews: Review[]): number => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  return {
    product,
    addReview,
    markReviewHelpful
  };
};