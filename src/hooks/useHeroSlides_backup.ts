import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { HeroSlide } from '../types/admin';

export const useHeroSlides = () => {
  const { supabase } = useAuth();
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
        .eq('is_active', true)
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
}

// Admin hook with full CRUD operations
export function useAdminHeroSlides() {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllHeroSlides = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
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
      const { data, error } = await supabase
        .from('hero_slides')
        .insert([slideData])
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
      console.log('updateHeroSlide called with:', { id, updates });
      const { data, error } = await supabase
        .from('hero_slides')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error details:', error);
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
      console.error('Error type:', typeof err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      
      // If it's a Supabase error, use its message
      if (err && typeof err === 'object' && 'message' in err) {
        return { data: null, error: (err as any).message };
      }
      
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update hero slide' };
    }
  };

  const deleteHeroSlide = async (id: string) => {
    try {
      const { error } = await supabase
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
    console.log('toggleActive called with:', { id, isActive });
    const result = await updateHeroSlide(id, { is_active: isActive });
    console.log('updateHeroSlide result:', result);
    return result;
  };

  const reorderSlides = async (slides: HeroSlide[]) => {
    try {
      const updates = slides.map((slide, index) => ({
        id: slide.id,
        display_order: index + 1
      }));

      const promises = updates.map(({ id, display_order }) =>
        supabase
          .from('hero_slides')
          .update({ display_order })
          .eq('id', id)
      );

      await Promise.all(promises);
      await fetchAllHeroSlides(); // Refresh the list
      return { error: null };
    } catch (err) {
      console.error('Error reordering slides:', err);
      return { error: err instanceof Error ? err.message : 'Failed to reorder slides' };
    }
  };

  useEffect(() => {
    fetchAllHeroSlides();
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
    refetch: fetchAllHeroSlides
  };
}