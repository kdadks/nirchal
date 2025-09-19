import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { transactionalEmailService } from '../services/transactionalEmailService';

interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
}

interface CustomerAuthContextType {
  customer: Customer | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, firstName: string, lastName: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  resetPasswordWithToken: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  refreshCustomer: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  // If you run customer auth via Supabase Auth, set VITE_CUSTOMER_USES_SUPABASE_AUTH=true
  // Default (undefined/false): customer auth is DB/RPC based and independent of Supabase auth session
  const USE_SUPABASE_CUSTOMER_AUTH = import.meta.env.VITE_CUSTOMER_USES_SUPABASE_AUTH === 'true';

  // Load customer from localStorage on mount
  useEffect(() => {
    const savedCustomer = localStorage.getItem('nirchal_customer');
    if (savedCustomer) {
      try {
        const parsedCustomer = JSON.parse(savedCustomer);
        setCustomer(parsedCustomer);
      } catch (error) {
        console.error('Error parsing saved customer:', error);
        localStorage.removeItem('nirchal_customer');
      }
    }
    setLoading(false);
  }, []);

  // Monitor Supabase auth session only if explicitly enabled for customer auth
  useEffect(() => {
    if (!USE_SUPABASE_CUSTOMER_AUTH) {
      // In DB/RPC mode we do NOT couple customer state to Supabase auth events
      return;
    }

    let refreshInterval: NodeJS.Timeout | undefined;

    const setupTokenRefresh = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        refreshInterval = setInterval(async () => {
          try {
            console.log('[CustomerAuth] Refreshing session token...');
            const { error } = await supabase.auth.refreshSession();
            if (error) {
              console.error('[CustomerAuth] Token refresh failed:', error);
            }
          } catch (err) {
            console.error('[CustomerAuth] Token refresh error:', err);
          }
        }, 50 * 60 * 1000);
      }
    };

