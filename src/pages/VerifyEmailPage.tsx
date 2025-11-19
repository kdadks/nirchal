import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';

interface VerificationStatus {
  loading: boolean;
  success: boolean;
  error: string | null;
  message: string;
}

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerificationStatus>({
    loading: true,
    success: false,
    error: null,
    message: 'Verifying your email...'
  });

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        const customerId = searchParams.get('customerId');

        if (!token || !customerId) {
          setStatus({
            loading: false,
            success: false,
            error: 'Invalid verification link. Missing token or customer ID.',
            message: ''
          });
          return;
        }

        // Fetch the customer to verify the token
        const { data: customer, error: fetchError } = await supabase
          .from('customers')
          .select('id, email, reset_token, reset_token_expires, email_verified')
          .eq('id', customerId)
          .single();

        if (fetchError || !customer) {
          setStatus({
            loading: false,
            success: false,
            error: 'Customer not found.',
            message: ''
          });
          return;
        }

        // Debug logging - show actual values
        const storedTokenStr = String(customer.reset_token || 'null');
        const tokenStr = String(token || 'null');
        console.log('Verification Debug - RAW VALUES:', {
          receivedToken: tokenStr,
          receivedTokenLength: tokenStr.length,
          storedToken: storedTokenStr,
          storedTokenLength: storedTokenStr.length,
          tokenMatch: storedTokenStr === tokenStr,
          customerEmail: customer.email,
          emailVerified: customer.email_verified
        });

        // Check if already verified
        if (customer.email_verified) {
          setStatus({
            loading: false,
            success: true,
            error: null,
            message: 'Your email is already verified!'
          });
          return;
        }

        // Check if token matches (handle URL encoding)
        const decodedToken = decodeURIComponent(tokenStr);
        const storedTokenTrimmed = storedTokenStr.trim();
        const tokenTrimmed = tokenStr.trim();
        
        console.log('Token comparison details:', {
          storedTokenTrimmed,
          tokenTrimmed,
          decodedToken,
          match1: storedTokenTrimmed === tokenTrimmed,
          match2: storedTokenTrimmed === decodedToken,
          storedFirst20: storedTokenTrimmed.substring(0, 20),
          receivedFirst20: tokenTrimmed.substring(0, 20),
          decodedFirst20: decodedToken.substring(0, 20)
        });
        
        if (storedTokenTrimmed !== tokenTrimmed && storedTokenTrimmed !== decodedToken) {
          console.error('Token mismatch:', {
            receivedToken: tokenStr,
            decodedToken: decodedToken,
            storedToken: storedTokenStr,
            storedTokenTrimmed
          });
          setStatus({
            loading: false,
            success: false,
            error: 'Invalid verification token.',
            message: ''
          });
          return;
        }

        // Check if token has expired
        if (customer.reset_token_expires) {
          const expiryTime = new Date(customer.reset_token_expires as string);
          if (new Date() > expiryTime) {
            setStatus({
              loading: false,
              success: false,
              error: 'Verification link has expired. Please request a new one.',
              message: ''
            });
            return;
          }
        }

        // Update customer to mark email as verified and clear the token
        const { error: updateError } = await supabase
          .from('customers')
          .update({
            email_verified: true,
            reset_token: null,
            reset_token_expires: null
          })
          .eq('id', customerId);

        if (updateError) {
          throw updateError;
        }

        setStatus({
          loading: false,
          success: true,
          error: null,
          message: 'Your email has been successfully verified! You can now log in to your account.'
        });

        toast.success('Email verified successfully!');

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        console.error('Error verifying email:', err);
        setStatus({
          loading: false,
          success: false,
          error: err instanceof Error ? err.message : 'An unexpected error occurred',
          message: ''
        });
        toast.error('Failed to verify email');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {status.loading ? (
            <>
              <Loader className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h1>
              <p className="text-gray-600">{status.message}</p>
            </>
          ) : status.success ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Success!</h1>
              <p className="text-gray-600 mb-4">{status.message}</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800">Redirecting to login in 3 seconds...</p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition"
              >
                Go to Login Now
              </button>
            </>
          ) : (
            <>
              <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
              <p className="text-gray-600 mb-4">{status.error}</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">Please contact support if you need further assistance.</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition"
              >
                Go to Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
