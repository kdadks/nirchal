import { useState } from 'react';
import { supabase } from '../config/supabase';
import type { ReviewFormData, Review } from '../types';

export const useProductReviews = (productId: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    setReviews(
      (data || []).map((r: any) => ({
        id: String(r.id),
        userId: r.user_id,
        userName: r.user_name,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at,
        helpful: r.helpful ?? 0,
        images: r.images || []
      }))
    );
    setLoading(false);
  };

  const addReview = async (form: ReviewFormData, user: { id: string; name: string }) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.from('product_reviews').insert({
      product_id: productId,
      user_id: user.id,
      user_name: user.name,
      rating: form.rating,
      comment: form.comment,
      images: form.images?.map(f => f.name) || []
    });
    if (error) setError(error.message);
    await fetchReviews();
    setLoading(false);
  };

  return { reviews, loading, error, fetchReviews, addReview };
};
