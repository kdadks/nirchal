import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Eye, EyeOff } from 'lucide-react';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useAuth } from '../../contexts/AuthContext';
import { transactionalEmailService } from '../../services/transactionalEmailService';
import { markWelcomeEmailSent } from '../../utils/orders';
import { SecurityUtils } from '../../utils/securityUtils';

interface CustomerAuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot' | 'reset-token';
  resetToken?: string;
}

const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({ 
  open, 
  onClose, 
  initialMode = 'login',
  resetToken = ''
}) => {
    const { signIn, signUp, resetPassword, resetPasswordWithToken, customer } = useCustomerAuth();
  const { supabase } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset-token'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Update mode when initialMode or resetToken changes
  useEffect(() => {
    if (resetToken && initialMode === 'reset-token') {
      setMode('reset-token');
    } else {
      setMode(initialMode);
    }
  }, [initialMode, resetToken]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      // Focus the first input for accessibility
      const firstInput = document.getElementById('email');
      if (firstInput) firstInput.focus();
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await signIn(email, password);
        console.log('Login result:', result);
        if (result.success) {
          console.log('Login successful, customer data should be set now');
          console.log('Current customer from context:', customer);
          onClose();
          // Add a small delay to ensure modal closes and customer context updates
          setTimeout(() => {
            console.log('Navigating to /myaccount...');
            navigate('/myaccount');
          }, 200);
        } else {
          setError(result.error || 'Login failed');
        }
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long');
          return;
        }
        
        const result = await signUp(email, password, firstName, lastName, phone);
        if (result.success) {
          setMessage('Account created successfully! Redirecting...');
          
          // Send welcome email (without temp password for self-registered users)
          try {
            await transactionalEmailService.sendWelcomeEmail({
              first_name: firstName,
              last_name: lastName,
              email: email
              // No temp_password for self-registered users
            });
            console.log('Welcome email sent successfully for self-registered user');
            
            // Mark welcome email as sent in database if we have customer ID
            if (customer?.id) {
              await markWelcomeEmailSent(supabase, customer.id);
            }
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't block the registration process if email fails
          }
          
          // Redirect to account dashboard after short delay for UX
          setTimeout(() => {
            onClose();
            navigate('/myaccount');
          }, 800);
        } else {
          setError(result.error || 'Registration failed');
        }
      } else if (mode === 'forgot') {
        const result = await resetPassword(email);
        if (result.success) {
          setMessage(result.message || 'Password reset instructions sent to your email.');
          // In development, also show the token
          if (process.env.NODE_ENV === 'development' && (result as any).token) {
            setMessage(prev => `${prev}\n\nDevelopment Token: ${(result as any).token}`);
          }
        } else {
          setError(result.error || 'Failed to send reset email');
        }
      } else if (mode === 'reset-token') {
        if (!resetToken) {
          setError('Invalid reset token');
          return;
        }

        if (newPassword !== confirmNewPassword) {
          setError('Passwords do not match');
          return;
        }

        const passwordErrors = validatePassword(newPassword);
        if (passwordErrors.length > 0) {
          setError(passwordErrors[0]);
          return;
        }

        try {
          // Hash the new password before sending to server
          const hashedPassword = await SecurityUtils.hashPassword(newPassword);
          
          const result = await resetPasswordWithToken(resetToken, hashedPassword);
          
          if (result.success) {
            setMessage('Password reset successfully! You can now sign in with your new password.');
            // Switch to login mode after successful reset
            setTimeout(() => {
              setMode('login');
              setNewPassword('');
              setConfirmNewPassword('');
              setError(null);
            }, 2000);
          } else {
            setError(result.error || 'Failed to reset password');
          }
        } catch (error) {
          console.error('Password reset error:', error);
          setError('An unexpected error occurred. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    return errors;
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Sign In';
      case 'register': return 'Create Account';
      case 'forgot': return 'Reset Password';
      case 'reset-token': return 'Reset Password';
      default: return 'Authentication';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'login': return 'Sign in to view your orders and manage your account.';
      case 'register': return 'Create an account to track orders and save your information.';
      case 'forgot': return 'Enter your email address to receive password reset instructions.';
      case 'reset-token': return 'Enter your new password below.';
      default: return '';
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-start justify-center pt-20 p-4 bg-black/50 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/50 animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl border border-gray-200 p-6 max-h-[calc(100vh-10rem)] overflow-y-auto animate-in zoom-in-95 duration-200 mt-8">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-2 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        
        <h2 className="text-2xl font-serif font-bold mb-1">{getTitle()}</h2>
        <p className="text-sm text-gray-600 mb-4">{getDescription()}</p>

        {error && (
          <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2 whitespace-pre-line">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode !== 'reset-token' && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
          )}

          {mode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (optional)
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </>
          )}

          {mode !== 'forgot' && mode !== 'reset-token' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
          )}

          {mode === 'reset-token' && (
            <>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    disabled={loading}
                    minLength={8}
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmNewPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    disabled={loading}
                    minLength={8}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <p className="font-medium mb-1">Password requirements:</p>
                <ul className="space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Contains uppercase and lowercase letters</li>
                  <li>• Contains at least one number</li>
                </ul>
              </div>
            </>
          )}

          {mode === 'register' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Please wait...' : 
             mode === 'login' ? 'Sign In' : 
             mode === 'register' ? 'Create Account' : 
             mode === 'forgot' ? 'Send Reset Email' :
             mode === 'reset-token' ? 'Reset Password' : 'Submit'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          {mode === 'login' && (
            <>
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Forgot your password?
              </button>
              <div className="mt-2">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sign up
                </button>
              </div>
            </>
          )}
          
          {mode === 'register' && (
            <div>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in
              </button>
            </div>
          )}
          
          {mode === 'forgot' && (
            <div>
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in
              </button>
            </div>
          )}

          {mode === 'reset-token' && (
            <div>
              Password reset complete?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerAuthModal;