    setupTokenRefresh();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('[CustomerAuth] Token refreshed successfully');
      }
      // Do not auto-clear customer state here; customer auth is handled separately
    });

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
      subscription.unsubscribe();
    };
  }, [USE_SUPABASE_CUSTOMER_AUTH]);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      // Use secure RPC to validate credentials server-side
      const { data, error } = await supabase.rpc('login_customer', {
        user_email: email,
        user_password: password
      });

      if (error) {
        console.error('Login RPC error:', error);
        return { success: false, error: 'Login failed. Please try again.' };
      }

      // Type assertion for RPC response
      const response = data as { 
        success: boolean; 
        error?: string; 
        customer?: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone?: string;
          date_of_birth?: string;
          gender?: string;
        };
      } | null;

      if (!response || !response.success || !response.customer) {
        console.warn('Login RPC returned unsuccessful response:', response);
        return { success: false, error: response?.error || 'Invalid email or password' };
      }

      const customerData = {
        id: response.customer.id,
        email: response.customer.email,
        first_name: response.customer.first_name,
        last_name: response.customer.last_name,
        phone: response.customer.phone || undefined,
        date_of_birth: response.customer.date_of_birth || undefined,
        gender: response.customer.gender || undefined
      };
      
      setCustomer(customerData);
      localStorage.setItem('nirchal_customer', JSON.stringify(customerData));
      
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      // Use secure RPC to register and hash password in the database
      const { data, error } = await supabase.rpc('register_customer', {
        user_email: email,
        user_password: password,
        user_first_name: firstName,
        user_last_name: lastName,
        user_phone: phone || null
      });

      if (error) {
        console.error('Register RPC error:', error);
        return { success: false, error: error.message || 'Registration failed. Please try again.' };
      }

      // Type assertion for RPC response
      const response = data as { 
        success: boolean; 
        error?: string; 
        customer?: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone?: string;
          date_of_birth?: string;
          gender?: string;
        };
      } | null;

      if (!response || !response.success || !response.customer) {
        console.warn('Register RPC returned unsuccessful response:', response);
        const message = response?.error || 'Registration failed. Please try again.';
        return { success: false, error: message };
      }

      const customerData = {
        id: response.customer.id,
        email: response.customer.email,
        first_name: response.customer.first_name,
        last_name: response.customer.last_name,
        phone: response.customer.phone || undefined,
        date_of_birth: response.customer.date_of_birth || undefined,
        gender: response.customer.gender || undefined
      };
      
      setCustomer(customerData);
      localStorage.setItem('nirchal_customer', JSON.stringify(customerData));
      
      // Send signup notification to support team
      try {
        await transactionalEmailService.sendSignupNotificationToSupport({
          customer_name: `${firstName} ${lastName}`,
          customer_email: email,
          phone: phone,
          signup_date: new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        });
        console.log('Signup notification sent to support team successfully');
      } catch (emailError) {
        console.error('Failed to send signup notification to support:', emailError);
        // Don't block the signup process if notification fails
      }
      
      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setCustomer(null);
    localStorage.removeItem('nirchal_customer');
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      // First check if customer exists and get their information
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id, email, first_name, last_name')
        .eq('email', email.trim())
        .single();

      if (customerError || !customerData) {
        // For security, return success even if email not found
        return { 
          success: true, 
          message: 'If an account with that email exists, you will receive password reset instructions shortly.'
        };
      }

      // Try to call the database function for password reset
      try {
        const { data, error } = await supabase.rpc('request_password_reset', {
          user_email: email.trim()
        });

        if (error) {
          console.warn('Database password reset function not available:', error);
          // Fallback - just send email without database token
        } else {
          // Type assertion for RPC response
          const response = data as { 
            success?: boolean; 
            token?: string; 
          } | null;
          
          if (response?.success) {
            // Send password reset email with database token
            try {
              // Type assertion for customer data
              const customer = customerData as { first_name: string; last_name: string; email: string };
              
              await transactionalEmailService.sendPasswordResetEmail(
                {
                  first_name: customer.first_name,
                  last_name: customer.last_name,
                  email: customer.email
                },
                `${window.location.origin}/reset-password?token=${response.token || 'temp-token'}`
              );
              console.log('Password reset email sent successfully');
            } catch (emailError) {
              console.error('Failed to send password reset email:', emailError);
            }

            return { 
              success: true, 
              message: process.env.NODE_ENV === 'development' && response.token 
                ? `Password reset email sent! Development token: ${response.token}`
                : 'Password reset instructions have been sent to your email address.'
            };
          }
        }
      } catch (rpcError) {
        console.warn('Password reset RPC function not available, using fallback');
      }

      // Fallback implementation - send email with temporary instructions
      try {
        // Type assertion for customer data
        const customer = customerData as { first_name: string; last_name: string; email: string };
        
        await transactionalEmailService.sendPasswordResetEmail(
          {
            first_name: customer.first_name,
            last_name: customer.last_name,
            email: customer.email
          },
          `${window.location.origin}/contact`
        );
        console.log('Fallback password reset email sent successfully');
      } catch (emailError) {
        console.error('Failed to send fallback password reset email:', emailError);
      }

      return { 
        success: true, 
        message: 'Password reset instructions have been sent to your email address.'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  };

  const resetPasswordWithToken = async (token: string, newPassword: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      const { data, error } = await supabase.rpc('reset_password_with_token', {
        token,
        new_password: newPassword
      });

      if (error) {
        console.error('Reset password with token error:', error);
        return { success: false, error: 'Failed to reset password. Please try again.' };
      }

      // Type assertion for RPC response
      const response = data as { success: boolean; message?: string; error?: string } | null;

      if (response?.success) {
        return { success: true, message: response.message || 'Password reset successfully' };
      } else {
        return { success: false, error: response?.error || 'Failed to reset password' };
      }
    } catch (error) {
      console.error('Reset password with token error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  };

  const refreshCustomer = async (): Promise<void> => {
    if (!customer?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, email, first_name, last_name, phone, date_of_birth, gender')
        .eq('id', customer.id)
        .single();

      if (error) {
        console.error('Error refreshing customer data:', error);
        return;
      }

      if (data) {
        // Type assertion for customer data
        const customerData = data as {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone?: string;
          date_of_birth?: string;
          gender?: string;
        };
        
        const updatedCustomer = {
          id: customerData.id,
          email: customerData.email,
          first_name: customerData.first_name,
          last_name: customerData.last_name,
          phone: customerData.phone || undefined,
          date_of_birth: customerData.date_of_birth || undefined,
          gender: customerData.gender || undefined
        };
        
        setCustomer(updatedCustomer);
        localStorage.setItem('nirchal_customer', JSON.stringify(updatedCustomer));
      }
    } catch (error) {
      console.error('Error refreshing customer:', error);
    }
  };

  const value = {
    customer,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    resetPasswordWithToken,
    refreshCustomer
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
};
