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

      if (!data || !data.success || !data.customer) {
        console.warn('Login RPC returned unsuccessful response:', data);
        return { success: false, error: (data && (data as any).error) || 'Invalid email or password' };
      }

      const customerData = {
        id: data.customer.id,
        email: data.customer.email,
        first_name: data.customer.first_name,
        last_name: data.customer.last_name,
        phone: data.customer.phone || undefined,
        date_of_birth: data.customer.date_of_birth || undefined,
        gender: data.customer.gender || undefined
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

      if (!data || !data.success || !data.customer) {
        console.warn('Register RPC returned unsuccessful response:', data);
        const message = (data && (data as any).error) || 'Registration failed. Please try again.';
        return { success: false, error: message };
      }

      const customerData = {
        id: data.customer.id,
        email: data.customer.email,
        first_name: data.customer.first_name,
        last_name: data.customer.last_name,
        phone: data.customer.phone || undefined,
        date_of_birth: data.customer.date_of_birth || undefined,
        gender: data.customer.gender || undefined
      };
      
      setCustomer(customerData);
      localStorage.setItem('nirchal_customer', JSON.stringify(customerData));
      
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
        } else if (data?.success) {
          // Send password reset email with database token
          try {
            await transactionalEmailService.sendPasswordResetEmail(
              {
                first_name: customerData.first_name,
                last_name: customerData.last_name,
                email: customerData.email
              },
              `${window.location.origin}/reset-password?token=${data.token || 'temp-token'}`
            );
            console.log('Password reset email sent successfully');
          } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
          }

          return { 
            success: true, 
            message: process.env.NODE_ENV === 'development' && data.token 
              ? `Password reset email sent! Development token: ${data.token}`
              : 'Password reset instructions have been sent to your email address.'
          };
        }
      } catch (rpcError) {
        console.warn('Password reset RPC function not available, using fallback');
      }

      // Fallback implementation - send email with temporary instructions
      try {
        await transactionalEmailService.sendPasswordResetEmail(
          {
            first_name: customerData.first_name,
            last_name: customerData.last_name,
            email: customerData.email
          },
          `${window.location.origin}/contact`
        );
        console.log('Fallback password reset email sent successfully');
      } catch (emailError) {
        console.error('Failed to send fallback password reset email:', emailError);
      }

      return { 
        success: true, 
        message: 'Password reset instructions have been sent to your email address. The password reset database is currently being set up, so please contact support for assistance.'
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

      if (data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
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
        const updatedCustomer = {
          id: data.id,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone || undefined,
          date_of_birth: data.date_of_birth || undefined,
          gender: data.gender || undefined
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
