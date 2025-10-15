import React, { useState } from 'react';
import { MessageCircle, Bot, Sparkles } from 'lucide-react';
import { NirchalAIAssistant } from './NirchalAIAssistant';

export const AIAssistantButton: React.FC = () => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <>
      {/* Floating AI Assistant Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999]">
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="group relative bg-gradient-to-r from-pink-500 to-purple-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-pulse"
          aria-label="Open Nirchal AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 absolute -top-1 -right-1 text-yellow-300" />
          </div>
          
          {/* Pulse Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 opacity-75 animate-ping"></div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-black text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
              Chat with Nirchal AI
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
            </div>
          </div>
        </button>
        
        {/* Small notification badge */}
        <div className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
          <MessageCircle className="w-2 h-2" />
        </div>
      </div>

      {/* AI Assistant Component */}
      <NirchalAIAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </>
  );
};