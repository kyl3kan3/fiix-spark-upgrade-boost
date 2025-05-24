
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null; session: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<{ success: boolean; error: string | null; session: any }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  isSubmitting: false,
  signIn: async () => ({ success: false, error: null, session: null }),
  signUp: async () => ({ success: false, error: null }),
  signOut: async () => {},
  refreshSession: async () => ({ success: false, error: null, session: null }),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { success: false, error: error.message, session: null };
      }
      
      return { success: true, error: null, session: data.session };
    } catch (error: any) {
      return { success: false, error: error.message, session: null };
    } finally {
      setIsSubmitting(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        return { success: false, error: error.message, session: null };
      }
      
      return { success: true, error: null, session: data.session };
    } catch (error: any) {
      return { success: false, error: error.message, session: null };
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      isAuthenticated, 
      isSubmitting, 
      signIn, 
      signUp, 
      signOut, 
      refreshSession 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
