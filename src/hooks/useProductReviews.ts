import { useState } from 'react';
import { supabase } from '../config/supabase';
import type { ReviewFormData, Review } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useProductReviews = (productId: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

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

  const addReview = async (
    form: ReviewFormData,
    overrideUser?: { id: string; name: string }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const isProd = import.meta.env.PROD;
      // Determine effective user based on environment
      let effectiveUser: { id: string; name: string } | null = null;
      if (user) {
        effectiveUser = { id: user.id, name: user.name || user.email || 'User' };
      } else if (!isProd) {
        // In development, allow override or anonymous
        effectiveUser = overrideUser ?? { id: 'anonymous', name: 'Anonymous' };
      } else {
        // In production without auth, block
        effectiveUser = null;
      }

      if (!effectiveUser) {
        setError('Please sign in to post a review.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('product_reviews').insert({
        product_id: productId,
        user_id: effectiveUser.id,
        user_name: effectiveUser.name,
        rating: form.rating,
        comment: form.comment,
        images: form.images?.map(f => f.name) || []
      });
  if (error) throw error;
      await fetchReviews();
    } catch (e: any) {
      const msg = e?.message || '';
      if (import.meta.env.DEV) {
        // Dev fallback: append locally so unauth users can test reviews without DB writes
        const now = new Date().toISOString();
        setReviews(prev => [
          {
            id: `temp-${Date.now()}`,
            userId: 'anonymous',
            userName: (overrideUser?.name || user?.name || user?.email || 'Anonymous') as string,
            rating: form.rating,
            comment: form.comment,
            createdAt: now,
            helpful: 0,
            images: form.images?.map(f => f.name) || []
          },
          ...prev
        ]);
        setError(null);
      } else {
        setError(msg || 'Failed to add review');
      }
    }
    setLoading(false);
  };

  return { reviews, loading, error, fetchReviews, addReview };
};
