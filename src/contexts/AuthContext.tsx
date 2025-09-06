
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';

export interface AppUser extends SupabaseUser {
  name?: string;
}

interface AuthContextType {
  user: AppUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  supabase: SupabaseClient;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          if (isMounted) {
            setUser(null);
            setIsAdmin(false);
            setLoading(false);
          }
          return;
        }

        if (session?.user && isMounted) {
          setUser({ ...session.user, name: session.user.email?.split('@')[0] });
          setIsAdmin(true);
        } else if (isMounted) {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser({ ...session.user, name: session.user.email?.split('@')[0] });
          setIsAdmin(true);
        } else if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        setUser({ ...data.user, name: data.user.email?.split('@')[0] });
        setIsAdmin(true);
      } else {
        throw new Error('No user data returned from authentication');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during sign in');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signOut();
      
      // Handle the specific case where there's no session to sign out
      if (error && error.message === 'Auth session missing!') {
        // User is already signed out, just clean up the local state
        setUser(null);
        setIsAdmin(false);
        return;
      }
      
      if (error) throw error;
      setUser(null);
      setIsAdmin(false);
    } catch (err) {
      // If it's the session missing error, don't throw, just clean up
      if (err instanceof Error && err.message === 'Auth session missing!') {
        setUser(null);
        setIsAdmin(false);
        return;
      }
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during sign out');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        signIn,
        signOut,
        error,
        supabase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
