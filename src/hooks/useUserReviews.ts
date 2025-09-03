import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { getStorageImageUrl } from '../utils/storageUtils';

// Helper function to generate slug from product name
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export interface UserReview {
  id: string;
  product_id: number;
  product_name: string;
  product_slug?: string;
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
          customer_id,
          rating,
          comment,
          created_at,
          helpful,
          images,
          products(
            name,
            slug,
            product_images(image_url, is_primary)
          )
        `)
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

      if (error) {
        
        // Handle JWT expiration
        const errorMsg = (error.message || '').toLowerCase();
        if (errorMsg.includes('jwt') && errorMsg.includes('expired')) {
          try {
            await supabase.auth.refreshSession();
            
            // Retry the query after refresh
            await fetchUserReviews();
            return; // Exit early on successful retry
          } catch (refreshError) {
            setError('Your session has expired. Please refresh the page to continue.');
            return;
          }
        }
        
        throw error;
      }

      const userReviews = (data || []).map((review: any) => {
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
        
        return {
          id: String(review.id),
          product_id: review.product_id,
          product_name: review.products?.name || 'Unknown Product',
          product_slug: review.products?.slug || generateSlug(review.products?.name || 'unknown-product'),
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
