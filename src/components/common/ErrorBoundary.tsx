import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const isJWTError = this.state.error?.message?.toLowerCase().includes('jwt') && 
                        this.state.error?.message?.toLowerCase().includes('expired');
      
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
          <div className="max-w-md w-full px-6 py-8 bg-white rounded-lg shadow-md">
            <div className="text-center mb-6">
              <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isJWTError ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                )}
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-4 text-gray-900">
              {isJWTError ? 'Session Expired' : 'Something went wrong'}
            </h1>
            
            <p className="text-gray-600 text-center mb-6">
              {isJWTError 
                ? 'Your session has expired. Please refresh the page to continue.'
                : 'An unexpected error occurred. Please try refreshing the page.'
              }
            </p>
            
            {!isJWTError && (
              <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                <p className="text-sm text-red-700 whitespace-pre-wrap font-mono">
                  {this.state.error?.message}
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;