import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import App from './App';

// Global styles
import './index.css';

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
if (process.env.NODE_ENV === 'development') {
  window.onerror = (message, source, lineno, colno, error) => {
    console.error('Global error:', { message, source, lineno, colno, error });
    return false;
  };

  window.onunhandledrejection = (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  };
}
