import { useEffect } from 'react';

/**
 * Tawk.to Live Chat Integration
 * 
 * Setup Instructions:
 * 1. Create a free account at https://www.tawk.to
 * 2. Get your Property ID from Dashboard > Administration > Property
 * 3. Add to .env file: VITE_TAWK_PROPERTY_ID=your_property_id
 * 4. Or add in Admin Settings > SEO Settings (future enhancement)
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
  }
}

const TawkToChat: React.FC = () => {
  useEffect(() => {
    // Add global styles to ensure proper z-index hierarchy and disable sounds
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
        width: 40px;
        height: 40px;
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 24px;
        line-height: 40px;
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

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.id = 'tawk-close-button';
    closeButton.innerHTML = '×';
    closeButton.title = 'End Chat and Close';
    closeButton.onclick = () => {
      if (window.Tawk_API) {
        // End the chat session first
        if (typeof window.Tawk_API.endChat === 'function') {
          window.Tawk_API.endChat();
        }
        // Then hide the widget completely
        if (typeof window.Tawk_API.hideWidget === 'function') {
          window.Tawk_API.hideWidget();
        }
        closeButton.classList.remove('visible');
      }
    };
    document.body.appendChild(closeButton);

    // Your Tawk.to Property ID
    const tawkPropertyId = import.meta.env.VITE_TAWK_PROPERTY_ID || '690068c06b37cd19503f3534';
    const tawkWidgetId = '1j8kpicgq'; // Your widget ID
    
    // Check if Tawk.to is already loaded
    if (window.Tawk_API) {
      console.log('[Tawk.to] Already initialized');
      return;
    }

    // Initialize Tawk.to
    window.Tawk_API = window.Tawk_API || ({} as TawkToAPI);
    window.Tawk_LoadStart = new Date();

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    // Add data attribute for easy triggering
    script.setAttribute('data-chatbot-trigger', 'tawk');

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    }

    // Create a MutationObserver to mute any audio elements immediately when created
    const muteAllAudio = () => {
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => {
        audio.muted = true;
        audio.volume = 0;
        audio.pause();
        // Prevent play
        audio.addEventListener('play', (e) => {
          e.preventDefault();
          audio.pause();
        });
      });
    };

    const observer = new MutationObserver(() => {
      muteAllAudio();
    });

    // Start observing the entire document for audio elements
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Set up event listeners
    script.onload = () => {
      console.log('[Tawk.to] Chat widget loaded successfully');
      
      // Immediately mute all audio
      muteAllAudio();
      
      // Hide widget by default - only show when user clicks "Start Chat"
      // Use onLoad callback to ensure API is ready
      if (window.Tawk_API) {
        window.Tawk_API.onLoad = function() {
          if (window.Tawk_API && typeof window.Tawk_API.hideWidget === 'function') {
            window.Tawk_API.hideWidget();
          }
          
          // Disable all audio elements (notification sounds)
          muteAllAudio();
        };
        
        // Show close button when chat is maximized
        window.Tawk_API.onChatMaximized = function() {
          closeButton.classList.add('visible');
        };
        
        // Hide close button and widget when user minimizes the chat
        window.Tawk_API.onChatMinimized = function() {
          closeButton.classList.remove('visible');
          if (window.Tawk_API && typeof window.Tawk_API.hideWidget === 'function') {
            window.Tawk_API.hideWidget();
          }
        };
        
        // Mute audio on chat started
        window.Tawk_API.onChatStarted = function() {
          muteAllAudio();
        };
      }
    };
    script.onerror = () => {
      console.error('[Tawk.to] Failed to load chat widget');
    };

    // Cleanup function
    return () => {
      // Disconnect observer
      observer.disconnect();
      
      // Remove close button
      if (closeButton.parentNode) {
        closeButton.parentNode.removeChild(closeButton);
      }
      
      // Remove style tag
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
      
      // Remove script on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default TawkToChat;

// Helper function to open Tawk.to chat programmatically
export const openTawkToChat = () => {
  if (window.Tawk_API && typeof window.Tawk_API.maximize === 'function') {
    window.Tawk_API.maximize();
    window.Tawk_API.showWidget();
    
    // Show close button
    const closeButton = document.getElementById('tawk-close-button');
    if (closeButton) {
      closeButton.classList.add('visible');
    }
  } else {
    console.warn('[Tawk.to] Chat widget not loaded yet. Please try again in a moment.');
  }
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
