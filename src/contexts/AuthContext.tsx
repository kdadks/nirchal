import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, createClient, SupabaseClient } from '@supabase/supabase-js';

export interface AppUser extends SupabaseUser {
  name?: string;
}
// Remove global supabase import. We'll create the client after login.

interface AuthContextType {
  user: AppUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  supabase: SupabaseClient | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    // Only check session, do not create a client on mount
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Missing Supabase configuration.');
      setLoading(false);
      return;
    }
    // Create a temporary client to check session, but do not store it
    const tempClient = createClient(supabaseUrl, supabaseAnonKey);
    tempClient.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ ...session.user, name: session.user.email?.split('@')[0] });
        setIsAdmin(true);
        // Only create the real client after login
        if (!supabase) setSupabase(tempClient);
      } else {
        setUser(null);
        setIsAdmin(false);
        setSupabase(null);
      }
      setLoading(false);
    });
    const { data: { subscription } } = tempClient.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ ...session.user, name: session.user.email?.split('@')[0] });
        setIsAdmin(true);
        if (!supabase) setSupabase(tempClient);
      } else {
        setUser(null);
        setIsAdmin(false);
        setSupabase(null);
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // checkAdminStatus removed: all authenticated users are admins

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    let tempClient = supabase;
    if (!tempClient) {
      tempClient = createClient(supabaseUrl, supabaseAnonKey);
    }
    try {
      const { data, error } = await tempClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        setIsAdmin(true);
        setSupabase(tempClient);
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
    if (!supabase) return;
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setIsAdmin(false);
      setSupabase(null);
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
