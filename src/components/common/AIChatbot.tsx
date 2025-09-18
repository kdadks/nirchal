/* global HTMLDivElement, setTimeout */
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! Welcome to Nirchal! 🙏 I'm here to help you find the perfect Indian ethnic wear. How can I assist you today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('saree') || lowerMessage.includes('sari')) {
      return "Our saree collection includes handwoven Banarasi silk, Kanjivaram, Georgette, and Chiffon sarees. Would you like to see our wedding collection or casual wear sarees?";
    }
    
    if (lowerMessage.includes('lehenga')) {
      return "We have stunning designer lehengas perfect for weddings and celebrations! Our collection includes heavy embroidered, contemporary, and Indo-western styles. What's the occasion?";
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return "Our prices range from ₹1,500 for casual kurtis to ₹25,000 for premium wedding lehengas. We also offer EMI options and seasonal discounts!";
    }
    
    if (lowerMessage.includes('size') || lowerMessage.includes('fitting')) {
      return "We offer sizes from XS to 4XL and provide detailed size charts. We also offer custom tailoring services for the perfect fit. Would you like me to guide you to our size guide?";
    }
    
    if (lowerMessage.includes('delivery') || lowerMessage.includes('shipping')) {
      return "We offer free shipping on orders above ₹2,999. Standard delivery takes 3-5 business days, and express delivery takes 1-2 days in major cities.";
    }
    
    if (lowerMessage.includes('return') || lowerMessage.includes('exchange')) {
      return "We have a 2-day hassle-free return and exchange policy. Items should be in original condition with tags intact. Would you like more details about our return process?";
    }
    
    if (lowerMessage.includes('wedding') || lowerMessage.includes('bridal')) {
      return "Our bridal collection features exquisite lehengas, sarees, and anarkalis perfect for your special day! We also offer bridal styling consultations. When is your wedding?";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return "I'm here to help! You can ask me about our products, sizes, pricing, delivery, returns, or anything else. You can also call our customer service at +91-XXXXX-XXXXX.";
    }
    
    // Default responses
    const defaultResponses = [
      "That's a great question! Let me help you with that. Could you be more specific about what you're looking for?",
      "I'd love to help you find the perfect ethnic wear! Are you looking for something specific like sarees, lehengas, or casual wear?",
      "Thank you for your interest in Nirchal! Could you tell me more about what you need so I can better assist you?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputText),
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-primary-500 to-accent-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        aria-label="Open chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-40 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-semibold">Nirchal AI Assistant</h3>
              <p className="text-sm opacity-90">Online now</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.isBot
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.isBot && (
                      <Bot size={16} className="text-primary-500 mt-1 flex-shrink-0" />
                    )}
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    {!message.isBot && (
                      <User size={16} className="text-white/70 mt-1 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl shadow-sm flex items-center space-x-2">
                  <Bot size={16} className="text-primary-500" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-2 rounded-lg hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
