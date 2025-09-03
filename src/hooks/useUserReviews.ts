import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { getStorageImageUrl } from '../utils/storageUtils';

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
      console.log('[useUserReviews] Fetching reviews for customer ID:', customer.id);
      console.log('[useUserReviews] Customer ID type:', typeof customer.id);
      
      // First, let's check if there are any reviews in the table at all
      const { data: allReviews } = await supabase
        .from('product_reviews')
        .select('id, customer_id, comment')
        .limit(5);
      
      console.log('[useUserReviews] All reviews in table (first 5):', allReviews);
      
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          id,
          product_id,
          customer_id,
          rating,
          comment,
          created_at,
          helpful,
          images,
          products(
            name,
            product_images(image_url, is_primary)
          )
        `)
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

      console.log('[useUserReviews] Query result:', { 
        data, 
        error, 
        customerIdUsed: customer.id,
        dataLength: data?.length || 0 
      });

      // If the main query fails or returns no results, try a simpler query
      if ((!data || data.length === 0) && !error) {
        console.log('[useUserReviews] No results from main query, trying simple query...');
        const { data: simpleData, error: simpleError } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('customer_id', customer.id);
        
        console.log('[useUserReviews] Simple query result:', { 
          simpleData, 
          simpleError,
          simpleDataLength: simpleData?.length || 0
        });
      }

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

      const userReviews = (data || []).map((review: any) => {
        console.log('[useUserReviews] Processing review:', review);
        console.log('[useUserReviews] Product images:', review.products?.product_images);
        
        let productImage: string | undefined;
        
        // Use the same logic as usePublicProducts for image handling
        if (review.products?.product_images && Array.isArray(review.products.product_images) && review.products.product_images.length > 0) {
          const productImages = review.products.product_images;
          // Find primary image first, then fallback to first image
          const primaryImage = productImages.find((img: any) => img.is_primary);
          const selectedImageData = primaryImage || productImages[0];
          
          if (selectedImageData?.image_url) {
            productImage = getStorageImageUrl(selectedImageData.image_url);
          }
        }
        
        console.log('[useUserReviews] Final product image URL:', productImage);
        
        return {
          id: String(review.id),
          product_id: review.product_id,
          product_name: review.products?.name || 'Unknown Product',
          product_image: productImage,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          helpful: review.helpful || 0,
          images: review.images || []
        };
      });

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
