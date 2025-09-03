import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';

export interface UserReview {
  id: string;
  product_id: number;
  product_name: string;
  product_image?: string;
  rating: number;
  comment: string;
  created_at: string;
  helpful: number;
  images?: string[];
}

export const useUserReviews = () => {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { customer } = useCustomerAuth();

  const fetchUserReviews = async () => {
    if (!customer) {
      setReviews([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          id,
          product_id,
          rating,
          comment,
          created_at,
          helpful,
          images,
          products!inner(
            name,
            images
          )
        `)
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useUserReviews] Error:', error);
        
        // Handle JWT expiration
        const errorMsg = (error.message || '').toLowerCase();
        if (errorMsg.includes('jwt') && errorMsg.includes('expired')) {
          try {
            console.log('[useUserReviews] JWT expired, attempting token refresh...');
            await supabase.auth.refreshSession();
            
            // Retry the query after refresh
            await fetchUserReviews();
            return; // Exit early on successful retry
          } catch (refreshError) {
            console.error('[useUserReviews] Token refresh failed:', refreshError);
            setError('Your session has expired. Please refresh the page to continue.');
            return;
          }
        }
        
        throw error;
      }

      const userReviews = (data || []).map((review: any) => ({
        id: String(review.id),
        product_id: review.product_id,
        product_name: review.products?.name || 'Unknown Product',
        product_image: review.products?.images?.[0] || null,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        helpful: review.helpful || 0,
        images: review.images || []
      }));

      setReviews(userReviews);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserReviews();
  }, [customer]);

  return { 
    reviews, 
    loading, 
    error, 
    refetch: fetchUserReviews,
    totalReviews: reviews.length 
  };
};
