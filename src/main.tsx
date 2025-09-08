import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import App from './App';

// Global styles
import './index.css';
import './styles/animations.css';

// Load Razorpay script early for security compliance
import './utils/razorpayLoader';

// Create root with strict error handling
const root = ReactDOM.createRoot(document.getElementById('root')!);

// Render app with error boundary and suspense
root.render(
  <ErrorBoundary>
    <Suspense fallback={<LoadingSpinner />}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </Suspense>
  </ErrorBoundary>
);

// Add error logging for development
if (import.meta.env.DEV) {
  window.onerror = (message, source, lineno, colno, error) => {
    console.error('Global error:', { message, source, lineno, colno, error });
    return false;
  };

  window.onunhandledrejection = (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  };
}
