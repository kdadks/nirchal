import { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '../config/supabase';
import type { HeroSlide } from '../types/admin';

export const useHeroSlides = () => {
  // Use global client for public operations (with RLS filtering active slides)
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHeroSlides = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)  // Only fetch active slides
        .order('display_order', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setHeroSlides((data as unknown as HeroSlide[]) || []);
    } catch (err) {
      console.error('Error fetching hero slides:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch hero slides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroSlides();
  }, []);

  return {
    heroSlides,
    loading,
    error,
    refetch: fetchHeroSlides
  };
};

// Admin hook for managing hero slides
export const useAdminHeroSlides = () => {
  // Use service role client for admin operations (bypasses RLS)
  const adminClient = supabaseAdmin;
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!adminClient) {
    throw new Error('Admin client not available. Please check VITE_SUPABASE_SERVICE_ROLE_KEY environment variable.');
  }

  const fetchHeroSlides = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await adminClient
        .from('hero_slides')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setHeroSlides((data as unknown as HeroSlide[]) || []);
    } catch (err) {
      console.error('Error fetching hero slides:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch hero slides');
    } finally {
      setLoading(false);
    }
  };

  const createHeroSlide = async (slideData: Omit<HeroSlide, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await adminClient
        .from('hero_slides')
        .insert(slideData)
        .select()
        .single();

      if (error) throw error;

      const newSlide = data as unknown as HeroSlide;
      setHeroSlides(prev => [...prev, newSlide].sort((a, b) => a.display_order - b.display_order));
      return { data: newSlide, error: null };
    } catch (err) {
      console.error('Error creating hero slide:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to create hero slide' };
    }
  };

  const updateHeroSlide = async (id: string, updates: Partial<HeroSlide>) => {
    try {
      const { data, error } = await adminClient
        .from('hero_slides')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updatedSlide = data as unknown as HeroSlide;
      setHeroSlides(prev => 
        prev.map(slide => slide.id === id ? updatedSlide : slide)
           .sort((a, b) => a.display_order - b.display_order)
      );
      return { data: updatedSlide, error: null };
    } catch (err) {
      console.error('Error updating hero slide:', err);
      
      // If it's a Supabase error, use its message
      if (err && typeof err === 'object' && 'message' in err) {
        return { data: null, error: (err as any).message };
      }
      
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update hero slide' };
    }
  };

  const deleteHeroSlide = async (id: string) => {
    try {
      const { error } = await adminClient
        .from('hero_slides')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHeroSlides(prev => prev.filter(slide => slide.id !== id));
      return { error: null };
    } catch (err) {
      console.error('Error deleting hero slide:', err);
      return { error: err instanceof Error ? err.message : 'Failed to delete hero slide' };
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const result = await updateHeroSlide(id, { is_active: isActive });
    return result;
  };

  const reorderSlides = async (slides: HeroSlide[]) => {
    try {
      const updates = slides.map((slide, index) => ({
        id: slide.id,
        display_order: index + 1
      }));

      const promises = updates.map(({ id, display_order }) =>
        adminClient
          .from('hero_slides')
          .update({ display_order })
          .eq('id', id)
      );

      const results = await Promise.all(promises);
      
      for (const result of results) {
        if (result.error) throw result.error;
      }

      setHeroSlides(slides);
      return { error: null };
    } catch (err) {
      console.error('Error reordering slides:', err);
      return { error: err instanceof Error ? err.message : 'Failed to reorder slides' };
    }
  };

  useEffect(() => {
    fetchHeroSlides();
  }, []);

  return {
    heroSlides,
    loading,
    error,
    createHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    toggleActive,
    reorderSlides,
    refetch: fetchHeroSlides
  };
};