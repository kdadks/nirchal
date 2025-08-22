
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
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ ...session.user, name: session.user.email?.split('@')[0] });
        setIsAdmin(true);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ ...session.user, name: session.user.email?.split('@')[0] });
        setIsAdmin(true);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
  if (import.meta.env.DEV) console.debug('AuthContext: sign in attempt:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('AuthContext: Supabase auth error:', error);
        throw error;
      }
      
      if (data.user) {
  if (import.meta.env.DEV) console.debug('AuthContext: login successful, user:', data.user);
        setUser({ ...data.user, name: data.user.email?.split('@')[0] });
        setIsAdmin(true);
      } else {
        console.warn('AuthContext: No user data returned');
        throw new Error('No user data returned from authentication');
      }
    } catch (err) {
      console.error('AuthContext: Sign in error:', err);
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
      if (error) throw error;
      setUser(null);
      setIsAdmin(false);
    } catch (err) {
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
