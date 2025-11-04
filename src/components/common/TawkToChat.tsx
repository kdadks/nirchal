import { useEffect } from 'react';

/**
 * Tawk.to Live Chat Integration - Lazy Loading
 * 
 * Script only loads when user clicks "Start Chat" button
 * Hidden on admin routes
 */

interface TawkToAPI {
  toggle: () => void;
  maximize: () => void;
  minimize: () => void;
  showWidget: () => void;
  hideWidget: () => void;
  endChat: () => void;
  setAttributes: (attributes: Record<string, any>, callback?: (error: any) => void) => void;
  addEvent: (event: string, metadata?: Record<string, any>, callback?: (error: any) => void) => void;
  onLoad?: () => void;
  onStatusChange?: (status: string) => void;
  onBeforeLoad?: () => void;
  onChatMinimized?: () => void;
  onChatMaximized?: () => void;
  onChatHidden?: () => void;
  onChatStarted?: () => void;
  onChatEnded?: () => void;
}

declare global {
  interface Window {
    Tawk_API?: TawkToAPI;
    Tawk_LoadStart?: Date;
    tawkToInitialized?: boolean;
  }
}

// Track if Tawk.to has been loaded
let tawktoLoaded = false;
let closeButton: HTMLButtonElement | null = null;

const TawkToChat: React.FC = () => {
  // Don't render chatbot on admin routes
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  
  useEffect(() => {
    // Don't add styles or initialize on admin routes
    if (isAdminRoute) {
      return;
    }

    // Only add styles on mount - don't load the script yet
    const style = document.createElement('style');
    style.textContent = `
      /* Tawk.to widget z-index - above most content but below modals */
      #tawkId, 
      div[id^="tawk"], 
      iframe[title*="chat widget"],
      .tawk-min-container,
      .tawk-button {
        z-index: 9998 !important;
      }
      
      /* Ensure AI chat button stays visible */
      .fixed.bottom-4.right-4 {
        z-index: 9999 !important;
      }
      
      /* Custom close button for Tawk.to */
      #tawk-close-button {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 36px;
        height: 36px;
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 24px;
        line-height: 36px;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: none;
        transition: all 0.3s ease;
      }
      
      #tawk-close-button:hover {
        background: #cc0000;
        transform: scale(1.1);
      }
      
      #tawk-close-button.visible {
        display: block;
      }
      
      /* Disable Tawk.to notification sounds */
      audio {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      // Remove style tag
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [isAdminRoute]);

  // Don't render on admin routes
  if (isAdminRoute) {
    return null;
  }

  return null;
};

export default TawkToChat;

// Helper function to load and initialize Tawk.to
const initializeTawkTo = (): Promise<void> => {
  if (tawktoLoaded || window.tawkToInitialized) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const tawkPropertyId = import.meta.env.VITE_TAWK_PROPERTY_ID || '690068c06b37cd19503f3534';
    const tawkWidgetId = '1j8kpicgq';
    
    // Initialize Tawk.to
    window.Tawk_API = window.Tawk_API || ({} as TawkToAPI);
    window.Tawk_LoadStart = new Date();
    window.tawkToInitialized = true;

    // Create close button
    closeButton = document.createElement('button');
    closeButton.id = 'tawk-close-button';
    closeButton.innerHTML = '×';
    closeButton.title = 'End Chat and Close';
    closeButton.onclick = () => {
      if (window.Tawk_API) {
        if (typeof window.Tawk_API.endChat === 'function') {
          window.Tawk_API.endChat();
        }
        if (typeof window.Tawk_API.hideWidget === 'function') {
          window.Tawk_API.hideWidget();
        }
        closeButton?.classList.remove('visible');
      }
    };
    document.body.appendChild(closeButton);

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    }

    // Mute all audio
    const muteAllAudio = () => {
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => {
        audio.muted = true;
        audio.volume = 0;
        audio.pause();
        audio.addEventListener('play', (e) => {
          e.preventDefault();
          audio.pause();
        });
      });
    };

    const observer = new MutationObserver(() => {
      muteAllAudio();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    script.onload = () => {
      console.log('[Tawk.to] Chat widget loaded successfully');
      muteAllAudio();
      tawktoLoaded = true;
      
      // Prevent Tawk.to from changing page title
      const originalTitle = document.title;
      
      // Monitor and restore title changes
      const titleObserver = new MutationObserver(() => {
        // If title changed and contains notification indicators, restore it
        if (document.title !== originalTitle && 
            (document.title.includes('(') || document.title.includes('New') || document.title.includes('message'))) {
          document.title = originalTitle;
        }
      });
      
      const titleElement = document.querySelector('title');
      if (titleElement) {
        titleObserver.observe(titleElement, {
          childList: true,
          characterData: true,
          subtree: true
        });
      }
      
      // Also use Object.defineProperty to intercept direct title assignments
      let internalTitle = originalTitle;
      Object.defineProperty(document, 'title', {
        get() {
          return internalTitle;
        },
        set(newTitle) {
          // Only allow title changes that don't look like Tawk.to notifications
          if (!newTitle.includes('(') && !newTitle.includes('New message')) {
            internalTitle = newTitle;
            if (titleElement) {
              titleElement.textContent = newTitle;
            }
          }
        },
        configurable: true
      });
      
      if (window.Tawk_API) {
        window.Tawk_API.onLoad = function() {
          muteAllAudio();
          // Restore title after load
          document.title = originalTitle;
        };
        
        window.Tawk_API.onChatMaximized = function() {
          closeButton?.classList.add('visible');
        };
        
        window.Tawk_API.onChatMinimized = function() {
          closeButton?.classList.remove('visible');
          if (window.Tawk_API && typeof window.Tawk_API.hideWidget === 'function') {
            window.Tawk_API.hideWidget();
          }
          // Restore title when chat is minimized
          document.title = originalTitle;
        };
        
        window.Tawk_API.onChatStarted = function() {
          muteAllAudio();
        };
        
        window.Tawk_API.onChatEnded = function() {
          // Restore title when chat ends
          document.title = originalTitle;
        };
      }
      
      resolve();
    };

    script.onerror = () => {
      console.error('[Tawk.to] Failed to load chat widget');
      resolve();
    };
  });
};

// Helper function to open Tawk.to chat programmatically
export const openTawkToChat = async () => {
  // Load Tawk.to if not already loaded
  await initializeTawkTo();
  
  // Small delay to ensure API is ready
  setTimeout(() => {
    if (window.Tawk_API && typeof window.Tawk_API.maximize === 'function') {
      window.Tawk_API.maximize();
      window.Tawk_API.showWidget();
      closeButton?.classList.add('visible');
    } else {
      console.warn('[Tawk.to] Chat widget not ready yet. Please try again in a moment.');
    }
  }, 500);
};

// Helper function to minimize/close Tawk.to chat
export const minimizeTawkToChat = () => {
  if (window.Tawk_API && typeof window.Tawk_API.minimize === 'function') {
    window.Tawk_API.minimize();
  }
};

// Helper function to hide Tawk.to chat completely
export const hideTawkToChat = () => {
  if (window.Tawk_API && typeof window.Tawk_API.hideWidget === 'function') {
    window.Tawk_API.hideWidget();
  }
};

// Helper function to set user attributes
export const setTawkToAttributes = (attributes: {
  name?: string;
  email?: string;
  hash?: string;
  [key: string]: any;
}) => {
  if (window.Tawk_API && typeof window.Tawk_API.setAttributes === 'function') {
    window.Tawk_API.setAttributes(attributes, (error) => {
      if (error) {
        console.error('[Tawk.to] Error setting attributes:', error);
      }
    });
  }
};
