
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { defineConfig } from 'vite';
import reactSWC from '@vitejs/plugin-react-swc';
import path from 'path';

// Polyfill __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactSWC()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@config': path.resolve(__dirname, './src/config'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  optimizeDeps: {
    exclude: ['nodemailer'], // Exclude server-only dependencies
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    // Increase chunk size limit after proper code splitting
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      external: ['nodemailer'], // Exclude nodemailer from browser bundle
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          
          // UI libraries
          'ui-icons': ['lucide-react'],
          'ui-components': ['react-hot-toast', 'react-helmet-async'],
          
          // Forms and data
          'forms': ['react-hook-form'],
          'data-utils': ['date-fns', 'xlsx'],
          
          // Supabase and AWS
          'supabase': ['@supabase/supabase-js'],
          'aws-sdk': ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner'],
          
          // PDF libraries (large)
          'pdf': ['jspdf', 'pdfmake'],
          
          // Editor
          'editor': ['quill', 'react-quill'],
          
          // Animation
          'animation': ['framer-motion'],
        },
        // Add hash to filenames for better cache busting
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Ensure consistent builds
    target: 'esnext',
    modulePreload: {
      polyfill: true
    }
  },
  preview: {
    port: 5173,
    strictPort: false,
    open: true,
    host: true,
  },
  // Environment variables
  envPrefix: 'VITE_',
});
